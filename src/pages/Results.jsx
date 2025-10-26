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
  
  // Demo data for design purposes
  const demoData = {
    selectedQuestions: [
      {
        id: 1,
        title: "Dark Pattern Discovery",
        category: "Ethical Design",
        scenario: "You're reviewing a competitor's app and notice they use several dark patterns to manipulate users into subscriptions.\n\nYour manager suggests implementing similar techniques to boost conversion rates."
      },
      {
        id: 2,
        title: "Accessibility vs. Aesthetics",
        category: "Design Standards",
        scenario: "The marketing team wants a minimalist design with light gray text on white backgrounds for the new landing page.\n\nThe contrast ratio fails WCAG guidelines, but they argue it looks more 'premium'."
      },
      {
        id: 3,
        title: "User Research Resistance",
        category: "Business Pressure",
        scenario: "Leadership wants to skip user testing for a major feature launch to meet an aggressive deadline.\n\nThey claim the design is 'obvious' and testing would just slow things down."
      },
      {
        id: 4,
        title: "Data Privacy Concerns",
        category: "Ethical Design",
        scenario: "Your analytics team requests to track extensive user behavior, including scroll patterns and click heatmaps.\n\nSome of this data collection seems excessive for the stated business goals."
      },
      {
        id: 5,
        title: "Feature Creep Pressure",
        category: "Business Pressure",
        scenario: "Stakeholders keep adding 'small' features to your streamlined design.\n\nThe scope has doubled, but the timeline remains the same."
      }
    ],
    userAnswers: [
      "I would document the dark patterns I found and prepare a presentation showing how they harm user trust and long-term business goals. I'd propose ethical alternatives that can achieve similar business objectives without manipulating users.",
      "I'd create a comparison showing the current design alongside WCAG-compliant versions, demonstrating that accessible design can still look premium. I'd also highlight the legal and brand risks of non-compliance.",
      "I would propose a compromise: quick guerrilla testing or unmoderated remote testing that can provide insights without major delays. I'd emphasize the cost of fixing issues post-launch versus catching them early.",
      "I'd work with the analytics team to identify the minimum viable data needed for business goals. I'd propose a privacy-first approach and ensure transparent disclosure to users about data collection.",
      "I would create a prioritization matrix with stakeholders, showing the impact vs effort of each feature. I'd advocate for launching with core features first and adding others in future iterations."
    ],
    feedback: [
      "**Excellent Ethical Stance**\n\nYour response demonstrates strong ethical principles and business acumen. You correctly identified that dark patterns harm long-term user trust.\n\n**Strengths:**\n- Clear documentation approach\n- Focus on ethical alternatives\n- Understanding of business impact\n\n**Areas for growth:**\n- Consider specific alternative solutions\n- Address potential pushback strategies",
      "**Strong Advocacy for Accessibility**\n\nYou showed good understanding of accessibility requirements and business risks.\n\n**Strengths:**\n- Visual comparison approach\n- Legal risk awareness\n- Brand protection mindset\n\n**Areas for growth:**\n- Provide specific design examples\n- Quantify business impact",
      "**Balanced Compromise Approach**\n\nGood balance between business needs and user-centered design principles.\n\n**Strengths:**\n- Practical testing alternatives\n- Cost-benefit understanding\n- Timeline awareness\n\n**Areas for growth:**\n- More specific testing methodologies\n- Risk mitigation strategies",
      "**Privacy-First Mindset**\n\nExcellent privacy awareness and collaborative approach with analytics team.\n\n**Strengths:**\n- Data minimization principle\n- Cross-team collaboration\n- User transparency focus\n\n**Areas for growth:**\n- Specific compliance frameworks\n- Alternative metrics suggestions",
      "**Strategic Scope Management**\n\nSmart approach to feature prioritization and stakeholder management.\n\n**Strengths:**\n- Prioritization framework\n- Iterative delivery mindset\n- Stakeholder collaboration\n\n**Areas for growth:**\n- Timeline negotiation tactics\n- Risk communication strategies"
    ],
    overallEvaluation: {
      level: "Senior UX Designer",
      summary: "You demonstrate strong ethical principles, business acumen, and user advocacy skills. Your responses show a mature understanding of balancing user needs with business constraints.\n\nYour strongest areas include ethical decision-making, accessibility awareness, and strategic thinking. You consistently propose collaborative solutions and consider long-term impacts.\n\nTo reach the Lead level, focus on developing more specific implementation strategies, stakeholder influence tactics, and team leadership approaches. Consider how you would mentor others facing similar challenges."
    }
  };

  // Use demo data if no real data is available (for demo mode)
  const isDemo = !selectedQuestions.length || userAnswers.length !== 5;
  const displayQuestions = isDemo ? demoData.selectedQuestions : selectedQuestions;
  const displayAnswers = isDemo ? demoData.userAnswers : userAnswers;
  const displayFeedback = isDemo ? demoData.feedback : feedback;
  const displayEvaluation = isDemo ? demoData.overallEvaluation : overallEvaluation;

  useEffect(() => {
    if (!isDemo && !overallEvaluation && !loading) {
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

      {displayEvaluation && (
        <div style={styles.overallSection}>
          <div style={{...styles.levelBadge, backgroundColor: getLevelColor(displayEvaluation.level)}}>
            {displayEvaluation.level}
          </div>
          <div style={styles.summary}>
            {displayEvaluation.summary.split('\n\n').map((paragraph, index) => (
              <p key={index} style={styles.summaryParagraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}

      <div style={styles.reviewSection}>
        <h2 style={styles.sectionTitle}>Your Responses</h2>
        
        {displayQuestions.map((scenario, index) => (
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
              <p style={styles.answerText}>{displayAnswers[index]}</p>
            </div>
            
            <div style={styles.feedbackBox}>
              <h4 style={styles.subheading}>Feedback:</h4>
              <div style={styles.feedbackContent}>
                {displayFeedback[index].split('**').map((part, partIndex) => {
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