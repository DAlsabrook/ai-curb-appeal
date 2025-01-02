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

    try {
      // Resize images to a maximum size of 1MB
      Logger.info('Training Route - Resizing images.');
      const resizedImages = await resizeImages(images);

      try {
        // Create zip file from resized images
        Logger.info('Training Route - Creating zip file from resized images.');
        const zipContent = await createZip(resizedImages);

        try {
          // Need to auto caption and include captions in zip
          Logger.info('Training Route - Starting image captioning.');
          const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
          if (!OPENAI_API_KEY) {
            Logger.error('OpenAI api key not set')
          }
          const input = {
            system_prompt: "Write a six-sentence caption for the provided image, with a focus on precision, photorealism, and structural details. In the first sentence, describe the overall style and type of the image, emphasizing its photorealistic, high-definition quality and how vivid and realistic the details appear. In the next four sentences, provide a precise and detailed description of the homes architectural structure and features, focusing on elements such as the roofline, overall shape and form, window styles, and construction materials, as well as notable structural features like chimneys, dormers, and unique design elements that define the homes character. Describe the textures and intricate details of the homes surfaces, such as the grain of wood, the patterns in brick or stone, and the visual depth of other materials, while avoiding emphasis on colors or design elements that are easy to modify, such as paint, doors, or other superficial features. In the final sentence, describe the immediate surroundings of the home with attention to context, such as the driveway's material, the layout of pathways, or the relationship between the home and its environment, focusing on structural and permanent features. Use clear, descriptive language suitable for prompting a text-to-image model, avoiding subjective phrases like 'evokes a sense of,' and ensure all descriptions are based on observable, specific details with comma-separated keywords for enhanced clarity.",
            openai_api_key: OPENAI_API_KEY,
            image_zip_archive: zipContent,
            model: "gpt-4o-mini"
          };

          const output = await replicate.run("fofr/batch-image-captioning:d0adb15f4826881a68f1d82e0b10fe2ee1af536632dc8313f7f777ed8d264726", { input });

          try {
            // Fetch the caption zip file
            Logger.info('Training Route - Fetching caption zip file.');
            const captionZipBuffer = Buffer.from(await fetch(output).then(res => res.arrayBuffer()));
            const captionFiles = await extractZip(captionZipBuffer);

            try {
              // Combine resized images and caption files into a new zip file
              Logger.info('Training Route - Combining resized images and caption files into a new zip file.');
              const combinedFiles = [...resizedImages, ...captionFiles];
              const combinedZipContent = await createZip(combinedFiles);

              try {
                // Upload the combined zip file to Firebase Storage
                const zipURL = await uploadInputZip(combinedZipContent, userUID, userGivenName);
                const imageURL = await uploadInputImage(images[0], userUID, userGivenName);
                Logger.info(imageURL)
                // return NextResponse.json({ detail: 'Done' }, { status: 200 });
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
                    const versionId = 'e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497';

                    const options = {
                      destination: `${owner}/${userGivenName}`,
                      input: {
                        steps: 1000,
                        lora_rank: 16,
                        optimizer: "adamw8bit",
                        batch_size: 1,
                        resolution: "512,768,1024",
                        autocaption: false,
                        input_images: zipURL,
                        trigger_word: "TOK", // Possibly Set to House?
                        learning_rate: 0.0004,
                        wandb_project: "flux_train_replicate",
                        wandb_save_interval: 100,
                        caption_dropout_rate: 0.05,
                        wandb_sample_interval: 100
                      },
                      webhook: `https://ai-curb-appeal.vercel.app/api/ai/training-webhook?uid=${userUID}&modelName=${userGivenName}&trainedImg=${encodeURIComponent(imageURL)}`
                      // Add query params like user.uid, model name? to then save in db from webhook?
                    };

                    const training = await replicate.trainings.create(modelOwner, modelName, versionId, options);

                    // Possibly delete the .zip from firebase after use.
                    // Not sure if it is cheaper to keep the files or use operations to delete them
                    Logger.info(`Training Route - Training URL: https://replicate.com/p/${training.id}`);
                    return NextResponse.json({ detail: 'Model training has started!', trainedModel: training }, { status: 200 });
                  } catch (error) {
                    Logger.error('Training Route - Error during model training:', error);
                    return NextResponse.json({ detail: 'Error during model training', error: error.message }, { status: 500 });
                  }
                } catch (error) {
                  Logger.error('Training Route - Error creating model:', error);
                  return NextResponse.json({ detail: 'Error creating the model', error: error.message }, { status: 500 });
                }
              } catch (error) {
                Logger.error('Training Route - Error uploading combined zip file to Firebase Storage:', error);
                return NextResponse.json({ detail: 'Error uploading combined zip file to Firebase Storage', error: error.message }, { status: 500 });
              }
            } catch (error) {
              Logger.error('Training Route - Error combining resized images and caption files into a new zip file:', error);
              return NextResponse.json({ detail: 'Error combining resized images and caption files into a new zip file', error: error.message }, { status: 500 });
            }
          } catch (error) {
            Logger.error('Training Route - Error fetching caption zip file:', error);
            return NextResponse.json({ detail: 'Error fetching caption zip file', error: error.message }, { status: 500 });
          }
        } catch (error) {
          Logger.error('Training Route - Error creating zip file from resized images:', error);
          return NextResponse.json({ detail: 'Error creating zip file from resized images', error: error.message }, { status: 500 });
        }
      } catch (error) {
        Logger.error('Training Route - Error resizing images:', error);
        return NextResponse.json({ detail: 'Error resizing images', error: error.message }, { status: 500 });
      }
    } catch (error) {
      Logger.error('Training Route - Error processing form data:', error);
      return NextResponse.json({ detail: 'Error processing form data', error: error.message }, { status: 500 });
    }
  } catch (error) {
    Logger.error('Training Route - Error handling POST request:', error);
    return NextResponse.json({ detail: 'Error handling POST request', error: error.message }, { status: 500 });
  }
}

export function GET(req, res) {
  return NextResponse.json('Working!', { status: 200 });
}
