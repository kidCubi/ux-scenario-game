import axios from 'axios';

// Use Netlify Functions instead of direct Claude API calls
const FUNCTIONS_URL = '/.netlify/functions';

export async function evaluateAnswer(scenario, userAnswer) {
  try {
    const response = await axios.post(`${FUNCTIONS_URL}/evaluate-answer`, {
      scenario,
      userAnswer
    });

    return response.data.feedback;
  } catch (error) {
    console.error('Error calling evaluation function:', error);
    throw new Error('Failed to get feedback. Please try again.');
  }
}

export async function evaluateOverall(questionsAndAnswers) {
  try {
    const response = await axios.post(`${FUNCTIONS_URL}/evaluate-overall`, {
      questionsAndAnswers
    });

    return response.data.evaluation;
  } catch (error) {
    console.error('Error calling overall evaluation function:', error);
    throw new Error('Failed to get overall evaluation. Please try again.');
  }
}