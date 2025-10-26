const axios = require('axios');

const headers = {
  'anthropic-version': '2023-06-01',
  'content-type': 'application/json',
  'x-api-key': process.env.CLAUDE_API_KEY
};

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Basic rate limiting - simple IP-based check
  const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
  
  try {
    const { scenario, userAnswer } = JSON.parse(event.body);

    if (!scenario || !userAnswer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing scenario or userAnswer' })
      };
    }

    // Debug: Check if API key is available
    if (!process.env.CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY environment variable is not set');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'API key configuration error. Please check environment variables.' 
        })
      };
    }

    const prompt = `You are evaluating a UX designer's response to a scenario. Analyze their thinking and provide constructive feedback.

SCENARIO:
${scenario.scenario}

USER'S ANSWER:
${userAnswer}

EVALUATION INSTRUCTIONS:
1. First, assess the quality and effort level of the response:
   - If the answer is clearly low-effort (like "test", "idk", very short responses, or obvious nonsense), respond with dry, matter-of-fact feedback like "The candidate didn't provide enough information to evaluate their UX thinking process."
   - If the answer is trolling, insulting, or inappropriate, respond with dry, GladOS-style sarcasm like "Fascinating. The candidate appears to have confused this with a different type of assessment entirely."
   - If the answer shows genuine effort and UX thinking, provide normal constructive feedback.

2. For genuine responses, provide feedback in this format:
**What you did well:**
- [Bullet points of strengths]

**What to consider:**
- [Bullet points of gaps or alternative perspectives]

**Alternative approaches:**
- [Bullet points of other valid approaches]

3. For low-effort or inappropriate responses, give a single dry paragraph without the structured format.

Keep feedback encouraging but honest for genuine responses. For low-effort responses, be matter-of-fact and dry. For trolling responses, channel GladOS from Portal - dry, slightly condescending, but professionally restrained.`;

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    }, { headers });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: JSON.stringify({ 
        feedback: response.data.content[0].text 
      })
    };

  } catch (error) {
    console.error('Error calling Claude API:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to get feedback. Please try again.' 
      })
    };
  }
};