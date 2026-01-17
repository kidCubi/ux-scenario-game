# UX Designer Scenario Practice Game - Project Knowledge

## Project Overview
This is a React-based web application that helps UX designers practice handling challenging real-world scenarios. Users answer questions about complex UX situations and receive AI-powered feedback on their responses.

## Key Features
- 15 pre-written scenarios across 3 categories (5 each):
  - Business Pressure Scenarios
  - Political/Organizational Scenarios
  - Ethical/Data Interpretation Scenarios
- Random selection of 5 scenarios per practice session
- AI-powered feedback using Claude API
- Progress tracking and performance evaluation
- Designer level assessment at completion

## Technical Stack
- **Framework**: React 19.1.1
- **Routing**: React Router DOM 7.1.1
- **Build Tool**: Vite 7.1.7
- **HTTP Client**: Axios 1.8.1
- **Styling**: Custom CSS with Windows 95-style fonts
- **State Management**: React Context API
- **Linting**: ESLint 9.36.0

## Project Structure
```
ux-scenario-game/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx      # Start screen
│   │   ├── Question.jsx     # Scenario presentation and response
│   │   └── Results.jsx      # Final evaluation
│   ├── components/
│   │   └── Button.jsx       # Reusable button component
│   ├── context/
│   │   └── AppContext.jsx   # Global state management
│   ├── data/
│   │   └── scenarios.js     # All 15 scenario definitions
│   ├── services/
│   │   └── claudeApi.js     # Claude API integration
│   ├── App.jsx              # Main app component with routing
│   └── main.jsx             # Entry point
├── public/
│   └── fonts/               # Windows 95 style fonts
└── package.json             # Dependencies and scripts
```

## Key Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Application Flow
1. **Landing Page** (`/`) - Introduction and start button
2. **Question Pages** (`/question/:number`) - Display scenario, collect response
3. **Results Page** (`/results`) - Show feedback and overall evaluation

## State Management
The app uses React Context (AppContext) to manage:
- Selected scenarios for the session
- User responses
- AI feedback for each response
- Overall results and designer level

## API Integration
- Uses Claude API for evaluating user responses
- Requires API key configuration in `.env` file
- API calls made through `claudeApi.js` service
- Handles feedback generation for individual responses and overall evaluation

## Scenario Structure
Each scenario includes:
- `id`: Unique identifier
- `title`: Short descriptive title
- `category`: One of the three main categories
- `difficulty`: Skill level (mid/senior)
- `scenario`: Detailed situation description with context and challenge

## Design Considerations
- Windows 95 aesthetic with custom fonts
- Simple, focused interface for scenario practice
- No data persistence (all state is session-based)
- Responsive text areas for detailed responses
- Loading states during API calls

## Environment Setup
Requires `.env` file with:
- Claude API key for AI feedback functionality

## Notes for Development
- All scenarios are stored in `/src/data/scenarios.js`
- The app randomly selects 5 scenarios per session
- No user authentication or data storage
- API responses may take several seconds
- Error handling for API failures should be considered

---

## Retrospective: Netlify Functions 404 Issue (Jan 2026)

### Problem
API calls to `/.netlify/functions/evaluate-answer` were returning 404 errors on the deployed Netlify site.

### Debugging Journey

**Initial hypothesis: Functions not detected**
- Functions weren't appearing in Netlify dashboard
- Suspected `.cjs` file extension wasn't being recognized
- Converted from `.cjs` to `.mjs` (ES modules) - didn't fix it

**Second attempt: Wrong function format**
- Tried converting from v1 Lambda format (`export async function handler`) to v2 modern format (`export default async`)
- Also replaced axios with native fetch
- Still got 404

**The breakthrough**
- Tested the endpoint directly with curl POST request
- Response body contained: `{"error":"model: claude-3-opus-20240229"}`
- The 404 was coming FROM the Claude API, not from Netlify
- The function was working all along!

### Root Cause
The Claude model `claude-3-opus-20240229` requires special API access. The API key didn't have access to Opus, so Claude's API returned a 404 for the model.

### Solution
Changed the model from `claude-3-opus-20240229` to `claude-sonnet-4-20250514` in both function files.

### Lessons Learned
1. **Check the response body, not just the status code** - The 404 status was misleading; the response body revealed the actual error
2. **Claude model access varies by API key** - Not all models are available to all API keys (Opus requires special access)
3. **Test endpoints directly with curl** - Browser DevTools showed 404 but didn't reveal the response body clearly
4. **The v2 function format works fine** - The migration to modern Netlify Functions (export default) was a red herring but is still a good practice

### Files Changed
- `netlify/functions/evaluate-answer.mjs` - Converted to v2 format, updated model
- `netlify/functions/evaluate-overall.mjs` - Converted to v2 format, updated model
- `netlify.toml` - Removed invalid `conditions` syntax from redirect