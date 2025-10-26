import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';

const Landing = () => {
  const navigate = useNavigate();
  const { initializeGame } = useApp();

  const handleStart = () => {
    initializeGame();
    navigate('/question/1');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Practice UX Leadership Scenarios</h1>
      <p style={styles.description}>
        Navigate stakeholder conflicts, business pressure, and ethical dilemmas. 
        Get AI-powered feedback on your thinking.
      </p>
      <Button onClick={handleStart}>
        Start Practice
      </Button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '100px auto',
    padding: '20px',
    textAlign: 'center'
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '30px',
    color: '#333'
  },
  description: {
    fontSize: '1.2rem',
    lineHeight: '1.6',
    marginBottom: '40px',
    color: '#666'
  }
};

export default Landing;