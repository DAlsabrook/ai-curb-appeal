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

  try {
    const output = await replicate.run("black-forest-labs/flux-dev", input);

  } catch (error) {
    console.error('ERROR during replicate.run:', error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
  // // For vercel
  // if (WEBHOOK_HOST) {
  //   options.webhook = `${WEBHOOK_HOST}/api/webhooks`
  //   options.webhook_events_filter = ["start", "completed"]
  // }

  console.log('No error return');
  return NextResponse.json(output, { status: 201 });
}


// export REPLICATE_API_TOKEN=r8_UJfHCIERmbc30d0Hj3wyiyfJ89hXola2asL4S
