const { OpenAI } = require('openai');

let openai = null;

if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.log('OpenAI API Key not configured or placeholder detected. AI Assistant will run in demo/mock mode.');
}

module.exports = openai;
