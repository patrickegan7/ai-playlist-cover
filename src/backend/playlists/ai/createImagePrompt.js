const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Cache the prompt template
let cachedPromptTemplate;
const getPromptTemplate = () => {
  if (!cachedPromptTemplate) {
    const promptPath = path.join(__dirname, '../../../../prompts/gpt4omini-to-dalle3-compression.prompt.md');
    cachedPromptTemplate = fs.readFileSync(promptPath, 'utf8');
  }
  return cachedPromptTemplate;
};

function extractTracks(playlist) {
  const trackDetails = [];
  
  for (const item of playlist.tracks.items) {
    if (item.track) {
      trackDetails.push({
        title: item.track.name,
        artists: item.track.artists.map(artist => artist.name)
      });
    }
  }
  
  return {
    tracks: trackDetails
  };
}

async function generateImagePrompt(trackDetails, userDescription) {
  const promptTemplate = getPromptTemplate();
  
  // Replace the placeholders with actual data
  const prompt =
    promptTemplate
      .replace('[[PLAYLIST_JSON]]', JSON.stringify(trackDetails, null, 2))
      .replace('[[USER_DESCRIPTION]]', userDescription);
  
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: prompt
  });

  console.log(`Generated image prompt: ${response.output_text}`);

  return response.output_text;
}

async function createImagePrompt(playlist, userDescription) {
  const trackDetails = extractTracks(playlist);
  const prompt = await generateImagePrompt(trackDetails, userDescription);

  return prompt;
}

module.exports = createImagePrompt;