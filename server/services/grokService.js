// Groq AI Service
// Handles communication with Groq API and response parsing

import axios from 'axios';
import { generateAnalysisPrompt } from '../prompts/analysisPrompt.js';

class GroqService {
  constructor() {
    // Initialize with Groq API configuration
    this.apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    this.apiBaseUrl = 'https://api.groq.com/openai/v1';
    this.model = 'llama-3.3-70b-versatile';
    
    // Validate API key on initialization
    if (!this.apiKey) {
      console.warn('⚠️  GROQ_API_KEY not found in environment variables');
    }
  }

  /**
   * Analyzes a meeting transcript using Groq API
   * @param {string} transcript - The meeting transcript to analyze
   * @returns {object} Structured analysis with summary and tasks
   */
  async analyzeMeeting(transcript) {
    try {
      // Validate input
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcript cannot be empty');
      }

      if (!this.apiKey) {
        throw new Error('GROQ_API_KEY is not configured on the backend');
      }

      // Generate the analysis prompt
      const prompt = generateAnalysisPrompt(transcript);

      // Call Groq API
      const response = await axios.post(
        `${this.apiBaseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      // Extract the response content
      const content = response.data.choices[0].message.content;

      // Parse the JSON response from Groq
      const analysisResult = this.parseGroqResponse(content);

      return analysisResult;
    } catch (error) {
      // Handle specific error types
      if (error.response?.status === 401) {
        throw new Error('Invalid Groq API key');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again with a shorter transcript.');
      }

      // Re-throw with context
      throw new Error(`Groq API error: ${error.message}`);
    }
  }

  /**
   * Parses and validates Groq's JSON response
   * @param {string} rawResponse - Raw response from Groq
   * @returns {object} Validated and formatted analysis
   */
  parseGroqResponse(rawResponse) {
    try {
      // Remove any markdown code blocks if present
      let cleanedResponse = rawResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      // Parse JSON
      const parsed = JSON.parse(cleanedResponse);

      // Validate structure
      if (!parsed.summary || !Array.isArray(parsed.tasks)) {
        throw new Error('Invalid response structure from AI');
      }

      // Validate and clean tasks
      const validatedTasks = parsed.tasks.map((task) => ({
        task: String(task.task || '').trim(),
        assignee: String(task.assignee || 'Unassigned').trim(),
        priority: this.validatePriority(task.priority),
        deadline: String(task.deadline || 'Not specified').trim(),
        reasoning: String(task.reasoning || '').trim(),
      })).filter(task => task.task.length > 0); // Remove empty tasks

      return {
        summary: String(parsed.summary).trim(),
        tasks: validatedTasks,
      };
    } catch (error) {
      // If parsing fails, return a safe default
      console.error('Error parsing Groq response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }

  /**
   * Validates and normalizes priority value
   * @param {string} priority - Priority value from AI
   * @returns {string} Validated priority (High, Medium, or Low)
   */
  validatePriority(priority) {
    const priorityString = String(priority || 'Medium').trim().toLowerCase();
    
    if (priorityString.includes('high')) return 'High';
    if (priorityString.includes('low')) return 'Low';
    return 'Medium'; // Default
  }

  /**
   * Health check for Groq API
   * @returns {boolean} Whether API is accessible
   */
  async healthCheck() {
    try {
      // Use lightweight /models endpoint instead of a full chat completion
      const response = await axios.get(
        `${this.apiBaseUrl}/models`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 5000,
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
export default new GroqService();
