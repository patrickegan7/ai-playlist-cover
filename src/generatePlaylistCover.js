const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


async function generatePlaylistCover(condensedPrompt, model) {
    try {
        const response = await openai.images.generate({
            model,
            prompt: condensedPrompt,
            size: '1024x1024',
            response_format: 'b64_json',
        });

        // Extract base64 image data from the response
        const b64 = response.data[0]?.b64_json;
        if (!b64) throw new Error('No image data returned from OpenAI');
        return b64;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

module.exports = generatePlaylistCover;
