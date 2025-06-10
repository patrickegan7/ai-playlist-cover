const { InferenceClient } = require("@huggingface/inference");

const client = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

function craftPrompt(playlsistData, userInput) {
    const songs = playlsistData.map(song => {
        return `- "${song.name}" by ${song.artist}, from the album "${song.album}"`;
    }).join('\n');

    let prompt = `Generate a square playlist cover image (1:1 aspect ratio) inspired by the user's music selection and aesthetic description.

User input / theme: “${userInput}”

Draw visual inspiration from the following music tracks:
${songs}

Use the song titles, artist styles, and album aesthetics to shape the visual atmosphere, color palette, and symbolic elements. Focus on evoking mood, genre, and tone — whether surreal, cinematic, abstract, or literal.

Do not include any text, faces of real people, or logos. The image should be high-resolution and visually compelling as a playlist cover.

Final output: A single square image suitable for digital music platforms.
`;

    return prompt;
}

async function generatePlaylistCover(playlsistData, userInput, model) {
    try {
        const prompt = craftPrompt(playlsistData, userInput);

        const image = await client.textToImage({
            model,
            inputs: prompt,
            parameters: { 
                num_inference_steps: 5,  // Increased for better quality
                // guidance_scale: 7.5,      // Optional: Controls how closely to follow the prompt
                // width: 512,               // Optional: Image width
                // height: 512              // Optional: Image height
            },
        });

        // Handle the Blob response
        return image;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

module.exports = generatePlaylistCover;
