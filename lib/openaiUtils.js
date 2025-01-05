import OpenAI from "openai";
import sharp from 'sharp';
const openai = new OpenAI();

async function convertImageToBase64(imageURL) {
    const imageResponse = await fetch(imageURL);

    if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error('Error fetching image:', imageResponse.status, imageResponse.statusText, errorText);
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);

    // Resize the image to a smaller size
    const resizedImageBuffer = await sharp(imageBuffer)
        .resize({ width: 512, height: 512, fit: 'inside' }) // Resize to fit within 512x512
        .jpeg({ quality: 85 }) // Adjust quality to reduce size
        .toBuffer();

    const imageBase64 = resizedImageBuffer.toString('base64');
    return imageBase64;
}

async function sendImageAndPrompt(userPrompt, imageURL) {
    const imageBase64 = await convertImageToBase64(imageURL);
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a prompt engineer." },
                { role: "user", content: `Here is an image of a house encoded in base64: ${imageBase64}` },
                { role: "user", content: `The user wants to make the following changes to the house: ${userPrompt}` },
                { role: "assistant", content: "Generate a detailed prompt for an image-generating model to make the desired changes to the house. First, mention the user's requested changes. Then, describe the house in detail, including its structure, color, windows, doors, and any other notable features. Incorporate the user's requested changes into the description. Use the word 'TOK' as the trigger word. Do not reference the image in your prompt. Speak to the model as if it is creating a new house and your goal is to get it to build that same house as in this image but with the changes the user wants." }
            ],
        });
        const generatedPrompt = completion.choices[0].message.content;
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
