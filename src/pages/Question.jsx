import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { evaluateAnswer } from '../services/claudeApi';
import Button from '../components/Button';

const Question = () => {
  const navigate = useNavigate();
  const { number } = useParams();
  const questionNumber = parseInt(number);
  const { 
    selectedQuestions, 
    userAnswers, 
    feedback,
    currentQuestionIndex, 
    addAnswer, 
    addFeedback,
    nextQuestion 
  } = useApp();
  
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  useEffect(() => {
    if (!selectedQuestions.length || questionNumber - 1 !== currentQuestionIndex) {
      navigate('/');
    }
    if (userAnswers[currentQuestionIndex] && feedback[currentQuestionIndex]) {
      setAnswer(userAnswers[currentQuestionIndex]);
      setSubmitted(true);
    }
  }, [selectedQuestions, questionNumber, currentQuestionIndex, navigate, userAnswers, feedback]);

  const currentScenario = selectedQuestions[currentQuestionIndex];
  
  if (!currentScenario) return null;

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const feedbackText = await evaluateAnswer(currentScenario, answer);
      addAnswer(answer);
      addFeedback(feedbackText);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to get feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (questionNumber === 5) {
      navigate('/results');
    } else {
      nextQuestion();
      navigate(`/question/${questionNumber + 1}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* Question Panel */}
        <div style={styles.windowPanel}>
          <div style={styles.windowInner}>
            <div style={styles.titleBar}>
              <h2 style={styles.titleText}>Question {questionNumber} of 5 - {currentScenario.category.toLowerCase()}</h2>
            </div>
            <div style={styles.windowContent}>
              <h3 style={styles.scenarioTitle}>{currentScenario.title}</h3>
              <div style={styles.scenarioText}>
                {currentScenario.scenario.split('\n\n').map((paragraph, index) => (
                  <p key={index} style={styles.paragraph}>{paragraph}</p>
                ))}
              </div>
              <p style={styles.questionPrompt}>What do you do?</p>
            </div>
          </div>
        </div>

        {/* Answer Panel */}
        <div style={styles.windowPanel}>
          <div style={styles.windowInner}>
            <div style={styles.titleBar}>
              <h2 style={styles.titleText}>Your answer - Notepad</h2>
              <div style={styles.windowControls}>
                <div style={styles.windowButton}>X</div>
                <div style={styles.windowButton}>X</div>
              </div>
            </div>
            <div style={styles.answerContent}>
              <textarea
                style={styles.textarea}
                placeholder="Type your response here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitted}
              />
            </div>
            {!submitted && (
              <div style={styles.answerFooter}>
                <button
                  style={{
                    ...styles.submitButton,
                    ...((!answer.trim() || loading) ? styles.submitButtonDisabled : {})
                  }}
                  onClick={handleSubmit}
                  disabled={!answer.trim() || loading}
                >
                  {loading ? 'Analyzing...' : 'Submit answer'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Panel - Always Shown */}
        <div style={styles.windowPanel}>
          <div style={styles.windowInner}>
            <div style={styles.titleBar}>
              <h2 style={styles.titleText}>Analyzer 3000</h2>
              <div style={styles.windowControls}>
                <div style={styles.windowButton}>X</div>
              </div>
            </div>
            <div style={styles.windowContent}>
              {loading ? (
                <p style={styles.feedbackText}>Analyzing your response...</p>
              ) : submitted && feedback[currentQuestionIndex] ? (
                feedback[currentQuestionIndex].split('**').map((part, index) => {
                  if (index % 2 === 1) {
                    return <h4 key={index} style={styles.feedbackHeader}>{part}</h4>;
                  }
                  return part.split('\n').map((line, lineIndex) => {
                    if (line.startsWith('- ')) {
                      return <p key={`${index}-${lineIndex}`} style={styles.feedbackItem}>• {line.substring(2)}</p>;
                    }
                    return line ? <p key={`${index}-${lineIndex}`} style={styles.feedbackText}>{line}</p> : null;
                  });
                })
              ) : (
                <p style={styles.waitingText}>Waiting for submission...</p>
              )}
            </div>
            {submitted && feedback[currentQuestionIndex] && (
              <div style={styles.feedbackFooter}>
                <button
                  style={styles.nextButton}
                  onClick={handleNext}
                >
                  {questionNumber === 5 ? 'View Results' : 'Next Question'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={styles.bottomBar}>
        <div style={styles.bottomBarInner}>
          <button style={styles.bottomButton}>
            What's expected of me again?
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.errorPopup}>
          <div style={styles.errorContent}>
            <p>{error}</p>
            <button style={styles.retryButton} onClick={handleSubmit}>
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#008081',
    position: 'relative'
  },
  mainContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '24px',
    padding: '40px 20px',
    flexGrow: 1,
    flexWrap: 'wrap'
  },
  windowPanel: {
    backgroundColor: 'silver',
    padding: '8px',
    width: '431px',
    maxWidth: '100%',
    maxHeight: '80vh',
    boxShadow: '2px 0 0 0 #fcf9fb inset, 0 2px 0 0 #fcf9fb inset, -2px 0 0 0 #333331 inset, 0 -2px 0 0 #333331 inset',
    display: 'flex',
    flexDirection: 'column'
  },
  windowInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    position: 'relative'
  },
  titleBar: {
    backgroundColor: '#05007f',
    color: 'white',
    padding: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  titleText: {
    fontSize: '16px',
    fontWeight: 600,
    margin: 0
  },
  windowControls: {
    display: 'flex',
    gap: '4px'
  },
  windowButton: {
    width: '20px',
    height: '20px',
    backgroundColor: 'silver',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '2px 0 0 0 #fcf9fb inset, 0 2px 0 0 #fcf9fb inset, -2px 0 0 0 #333331 inset, 0 -2px 0 0 #333331 inset'
  },
  windowContent: {
    backgroundColor: '#d6d6d6',
    padding: '12px',
    boxShadow: '2px 0 0 0 #999999 inset, 0 2px 0 0 #999999 inset, -2px 0 0 0 #fafafa inset, 0 -2px 0 0 #fafafa inset',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    height: 'calc(80vh - 60px)',
    overflowY: 'auto'
  },
  answerContent: {
    backgroundColor: 'white',
    padding: '12px',
    boxShadow: '2px 0 0 0 #999999 inset, 0 2px 0 0 #999999 inset, -2px 0 0 0 #fafafa inset, 0 -2px 0 0 #fafafa inset',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(80vh - 60px)',
    overflowY: 'auto'
  },
  scenarioTitle: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '10px',
    color: 'black'
  },
  scenarioText: {
    fontSize: '18px',
    lineHeight: '1.4',
    color: 'black'
  },
  paragraph: {
    marginBottom: '16px'
  },
  questionPrompt: {
    fontSize: '18px',
    fontWeight: 400,
    marginTop: 'auto',
    color: 'black'
  },
  textarea: {
    width: '100%',
    minHeight: '400px',
    padding: '8px',
    fontSize: '18px',
    border: 'none',
    backgroundColor: 'transparent',
    resize: 'none',
    fontFamily: 'W95Font, sans-serif',
    lineHeight: '1.4',
    flexGrow: 1
  },
  answerFooter: {
    backgroundColor: 'silver',
    display: 'flex',
    gap: '4px',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: '4px',
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  feedbackFooter: {
    backgroundColor: 'silver',
    display: 'flex',
    gap: '4px',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: '4px',
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  submitButton: {
    backgroundColor: '#d6d6d6',
    padding: '8px',
    fontSize: '18px',
    fontFamily: 'W95Font, sans-serif',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '2px 0 0 0 #fcf9fb inset, 0 2px 0 0 #fcf9fb inset, -2px 0 0 0 #333331 inset, 0 -2px 0 0 #333331 inset'
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  nextButton: {
    backgroundColor: '#d6d6d6',
    padding: '8px',
    fontSize: '18px',
    fontFamily: 'W95Font, sans-serif',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '2px 0 0 0 #fcf9fb inset, 0 2px 0 0 #fcf9fb inset, -2px 0 0 0 #333331 inset, 0 -2px 0 0 #333331 inset'
  },
  feedbackHeader: {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '10px',
    color: 'black'
  },
  feedbackItem: {
    fontSize: '18px',
    marginBottom: '8px',
    marginLeft: '0',
    color: 'black'
  },
  feedbackText: {
    fontSize: '18px',
    marginBottom: '8px',
    color: 'black'
  },
  waitingText: {
    fontSize: '18px',
    color: '#666666',
    fontStyle: 'italic'
  },
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#d9d9d9',
    padding: '16px 20px',
    boxShadow: '2px 0 0 0 #fcf9fb inset, 0 2px 0 0 #fcf9fb inset, -2px 0 0 0 #333331 inset, 0 -2px 0 0 #333331 inset'
  },
  bottomBarInner: {
    display: 'flex',
    gap: '8px'
  },
  bottomButton: {
    backgroundColor: '#d6d6d6',
    padding: '8px',
    fontSize: '18px',
    fontFamily: 'W95Font, sans-serif',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '2px 0 0 0 #fcf9fb inset, 0 2px 0 0 #fcf9fb inset, -2px 0 0 0 #333331 inset, 0 -2px 0 0 #333331 inset'
  },
  errorPopup: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'silver',
    padding: '8px',
    boxShadow: '2px 0 0 0 #fcf9fb inset, 0 2px 0 0 #fcf9fb inset, -2px 0 0 0 #333331 inset, 0 -2px 0 0 #333331 inset',
    zIndex: 1000
  },
  errorContent: {
    backgroundColor: '#d6d6d6',
    padding: '20px',
    boxShadow: '2px 0 0 0 #999999 inset, 0 2px 0 0 #999999 inset, -2px 0 0 0 #fafafa inset, 0 -2px 0 0 #fafafa inset',
    textAlign: 'center'
  },
  retryButton: {
    backgroundColor: '#d6d6d6',
    padding: '8px 16px',
    fontSize: '18px',
    fontFamily: 'W95Font, sans-serif',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '2px 0 0 0 #fcf9fb inset, 0 2px 0 0 #fcf9fb inset, -2px 0 0 0 #333331 inset, 0 -2px 0 0 #333331 inset'
  }
};

export default Question;