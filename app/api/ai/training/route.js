import { NextResponse } from "next/server";
import Replicate from "replicate";
import sharp from 'sharp'; // Resizing images
import JSZip from 'jszip'; // Create zip files
import { uploadInputZip, uploadInputImage } from '../../../firebase/storage'; // Import the uploadZip function
import Logger from '../../../../lib/logger.js'

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

// Function to extract zip file
async function extractZip(zipBuffer) {
  const zip = await JSZip.loadAsync(zipBuffer);
  const files = [];
  await Promise.all(Object.keys(zip.files).map(async (filename) => {
    const file = zip.files[filename];
    if (!file.dir) {
      files.push({ name: filename, buffer: await file.async('nodebuffer') });
    }
  }));
  return files;
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
  Logger.info('Training Route - POST request received.');

  if (!checkEnvVariables()) {
    Logger.error('Training Route - Did not pass all env var checks.');
    return NextResponse.json({ detail: "Environment variables not set correctly in training route" }, { status: 400 });
  }

  try {
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
    Logger.info('Training Route - Resizing images.');
    const resizedImages = await resizeImages(images);

    // Create zip file from resized images
    Logger.info('Training Route - Creating zip file from resized images.');
    const zipContent = await createZip(resizedImages);

    // Upload the combined zip file to Firebase Storage
    const zipURL = await uploadInputZip(zipContent, userUID, userGivenName);
    const imageURL = await uploadInputImage(images[0], userUID, userGivenName);
    Logger.info(`Training Route - Image URL: ${imageURL}`);
    const encodedImageURL = encodeURIComponent(imageURL);
    Logger.info(`Training Route - encoded url: ${encodedImageURL}`)
    Logger.info(`Training Route - Decoded url: ${decodeURIComponent(encodedImageURL)}`)
    // https://firebasestorage.googleapis.com/v0/b/aicurbappeal-56306.appspot.com/o/ghKALyqoHHOMOknTGMsrk86sqOW2%2Furl_test%2FinputImage%2Furl_test-DisplayImage.jpg?alt=media&token=6f0c1e54-9828-4802-9c3c-e3ab180ddc69

    // Create the model
    const owner = 'dalsabrook';
    const visibility = 'private';
    const hardware = 'gpu-t4';
    const description = 'AICurbAppeal.com house model';

    await replicate.models.create(
      owner,
      userGivenName,
      {
        'visibility': visibility,
        'hardware': hardware,
        'description': description
      }
    );

    // Training the model that was just created
    const options = {
      destination: `${owner}/${userGivenName}`,
      input: {
        steps: 100, // max 6000 (2000 is best results so far)
        lora_rank: 30, // (max 128) Higher ranks take longer to train but can capture more complex features. Caption quality is more important for higher ranks.
        optimizer: "adamw8bit",
        batch_size: 1,
        resolution: "512,768,1024",
        autocaption: true,
        input_images: zipURL,
        trigger_word: "TOK", // Possibly Set to House?
        learning_rate: 0.0004,
        wandb_project: "flux_train_replicate",
        wandb_save_interval: 100,
        caption_dropout_rate: 0.05,
        wandb_sample_interval: 100
      },
      webhook: `https://ai-curb-appeal.vercel.app/api/ai/training-webhook?uid=${userUID}&modelName=${userGivenName}&trainedImg=${encodedImageURL}`
      // Add query params like user.uid, model name? to then save in db from webhook?
    };

    const trainingModelOwner = 'ostris';
    const trainingModelName = 'flux-dev-lora-trainer';
    const trainingVersionId = 'e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497';
    const training = await replicate.trainings.create(trainingModelOwner, trainingModelName, trainingVersionId, options);

    // Possibly delete the .zip from firebase after use.
    // Not sure if it is cheaper to keep the files or use operations to delete them
    Logger.info(`Training Route - Training URL: https://replicate.com/p/${training.id}`);
    return NextResponse.json({ detail: 'Model training has started!', trainedModel: training }, { status: 200 });

  } catch (error) {
    Logger.error('Training Route - Error during processing:', error);
    return NextResponse.json({ detail: 'Error during processing', error: error.message }, { status: 500 });
  }
}

export function GET(req, res) {
  return NextResponse.json('Working!', { status: 200 });
}

// https://firebasestorage.googleapis.com/v0/b/aicurbappeal-56306.appspot.com/o/ghKALyqoHHOMOknTGMsrk86sqOW2%2Furl_test1%2FinputImage%2Furl_test1-DisplayImage.jpg?alt=media&token=fd6746c5-3d9b-4057-b6d9-03eb4270f6c0
// https://firebasestorage.googleapis.com/v0/b/aicurbappeal-56306.appspot.com/o/ghKALyqoHHOMOknTGMsrk86sqOW2/url_test1/inputImage/url_test1-DisplayImage.jpg?alt=media&token=fd6746c5-3d9b-4057-b6d9-03eb4270f6c0
