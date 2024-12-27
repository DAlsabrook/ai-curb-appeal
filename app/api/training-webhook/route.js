import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Logger from '../../../lib/logger.js'

// Your webhook signing key (retrieve this from Replicate and store securely)
const WEBHOOK_SECRET = process.env.REPLICATE_WEBHOOK_SECRET;

async function verifyWebhook(req) {
  const webhookId = req.headers['webhook-id'];
  const webhookTimestamp = req.headers['webhook-timestamp'];
  const webhookSignature = req.headers['webhook-signature'];
  const body = await req.text(); // Get the raw body

  // Construct the signed content
  const signedContent = `${webhookId}.${webhookTimestamp}.${body}`;

  if (!WEBHOOK_SECRET) {
    Logger.error('Training-Webhook route - WEBHOOK_SECRET not set.')
    return NextResponse.json({ message: 'Secret not set' }, { status: 400 });
  }

  Logger.info(WEBHOOK_SECRET);
  // Base64 decode the secret
  const secretBytes = Buffer.from(WEBHOOK_SECRET.split('_')[1], 'base64');

  // Calculate the expected signature
  const computedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // Extract the expected signatures from the webhook-signature header
  const expectedSignatures = webhookSignature.split(' ').map(sig => sig.split(',')[1]);

  // Verify the signature
  const isValid = expectedSignatures.some(expectedSignature => expectedSignature === computedSignature);

  // Verify the timestamp to prevent replay attacks
  const tolerance = 5 * 60 * 1000; // 5 minutes
  const currentTime = Date.now();
  const webhookTime = parseInt(webhookTimestamp, 10) * 1000;

  if (Math.abs(currentTime - webhookTime) > tolerance) {
    throw new Error('Timestamp outside of tolerance');
  }

  return isValid;
}

// Handles POST requests from the webhook
export async function POST(req) {
  try {
    // Verify the webhook
    const isValid = await verifyWebhook(req);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid webhook signature' }, { status: 400 });
    }

    const body = JSON.parse(await req.text());

    // Extract relevant data from the request body
    const modelId = body.id;
    const status = body.status; // possible "starting", "processing", "succeeded", "failed", "canceled"
    const versionId = body.version; // I think this is what we need to make predictions

    console.log('Data received from Replicate:');
    console.log(body);

    // Check if the model training is completed
    if (status === 'succeeded') {
      // Log the model ID and version ID
      console.log(`Model ID: ${modelId} is trained, Version ID: ${versionId}`);

      // Example: Save the model version ID to a database

      // Respond with a success message
      return NextResponse.json({ message: 'Webhook received and processed successfully' }, { status: 200 });
    }

    // If the model training is not yet completed
    return NextResponse.json({ message: 'Training is still in progress' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Optionally handle non-POST requests with a 405 Method Not Allowed response
export function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export function PUT() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
