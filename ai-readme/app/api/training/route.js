import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import Replicate from "replicate";
import sharp from 'sharp'; // Resizing images
import JSZip from 'jszip'; // Create zip files
// import { Readable } from 'stream'; // Stream for zip file

// Initialize Rep client with the API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Initialize S3Client for Cloudflare R2
const s3Client = new S3Client({
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: "auto",
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
}); //////////////////////////////////////////////NEED to change R2 'allowed' domains

// Function to resize images to a maximum size of 1MB
async function resizeImages(images) {
  const resizedImages = [];
  for (const image of images) {
    let buffer = await image.arrayBuffer();
    let imageBuffer = Buffer.from(buffer);

    // Resize image to a maximum dimension while maintaining aspect ratio
    imageBuffer = await sharp(imageBuffer)
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

// Upload zip file to Cloudflare R2 using AWS SDK v3
async function uploadToR2(fileBuffer, userGivenName) {
  try {
    const objectKey = `username/${userGivenName}/${Date.now()}.zip`;

    // Upload to R2 using S3 API v3
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: "application/zip",
    });

    const s3Response = await s3Client.send(putObjectCommand);
    console.log('Uploaded S3 response:\n', s3Response)

    // Generate a signed URL for the uploaded file (valid for 1 hour)
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: objectKey,
    });

    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 }); // URL valid for 1 hour
    console.log("Signed URL:", signedUrl);

    return signedUrl;
  } catch (error) {
    console.error("Error uploading to Cloudflare R2:", error);
    throw error;
  }
}

async function checkEnvVariables() {
  const tokens = {
    'Replicate': process.env.REPLICATE_API_TOKEN,
    'CF Bucket Name': process.env.CLOUDFLARE_R2_BUCKET_NAME,
    'CF Account ID': process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    'CF Access Key': process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    'CF Secret Key': process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  }

  for (const key in tokens) {
    if (!tokens[key]) {
      console.log(`${key} is not set`);
      return false;
    }
  }
  return true;
}

// Function to train the model
export async function POST(req) {
  if (!checkEnvVariables()) {
    return NextResponse.json({ detail: "Enviroment variables not set correctly" }, { status: 400 });
  }

  const formData = await req.formData();
  const userGivenName = formData.get('name').toLowerCase().replace(/ /g, '_');

  if (!userGivenName) {
    return NextResponse.json({ detail: "Model name is required" }, { status: 400 });
  }

  // Check if the name contains only letters and numbers
  const isValidName = /^[a-zA-Z0-9]+$/.test(userGivenName);
  if (!isValidName) {
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
    return NextResponse.json({ detail: "Error loading images" }, { status: 400 });
  }

  // Resize images to a maximum size of 1MB
  const resizedImages = await resizeImages(images);

  // Create zip file from resized images
  const zipContent = await createZip(resizedImages);

  // Upload the zip file to Cloudflare R2
  const r2Url = await uploadToR2(zipContent, userGivenName);

  try { // Create the model
    const owner = 'dalsabrook';
    const visibility = 'private';
    const hardware = 'gpu-t4';
    const description = 'AICurbAppeal.com house model'

    const model = await replicate.models.create(
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
          input_images: r2Url,
          trigger_word: "TOK",
          learning_rate: 0.0004,
          wandb_project: "flux_train_replicate",
          wandb_save_interval: 100,
          caption_dropout_rate: 0.05,
          wandb_sample_interval: 100
        }
      };

      const training = await replicate.trainings.create(modelOwner, modelName, versionId, options);

      console.log(`Training URL: https://replicate.com/p/${training.id}`);
      return NextResponse.json({ detail: 'Model training has started!', trainedModel: training }, { status: 200 });
    } catch (error) {
      console.log(error);
      return NextResponse.json({ detail: 'Error during model training', error: error.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating model:', error);
    return NextResponse.json({ detail: 'Error creating the model', error: error.message }, { status: 500 });
  }
}

//////////// this is what the training object is.
// {
//   id: 'papxhx3s4srm00chrp683cwf00',
//   model: 'ostris/flux-dev-lora-trainer',
//   version: '9d960224bcfc17c68d621e7a6a5afb43d222588daa4e8ddc5f127e27ab874486',
//   input: {
//      autocaption: false,
//      batch_size: 1,
//      caption_dropout_rate: 0.05,
//      input_images: 'http://res.cloudinary.com/dugyjblat/raw/upload/v1725596201/dalsabrook/logtest1/dyvsdxwcuyt97kfkmuj5.zip',
//      learning_rate: 0.0004,
//      lora_rank: 16,
//      optimizer: 'adamw8bit',
//      resolution: '512,768,1024',
//      steps: 1000,
//      trigger_word: 'TOK',
//      wandb_project: 'flux_train_replicate',
//      wandb_sample_interval: 100,
//      wandb_save_interval: 100
//   },
//   logs: '',
//   output: null,
//   data_removed: false,
//   error: null,
//   status: 'starting',
//   created_at: '2024-09-06T04:16:43.302Z',
//   urls: {
//     cancel: 'https://api.replicate.com/v1/predictions/papxhx3s4srm00chrp683cwf00/cancel',
//     get: 'https://api.replicate.com/v1/predictions/papxhx3s4srm00chrp683cwf00'
//   }
// }
