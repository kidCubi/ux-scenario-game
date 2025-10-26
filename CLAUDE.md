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