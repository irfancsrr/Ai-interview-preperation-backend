const { GoogleGenerativeAI } = require('@google/generative-ai');
const {
  generateQuestionsPrompt,
  evaluateAnswerPrompt,
  resumeAnalysisPrompt,
  sessionFeedbackPrompt,
  videoInterviewQuestionPrompt,
  videoAnswerEvaluationPrompt,
} = require('../utils/prompts');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  }

  async _generate(prompt, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        console.log("interview question generated...");
        return this._parseJSON(text);
      } catch (error) {
        console.log("question generating error!!!");
        if (attempt === retries) {
          console.error('Gemini API error after retries:', error.message);
          throw new Error('AI service temporarily unavailable. Please try again.');
        }
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  _parseJSON(text) {
    let cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/[\[{][\s\S]*[}\]]/);
      if (match) {
        return JSON.parse(match[0]);
      }
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  async generateQuestions(role, experience, topics, count = 5) {
    const prompt = generateQuestionsPrompt(role, experience, topics, count);
    return this._generate(prompt);
  }

  async evaluateAnswer(question, correctAnswer, userAnswer) {
    const prompt = evaluateAnswerPrompt(question, correctAnswer, userAnswer);
    return this._generate(prompt);
  }

  async analyzeResume(resumeText, targetRole = '') {
    const prompt = resumeAnalysisPrompt(resumeText, targetRole);
    return this._generate(prompt);
  }

  async generateSessionFeedback(role, experience, questionsWithScores) {
    const prompt = sessionFeedbackPrompt(role, experience, questionsWithScores);
    return this._generate(prompt);
  }

  async generateVideoQuestion(role, experience, interviewType, previousQA = []) {
    const prompt = videoInterviewQuestionPrompt(role, experience, interviewType, previousQA);
    return this._generate(prompt);
  }

  async evaluateVideoAnswer(question, userTranscript, expectedTopics = []) {
    const prompt = videoAnswerEvaluationPrompt(question, userTranscript, expectedTopics);
    return this._generate(prompt);
  }
}

module.exports = new GeminiService();
