import { NextResponse } from "next/server";
import Replicate from "replicate";
import cloudinary from 'cloudinary'; // Save img
import sharp from 'sharp'; // Resizing images

// Initialize the Replicate client with the API token
const replicateClient = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Disable the default body parser to handle file uploads with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  // console.log("All env variable check");
  // console.log(process.env.REPLICATE_API_TOKEN)
  // console.log(process.env.CLOUDINARY_CLOUD_NAME)
  // console.log(process.env.CLOUDINARY_API_KEY)
  // console.log(process.env.CLOUDINARY_API_SECRET)

  try {
    const prePrompt = 'Ensure the scene is rendered with 100% photorealistic detail, including lifelike lighting, textures, and natural imperfections, to maintain complete realism in every generated image.'
    const formData = await req.formData();
    const prompt = prePrompt + formData.get('prompt');
    const file = formData.get('file');

    if (!prompt || !file) {
      return NextResponse.json({ detail: "Prompt and file are required" }, { status: 400 });
    }

    // Read the file data using FileReader
    const fileData = await file.arrayBuffer();

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(fileData);


    // Check the file size
    const fileSizeInBytes = buffer.length;
    const maxSizeInBytes = 5 * 1024 * 1024; // Example: 5MB

    let resizedBuffer = buffer; // Default to original buffer

    // Resize the image if the file size exceeds the threshold
    if (fileSizeInBytes > maxSizeInBytes) {
      const bufferImage = sharp(buffer);
      resizedBuffer = await bufferImage
        .resize(2000, 2000, { // Set desired width and height
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        })
        .toBuffer();
    }


    // CLOUDINARY API CALL
    let imageUrl;
    try {
      // Upload the image to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(resizedBuffer);
      });
      imageUrl = uploadResult.secure_url; // Get url of img hosted on cloudinary after call
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return NextResponse.json({ detail: "Error uploading to Cloudinary" }, { status: 500 });
    }

    // REPLICATE API CALL
    let apiResponse;
    const modelToUse = "black-forest-labs/flux-dev";
    try {
      // Send the file URI and prompt to the external API
      apiResponse = await replicateClient.run(modelToUse, {
        input: {
          prompt: prompt, // String
          image: imageUrl, // User Image hosted on Cloudinary
          guidance: 10, // 0-10 : Higher values means strict prompt following but may reduce overall image quality. Lower values allow for more creative freedom
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80, // 0-100 : Higher means better image quality
          num_outputs: 1, // 1-4
          prompt_strength: 0.6, // 1.0 corresponds to full changing of image
          num_inference_steps: 50, // 1-50 : Number of denoising steps.
          disable_safety_checker: false, // Offensive or inappropriate content
        },
      });
    } catch (error) {
      console.error('Error calling replicate API:', error);
      return NextResponse.json({ detail: "Error calling replicate API" }, { status: 500 });
    }

    if (apiResponse.error) {
      console.log("Error from API response.");
      return NextResponse.json({ detail: apiResponse.error }, { status: 500 });
    }

    return NextResponse.json(apiResponse, { status: 201 });
  } catch (error) {
    console.error('Error during API call:', error);
    return NextResponse.json({ detail: "Error during API call" }, { status: 500 });
  }
}

// Check env variables
// printenv REPLICATE_API_TOKEN
// printenv CLOUDINARY_CLOUD_NAME
// printenv CLOUDINARY_API_KEY
// printenv CLOUDINARY_API_SECRET
