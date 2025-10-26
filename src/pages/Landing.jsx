import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Window95Modal from '../components/Window95Modal';
import { scenarios } from '../data/scenarios';
import { evaluateAnswer } from '../services/claudeApi';

const Landing = () => {
  const navigate = useNavigate();
  const { initializeGame } = useApp();
  const [activeIcon, setActiveIcon] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showExpectedModal, setShowExpectedModal] = useState(false);
  const [showWelcomeExpectedModal, setShowWelcomeExpectedModal] = useState(false);
  const [welcomeModalZIndex, setWelcomeModalZIndex] = useState(2000);
  const [welcomeExpectedModalZIndex, setWelcomeExpectedModalZIndex] = useState(2000);

  // Game state (moved from AppContext usage)
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionPanels, setShowQuestionPanels] = useState(false);
  
  // Question form state
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [modalZIndex, setModalZIndex] = useState(2000);

  // Panel states for question windows
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

  // Game logic functions
  const initializeQuestionGame = () => {
    const shuffled = [...scenarios].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    setSelectedQuestions(selected);
    setUserAnswers([]);
    setFeedback([]);
    setCurrentQuestionIndex(0);
    setAnswer('');
    setSubmitted(false);
    setError('');
    setLoading(false);
    setShowQuestionPanels(true);
  };

  const handleStart = () => {
    initializeQuestionGame();
  };

  const addAnswer = (answer) => {
    setUserAnswers([...userAnswers, answer]);
  };

  const addFeedback = (feedbackText) => {
    setFeedback([...feedback, feedbackText]);
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setAnswer('');
    setSubmitted(false);
    setError('');
    setLoading(false);
  };

  // Question form handlers
  const handleSubmit = async () => {
    if (!answer.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const currentScenario = selectedQuestions[currentQuestionIndex];
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
    if (currentQuestionIndex === 4) {
      // Navigate to results - we can implement this later or show results panel
      navigate('/results');
    } else {
      nextQuestion();
    }
  };

  // Z-index management
  const bringToFront = (panelType) => {
    // Include all modals in z-index calculation
    const currentMaxZIndex = Math.max(questionPanel.zIndex, answerPanel.zIndex, feedbackPanel.zIndex, modalZIndex, welcomeModalZIndex, welcomeExpectedModalZIndex);
    const newZIndex = currentMaxZIndex + 1;
    
    if (panelType === 'question') {
      setQuestionPanel(prev => ({ ...prev, zIndex: newZIndex }));
    } else if (panelType === 'answer') {
      setAnswerPanel(prev => ({ ...prev, zIndex: newZIndex }));
    } else if (panelType === 'feedback') {
      setFeedbackPanel(prev => ({ ...prev, zIndex: newZIndex }));
    } else if (panelType === 'modal') {
      setModalZIndex(newZIndex);
    } else if (panelType === 'welcomeModal') {
      setWelcomeModalZIndex(newZIndex);
    } else if (panelType === 'welcomeExpectedModal') {
      setWelcomeExpectedModalZIndex(newZIndex);
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
        case 'nw':
          newWidth = Math.max(minWidth, panelState.dragStart.width - deltaX);
          newHeight = Math.max(minHeight, panelState.dragStart.height - deltaY);
          newX = panelState.dragStart.left + (panelState.dragStart.width - newWidth);
          newY = panelState.dragStart.top + (panelState.dragStart.height - newHeight);
          break;
        case 'ne':
          newWidth = Math.max(minWidth, panelState.dragStart.width + deltaX);
          newHeight = Math.max(minHeight, panelState.dragStart.height - deltaY);
          newY = panelState.dragStart.top + (panelState.dragStart.height - newHeight);
          break;
        case 'sw':
          newWidth = Math.max(minWidth, panelState.dragStart.width - deltaX);
          newHeight = Math.max(minHeight, panelState.dragStart.height + deltaY);
          newX = panelState.dragStart.left + (panelState.dragStart.width - newWidth);
          break;
        case 'se':
          newWidth = Math.max(minWidth, panelState.dragStart.width + deltaX);
          newHeight = Math.max(minHeight, panelState.dragStart.height + deltaY);
          break;
      }

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
    if (!showQuestionPanels) return;
    
    const initializePanelPositions = () => {
      // Position panels horizontally across the screen
      const panelWidth = 431;
      const panelHeight = 600; // Default height
      const gap = 24;
      const startX = 50;
      const startY = 50;
      
      if (questionPanelRef.current && questionPanel.position === null) {
        setQuestionPanel(prev => ({ 
          ...prev, 
          position: { x: startX, y: startY },
          size: { width: panelWidth, height: panelHeight }
        }));
      }
      if (answerPanelRef.current && answerPanel.position === null) {
        setAnswerPanel(prev => ({ 
          ...prev, 
          position: { x: startX + panelWidth + gap, y: startY },
          size: { width: panelWidth, height: panelHeight }
        }));
      }
      if (feedbackPanelRef.current && feedbackPanel.position === null) {
        setFeedbackPanel(prev => ({ 
          ...prev, 
          position: { x: startX + (panelWidth + gap) * 2, y: startY },
          size: { width: panelWidth, height: panelHeight }
        }));
      }
    };

    const timer = setTimeout(initializePanelPositions, 10);
    return () => clearTimeout(timer);
  }, [showQuestionPanels, questionPanel.position, answerPanel.position, feedbackPanel.position]);

  // Reset form state when moving to a new question
  useEffect(() => {
    if (userAnswers[currentQuestionIndex] && feedback[currentQuestionIndex]) {
      setAnswer(userAnswers[currentQuestionIndex]);
      setSubmitted(true);
    } else {
      setAnswer('');
      setSubmitted(false);
      setError('');
      setLoading(false);
    }
  }, [currentQuestionIndex, userAnswers, feedback]);

  const handleIconClick = (iconName) => {
    setActiveIcon(iconName);
    if (iconName === 'welcome') {
      setShowWelcomeModal(true);
    }
  };

  const handleDesktopClick = () => {
    setActiveIcon(null);
  };

  return (
    <div style={styles.desktop} onClick={handleDesktopClick}>
      <div style={styles.iconsContainer}>
      <div
          style={{
            ...styles.iconWrapper,
            ...(activeIcon === 'welcome' ? styles.activeIcon : {})
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setActiveIcon('welcome');
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            setActiveIcon(null);
            if (e.button === 0) {
              setShowWelcomeModal(true);
              // Ensure Welcome modal appears on top when opened
              const currentMaxZIndex = Math.max(questionPanel.zIndex, answerPanel.zIndex, feedbackPanel.zIndex, modalZIndex, welcomeModalZIndex);
              setWelcomeModalZIndex(currentMaxZIndex + 1);
            }
          }}
          onMouseLeave={() => {
            setActiveIcon(null);
          }}
        >
          <div style={styles.iconImageWrapper}>
            <img src="/welcome-icon.png" alt="Welcome" style={styles.iconImage} />
          </div>
          <p style={styles.iconLabel}>Welcome!</p>
        </div>
        <div
          style={{
            ...styles.iconWrapper,
            ...(activeIcon === 'assignment' ? styles.activeIcon : {})
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setActiveIcon('assignment');
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            setActiveIcon(null);
            if (e.button === 0) {
              if (!showQuestionPanels) {
                handleStart();
              }
            }
          }}
          onMouseLeave={() => {
            setActiveIcon(null);
          }}
        >
          <div style={styles.iconImageWrapper}>
            <img src="/assignment-icon.png" alt="Assignment" style={styles.iconImage} />
          </div>
          <p style={styles.iconLabel}>Assignment</p>
        </div>
      </div>

      <div style={styles.taskbar}>
        <div style={styles.taskbarInner}>
        </div>
      </div>

      {showWelcomeModal && (
        <div onClick={() => bringToFront('welcomeModal')}>
          <Window95Modal
            title="Welcome! - The Firm"
            onClose={() => {
              setShowWelcomeModal(false);
              setActiveIcon(null);
            }}
            onBringToFront={() => bringToFront('welcomeModal')}
            buttons={[
              {
                text: "What's expected of me?",
                onClick: () => {
                  setShowWelcomeExpectedModal(true);
                  // Ensure Welcome Expected modal appears on top when opened
                  const currentMaxZIndex = Math.max(questionPanel.zIndex, answerPanel.zIndex, feedbackPanel.zIndex, modalZIndex, welcomeModalZIndex, welcomeExpectedModalZIndex);
                  setWelcomeExpectedModalZIndex(currentMaxZIndex + 1);
                }
              },
              {
                text: showQuestionPanels ? "OK" : "Let's go",
                onClick: () => {
                  setShowWelcomeModal(false);
                  if (!showQuestionPanels) {
                    handleStart();
                  }
                }
              }
            ]}
            style={{ zIndex: welcomeModalZIndex }}
          >
          <p style={styles.modalText}>
            Congrats on your new UX designer position at The Firm!
          </p>
          <p style={styles.modalText}>
            We're glad to have you around. We pride ourselves on putting the needs of our users first.
          </p>
          <p style={styles.modalText}>
            You'll feel right at home here! Are you ready for your first assignment?
          </p>
          </Window95Modal>
        </div>
      )}

      {showWelcomeExpectedModal && (
        <div onClick={() => bringToFront('welcomeExpectedModal')}>
          <Window95Modal
            title="What's expected of me? - The Firm"
            onClose={() => setShowWelcomeExpectedModal(false)}
            onBringToFront={() => bringToFront('welcomeExpectedModal')}
            buttons={[
              {
                text: showQuestionPanels ? "OK" : "Let's go",
                onClick: () => {
                  setShowWelcomeExpectedModal(false);
                  setShowWelcomeModal(false);
                  if (!showQuestionPanels) {
                    handleStart();
                  }
                }
              }
            ]}
            style={{ zIndex: welcomeExpectedModalZIndex }}
          >
            <p style={styles.modalText}>
              [Title and content not defined yet]
            </p>
          </Window95Modal>
        </div>
      )}

      {/* Question Panels - only show when game is active */}
      {showQuestionPanels && selectedQuestions.length > 0 && (
        <>
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
                <h2 style={styles.titleText}>Question {currentQuestionIndex + 1} of 5 - {selectedQuestions[currentQuestionIndex]?.category.toLowerCase()}</h2>
              </div>
              <div style={styles.windowContent}>
                <h3 style={styles.scenarioTitle}>{selectedQuestions[currentQuestionIndex]?.title}</h3>
                <div style={styles.scenarioText}>
                  {selectedQuestions[currentQuestionIndex]?.scenario.split('\n\n').map((paragraph, index) => (
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

          {/* Feedback Panel */}
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
                    {currentQuestionIndex === 4 ? 'View Results' : 'Next Question'}
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

          {/* Question Modal for "What's expected of me again?" */}
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

          {/* Bottom Bar for Questions */}
          <div style={styles.bottomBar}>
            <div style={styles.bottomBarInner}>
            </div>
          </div>

          {/* Error popup */}
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
        </>
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
    userSelect: 'none'
  },
  iconsContainer: {
    position: 'absolute',
    top: '43px',
    left: '26px',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    gap: '24px',
    maxHeight: 'calc(100vh - 150px)',
    width: '232px'
  },
  iconWrapper: {
    width: '104px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px',
    cursor: 'pointer',
    borderRadius: '0px'
  },
  activeIcon: {
    backgroundColor: '#05007f'
  },
  iconImageWrapper: {
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconImage: {
    width: 'inherit',
    height: 'inherit',
    imageRendering: 'pixelated'
  },
  iconLabel: {
    color: '#f2f2f2',
    fontSize: '18px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    textAlign: 'center',
    width: '100%',
    margin: 0
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
    gap: '8px'
  },
  taskbarButton: {
    backgroundColor: '#d6d6d6',
    padding: '8px',
    fontSize: '18px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '2px 0 0 0 #fcf9fb inset, 0 2px 0 0 #fcf9fb inset, -2px 0 0 0 #333331 inset, 0 -2px 0 0 #333331 inset'
  },
  taskbarText: {
    fontSize: '18px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    color: '#000000',
    whiteSpace: 'nowrap'
  },
  modalText: {
    fontSize: '18px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    color: '#000000',
    margin: 0
  },
  // Question panel styles
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
  }
};

export default Landing;