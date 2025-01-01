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
    const prePrompt = 'Ensure the scene is rendered with 100% photorealistic detail, including lifelike lighting, textures, and natural imperfections. Create the house from the prompt img in the style of TOK.';
    const prompt = prePrompt + ' ' +formData.get('prompt'); // user prompt
    const userUID = formData.get('uid'); // user.uid is sent from the client side
    const formPromptStrength = Number(formData.get('prompt_strength'));
    const negativePrompt = formData.get("negative_prompt");
    const numImages = formData.get("num_images");
    const model = formData.get("selected_model");
    const modelVersion = formData.get("selected_model_version");

    if (!prompt || !userUID) {
      return NextResponse.json({ detail: "Prompt and user UID are required" }, { status: 400 });
    }

    const modelToUse = `dalsabrook/${model}:${modelVersion}`;
    let apiResponse;
    Logger.info(formPromptStrength)
    try {
      Logger.info('Sending prediction');
      // Send the file URI and prompt to the external API
      apiResponse = await replicateClient.run(modelToUse, {
        input: {
          prompt: prompt, // String
          // image: imageUrl, // User Image hosted on Firebase Storage - commented out as it's not defined
          guidance: 10, // 0-10 : Higher values means strict prompt following but may reduce overall image quality. Lower values allow for more creative freedom
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80, // 0-100 : Higher means better image quality
          num_outputs: Number(numImages) || 4, // 1-4
          guidance_scale: formPromptStrength, // value from .5 - .7
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
