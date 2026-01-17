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
    const { questionsAndAnswers } = await request.json();

    if (!questionsAndAnswers || !Array.isArray(questionsAndAnswers)) {
      return Response.json({ error: 'Invalid questionsAndAnswers data' }, { status: 400 });
    }

    // Check if API key is available
    if (!process.env.CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY environment variable is not set');
      return Response.json(
        { error: 'API key configuration error. Please check environment variables.' },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    let prompt = `You are evaluating a UX designer's overall performance across 5 scenario responses. Assign them a level and provide summary feedback.\n\n`;

    questionsAndAnswers.forEach((qa, index) => {
      prompt += `SCENARIO ${index + 1}: ${qa.scenario.title}\n`;
      prompt += `${qa.scenario.scenario}\n\n`;
      prompt += `USER'S ANSWER:\n${qa.answer}\n\n`;
      prompt += `FEEDBACK RECEIVED:\n${qa.feedback}\n\n`;
      prompt += '---\n\n';
    });

    prompt += `Based on ALL responses, assign ONE level:
- Junior Designer: Tactical thinking, missing stakeholder considerations, accepting constraints without questioning
- Mid Designer: Good tactical skills, some strategic thinking, but inconsistent in challenging assumptions
- Senior Designer: Strong strategic thinking, balances users and business, challenges assumptions, navigates politics
- Lead Designer: Exceptional strategic thinking, builds alliances, reframes problems, thinks long-term, handles politics masterfully

SPECIAL CASES:
- If most responses were low-effort or trolling, assign "Junior Designer" and provide a dry, matter-of-fact summary about insufficient evidence to evaluate UX capabilities.
- If responses were mixed (some genuine, some low-effort), focus evaluation on the genuine responses but note the inconsistency.

Provide your evaluation in this format:
LEVEL: [Junior Designer/Mid Designer/Senior Designer/Lead Designer]

SUMMARY:
[2-3 paragraph summary of their overall strengths, patterns in their thinking, and areas for growth. For low-effort candidates, be dry and matter-of-fact.]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Claude API error:', errorData);
      return Response.json(
        { error: 'Failed to get overall evaluation. Please try again.' },
        { status: response.status, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const data = await response.json();
    const responseText = data.content[0].text;
    const levelMatch = responseText.match(/LEVEL:\s*(.+)/);
    const summaryMatch = responseText.match(/SUMMARY:\s*([\s\S]+)/);

    const evaluation = {
      level: levelMatch ? levelMatch[1].trim() : 'Mid Designer',
      summary: summaryMatch ? summaryMatch[1].trim() : responseText
    };

    return Response.json(
      { evaluation },
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
      { error: 'Failed to get overall evaluation. Please try again.' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
};
