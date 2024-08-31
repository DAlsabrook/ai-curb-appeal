import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// In production and preview deployments (on Vercel), the VERCEL_URL environment variable is set.
// In development (on your local machine), the NGROK_HOST environment variable is set.
// const WEBHOOK_HOST = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : process.env.NGROK_HOST;

export async function POST(request) {
  console.log('Creating Image with Replicate')
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      'The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it.'
    );
  }

  const { prompt } = await request.json();
  const input = {
    prompt: prompt + " FLUX DEV",
    guidance: 3.5
  };

  const output = await replicate.run("black-forest-labs/flux-dev", { input });
  // const options = {
  //   version: 'adirik/flux-cinestill:216a43b9975de9768114644bbf8cd0cba54a923c6d0f65adceaccfc9383a938f',
  //   input: { prompt }
  // }

  // // For vercel
  // if (WEBHOOK_HOST) {
  //   options.webhook = `${WEBHOOK_HOST}/api/webhooks`
  //   options.webhook_events_filter = ["start", "completed"]
  // }

  // // A prediction is the result you get when you run a model, including the input, output, and other details
  // const prediction = await replicate.predictions.create(options);
  // console.log(prediction)

  // // if (prediction?.error) {
  // //   console.log('|||||||||||||||||||||||||| Error return');
  // //   return NextResponse.json({ detail: prediction.error }, { status: 500 });
  // // }
  console.log('|||||||||||||||||||||||||| No error return');
  return NextResponse.json(output, { status: 201 });
}


// export REPLICATE_API_TOKEN=r8_UJfHCIERmbc30d0Hj3wyiyfJ89hXola2asL4S
