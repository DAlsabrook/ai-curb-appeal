import { NextResponse } from "next/server";
import Replicate from "replicate";
import sharp from 'sharp'; // Resizing images
import { uploadImages } from '../../firebase/storage';

// Initialize the Replicate client with the API token
const replicateClient = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req) {
  try {
    const prePrompt = 'Ensure the scene is rendered with 100% photorealistic detail, including lifelike lighting, textures, and natural imperfections. Create the house from the prompt img in the style of TOK.';
    const formData = await req.formData();
    const prompt = prePrompt + formData.get('prompt'); // user prompt
    const file = formData.get('file'); // image file
    const userUID = formData.get('uid'); // user.uid is sent from the client side
    const formPromptStrength = Number(formData.get('prompt_strength'));
    const model = 'whitehousecaptiontest'; // Assuming model is hardcoded for now

    if (!prompt || !file || !userUID) {
      return NextResponse.json({ detail: "Prompt, file, and user UID are required" }, { status: 400 });
    }

    // Read the file data using FileReader
    const fileData = await file.arrayBuffer();

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(fileData);

    // Check the file size
    const fileSizeInBytes = buffer.length;
    const maxSizeInBytes = 100 * 1024; // 500KB

    let resizedBuffer = buffer; // Default to original buffer

    // Resize the image if the file size exceeds the threshold
    if (fileSizeInBytes > maxSizeInBytes) {
      let bufferImage = sharp(buffer);
      let quality = 80; // Initial quality
      let width = 2000; // Initial width
      let height = 2000; // Initial height

      while (resizedBuffer.length > maxSizeInBytes && quality > 10) {
        resizedBuffer = await bufferImage
          .resize(width, height, {
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .jpeg({ quality }) // Adjust quality for JPEG format
          .toBuffer();

        // Reduce quality and dimensions iteratively
        quality -= 10;
        width -= 200;
        height -= 200;
      }
    }

    // Upload the image to Firebase Storage
    const uploadedImages = await uploadImages([new File([resizedBuffer], file.name)], userUID, model);
    const imageUrl = uploadedImages[0]; // Assuming uploadImages returns an array of URLs

    // REPLICATE API CALL
    let apiResponse;

    // example on what to use for a user created model
    // accountname/UserGivenModelName:Version
    // "dalsabrook/testingr2:4ac1394f3b9276d033cc17d8e1672d92b1f094c566c3caf79610ad1f6901aea1"
    const modelToUse = `dalsabrook/${model}:19ac825df65a4f3ed5a7395c28ce023979a2085c8940b01a2a9de955dffe51bb`;
    try {
      // Send the file URI and prompt to the external API
      apiResponse = await replicateClient.run(modelToUse, {
        input: {
          prompt: prompt, // String
          image: imageUrl, // User Image hosted on Firebase Storage
          guidance: 10, // 0-10 : Higher values means strict prompt following but may reduce overall image quality. Lower values allow for more creative freedom
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80, // 0-100 : Higher means better image quality
          num_outputs: 4, // 1-4
          prompt_strength: .5 + (.01 * formPromptStrength), // value from .5 - .7
          num_inference_steps: 30, // 1-50 : Number of denoising steps.
          disable_safety_checker: false, // Offensive or inappropriate content
        },
      });
      console.log('In prediction route:')
      console.log(apiResponse)
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
