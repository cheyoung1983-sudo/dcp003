import 'dotenv/config';
import { streamText } from 'ai';

async function runTextGeneration(modelName = 'openai/gpt-5.4') {
  console.log(`\n--- Streaming response from Vercel AI Gateway model: '${modelName}' ---`);

  try {
    const result = streamText({
      model: modelName,
      prompt: 'Explain the concept of AI Gateway in two concise sentences.',
    });

    for await (const delta of result.textStream) {
      process.stdout.write(delta);
    }
    console.log('\n');

    const usage = await result.usage;
    console.log('Token usage:', usage);
  } catch (error: any) {
    console.error(`[AI Gateway Error for ${modelName}]:`, error?.message || error);
    if (error?.message?.includes('Free tier users do not have access')) {
      console.log('💡 Note: This model requires paid Vercel AI Gateway credits or custom provider key (BYOK).');
    }
  }
}

async function main() {
  // Execute primary request with requested model
  await runTextGeneration('openai/gpt-5.4');
}

main();
