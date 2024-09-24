import { NextResponse } from "next/server";
import Replicate from "replicate";
import sharp from 'sharp'; // Resizing images
import JSZip from 'jszip'; // Create zip files
import axios from 'axios'; // Used to download images
import { uploadImages } from '../../firebase/storage'
import { ConstructionOutlined } from "@mui/icons-material";

// Initialize Rep client with the API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Download images from firebase storage
async function downloadImages(imageUrls) {
  const images = [];
  for (const url of imageUrls) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const imageName = url.split('/').pop(); // Extract image name from URL
    images.push({ name: imageName, buffer });
  }
  return images;
}

// Function to resize images to a maximum size of 1MB
async function resizeImages(images) {
  const resizedImages = [];
  for (const image of images) {
    let imageBuffer = image.buffer;

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


async function checkEnvVariables() {
  const tokens = {
    'Replicate': process.env.REPLICATE_API_TOKEN
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
    return NextResponse.json({ detail: "Enviroment variables not set correctly in training route" }, { status: 400 });
  }

  const formData = await req.formData();
  const userGivenName = formData.get('name').toLowerCase().replace(/ /g, '_');
  const userUID = formData.get('uid');

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

  // Upload Images to firebase
  const imagesURLList = await uploadImages(images, userUID, userGivenName);
  console.log('Images uploaded')

  // Download images
  const downloadedImages = await downloadImages(imagesURLList);
  console.log('Images downloaded')

  // Resize images to a maximum size of 1MB
  const resizedImages = await resizeImages(downloadedImages);
  console.log('Images resized')

  // Create zip file from resized images
  const zipContent = await createZip(resizedImages);
  console.log('Zip Created')

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
          input_images: zipContent,
          trigger_word: "TOK", // Possibly Set to House?
          learning_rate: 0.0004,
          wandb_project: "flux_train_replicate",
          wandb_save_interval: 100,
          caption_dropout_rate: 0.05,
          wandb_sample_interval: 100
        },
        // webhook: "https://aicurbappeal.com/api/training-webhook"
        //commented out because site isnt live yet and this would go unanswered
        // Docs for webhooks: https://replicate.com/docs/reference/webhooks
      };

      const training = await replicate.trainings.create(modelOwner, modelName, versionId, options);

      console.log(`Training URL: https://replicate.com/p/${training.id}`);
      console.log(`Training object passed to frontend: \n${JSON.stringify(training, null, 2) }`)
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

// Training object passed to frontend:
// Link for this training: https://replicate.com/p/fq01gb6n5drm20cj0rhtj6ds3g
// Training done use replicate.run with
//    "dalsabrook/trainingobjtest1:750a11fa29d323ad1f020f9fe6fbb3205dfac5c2ba5d0af69adad5502039b085"
//     AccountName/UserGivenModelName:
// {
//   "id": "fq01gb6n5drm20cj0rhtj6ds3g",
//   "model": "ostris/flux-dev-lora-trainer",
//   "version": "885394e6a31c6f349dd4f9e6e7ffbabd8d9840ab2559ab78aed6b2451ab2cfef",
//   "input": {
//      "autocaption": false,
//      "batch_size": 1,
//      "caption_dropout_rate": 0.05,
//      "input_images": "https://curbappeal-image-storage.bb2c7337654f08315f6e09cea3065dbd.r2.cloudflarestorage.com/username/trainingobjtest1/1726679867025.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=94dc187da8480592b14765fa3d73b20a%2F20240918%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20240918T171748Z&X-Amz-Expires=3600&X-Amz-Signature=5322c87a0e614862568765f295806efa774694dccd35e62124dae2581715abd2&X-Amz-SignedHeaders=host&x-id=GetObject",
//      "learning_rate": 0.0004,
//      "lora_rank": 16,
//      "optimizer": "adamw8bit",
//      "resolution": "512,768,1024",
//      "steps": 1000,
//      "trigger_word": "TOK",
//      "wandb_project": "flux_train_replicate",
//      "wandb_sample_interval": 100,
//      "wandb_save_interval": 100
//   },
//   "logs": "",
//   "output": null,
//   "data_removed": false,
//   "error": null,
//   "status": "starting",
//   "created_at": "2024-09-18T17:17:44.619Z",
//   "urls": {
//     "cancel": "https://api.replicate.com/v1/predictions/fq01gb6n5drm20cj0rhtj6ds3g/cancel",
//     "get": "https://api.replicate.com/v1/predictions/fq01gb6n5drm20cj0rhtj6ds3g"
//   }
// }
