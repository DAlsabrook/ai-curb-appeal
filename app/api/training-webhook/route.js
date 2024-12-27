import { NextResponse } from 'next/server';
import crypto from 'crypto';
import logger from '../../../lib/logger'; // Adjust the import path as needed

const WEBHOOK_SECRET = process.env.REPLICATE_WEBHOOK_SECRET;

async function verifyWebhook(req) {
  const webhookId = req.headers['webhook-id'];
  const webhookTimestamp = req.headers['webhook-timestamp'];
  const webhookSignature = req.headers['webhook-signature'];
  const body = await req.text(); // Get the raw body

  logger.info(webhookId);
  logger.info(req.headers)
  logger.info(webhookTimestamp);
  logger.info(webhookSignature)
  logger.info(WEBHOOK_SECRET);

  if (!WEBHOOK_SECRET) {
    logger.error('Webhook secret is not set');
    throw new Error('Webhook secret is not set');
  }

  // Construct the signed content
  const signedContent = `${webhookId}.${webhookTimestamp}.${body}`;
  logger.info(`signedContent from replicate: ${signedContent}`)

  // Base64 decode the secret
  const secretParts = WEBHOOK_SECRET.split('_');
  if (secretParts.length !== 2) {
    logger.error('Invalid webhook secret format');
    throw new Error('Invalid webhook secret format');
  }
  logger.info(`secretParts: ${secretParts}`)
  const secretBytes = Buffer.from(secretParts[1], 'base64');
  logger.info(`secretBytes: ${secretBytes}`);

  // Calculate the expected signature
  const computedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');
  logger.info(`computedSignature: ${computedSignature}`);

  // Extract the expected signatures from the webhook-signature header
  const expectedSignatures = webhookSignature.split(' ').map(sig => sig.split(',')[1]);
  logger.info(`expectedSignatures: ${expectedSignatures}`);

  // Verify the signature
  const isValid = expectedSignatures.some(expectedSignature => expectedSignature === computedSignature);
  logger.info(`isValid: ${isValid}`);

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
    // Verify the webhook
    const isValid = await verifyWebhook(req);
    if (!isValid) {
      logger.warn('Invalid webhook signature');
      return NextResponse.json({ message: 'Invalid webhook signature' }, { status: 400 });
    }

    const body = JSON.parse(await req.text());

    // Extract relevant data from the request body
    const modelId = body.id;
    const status = body.status; // possible "starting", "processing", "succeeded", "failed", "canceled"
    const versionId = body.version; // I think this is what we need to make predictions

    logger.info(`Data received from Replicate: ${JSON.stringify(body)}`);

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
