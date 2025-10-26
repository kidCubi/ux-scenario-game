# UX Designer Scenario Practice Game

A React application for practicing UX leadership scenarios with AI-powered feedback.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Key:**
   - Open `.env` file
   - Replace `your_claude_api_key_here` with your actual Claude API key from Anthropic

3. **Run the application:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Navigate to `http://localhost:5173` (or the URL shown in terminal)

## Features

- 15 challenging UX design scenarios across 3 categories:
  - Business Pressure Scenarios
  - Political/Organizational Scenarios
  - Ethical/Data Interpretation Scenarios
- AI-powered feedback on your responses
- Overall performance evaluation with designer level assessment
- Progress tracking throughout the practice session

## How to Use

1. Click "Start Practice" on the landing page
2. Read each scenario carefully
3. Type your response in the textarea
4. Submit to get AI feedback
5. Complete all 5 questions
6. View your overall results and designer level

## Notes

- The app randomly selects 5 scenarios for each practice session
- All state is managed in React (no data persistence)
- Requires a valid Claude API key to function
- API calls may take a few seconds for feedback generation
