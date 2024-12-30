import { NextResponse } from "next/server";
import Replicate from "replicate";
import Logger from '../../../../lib/logger'

// Initialize the Replicate client with the API token
const replicateClient = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req) {
  try {
    const prePrompt = 'Ensure the scene is rendered with 100% photorealistic detail, including lifelike lighting, textures, and natural imperfections. Create the house from the prompt img in the style of TOK.';
    const formData = await req.formData();
    const prompt = prePrompt + formData.get('prompt'); // user prompt
    const userUID = formData.get('uid'); // user.uid is sent from the client side
    const formPromptStrength = Number(formData.get('prompt_strength'));

    // NEEDED to run the prediction
    const owner = 'dalsabrook';
    const userGivenModelName = 'whitehousecaptiontest'; // hardcoded for now
    const version = '1234'; // get from db


    if (!prompt || !userUID) {
      return NextResponse.json({ detail: "Prompt, file, and user UID are required" }, { status: 400 });
    }

    // REPLICATE API CALL
    let apiResponse;

    // example on what to use for a user created model
    // accountname/UserGivenModelName:Version
    // "dalsabrook/testingr2:4ac1394f3b9276d033cc17d8e1672d92b1f094c566c3caf79610ad1f6901aea1"
    const modelToUse = `${owner}/${userGivenModelName}:19ac825df65a4f3ed5a7395c28ce023979a2085c8940b01a2a9de955dffe51bb`;
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
      Logger.info(apiResponse);

    } catch (error) {
      Logger.error(`Prediction route - Error calling replicate API ${error}`);
      return NextResponse.json({ detail: "Error calling replicate API" }, { status: 500 });
    }

    if (apiResponse.error) {
      Logger.error(`Prediction route - Error from API response: ${error}`);
      return NextResponse.json({ detail: apiResponse.error }, { status: 500 });
    }

    return NextResponse.json(apiResponse, { status: 201 });
  } catch (error) {
    Logger.error(`Prediction route - Error during API call: ${error}`);
    return NextResponse.json({ detail: "Error during API call" }, { status: 500 });
  }
}
