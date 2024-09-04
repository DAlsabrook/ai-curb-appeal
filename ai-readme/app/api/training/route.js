import { NextResponse } from "next/server";
import Replicate from "replicate";
import cloudinary from 'cloudinary'; // Save img
import sharp from 'sharp'; // Resizing images
import JSZip from 'jszip'; // Create zip files
import { Readable } from 'stream'; // Stream for zip file

// Initialize Rep client with the API token
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to resize images
async function resizeImages(images, maxWidth) {
  const resizedImages = [];
  for (const image of images) {
    let buffer = await image.arrayBuffer();
    let imageBuffer = Buffer.from(buffer);

    // Resize image
    imageBuffer = await sharp(imageBuffer)
      .resize({ width: maxWidth }) // Resize to a max width
      .toBuffer();

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

// Function to train the model
export async function POST(req) {
  try {
    const formData = await req.formData();
    const userGivenName = formData.get('name');
    const modelOwner = 'stability-ai';
    const modelName = 'sdxl';
    const versionId = '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc';

    if (!formData || !userGivenName) {
      return NextResponse.json({ detail: "Prompt and file are required" }, { status: 400 });
    }

    // Collect all images from formData
    const images = [];
    formData.forEach((value, key) => {
      if (key.startsWith('filesList[')) {
        images.push(value);
      }
    });

    if (images.length === 0) {
      return NextResponse.json({ detail: "No images provided" }, { status: 400 });
    }

    let maxWidth = 1024;
    let zipContent;

    // Iteratively resize images and check zip size
    while (true) {
      const resizedImages = await resizeImages(images, maxWidth);
      zipContent = await createZip(resizedImages);

      if (zipContent.length <= 10 * 1024 * 1024) { // Check if compressed size is under 10MB
        break;
      }

      maxWidth = Math.floor(maxWidth * 0.9); // Reduce max width by 10%
      if (maxWidth < 100) { // Prevent infinite loop
        return NextResponse.json({ detail: "Unable to compress images under 10MB" }, { status: 400 });
      }
    }

    // Upload the zip file to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { resource_type: 'raw', folder: `dalsabrook/${userGivenName}` },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      Readable.from(zipContent).pipe(stream);
    });

    const options = {
      destination: `dalsabrook/${userGivenName}`, // THE PROBLEM - replicate says this doesnt exist, which it doesnt, but i want it to create it
      input: {
        input_images: uploadResponse.secure_url,
      },
    };

    const training = await replicate.trainings.create(modelOwner, modelName, versionId, options);

    console.log('Model training successful:');
    console.log(`URL: https://replicate.com/p/${training.id}`);

    return NextResponse.json({ detail: "Model training started successfully", trainingUrl: `https://replicate.com/p/${training.id}` }, { status: 201 });
  } catch (error) {
    if (error.response && error.response.status === 422) {
      console.error('Invalid version or not permitted:', error.response.data);
      return NextResponse.json({ detail: 'Invalid version or not permitted', error: error.response.data }, { status: 422 });
    } else {
      console.error('Error during model training:', error);
      return NextResponse.json({ detail: 'Error during model training', error: error.message }, { status: 500 });
    }
  }
}
