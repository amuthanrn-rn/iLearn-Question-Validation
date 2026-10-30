import axios from 'axios';
import config from '../config/ai.js';

class DeepSeekProvider {
  constructor() {
    this.provider = config.aiProvider;
    this.client = null;
    
    if (this.provider === 'deepseek') {
      this.client = axios.create({
        baseURL: config.deepseek.baseUrl,
        timeout: config.ai.timeoutMs,
        headers: {
          'Authorization': Bearer ,
          'Content-Type': 'application/json'
        }
      });
    }
  }

  async validateQuestion(questionData) {
    const startTime = Date.now();
    
    if (this.provider === 'mock') {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const storedAnswer = questionData.answer_key || questionData.stored_answer || '';
      const isCorrect = Math.random() > 0.3;
      
      return {
        qid: questionData.qid,
        provider: 'mock',
        status: isCorrect ? 'CORRECT' : 'INCORRECT',
        storedAnswer: storedAnswer,
        aiDerivedAnswer: storedAnswer,
        confidence: 0.9,
        explanation: 'Mock validation result',
        errors: isCorrect ? [] : [{ field: 'answer_key', type: 'WRONG_ANSWER_KEY', severity: 'HIGH', description: 'Mock detected issue' }],
        proposedPublicationStatus: isCorrect ? 'published' : 'draft',
        requiresHumanReview: !isCorrect,
        processingTimeMs: Date.now() - startTime,
        tokensUsed: 150
      };
    }

    if (this.provider === 'deepseek') {
      try {
        const prompt = 'Validate question independently. Question: ' + (questionData.question || '') + '. Subject: ' + (questionData.subject || '');
        const response = await this.client.post('/chat/completions', {
          model: config.deepseek.model,
          messages: [
            { role: 'system', content: 'You are a precise academic validator. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 1000
        });

        const content = response.data.choices?.[0]?.message?.content || '{}';
        let parsed;
        try {
          parsed = JSON.parse(content);
        } catch (e) {
          throw new Error('Invalid AI response format');
        }

        return {
          qid: questionData.qid,
          provider: 'deepseek',
          status: parsed.screeningStatus || 'NEEDS_REVIEW',
          storedAnswer: questionData.answer_key,
          aiDerivedAnswer: parsed.aiDerivedAnswer,
          confidence: parsed.confidence || 0.8,
          explanation: parsed.overallExplanation || '',
          errors: parsed.errors || [],
          proposedPublicationStatus: parsed.proposedPublicationStatus || 'draft',
          requiresHumanReview: parsed.requiresHumanReview !== false,
          processingTimeMs: Date.now() - startTime,
          tokensUsed: response.data.usage?.total_tokens || 0,
          rawResponse: parsed
        };
      } catch (error) {
        if (error.response?.status === 401) {
          throw new Error('Invalid DeepSeek API key');
        } else if (error.response?.status === 429) {
          throw new Error('DeepSeek API rate limit exceeded');
        } else if (error.response?.status === 402) {
          throw new Error('Insufficient DeepSeek API credits');
        }
        throw new Error('DeepSeek API error: ' + error.message);
      }
    }

    throw new Error('Invalid AI provider');
  }

  async testConnection() {
    if (this.provider === 'mock') {
      return { status: 'ok', provider: 'mock', message: 'Mock provider ready' };
    }
    
    if (this.provider === 'deepseek') {
      try {
        const response = await this.client.post('/chat/completions', {
          model: config.deepseek.model,
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        });
        return { status: 'ok', provider: 'deepseek', message: 'Connected to DeepSeek API' };
      } catch (error) {
        throw error;
      }
    }
  }
}

export default new DeepSeekProvider();
