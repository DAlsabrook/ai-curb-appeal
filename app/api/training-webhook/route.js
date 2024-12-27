import { NextResponse } from 'next/server';
import crypto from 'crypto';
import logger from '../../../lib/logger'; // Adjust the import path as needed

const WEBHOOK_SECRET = process.env.REPLICATE_WEBHOOK_SECRET;

async function verifyWebhook(headers, body) {
  const webhookId = headers.get('webhook-id');
  const webhookTimestamp = headers.get('webhook-timestamp');
  const webhookSignature = headers.get('webhook-signature');

  if (!WEBHOOK_SECRET) {
    logger.error('Webhook secret is not set');
    throw new Error('Webhook secret is not set');
  }

  // Construct the signed content
  const signedContent = `${webhookId}.${webhookTimestamp}.${body}`;

  // Base64 decode the secret
  const secretParts = WEBHOOK_SECRET.split('_');
  if (secretParts.length !== 2) {
    logger.error('Invalid webhook secret format');
    throw new Error('Invalid webhook secret format');
  }
  const secretBytes = Buffer.from(secretParts[1], 'base64');

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
    logger.error('Timestamp outside of tolerance');
    throw new Error('Timestamp outside of tolerance');
  }

  return isValid;
}

// Handles POST requests from the webhook
export async function POST(req) {
  try {
    const body = await req.text(); // Get the raw body

    // Verify the webhook
    const isValid = await verifyWebhook(req.headers, body);
    if (!isValid) {
      logger.warn('Invalid webhook signature');
      return NextResponse.json({ message: 'Invalid webhook signature' }, { status: 400 });
    }
    logger.info("Webhook source validated");

    const parsedBody = JSON.parse(body);
    // Extract relevant data from the request body
    const modelId = parsedBody.id;
    const status = parsedBody.status; // possible "starting", "processing", "succeeded", "failed", "canceled"
    const versionId = parsedBody.version; // I think this is what we need to make predictions

    // Extract query parameters
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const userUID = searchParams.get('uid');
    const userGivenName = searchParams.get('modelName');
    logger.info(`Query parameter uid: ${myParam}\nModel Name: ${userGivenName}`);

    logger.info(`Data received from Replicate: ${JSON.stringify(parsedBody)}`);

    // Check if the model training is completed
    if (status === 'succeeded') {
      // Log the model ID and version ID
      logger.info(`Model ID: ${modelId} is trained, Version ID: ${versionId}`);

      // Example: Save the model version ID to a database

      // Respond with a success message
      return NextResponse.json({ message: 'Webhook received and processed successfully' }, { status: 200 });
    }

    // If the model training is not yet completed
    return NextResponse.json({ message: 'Training is still in progress' }, { status: 200 });
  } catch (error) {
    logger.error(`Error processing webhook: ${error.message}`);
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
