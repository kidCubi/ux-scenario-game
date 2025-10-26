import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { evaluateAnswer } from '../services/claudeApi';
import Button from '../components/Button';
import Window95Modal from '../components/Window95Modal';

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
  const [showExpectedModal, setShowExpectedModal] = useState(false);
  const [modalZIndex, setModalZIndex] = useState(2000);

  // Drag and resize state for each panel
  const [questionPanel, setQuestionPanel] = useState({ 
    position: null, 
    size: { width: 431, height: null },
    isDragging: false, 
    isResizing: false,
    resizeDirection: null,
    dragStart: { x: 0, y: 0 }, 
    zIndex: 1000 
  });
  const [answerPanel, setAnswerPanel] = useState({ 
    position: null, 
    size: { width: 431, height: null },
    isDragging: false, 
    isResizing: false,
    resizeDirection: null,
    dragStart: { x: 0, y: 0 }, 
    zIndex: 1001 
  });
  const [feedbackPanel, setFeedbackPanel] = useState({ 
    position: null, 
    size: { width: 431, height: null },
    isDragging: false, 
    isResizing: false,
    resizeDirection: null,
    dragStart: { x: 0, y: 0 }, 
    zIndex: 1002 
  });
  
  const questionPanelRef = useRef(null);
  const answerPanelRef = useRef(null);
  const feedbackPanelRef = useRef(null);

  // Z-index management
  const bringToFront = (panelType) => {
    // Include modal in z-index calculation
    const currentMaxZIndex = Math.max(questionPanel.zIndex, answerPanel.zIndex, feedbackPanel.zIndex, modalZIndex);
    const newZIndex = currentMaxZIndex + 1;
    
    if (panelType === 'question') {
      setQuestionPanel(prev => ({ ...prev, zIndex: newZIndex }));
    } else if (panelType === 'answer') {
      setAnswerPanel(prev => ({ ...prev, zIndex: newZIndex }));
    } else if (panelType === 'feedback') {
      setFeedbackPanel(prev => ({ ...prev, zIndex: newZIndex }));
    } else if (panelType === 'modal') {
      setModalZIndex(newZIndex);
    }
  };

  // Resize handlers
  const createResizeHandlers = (panelState, setPanelState, panelType) => {
    const handleResizeMouseDown = (e, direction) => {
      e.stopPropagation();
      bringToFront(panelType);
      
      setPanelState(prev => ({
        ...prev,
        isResizing: true,
        resizeDirection: direction,
        dragStart: {
          x: e.clientX,
          y: e.clientY,
          width: prev.size.width,
          height: prev.size.height,
          left: prev.position.x,
          top: prev.position.y
        }
      }));
    };

    const handleResizeMouseMove = (e) => {
      if (!panelState.isResizing) return;

      const deltaX = e.clientX - panelState.dragStart.x;
      const deltaY = e.clientY - panelState.dragStart.y;
      const minWidth = 300;
      const minHeight = 200;

      let newWidth = panelState.dragStart.width;
      let newHeight = panelState.dragStart.height;
      let newX = panelState.dragStart.left;
      let newY = panelState.dragStart.top;

      switch (panelState.resizeDirection) {
        case 'nw': // top-left
          newWidth = Math.max(minWidth, panelState.dragStart.width - deltaX);
          newHeight = Math.max(minHeight, panelState.dragStart.height - deltaY);
          newX = panelState.dragStart.left + (panelState.dragStart.width - newWidth);
          newY = panelState.dragStart.top + (panelState.dragStart.height - newHeight);
          break;
        case 'ne': // top-right
          newWidth = Math.max(minWidth, panelState.dragStart.width + deltaX);
          newHeight = Math.max(minHeight, panelState.dragStart.height - deltaY);
          newY = panelState.dragStart.top + (panelState.dragStart.height - newHeight);
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(minWidth, panelState.dragStart.width - deltaX);
          newHeight = Math.max(minHeight, panelState.dragStart.height + deltaY);
          newX = panelState.dragStart.left + (panelState.dragStart.width - newWidth);
          break;
        case 'se': // bottom-right
          newWidth = Math.max(minWidth, panelState.dragStart.width + deltaX);
          newHeight = Math.max(minHeight, panelState.dragStart.height + deltaY);
          break;
      }

      // Keep within viewport bounds
      const maxX = window.innerWidth - newWidth;
      const maxY = window.innerHeight - newHeight;
      
      setPanelState(prev => ({
        ...prev,
        position: {
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        },
        size: {
          width: newWidth,
          height: newHeight
        }
      }));
    };

    const handleResizeMouseUp = () => {
      setPanelState(prev => ({ 
        ...prev, 
        isResizing: false, 
        resizeDirection: null 
      }));
    };

    return { handleResizeMouseDown, handleResizeMouseMove, handleResizeMouseUp };
  };

  // Drag handlers
  const createDragHandlers = (panelState, setPanelState, panelRef, panelType) => {
    const handleMouseDown = (e) => {
      if (panelState.position && !panelState.isResizing) {
        bringToFront(panelType);
        setPanelState(prev => ({
          ...prev,
          isDragging: true,
          dragStart: {
            x: e.clientX - prev.position.x,
            y: e.clientY - prev.position.y
          }
        }));
      }
    };

    const handleMouseMove = (e) => {
      if (!panelState.isDragging) return;
      
      const newX = e.clientX - panelState.dragStart.x;
      const newY = e.clientY - panelState.dragStart.y;
      
      const maxX = window.innerWidth - panelState.size.width;
      const maxY = window.innerHeight - panelState.size.height;
      
      setPanelState(prev => ({
        ...prev,
        position: {
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        }
      }));
    };

    const handleMouseUp = () => {
      setPanelState(prev => ({ ...prev, isDragging: false }));
    };

    return { handleMouseDown, handleMouseMove, handleMouseUp };
  };

  const questionDragHandlers = createDragHandlers(questionPanel, setQuestionPanel, questionPanelRef, 'question');
  const answerDragHandlers = createDragHandlers(answerPanel, setAnswerPanel, answerPanelRef, 'answer');
  const feedbackDragHandlers = createDragHandlers(feedbackPanel, setFeedbackPanel, feedbackPanelRef, 'feedback');

  const questionResizeHandlers = createResizeHandlers(questionPanel, setQuestionPanel, 'question');
  const answerResizeHandlers = createResizeHandlers(answerPanel, setAnswerPanel, 'answer');
  const feedbackResizeHandlers = createResizeHandlers(feedbackPanel, setFeedbackPanel, 'feedback');

  // Mouse event listeners for dragging
  useEffect(() => {
    if (questionPanel.isDragging) {
      document.addEventListener('mousemove', questionDragHandlers.handleMouseMove);
      document.addEventListener('mouseup', questionDragHandlers.handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', questionDragHandlers.handleMouseMove);
        document.removeEventListener('mouseup', questionDragHandlers.handleMouseUp);
      };
    }
  }, [questionPanel.isDragging, questionPanel.dragStart]);

  useEffect(() => {
    if (answerPanel.isDragging) {
      document.addEventListener('mousemove', answerDragHandlers.handleMouseMove);
      document.addEventListener('mouseup', answerDragHandlers.handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', answerDragHandlers.handleMouseMove);
        document.removeEventListener('mouseup', answerDragHandlers.handleMouseUp);
      };
    }
  }, [answerPanel.isDragging, answerPanel.dragStart]);

  useEffect(() => {
    if (feedbackPanel.isDragging) {
      document.addEventListener('mousemove', feedbackDragHandlers.handleMouseMove);
      document.addEventListener('mouseup', feedbackDragHandlers.handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', feedbackDragHandlers.handleMouseMove);
        document.removeEventListener('mouseup', feedbackDragHandlers.handleMouseUp);
      };
    }
  }, [feedbackPanel.isDragging, feedbackPanel.dragStart]);

  // Mouse event listeners for resizing
  useEffect(() => {
    if (questionPanel.isResizing) {
      document.addEventListener('mousemove', questionResizeHandlers.handleResizeMouseMove);
      document.addEventListener('mouseup', questionResizeHandlers.handleResizeMouseUp);
      return () => {
        document.removeEventListener('mousemove', questionResizeHandlers.handleResizeMouseMove);
        document.removeEventListener('mouseup', questionResizeHandlers.handleResizeMouseUp);
      };
    }
  }, [questionPanel.isResizing, questionPanel.dragStart]);

  useEffect(() => {
    if (answerPanel.isResizing) {
      document.addEventListener('mousemove', answerResizeHandlers.handleResizeMouseMove);
      document.addEventListener('mouseup', answerResizeHandlers.handleResizeMouseUp);
      return () => {
        document.removeEventListener('mousemove', answerResizeHandlers.handleResizeMouseMove);
        document.removeEventListener('mouseup', answerResizeHandlers.handleResizeMouseUp);
      };
    }
  }, [answerPanel.isResizing, answerPanel.dragStart]);

  useEffect(() => {
    if (feedbackPanel.isResizing) {
      document.addEventListener('mousemove', feedbackResizeHandlers.handleResizeMouseMove);
      document.addEventListener('mouseup', feedbackResizeHandlers.handleResizeMouseUp);
      return () => {
        document.removeEventListener('mousemove', feedbackResizeHandlers.handleResizeMouseMove);
        document.removeEventListener('mouseup', feedbackResizeHandlers.handleResizeMouseUp);
      };
    }
  }, [feedbackPanel.isResizing, feedbackPanel.dragStart]);
  
  // Initialize panel positions and sizes after component mounts
  useEffect(() => {
    const initializePanelPositions = () => {
      if (questionPanelRef.current && questionPanel.position === null) {
        const rect = questionPanelRef.current.getBoundingClientRect();
        setQuestionPanel(prev => ({ 
          ...prev, 
          position: { x: rect.left, y: rect.top },
          size: { width: rect.width, height: rect.height }
        }));
      }
      if (answerPanelRef.current && answerPanel.position === null) {
        const rect = answerPanelRef.current.getBoundingClientRect();
        setAnswerPanel(prev => ({ 
          ...prev, 
          position: { x: rect.left, y: rect.top },
          size: { width: rect.width, height: rect.height }
        }));
      }
      if (feedbackPanelRef.current && feedbackPanel.position === null) {
        const rect = feedbackPanelRef.current.getBoundingClientRect();
        setFeedbackPanel(prev => ({ 
          ...prev, 
          position: { x: rect.left, y: rect.top },
          size: { width: rect.width, height: rect.height }
        }));
      }
    };

    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(initializePanelPositions, 10);
    return () => clearTimeout(timer);
  }, [questionPanel.position, answerPanel.position, feedbackPanel.position]);

  useEffect(() => {
    // Only redirect if we have no questions selected, or if we're way off from expected index
    const expectedIndex = questionNumber - 1;
    const indexDiff = Math.abs(expectedIndex - currentQuestionIndex);
    
    if (!selectedQuestions.length || indexDiff > 1) {
      navigate('/');
    }
    
    // Reset local state when moving to a new question
    if (userAnswers[currentQuestionIndex] && feedback[currentQuestionIndex]) {
      // Question already answered - show previous answer and mark as submitted
      setAnswer(userAnswers[currentQuestionIndex]);
      setSubmitted(true);
    } else {
      // New question - reset state
      setAnswer('');
      setSubmitted(false);
      setError('');
      setLoading(false);
    }
    
    console.log('Validation check:', {
      questionNumber,
      currentQuestionIndex,
      expectedIndex,
      indexDiff,
      selectedQuestionsLength: selectedQuestions.length,
      shouldRedirect: !selectedQuestions.length || indexDiff > 1
    });
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
      // Use setTimeout to ensure state update completes before navigation
      setTimeout(() => {
        navigate(`/question/${questionNumber + 1}`);
      }, 0);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        {/* Question Panel */}
        <div 
          ref={questionPanelRef}
          style={{
            ...styles.windowPanel,
            ...(questionPanel.position && {
              position: 'fixed',
              left: questionPanel.position.x,
              top: questionPanel.position.y,
              width: questionPanel.size.width,
              height: questionPanel.size.height,
              transform: 'none'
            }),
            cursor: questionPanel.isDragging ? 'grabbing' : 'default',
            zIndex: questionPanel.zIndex
          }}
          onClick={() => bringToFront('question')}
        >
          <div style={styles.windowInner}>
            <div 
              style={{
                ...styles.titleBar,
                cursor: 'grab'
              }}
              onMouseDown={questionDragHandlers.handleMouseDown}
            >
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
          {/* Resize handles */}
          <div 
            style={{...styles.resizeHandle, ...styles.resizeHandleNW}} 
            onMouseDown={(e) => questionResizeHandlers.handleResizeMouseDown(e, 'nw')}
          />
          <div 
            style={{...styles.resizeHandle, ...styles.resizeHandleNE}} 
            onMouseDown={(e) => questionResizeHandlers.handleResizeMouseDown(e, 'ne')}
          />
          <div 
            style={{...styles.resizeHandle, ...styles.resizeHandleSW}} 
            onMouseDown={(e) => questionResizeHandlers.handleResizeMouseDown(e, 'sw')}
          />
          <div 
            style={{...styles.resizeHandle, ...styles.resizeHandleSE}} 
            onMouseDown={(e) => questionResizeHandlers.handleResizeMouseDown(e, 'se')}
          />
        </div>

        {/* Answer Panel */}
        <div 
          ref={answerPanelRef}
          style={{
            ...styles.windowPanel,
            ...(answerPanel.position && {
              position: 'fixed',
              left: answerPanel.position.x,
              top: answerPanel.position.y,
              width: answerPanel.size.width,
              height: answerPanel.size.height,
              transform: 'none'
            }),
            cursor: answerPanel.isDragging ? 'grabbing' : 'default',
            zIndex: answerPanel.zIndex
          }}
          onClick={() => bringToFront('answer')}
        >
          <div style={styles.windowInner}>
            <div 
              style={{
                ...styles.titleBar,
                cursor: 'grab'
              }}
              onMouseDown={answerDragHandlers.handleMouseDown}
            >
              <h2 style={styles.titleText}>Your answer - Notepad</h2>
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
          {/* Resize handles */}
          <div 
            style={{...styles.resizeHandle, ...styles.resizeHandleNW}} 
            onMouseDown={(e) => answerResizeHandlers.handleResizeMouseDown(e, 'nw')}
          />
          <div 
            style={{...styles.resizeHandle, ...styles.resizeHandleNE}} 
            onMouseDown={(e) => answerResizeHandlers.handleResizeMouseDown(e, 'ne')}
          />
          <div 
            style={{...styles.resizeHandle, ...styles.resizeHandleSW}} 
            onMouseDown={(e) => answerResizeHandlers.handleResizeMouseDown(e, 'sw')}
          />
          <div 
            style={{...styles.resizeHandle, ...styles.resizeHandleSE}} 
            onMouseDown={(e) => answerResizeHandlers.handleResizeMouseDown(e, 'se')}
          />
        </div>

        {/* Feedback Panel - Always Shown */}
        <div 
          ref={feedbackPanelRef}
          style={{
            ...styles.windowPanel,
            ...(feedbackPanel.position && {
              position: 'fixed',
              left: feedbackPanel.position.x,
              top: feedbackPanel.position.y,
              width: feedbackPanel.size.width,
              height: feedbackPanel.size.height,
              transform: 'none'
            }),
            cursor: feedbackPanel.isDragging ? 'grabbing' : 'default',
            zIndex: feedbackPanel.zIndex
          }}
          onClick={() => bringToFront('feedback')}
        >
          <div style={styles.windowInner}>
            <div 
              style={{
                ...styles.titleBar,
                cursor: 'grab'
              }}
              onMouseDown={feedbackDragHandlers.handleMouseDown}
            >
              <h2 style={styles.titleText}>Analyzer 3000</h2>
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
          {/* Resize handles */}
          <div 
            style={{...styles.resizeHandle, ...styles.resizeHandleNW}} 
            onMouseDown={(e) => feedbackResizeHandlers.handleResizeMouseDown(e, 'nw')}
          />
          <div 
            style={{...styles.resizeHandle, ...styles.resizeHandleNE}} 
            onMouseDown={(e) => feedbackResizeHandlers.handleResizeMouseDown(e, 'ne')}
          />
          <div 
            style={{...styles.resizeHandle, ...styles.resizeHandleSW}} 
            onMouseDown={(e) => feedbackResizeHandlers.handleResizeMouseDown(e, 'sw')}
          />
          <div 
            style={{...styles.resizeHandle, ...styles.resizeHandleSE}} 
            onMouseDown={(e) => feedbackResizeHandlers.handleResizeMouseDown(e, 'se')}
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={styles.bottomBar}>
        <div style={styles.bottomBarInner}>
          <button 
            style={styles.bottomButton}
            onClick={() => {
              setShowExpectedModal(true);
              // Ensure modal appears on top when opened
              const currentMaxZIndex = Math.max(questionPanel.zIndex, answerPanel.zIndex, feedbackPanel.zIndex, modalZIndex);
              setModalZIndex(currentMaxZIndex + 1);
            }}
          >
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

      {showExpectedModal && (
        <div onClick={() => bringToFront('modal')}>
          <Window95Modal
            title="What's expected of me? - The Firm"
            onClose={() => setShowExpectedModal(false)}
            onBringToFront={() => bringToFront('modal')}
            buttons={[
              {
                text: "OK",
                onClick: () => setShowExpectedModal(false)
              }
            ]}
            style={{ zIndex: modalZIndex }}
          >
            <p style={styles.modalText}>
              [Title and content not defined yet]
            </p>
          </Window95Modal>
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
    flexDirection: 'column',
    position: 'relative'
  },
  windowInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    position: 'relative',
    height: '100%'
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
    flex: 1,
    overflowY: 'auto'
  },
  answerContent: {
    backgroundColor: 'white',
    padding: '12px',
    boxShadow: '2px 0 0 0 #999999 inset, 0 2px 0 0 #999999 inset, -2px 0 0 0 #fafafa inset, 0 -2px 0 0 #fafafa inset',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '48px'
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
    padding: '8px',
    fontSize: '18px',
    border: 'none',
    backgroundColor: 'transparent',
    resize: 'none',
    fontFamily: 'W95Font, sans-serif',
    lineHeight: '1.4',
    flex: 1,
    minHeight: 0
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
    boxShadow: '2px 0 0 0 #fcf9fb inset, 0 2px 0 0 #fcf9fb inset, -2px 0 0 0 #333331 inset, 0 -2px 0 0 #333331 inset',
    zIndex: 500
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
  },
  resizeHandle: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    backgroundColor: 'transparent',
    zIndex: 10
  },
  resizeHandleNW: {
    top: '-10px',
    left: '-10px',
    cursor: 'nw-resize'
  },
  resizeHandleNE: {
    top: '-10px',
    right: '-10px',
    cursor: 'ne-resize'
  },
  resizeHandleSW: {
    bottom: '-10px',
    left: '-10px',
    cursor: 'sw-resize'
  },
  resizeHandleSE: {
    bottom: '-10px',
    right: '-10px',
    cursor: 'se-resize'
  },
  modalText: {
    fontSize: '18px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    color: '#000000',
    margin: 0
  }
};

export default Question;