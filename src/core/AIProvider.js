import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOllama } from '@langchain/ollama';

export class AIProvider {
  constructor(type = 'ollama', config = {}) {
    switch (type.toLowerCase()) {
      case 'ollama':
        this.model = new ChatOllama({
          baseUrl: config.baseUrl || "http://localhost:11434",
          model: config.model || "llama2"
        });
        break;
      case 'openai':
        this.model = new ChatOpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          model: config.model || "gpt-4"
        });
        break;
      case 'claude':
        this.model = new ChatAnthropic({
          anthropicApiKey: config.apiKey,
          model: config.model || "claude-3-sonnet-20240229"
        });
        break;
      default:
        throw new Error(`Unsupported AI provider: ${type}`);
    }
  }

  async generate(prompt) {
    try {
      const response = await this.model.invoke(prompt);
      return response.content;
    } catch (error) {
      console.error('AI Provider Error:', error);
      throw error;
    }
  }
}