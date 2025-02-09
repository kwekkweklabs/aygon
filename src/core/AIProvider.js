import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOllama } from '@langchain/ollama';
import axios from 'axios';

export class AIProvider {
  constructor(type = 'ollama', config = {}) {
    this.type = type.toLowerCase();
    
    switch (this.type) {
      case 'ollama':
        this.model = new ChatOllama({
          baseUrl: config.baseUrl || "http://localhost:11434",
          model: config.model || "llama2"
        });
        break;
      case 'openai':
        this.model = new ChatOpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          model: 'gpt-4o'
        });
        break;
      case 'gaia':
        this.baseURL = process.env.GAIA_NODE_ENDPOINT;
        this.model = config.model || 'llama-3.2:3b';
        this.headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...config.headers
        };
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
      // Special handling for Gaia using axios
      if (this.type === 'gaia') {
        const messages = [
          { role: 'user', content: prompt }
        ];

        const response = await axios.post(
          `${this.baseURL}/v1/chat/completions`,
          { messages },
          { headers: this.headers }
        );

        return response.data.choices[0].message.content;
      }

      // Use LangChain for other providers
      const response = await this.model.invoke(prompt);
      return response.content;
    } catch (error) {
      console.error('AI Provider Error:', error);
      throw error;
    }
  }
}