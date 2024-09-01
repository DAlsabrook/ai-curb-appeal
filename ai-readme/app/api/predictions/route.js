import { NextResponse } from "next/server";
import Replicate from "replicate";

// init the replicte object to use for api call
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// In production and preview deployments (on Vercel), the VERCEL_URL environment variable is set.
// In development (on your local machine), the NGROK_HOST environment variable is set.
// const WEBHOOK_HOST = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : process.env.NGROK_HOST;


export async function POST(request) {
  // "POST" Request to "api/predictions" run this function
  console.log('Creating Image with Replicate')
  if (!process.env.REPLICATE_API_TOKEN) { // If api key env varibale is not set correctly
    throw new Error(
      'The REPLICATE_API_TOKEN environment variable is not set.'
    );
  }

  let prompt;
  try { // Handle getting the prompt from the post request
    ({ prompt } = await request.json());
  } catch (error) {
    console.error('ERROR getting prompt from "POST" request in route.js:', error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  const input = { // Construct the input to send to the replicate API
    prompt: prompt + " FLUX DEV",
    guidance: 3.4
  };

  let output;
  try { // Send user prompt to the replicate API
    console.log({ input }, process.env.REPLICATE_API_TOKEN)
    output = await replicate.run("black-forest-labs/flux-dev", { input });

  } catch (error) {
    console.error('ERROR during replicate.run:', error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }


  // // For vercel
  // if (WEBHOOK_HOST) {
  //   options.webhook = `${WEBHOOK_HOST}/api/webhooks`
  //   options.webhook_events_filter = ["start", "completed"]
  // }

  console.log('Route.js had no errors');
  return NextResponse.json(output, { status: 201 });
}

// export REPLICATE_API_TOKEN=
