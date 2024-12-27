import { NextResponse } from "next/server";
import Replicate from "replicate";
import sharp from 'sharp'; // Resizing images
import JSZip from 'jszip'; // Create zip files
import { uploadZip } from '../../firebase/storage'; // Import the uploadZip function
import Logger from '@/lib/logger'

// Initialize Rep client with the API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Function to resize images to a maximum size of 1MB
async function resizeImages(images) {
  const resizedImages = [];
  for (const image of images) {
    let imageBuffer = await image.arrayBuffer();

    // Resize image to a maximum dimension while maintaining aspect ratio
    imageBuffer = await sharp(Buffer.from(imageBuffer))
      .resize({ width: 1024, height: 1024, fit: 'inside' }) // Resize to fit within 1024x1024
      .jpeg({ quality: 85 }) // Adjust quality to reduce size
      .toBuffer();

    // Check if the image size is still over 1MB
    while (imageBuffer.length > 1 * 1024 * 1024) {
      imageBuffer = await sharp(imageBuffer)
        .resize({ width: Math.floor(imageBuffer.width * 0.9) }) // Reduce width by 10%
        .jpeg({ quality: 85 }) // Adjust quality to reduce size
        .toBuffer();
    }

    resizedImages.push({ name: image.name, buffer: imageBuffer });
  }
  return resizedImages;
}

// Function to create zip file
async function createZip(images) {
  const zip = new JSZip();
  for (const image of images) {
    zip.file(image.name, image.buffer);
  }
  return await zip.generateAsync({ type: 'nodebuffer' });
}

async function checkEnvVariables() {
  const tokens = {
    'Replicate': process.env.REPLICATE_API_TOKEN
  }

  for (const key in tokens) {
    if (!tokens[key]) {
      Logger.error(`${key} is not set`);
      return false;
    }
  }
  return true;
}

// Function to handle the POST request
export async function POST(req) {

  if (!checkEnvVariables()) {
    Logger.error('Training Route - Did not pass all env var checks.');
    return NextResponse.json({ detail: "Environment variables not set correctly in training route" }, { status: 400 });
  }

  const formData = await req.formData();
  const userGivenName = formData.get('name').toLowerCase().replace(/ /g, '_');
  const userUID = formData.get('uid');

  if (!userGivenName) {
    Logger.error('Training Route - Model name is required.');
    return NextResponse.json({ detail: "Model name is required" }, { status: 400 });
  }

  // Check if the name contains only letters and numbers
  const isValidName = /^[a-zA-Z0-9_]+$/.test(userGivenName);
  if (!isValidName) {
    Logger.error('Training Route - Model name must contain only letters and numbers');
    return NextResponse.json({ detail: "Model name must contain only letters and numbers" }, { status: 400 });
  }

  // Collect all images from formData
  const images = [];
  formData.forEach((value, key) => {
    if (key.startsWith('filesList[')) {
      images.push(value);
    }
  });

  if (images.length === 0) {
    Logger.error('Training Route - Did not pass images > 0 check.');
    return NextResponse.json({ detail: "Error loading images" }, { status: 400 });
  }

  // Resize images to a maximum size of 1MB
  const resizedImages = await resizeImages(images);

  // Create zip file from resized images
  const zipContent = await createZip(resizedImages);

  // Upload the zip file to Firebase Storage
  const downloadURL = await uploadZip(zipContent, userUID, userGivenName);

  try { // Create the model
    const owner = 'dalsabrook';
    const visibility = 'private';
    const hardware = 'gpu-t4';
    const description = 'AICurbAppeal.com house model'

    await replicate.models.create(
      owner,
      userGivenName,
      {
        'visibility': visibility,
        'hardware': hardware,
        'description': description
      }
    );

    try { // Training the model that was just created
      const modelOwner = 'ostris';
      const modelName = 'flux-dev-lora-trainer';
      const versionId = '3f39d8b7d50801daf27c7adc4e6b3de138cce9c5daa22e062c5ca30f0a558918';

      const options = {
        destination: `${owner}/${userGivenName}`,
        input: {
          steps: 1000,
          lora_rank: 16,
          optimizer: "adamw8bit",
          batch_size: 1,
          resolution: "512,768,1024",
          autocaption: false,
          input_images: downloadURL,
          trigger_word: "TOK", // Possibly Set to House?
          learning_rate: 0.0004,
          wandb_project: "flux_train_replicate",
          wandb_save_interval: 100,
          caption_dropout_rate: 0.05,
          wandb_sample_interval: 100
        },
        webhook: "https://ai-curb-appeal.vercel.app/api/training-webhook?TESTIDDDDD=123"
        // Add query params like user.uid, model name? to then save in db from webhook?
      };

      const training = await replicate.trainings.create(modelOwner, modelName, versionId, options);

      // Possibly delete the .zip from firebase after use.
      // Not sure if it is cheaper to keep the files or use operations to delete them

      Logger.info(`Training Route - Training URL: https://replicate.com/p/${training.id}`);
      return NextResponse.json({ detail: 'Model training has started!', trainedModel: training }, { status: 200 });
    } catch (error) {
      Logger.error(error);
      return NextResponse.json({ detail: 'Error during model training', error: error.message }, { status: 500 });
    }
  } catch (error) {
    Logger.error('Training Route - Error creating model:', error);
    return NextResponse.json({ detail: 'Error creating the model', error: error.message }, { status: 500 });
  }
}

function GET(req, res) {
  return NextResponse.json('Working!', { status: 200 });
}
