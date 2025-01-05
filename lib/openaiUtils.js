// import { Configuration, OpenAIApi } from 'openai';
import OpenAI from "openai";
const openai = new OpenAI();

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);

async function convertImageToBase64(imageURL) {
    const imageResponse = await fetch(imageURL);
    // console.log(imageResponse)
    if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error('Error fetching image:', imageResponse.status, imageResponse.statusText, errorText);
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = btoa(
        String.fromCharCode(...new Uint8Array(imageArrayBuffer))
    );
    console.log('in function')
    return imageBase64;
}

async function sendImageAndPrompt(userPrompt, imageURL) {

    const imageBase64 = await convertImageToBase64(imageURL);
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: `Here is an image of a house encoded in base64: ${imageBase64}` },
                { role: "user", content: `The user wants to make the following changes to the house: ${userPrompt}` },
                { role: "assistant", content: "Generate a detailed prompt for an image-generating model to make the desired changes to the house." }
            ],
        });
        const generatedPrompt = completion.completion.choices[0].message;
        return generatedPrompt;
    } catch (error) {
        console.error('Error generating prompt:', error);
        throw error;
    }
}

// Example usage
// const userPrompt = "Add a modern porch and change the roof to a gable style.";
// const imageURL = "./path/to/house.jpg"; // Replace with the actual path to your image
// sendImageAndPrompt(userPrompt, imageURL)
//     .then(generatedPrompt => {
//         console.log('Generated Prompt:', generatedPrompt);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });

export { sendImageAndPrompt };
