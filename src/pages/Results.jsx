import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { evaluateOverall } from '../services/claudeApi';
import Button from '../components/Button';
import Window95Modal from '../components/Window95Modal';

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
  const [showQuestionBreakdown, setShowQuestionBreakdown] = useState(false);
  


  useEffect(() => {
    if (!overallEvaluation && selectedQuestions.length && userAnswers.length === 5 && !loading) {
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

  const formatQuestionsForModal = () => {
    return selectedQuestions.map((question, index) => {
      const feedbackText = feedback[index] || '';
      const parts = feedbackText.split('**');
      
      let feedbackTitle = 'Feedback';
      let mainFeedback = '';
      let strengths = '';
      let growthAreas = '';
      
      // Parse the feedback format
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 1) { // Bold sections
          if (parts[i].includes('Ethical Stance') || parts[i].includes('Advocacy') || parts[i].includes('Approach') || parts[i].includes('Mindset') || parts[i].includes('Management')) {
            feedbackTitle = parts[i].trim();
          }
        } else { // Regular text sections
          const text = parts[i].trim();
          if (text && !mainFeedback) {
            mainFeedback = text;
          } else if (text.includes('strongest areas') || text.includes('Strengths:')) {
            strengths = text;
          } else if (text.includes('reach the Lead level') || text.includes('Areas for growth:')) {
            growthAreas = text;
          }
        }
      }

      return {
        answer: userAnswers[index] || '';
        feedbackTitle: feedbackTitle,
        feedbackText: mainFeedback,
        strengths: strengths,
        growthAreas: growthAreas
      };
    });
  };

  const getLevelColor = (level) => {
    return '#17a2b8'; // Same turquoise/blue color for all levels
  };

  return (
    <div style={styles.desktop}>
      {/* Main Results Window */}
      <div style={styles.windowPanel}>
        <div style={styles.windowInner}>
          {/* Title Bar */}
          <div style={styles.titleBar}>
            <h1 style={styles.titleText}>UX Designer Assessment Results - The Firm</h1>
          </div>
          
          {/* Window Content */}
          <div style={styles.windowContent}>
            {loading && (
              <div style={styles.loadingPanel}>
                <p style={styles.loadingText}>Analyzing your overall performance...</p>
              </div>
            )}

            {error && (
              <div style={styles.errorPanel}>
                <div style={styles.errorHeader}>
                  <h3 style={styles.errorTitle}>Error</h3>
                </div>
                <div style={styles.errorContent}>
                  <p style={styles.errorText}>{error}</p>
                  <Button onClick={fetchOverallEvaluation}>
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {overallEvaluation && (
              <div style={styles.overallPanel}>
                <div style={styles.overallHeader}>
                  <h2 style={styles.overallTitle}>Overall Assessment</h2>
                </div>
                <div style={styles.overallContent}>
                  <div style={{...styles.levelBadge, backgroundColor: getLevelColor(overallEvaluation.level)}}>
                    {overallEvaluation.level}
                  </div>
                  <div style={styles.summary}>
                    {overallEvaluation.summary.split('\n\n').map((paragraph, index) => (
                      <p key={index} style={styles.summaryParagraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Individual Question Reviews */}
            <div style={styles.reviewPanel}>
              <div style={styles.reviewHeader}>
                <h2 style={styles.reviewTitle}>Individual Question Reviews</h2>
              </div>
              <div style={styles.reviewContent}>
                {selectedQuestions.map((scenario, index) => (
                  <div key={scenario.id} style={styles.questionPanel}>
                    <div style={styles.questionHeader} onClick={() => toggleQuestion(index)}>
                      <h3 style={styles.questionTitle}>
                        Question {index + 1}: {scenario.title}
                      </h3>
                      <span style={styles.expandIcon}>
                        {expandedQuestions[index] ? '▼' : '▶'}
                      </span>
                    </div>
                    
                    {expandedQuestions[index] && (
                      <div style={styles.questionDetails}>
                        <div style={styles.scenarioPanel}>
                          <h4 style={styles.subheading}>Scenario:</h4>
                          <div style={styles.scenarioText}>
                            {scenario.scenario.split('\n\n').map((paragraph, pIndex) => (
                              <p key={pIndex} style={styles.scenarioParagraph}>{paragraph}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div style={styles.answerPanel}>
                      <h4 style={styles.subheading}>Your Answer:</h4>
                      <div style={styles.answerContent}>
                        <p style={styles.answerText}>{userAnswers[index]}</p>
                      </div>
                    </div>
                    
                    <div style={styles.feedbackPanel}>
                      <h4 style={styles.subheading}>Assessment Feedback:</h4>
                      <div style={styles.feedbackContent}>
                        {feedback[index] && feedback[index].split('**').map((part, partIndex) => {
                          if (partIndex % 2 === 1) {
                            return <h5 key={partIndex} style={styles.feedbackHeader}>{part}</h5>;
                          }
                          return part.split('\n').map((line, lineIndex) => {
                            if (line.startsWith('- ')) {
                              return <p key={`${partIndex}-${lineIndex}`} style={styles.feedbackItem}>• {line.substring(2)}</p>;
                            }
                            return line ? <p key={`${partIndex}-${lineIndex}`} style={styles.feedbackText}>{line}</p> : null;
                          });
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Window Footer */}
          <div style={styles.windowFooter}>
            <Button onClick={() => setShowQuestionBreakdown(true)}>
              Question Breakdown
            </Button>
            <Button onClick={handleStartOver}>
              Start Over
            </Button>
          </div>
        </div>
      </div>
      
      {/* Taskbar */}
      <div style={styles.taskbar}>
        <div style={styles.taskbarInner}>
          <div style={styles.taskbarLeft}>
            <button 
              style={styles.demoButton}
              onClick={() => navigate('/')}
            >
              Back to Desktop
            </button>
          </div>
          <div style={styles.taskbarRight}>
            <div style={styles.clock}>
              {new Date().toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Question Breakdown Modal */}
      {showQuestionBreakdown && (
        <Window95Modal
          questionsData={formatQuestionsForModal()}
          onClose={() => setShowQuestionBreakdown(false)}
          style={{ zIndex: 3000 }}
        >
          <div>If you see this text, the questionsData prop is not working</div>
        </Window95Modal>
      )}
    </div>
  );
};

const styles = {
  desktop: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#008081',
    position: 'relative',
    cursor: 'default',
    userSelect: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box'
  },
  windowPanel: {
    backgroundColor: '#c0c0c0',
    border: '2px solid',
    borderTopColor: '#fcf9fb',
    borderLeftColor: '#fcf9fb',
    borderBottomColor: '#333331',
    borderRightColor: '#333331',
    boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.5)',
    width: '90%',
    maxWidth: '1000px',
    height: '90%',
    maxHeight: '800px',
    display: 'flex',
    flexDirection: 'column'
  },
  windowInner: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  titleBar: {
    backgroundColor: '#05007f',
    color: 'white',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif'
  },
  titleText: {
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
    userSelect: 'none'
  },
  windowContent: {
    backgroundColor: '#d6d6d6',
    border: '2px inset',
    borderTopColor: '#999999',
    borderLeftColor: '#999999',
    borderBottomColor: '#fafafa',
    borderRightColor: '#fafafa',
    padding: '12px',
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  loadingPanel: {
    backgroundColor: '#c0c0c0',
    border: '2px solid',
    borderTopColor: '#fcf9fb',
    borderLeftColor: '#fcf9fb',
    borderBottomColor: '#333331',
    borderRightColor: '#333331',
    padding: '20px',
    textAlign: 'center'
  },
  loadingText: {
    fontSize: '14px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    color: '#000000',
    margin: 0
  },
  errorPanel: {
    backgroundColor: '#c0c0c0',
    border: '2px solid',
    borderTopColor: '#fcf9fb',
    borderLeftColor: '#fcf9fb',
    borderBottomColor: '#333331',
    borderRightColor: '#333331'
  },
  errorHeader: {
    backgroundColor: '#05007f',
    color: 'white',
    padding: '4px 8px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif'
  },
  errorTitle: {
    fontSize: '14px',
    fontWeight: 600,
    margin: 0
  },
  errorContent: {
    backgroundColor: '#d6d6d6',
    border: '2px inset',
    borderTopColor: '#999999',
    borderLeftColor: '#999999',
    borderBottomColor: '#fafafa',
    borderRightColor: '#fafafa',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    alignItems: 'center'
  },
  errorText: {
    fontSize: '14px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    color: '#000000',
    margin: 0,
    textAlign: 'center'
  },
  overallPanel: {
    backgroundColor: '#c0c0c0',
    border: '2px solid',
    borderTopColor: '#fcf9fb',
    borderLeftColor: '#fcf9fb',
    borderBottomColor: '#333331',
    borderRightColor: '#333331',
    marginBottom: '12px'
  },
  overallHeader: {
    backgroundColor: '#05007f',
    color: 'white',
    padding: '4px 8px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif'
  },
  overallTitle: {
    fontSize: '14px',
    fontWeight: 600,
    margin: 0
  },
  overallContent: {
    backgroundColor: '#d6d6d6',
    border: '2px inset',
    borderTopColor: '#999999',
    borderLeftColor: '#999999',
    borderBottomColor: '#fafafa',
    borderRightColor: '#fafafa',
    padding: '16px',
    textAlign: 'center'
  },
  levelBadge: {
    display: 'inline-block',
    color: 'white',
    padding: '8px 16px',
    fontSize: '16px',
    fontWeight: 600,
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    border: '2px solid',
    borderTopColor: '#fcf9fb',
    borderLeftColor: '#fcf9fb',
    borderBottomColor: '#333331',
    borderRightColor: '#333331',
    marginBottom: '12px'
  },
  summary: {
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.4',
    color: '#000000',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    fontSize: '14px'
  },
  summaryParagraph: {
    marginBottom: '12px'
  },
  reviewPanel: {
    backgroundColor: '#c0c0c0',
    border: '2px solid',
    borderTopColor: '#fcf9fb',
    borderLeftColor: '#fcf9fb',
    borderBottomColor: '#333331',
    borderRightColor: '#333331',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  reviewHeader: {
    backgroundColor: '#05007f',
    color: 'white',
    padding: '4px 8px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif'
  },
  reviewTitle: {
    fontSize: '14px',
    fontWeight: 600,
    margin: 0
  },
  reviewContent: {
    backgroundColor: '#d6d6d6',
    border: '2px inset',
    borderTopColor: '#999999',
    borderLeftColor: '#999999',
    borderBottomColor: '#fafafa',
    borderRightColor: '#fafafa',
    padding: '8px',
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  questionPanel: {
    backgroundColor: '#c0c0c0',
    border: '2px solid',
    borderTopColor: '#fcf9fb',
    borderLeftColor: '#fcf9fb',
    borderBottomColor: '#333331',
    borderRightColor: '#333331',
    padding: '8px'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '4px',
    backgroundColor: '#d6d6d6',
    border: '1px solid',
    borderTopColor: '#fcf9fb',
    borderLeftColor: '#fcf9fb',
    borderBottomColor: '#999999',
    borderRightColor: '#999999'
  },
  questionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#000000',
    margin: 0,
    fontFamily: 'W95Font, MS Sans Serif, sans-serif'
  },
  expandIcon: {
    color: '#000000',
    fontSize: '14px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    userSelect: 'none'
  },
  questionDetails: {
    marginTop: '8px'
  },
  scenarioPanel: {
    backgroundColor: '#d6d6d6',
    border: '2px inset',
    borderTopColor: '#999999',
    borderLeftColor: '#999999',
    borderBottomColor: '#fafafa',
    borderRightColor: '#fafafa',
    padding: '8px',
    marginBottom: '8px'
  },
  scenarioText: {
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    fontSize: '14px',
    color: '#000000',
    lineHeight: '1.4'
  },
  scenarioParagraph: {
    marginBottom: '8px'
  },
  answerPanel: {
    backgroundColor: '#d6d6d6',
    border: '2px inset',
    borderTopColor: '#999999',
    borderLeftColor: '#999999',
    borderBottomColor: '#fafafa',
    borderRightColor: '#fafafa',
    padding: '8px',
    marginTop: '8px'
  },
  answerContent: {
    backgroundColor: 'white',
    border: '1px solid #999999',
    padding: '8px',
    marginTop: '4px'
  },
  answerText: {
    fontSize: '14px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    color: '#000000',
    lineHeight: '1.4',
    whiteSpace: 'pre-wrap',
    margin: 0
  },
  feedbackPanel: {
    backgroundColor: '#d6d6d6',
    border: '2px inset',
    borderTopColor: '#999999',
    borderLeftColor: '#999999',
    borderBottomColor: '#fafafa',
    borderRightColor: '#fafafa',
    padding: '8px',
    marginTop: '8px'
  },
  feedbackContent: {
    backgroundColor: 'white',
    border: '1px solid #999999',
    padding: '8px',
    marginTop: '4px',
    lineHeight: '1.4'
  },
  feedbackHeader: {
    fontSize: '14px',
    fontWeight: 600,
    marginTop: '8px',
    marginBottom: '4px',
    color: '#000000',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif'
  },
  feedbackText: {
    fontSize: '14px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    color: '#000000',
    marginBottom: '4px'
  },
  feedbackItem: {
    fontSize: '14px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    color: '#000000',
    marginBottom: '4px',
    marginLeft: '0'
  },
  subheading: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '4px',
    color: '#000000',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif'
  },
  windowFooter: {
    backgroundColor: '#c0c0c0',
    padding: '8px',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px'
  },
  taskbar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#d9d9d9',
    padding: '16px 20px',
    boxShadow: '2px 0 0 0 #fcf9fb inset, 0 2px 0 0 #fcf9fb inset, -2px 0 0 0 #333331 inset, 0 -2px 0 0 #333331 inset',
    zIndex: 500
  },
  taskbarInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  taskbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  taskbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  demoButton: {
    backgroundColor: '#d6d6d6',
    border: '2px solid',
    borderTopColor: '#fcf9fb',
    borderLeftColor: '#fcf9fb',
    borderBottomColor: '#333331',
    borderRightColor: '#333331',
    padding: '4px 8px',
    fontSize: '14px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    color: '#000000',
    cursor: 'pointer',
    userSelect: 'none'
  },
  clock: {
    backgroundColor: '#d6d6d6',
    border: '2px inset',
    borderTopColor: '#999999',
    borderLeftColor: '#999999',
    borderBottomColor: '#fafafa',
    borderRightColor: '#fafafa',
    padding: '4px 8px',
    fontSize: '14px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    color: '#000000',
    minWidth: '65px',
    textAlign: 'center',
    userSelect: 'none'
  }
};

export default Results;