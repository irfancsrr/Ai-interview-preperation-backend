const generateQuestionsPrompt = (role, experience, topics, count = 5) => {
  const topicStr = topics.length > 0 ? topics.join(', ') : 'general interview topics';
  return `You are an expert technical interviewer. Generate exactly ${count} interview questions for a ${role} position requiring ${experience} experience level. Focus on: ${topicStr}.

For each question, provide:
1. The interview question
2. A comprehensive ideal answer
3. Category (one of: technical, behavioral, system-design, problem-solving, general)
4. Difficulty (one of: easy, medium, hard)

Return ONLY valid JSON in this exact format, no additional text:
[
  {
    "question": "...",
    "answer": "...",
    "category": "...",
    "difficulty": "..."
  }
]`;
};

const evaluateAnswerPrompt = (question, correctAnswer, userAnswer) => {
  return `You are an expert interview evaluator. Evaluate the candidate's answer to an interview question.

Question: ${question}

Expected/Ideal Answer: ${correctAnswer}

Candidate's Answer: ${userAnswer}

Score the answer from 0-10 and provide constructive feedback. Consider:
- Accuracy and correctness
- Completeness of the response
- Communication clarity
- Relevant examples or details mentioned

Return ONLY valid JSON in this exact format:
{
  "score": <number 0-10>,
  "feedback": "detailed constructive feedback",
  "keyPoints": ["key point 1 the candidate mentioned well or missed", "key point 2", "key point 3"]
}`;
};

const resumeAnalysisPrompt = (resumeText, targetRole = '') => {
  const roleContext = targetRole ? ` for a ${targetRole} position` : '';
  return `You are an expert resume reviewer and career coach. Analyze the following resume${roleContext}.

Resume Content:
${resumeText}

Provide a comprehensive analysis covering:
1. Overall quality score (0-100)
2. Formatting assessment score (0-100)
3. Content quality score (0-100)
4. Experience relevance score (0-100)
5. Key strengths found in the resume
6. Weaknesses or areas for improvement
7. Specific actionable suggestions
8. Important keywords found and potentially missing keywords${targetRole ? ' for the target role' : ''}

Return ONLY valid JSON in this exact format:
{
  "overallScore": <number>,
  "formattingScore": <number>,
  "contentScore": <number>,
  "experienceScore": <number>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "keywordMatch": {
    "found": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"]
  }
}`;
};

const sessionFeedbackPrompt = (role, experience, questionsWithScores) => {
  const qaSummary = questionsWithScores.map((q, i) =>
    `Q${i + 1}: ${q.question}\nUser Answer: ${q.userAnswer || 'Not answered'}\nScore: ${q.aiScore || 'N/A'}/10`
  ).join('\n\n');

  return `You are a senior interview coach. Generate a comprehensive feedback report for this interview practice session.

Role: ${role}
Experience Level: ${experience}

Questions and Answers Summary:
${qaSummary}

Provide detailed feedback including:
1. Overall score (0-100)
2. 2-3 paragraph executive summary
3. Top strengths demonstrated
4. Areas needing improvement
5. Specific recommendations for next steps
6. Breakdown by category (if applicable)

Return ONLY valid JSON in this exact format:
{
  "overallScore": <number>,
  "summary": "2-3 paragraph summary",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasForImprovement": ["area 1", "area 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "detailedBreakdown": [
    { "category": "Technical Knowledge", "score": <number 0-100>, "feedback": "..." },
    { "category": "Communication", "score": <number 0-100>, "feedback": "..." },
    { "category": "Problem Solving", "score": <number 0-100>, "feedback": "..." }
  ]
}`;
};

const videoInterviewQuestionPrompt = (role, experience, interviewType, previousQA = []) => {
  const historyStr = previousQA.length > 0
    ? previousQA.map((qa, i) => `Q${i + 1}: ${qa.question}\nAnswer: ${qa.userTranscript || 'No answer'}`).join('\n\n')
    : 'This is the first question.';

  return `You are an experienced ${interviewType} interviewer conducting a live interview for a ${role} position (${experience} level).

Previous conversation:
${historyStr}

Generate the next interview question. It should:
- Be natural and conversational, as if in a real interview
- Build on previous answers when relevant
- Cover ${interviewType} aspects appropriate for the role
- Be challenging but fair for the experience level

Return ONLY valid JSON in this exact format:
{
  "question": "your interview question here",
  "expectedTopics": ["topic the candidate should cover 1", "topic 2", "topic 3"]
}`;
};

const videoAnswerEvaluationPrompt = (question, userTranscript, expectedTopics) => {
  return `You are evaluating a spoken interview answer. Be fair about natural speech patterns (filler words, slight repetition are okay).

Question: ${question}
Expected topics to cover: ${expectedTopics.join(', ')}
Candidate's spoken response (transcribed): ${userTranscript}

Evaluate considering:
- Relevance to the question
- Coverage of expected topics
- Depth of knowledge demonstrated
- Communication clarity (accounting for speech-to-text artifacts)

Return ONLY valid JSON:
{
  "score": <number 0-10>,
  "feedback": "constructive feedback on the spoken answer"
}`;
};

module.exports = {
  generateQuestionsPrompt,
  evaluateAnswerPrompt,
  resumeAnalysisPrompt,
  sessionFeedbackPrompt,
  videoInterviewQuestionPrompt,
  videoAnswerEvaluationPrompt,
};
