import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Landing from './pages/Landing';
import Question from './pages/Question';
import Results from './pages/Results';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/question/:number" element={<Question />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App
