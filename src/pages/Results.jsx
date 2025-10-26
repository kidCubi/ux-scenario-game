import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { evaluateOverall } from '../services/claudeApi';
import Button from '../components/Button';

const Results = () => {
  const navigate = useNavigate();
  const { 
    selectedQuestions, 
    userAnswers, 
    feedback,
    overallEvaluation,
    setOverall,
    resetGame
  } = useApp();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    if (!selectedQuestions.length || userAnswers.length !== 5) {
      navigate('/');
      return;
    }
    
    if (!overallEvaluation && !loading) {
      fetchOverallEvaluation();
    }
  }, []);

  const fetchOverallEvaluation = async () => {
    setLoading(true);
    setError('');
    
    try {
      const questionsAndAnswers = selectedQuestions.map((scenario, index) => ({
        scenario,
        answer: userAnswers[index],
        feedback: feedback[index]
      }));
      
      const evaluation = await evaluateOverall(questionsAndAnswers);
      setOverall(evaluation);
    } catch (err) {
      setError(err.message || 'Failed to get overall evaluation.');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleStartOver = () => {
    resetGame();
    navigate('/');
  };

  const getLevelColor = (level) => {
    if (level.includes('Lead')) return '#28a745';
    if (level.includes('Senior')) return '#17a2b8';
    if (level.includes('Mid')) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Your Results</h1>
      
      {loading && (
        <div style={styles.loading}>
          <p>Analyzing your overall performance...</p>
        </div>
      )}

      {error && (
        <div style={styles.error}>
          <p>{error}</p>
          <Button onClick={fetchOverallEvaluation}>
            Retry
          </Button>
        </div>
      )}

      {overallEvaluation && (
        <div style={styles.overallSection}>
          <div style={{...styles.levelBadge, backgroundColor: getLevelColor(overallEvaluation.level)}}>
            {overallEvaluation.level}
          </div>
          <div style={styles.summary}>
            {overallEvaluation.summary.split('\n\n').map((paragraph, index) => (
              <p key={index} style={styles.summaryParagraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      <div style={styles.reviewSection}>
        <h2 style={styles.sectionTitle}>Your Responses</h2>
        
        {selectedQuestions.map((scenario, index) => (
          <div key={scenario.id} style={styles.questionReview}>
            <div style={styles.questionHeader} onClick={() => toggleQuestion(index)}>
              <h3 style={styles.questionTitle}>
                Question {index + 1}: {scenario.title}
              </h3>
              <span style={styles.expandIcon}>
                {expandedQuestions[index] ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedQuestions[index] && (
              <div style={styles.scenarioText}>
                {scenario.scenario.split('\n\n').map((paragraph, pIndex) => (
                  <p key={pIndex} style={styles.scenarioParagraph}>{paragraph}</p>
                ))}
              </div>
            )}
            
            <div style={styles.answerBox}>
              <h4 style={styles.subheading}>Your Answer:</h4>
              <p style={styles.answerText}>{userAnswers[index]}</p>
            </div>
            
            <div style={styles.feedbackBox}>
              <h4 style={styles.subheading}>Feedback:</h4>
              <div style={styles.feedbackContent}>
                {feedback[index].split('**').map((part, partIndex) => {
                  if (partIndex % 2 === 1) {
                    return <h5 key={partIndex} style={styles.feedbackHeader}>{part}</h5>;
                  }
                  return part.split('\n').map((line, lineIndex) => {
                    if (line.startsWith('- ')) {
                      return <li key={`${partIndex}-${lineIndex}`} style={styles.feedbackItem}>{line.substring(2)}</li>;
                    }
                    return line ? <p key={`${partIndex}-${lineIndex}`}>{line}</p> : null;
                  });
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.actions}>
        <Button onClick={handleStartOver}>
          Start Over
        </Button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '20px'
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '30px',
    textAlign: 'center',
    color: '#333'
  },
  loading: {
    textAlign: 'center',
    color: '#007bff',
    margin: '40px 0'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  overallSection: {
    backgroundColor: '#f8f9fa',
    padding: '30px',
    borderRadius: '10px',
    marginBottom: '40px',
    textAlign: 'center'
  },
  levelBadge: {
    display: 'inline-block',
    color: 'white',
    padding: '15px 30px',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    borderRadius: '50px',
    marginBottom: '20px'
  },
  summary: {
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: '1.8',
    color: '#495057'
  },
  summaryParagraph: {
    marginBottom: '15px'
  },
  reviewSection: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '2rem',
    marginBottom: '30px',
    color: '#333'
  },
  questionReview: {
    backgroundColor: '#fff',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    marginBottom: '20px',
    padding: '20px'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '15px'
  },
  questionTitle: {
    fontSize: '1.3rem',
    color: '#007bff',
    margin: 0
  },
  expandIcon: {
    color: '#6c757d',
    fontSize: '0.9rem'
  },
  scenarioText: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px'
  },
  scenarioParagraph: {
    marginBottom: '10px',
    lineHeight: '1.6'
  },
  answerBox: {
    backgroundColor: '#e9ecef',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '15px'
  },
  feedbackBox: {
    backgroundColor: '#f0f8ff',
    padding: '15px',
    borderRadius: '5px'
  },
  subheading: {
    fontSize: '1.1rem',
    marginBottom: '10px',
    color: '#495057'
  },
  answerText: {
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  },
  feedbackContent: {
    lineHeight: '1.6'
  },
  feedbackHeader: {
    marginTop: '10px',
    marginBottom: '8px',
    color: '#495057',
    fontSize: '1rem'
  },
  feedbackItem: {
    marginLeft: '20px',
    marginBottom: '5px'
  },
  actions: {
    textAlign: 'center',
    marginTop: '40px'
  }
};

export default Results;