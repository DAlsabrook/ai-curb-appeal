import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// In production and preview deployments (on Vercel), the VERCEL_URL environment variable is set.
// In development (on your local machine), the NGROK_HOST environment variable is set.
const WEBHOOK_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NGROK_HOST;

export async function POST(request) {
  console.log('In post function')
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      'The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it.'
    );
  }

  const { prompt } = await request.json();
  const input = {
    width: 768,
    height: 768,
    prompt: prompt,
    refine: "expert_ensemble_refiner",
    apply_watermark: false,
    num_inference_steps: 25
  };
// Test from stability docs
  // const output = await replicate.run("stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc", { input });
  // console.log(output)
  // console.log('ran test call')

  const options = {
    version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
    input: { prompt }
  }

  if (WEBHOOK_HOST) {
    options.webhook = `${WEBHOOK_HOST}/api/webhooks`
    options.webhook_events_filter = ["start", "completed"]
  }
// A prediction is the result you get when you run a model, including the input, output, and other details
  const prediction = await replicate.predictions.create(options);

  if (prediction?.error) {
    console.log('in error handling if statement from route.js')
    console.log(prediction.error)
    return NextResponse.json({ detail: prediction.error }, { status: 500 });
  }

  return NextResponse.json(prediction, { status: 201 });
}
