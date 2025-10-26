import React, { createContext, useState, useContext } from 'react';
import { scenarios } from '../data/scenarios';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [overallEvaluation, setOverallEvaluation] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const initializeGame = () => {
    const shuffled = [...scenarios].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    setSelectedQuestions(selected);
    setUserAnswers([]);
    setFeedback([]);
    setOverallEvaluation(null);
    setCurrentQuestionIndex(0);
  };

  const addAnswer = (answer) => {
    setUserAnswers([...userAnswers, answer]);
  };

  const addFeedback = (feedbackText) => {
    setFeedback([...feedback, feedbackText]);
  };

  const setOverall = (evaluation) => {
    setOverallEvaluation(evaluation);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const resetGame = () => {
    setSelectedQuestions([]);
    setUserAnswers([]);
    setFeedback([]);
    setOverallEvaluation(null);
    setCurrentQuestionIndex(0);
  };

  const value = {
    selectedQuestions,
    userAnswers,
    feedback,
    overallEvaluation,
    currentQuestionIndex,
    initializeGame,
    addAnswer,
    addFeedback,
    setOverall,
    nextQuestion,
    resetGame
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};