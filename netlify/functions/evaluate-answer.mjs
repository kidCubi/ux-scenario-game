export default async (request, context) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { scenario, userAnswer } = await request.json();

    if (!scenario || !userAnswer) {
      return Response.json({ error: 'Missing scenario or userAnswer' }, { status: 400 });
    }

    // Check if API key is available
    if (!process.env.CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY environment variable is not set');
      return Response.json(
        { error: 'API key configuration error. Please check environment variables.' },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Check API key format
    if (!process.env.CLAUDE_API_KEY.startsWith('sk-ant-')) {
      console.error('CLAUDE_API_KEY format appears invalid');
      return Response.json(
        { error: 'API key format error. Claude API keys should start with sk-ant-' },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const prompt = `You are evaluating a UX designer's response to a scenario. Analyze their thinking and provide constructive feedback.

SCENARIO:
${scenario.scenario}

USER'S ANSWER:
${userAnswer}

EVALUATION INSTRUCTIONS:
1. First, assess the quality and effort level of the response:
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Claude API error:', errorData);
      const errorMessage = response.status === 401
        ? 'Authentication failed. API key may be invalid or missing.'
        : errorData?.error?.message || 'Failed to get feedback. Please try again.';
      return Response.json(
        { error: errorMessage },
        { status: response.status, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const data = await response.json();

    return Response.json(
      { feedback: data.content[0].text },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST'
        }
      }
    );

  } catch (error) {
    console.error('Error calling Claude API:', error);
    return Response.json(
      { error: 'Failed to get feedback. Please try again.' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
};
