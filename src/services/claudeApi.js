import axios from 'axios';

const API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

const headers = {
  'anthropic-version': '2023-06-01',
  'content-type': 'application/json',
  'x-api-key': API_KEY,
  'anthropic-dangerous-direct-browser-access': 'true'
};

export async function evaluateAnswer(scenario, userAnswer) {
  const prompt = `You are evaluating a UX designer's response to a scenario. Analyze their thinking and provide constructive feedback.

SCENARIO:
${scenario.scenario}

USER'S ANSWER:
${userAnswer}

Provide feedback in this format:
**What you did well:**
- [Bullet points of strengths]

**What to consider:**
- [Bullet points of gaps or alternative perspectives]

**Alternative approaches:**
- [Bullet points of other valid approaches]

Keep feedback encouraging but honest. Focus on strategic thinking, stakeholder management, and decision-making process.`;

  try {
    const response = await axios.post(API_URL, {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    }, { headers });

    return response.data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error('Failed to get feedback. Please try again.');
  }
}

export async function evaluateOverall(questionsAndAnswers) {
  let prompt = `You are evaluating a UX designer's overall performance across 5 scenario responses. Assign them a level and provide summary feedback.\n\n`;
  
  questionsAndAnswers.forEach((qa, index) => {
    prompt += `SCENARIO ${index + 1}: ${qa.scenario.title}\n`;
    prompt += `${qa.scenario.scenario}\n\n`;
    prompt += `USER'S ANSWER:\n${qa.answer}\n\n`;
    prompt += `FEEDBACK RECEIVED:\n${qa.feedback}\n\n`;
    prompt += '---\n\n';
  });

  prompt += `Based on ALL responses, assign ONE level:
- Junior Designer (0-40%): Tactical thinking, missing stakeholder considerations, accepting constraints without questioning
- Mid Designer (41-60%): Good tactical skills, some strategic thinking, but inconsistent in challenging assumptions  
- Senior Designer (61-80%): Strong strategic thinking, balances users and business, challenges assumptions, navigates politics
- Lead Designer (81-100%): Exceptional strategic thinking, builds alliances, reframes problems, thinks long-term, handles politics masterfully

Provide your evaluation in this format:
LEVEL: [Junior Designer/Mid Designer/Senior Designer/Lead Designer]

SUMMARY:
[2-3 paragraph summary of their overall strengths, patterns in their thinking, and areas for growth]`;

  try {
    const response = await axios.post(API_URL, {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    }, { headers });

    const responseText = response.data.content[0].text;
    const levelMatch = responseText.match(/LEVEL:\s*(.+)/);
    const summaryMatch = responseText.match(/SUMMARY:\s*([\s\S]+)/);
    
    return {
      level: levelMatch ? levelMatch[1].trim() : 'Mid Designer',
      summary: summaryMatch ? summaryMatch[1].trim() : responseText
    };
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error('Failed to get overall evaluation. Please try again.');
  }
}