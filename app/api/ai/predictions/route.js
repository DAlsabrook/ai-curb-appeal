import { NextResponse } from "next/server";
import Replicate from "replicate";
import Logger from '@/lib/logger'

// Initialize the Replicate client with the API token
const replicateClient = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const prePrompt = 'Ensure the scene is rendered with 100% photorealistic detail, including lifelike lighting, textures, and natural imperfections. The house should have the exact structure as TOK but change anything from TOK to match this prompt: ';
    const prompt = prePrompt + ' ' +formData.get('prompt'); // user prompt
    const userUID = formData.get('uid'); // user.uid is sent from the client side
    const designFlexibility = Number(formData.get('designFlexibility'));
    const negativePrompt = formData.get("negative_prompt");
    const numImages = formData.get("num_images");
    const model = formData.get("selected_model");
    const modelVersion = formData.get("selected_model_version");

    if (!prompt || !userUID) {
      return NextResponse.json({ detail: "Prompt and user UID are required" }, { status: 400 });
    }
    const modelToUse = `dalsabrook/${model}:${modelVersion}`;
    let apiResponse;
    try {
      // Send the file URI and prompt to the external API
      apiResponse = await replicateClient.run(modelToUse, {
        input: {
          prompt: prompt, // String
          negative_prompt: negativePrompt,
          // image: 'https://firebasestorage.googleapis.com/v0/b/aicurbappeal-56306.appspot.com/o/ghKALyqoHHOMOknTGMsrk86sqOW2%2Fwhite%20house%208%20-%20Copy.jpg?alt=media&token=fa05c2f1-24be-465a-a3a2-efa600fa6c6c', // User Image hosted on Firebase Storage - commented out as it's not defined
          guidance: designFlexibility, // 0-10 : Higher values means strict prompt following but may reduce overall image quality. Lower values allow for more creative freedom
          aspect_ratio: "1:1",
          go_fast: false,
          output_format: "webp",
          output_quality: 100, // 0-100 : Higher means better image quality
          num_outputs: Number(numImages) || 4, // 1-4
          num_inference_steps: 30, // 1-50 : Number of denoising steps.
          disable_safety_checker: false, // Offensive or inappropriate content
        },
      });
      if (apiResponse.error) {
        Logger.error(`Prediction route - Error from API response: ${apiResponse.error}`);
        return NextResponse.json({ detail: apiResponse.error }, { status: 500 });
      }

      return NextResponse.json(apiResponse, { status: 200 });
    } catch (error) {
      Logger.error(`Prediction route - Error calling replicate API ${error}`);
      return NextResponse.json({ detail: "Error calling replicate API" }, { status: 500 });
    }
  } catch (error) {
    Logger.error(`Prediction route - Error during API call: ${error}`);
    return NextResponse.json({ detail: "Error during API call" }, { status: 500 });
  }
}
