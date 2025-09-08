const OpenAI = require('openai');

const openai = new OpenAI();

async function generatePlaylistImage(playlist, userDescription) {
    const prompt = createImagePrompt(playlist, userDescription);

    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            response_format: "url"
        });

        console.log(`Generated image URL: ${response.data[0].url}`);
        return response.data[0].url;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

module.exports = generatePlaylistImage;