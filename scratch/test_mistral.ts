import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.VITE_MISTRAL_API_KEY;

async function testMistral() {
  if (!apiKey) {
    console.error('No API key found');
    return;
  }
  const client = new Mistral({ apiKey });
  try {
    const result = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: 'Say hello' }]
    });
    console.log('Mistral API Success:', result.choices[0].message.content);
  } catch (error) {
    console.error('Mistral API Failure:', error.message);
  }
}

testMistral();
