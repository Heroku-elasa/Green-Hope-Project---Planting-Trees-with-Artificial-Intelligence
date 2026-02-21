import axios, { AxiosInstance } from 'axios';

interface PoYoConfig {
  apiKey: string;
  baseURL?: string;
}

class PoYoClient {
  private client: AxiosInstance;

  constructor(config: PoYoConfig) {
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.poyo.ai/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ===== TEXT GENERATION (LLMs) =====
  async generateText(model: string, prompt: string, options = {}) {
    try {
      const response = await this.client.post('/chat/completions', {
        model,
        messages: [{ role: 'user', content: prompt }],
        ...options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`PoYo Text Error: ${error.response?.data?.error || error.message}`);
    }
  }

  // ===== IMAGE GENERATION =====
  async generateImage(model: string, prompt: string, options = {}) {
    try {
      const response = await this.client.post('/images/generations', {
        model,
        prompt,
        ...options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`PoYo Image Error: ${error.response?.data?.error || error.message}`);
    }
  }

  // ===== VIDEO GENERATION =====
  async generateVideo(model: string, prompt: string, options = {}) {
    try {
      const response = await this.client.post('/videos/generations', {
        model,
        prompt,
        ...options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`PoYo Video Error: ${error.response?.data?.error || error.message}`);
    }
  }

  // ===== MUSIC GENERATION =====
  async generateMusic(prompt: string, options = {}) {
    try {
      const response = await this.client.post('/music/generations', {
        prompt,
        ...options,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`PoYo Music Error: ${error.response?.data?.error || error.message}`);
    }
  }

  // ===== CHECK TASK STATUS (for async operations) =====
  async getTaskStatus(taskId: string) {
    try {
      const response = await this.client.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`PoYo Task Error: ${error.response?.data?.error || error.message}`);
    }
  }
}

export default PoYoClient;
