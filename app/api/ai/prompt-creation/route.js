import { sendImageAndPrompt } from "@/lib/openaiUtils";
import { NextResponse } from 'next/server';
import logger from '../../../../lib/logger';


export async function POST(req) {
    try {
        const body = await req.text();
        const parsedBody = JSON.parse(body);
        const imageURL = parsedBody.imageURL;
        const textPrompt = parsedBody.textPrompt;

        if (!imageURL || !textPrompt) {
            logger.error("ERROR in one of these -\nimageURL: ", imageURL, "\ntextPrompt: ", textPrompt);
            return NextResponse.json({ message: 'An error occured when creating the prompt', error }, { status: 400 });
        }

        // This should return a prompt for the replicate model to run against the user model
        const openAIResult = await sendImageAndPrompt(textPrompt, imageURL);
        console.log(openAIResult)
        return NextResponse.json({ message: 'Prompt created successfully', prompt: openAIResult }, { status: 200 });
    } catch (error) {
        logger.error(error);
        return NextResponse.json({ message: 'An error occured when creating the prompt', error }, { status: 400 });
    }
}
