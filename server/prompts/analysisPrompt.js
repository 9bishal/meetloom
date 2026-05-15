// AI prompt template for Grok API
// This prompt instructs Grok to analyze meeting transcripts and extract structured insights

export const generateAnalysisPrompt = (transcript) => {
  return `You are an expert meeting analyst. Analyze the following meeting transcript and provide structured output.

Meeting Transcript:
"""
${transcript}
"""

Please provide a JSON response with the following structure:
{
  "summary": "A concise 2-3 sentence summary of the key discussion points from the meeting",
  "tasks": [
    {
      "task": "Clear, actionable task description",
      "assignee": "Person responsible (or 'Unassigned' if unclear)",
      "priority": "High | Medium | Low",
      "deadline": "YYYY-MM-DD format, or 'Not specified' if unclear. Estimate reasonable deadlines.",
      "reasoning": "Brief explanation of why this task matters and its priority"
    }
  ]
}

Requirements:
1. The summary should be concise (2-3 sentences) and capture the essence of the meeting
2. Extract 3-7 actionable tasks from the transcript
3. Assign realistic priorities based on urgency and impact
4. Suggest reasonable deadlines (within 1-4 weeks from now)
5. Include brief reasoning for each task's priority and deadline
6. If assignees aren't mentioned, use context clues or mark as "Unassigned"
7. Ensure the JSON is valid and properly formatted
8. Return ONLY the JSON, no additional text or explanation

Return only valid JSON, no markdown, no code blocks, no explanations.`;
};

// Alternative prompt for fallback scenarios
export const generateSimpleAnalysisPrompt = (transcript) => {
  return `Analyze this meeting transcript and respond with ONLY valid JSON (no markdown, no explanation):
{
  "summary": "2-3 sentence summary of key points",
  "tasks": [
    {
      "task": "action",
      "assignee": "person or 'Unassigned'",
      "priority": "High/Medium/Low",
      "deadline": "YYYY-MM-DD",
      "reasoning": "why this matters"
    }
  ]
}

Transcript:
${transcript}`;
};
