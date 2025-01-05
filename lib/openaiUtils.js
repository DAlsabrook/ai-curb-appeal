import { Configuration, OpenAIApi } from 'node_modules/openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function convertImageToBase64(imageURL) {
    // Step 1: Fetch the image
    const imageResponse = await fetch(imageURL);
    if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // Step 2: Convert the image to Base64
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = btoa(
        String.fromCharCode(...new Uint8Array(imageArrayBuffer))
    );
    return imageBase64;
}

async function sendImageAndPrompt(userPrompt, imageURL) {
    const imageBase64 = await convertImageToBase64(imageURL);
    const messages = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Here is an image of a house encoded in base64: ${imageBase64}` },
        { role: "user", content: `The user wants to make the following changes to the house: ${userPrompt}` },
        { role: "assistant", content: "Generate a detailed prompt for an image-generating model to make the desired changes to the house." }
    ];

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: messages,
            max_tokens: 150,
        });

        const generatedPrompt = response.data.choices[0].message.content;
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
