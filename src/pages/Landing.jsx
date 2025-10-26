import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Window95Modal from '../components/Window95Modal';

const Landing = () => {
  const navigate = useNavigate();
  const { initializeGame } = useApp();
  const [activeIcon, setActiveIcon] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showExpectedModal, setShowExpectedModal] = useState(false);

  const handleStart = () => {
    initializeGame();
    navigate('/question/1');
  };

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
              handleStart();
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
        <div style={{ display: 'flex', gap: '8px' }}>
        </div>
      </div>

      {showWelcomeModal && (
        <Window95Modal
          title="Welcome! - The Firm"
          onClose={() => {
            setShowWelcomeModal(false);
            setActiveIcon(null);
          }}
          buttons={[
            {
              text: "What's expected of me?",
              onClick: () => setShowExpectedModal(true)
            },
            {
              text: "Let's go",
              onClick: () => {
                setShowWelcomeModal(false);
                handleStart();
              }
            }
          ]}
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
      )}

      {showExpectedModal && (
        <Window95Modal
          title="What's expected of me? - The Firm"
          onClose={() => setShowExpectedModal(false)}
          buttons={[
            {
              text: "Let's go",
              onClick: () => {
                setShowExpectedModal(false);
                setShowWelcomeModal(false);
                handleStart();
              }
            }
          ]}
        >
          <p style={styles.modalText}>
            [Title and content not defined yet]
          </p>
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
    boxShadow: '2px 0 0 0 #fcf9fb inset, 0 2px 0 0 #fcf9fb inset, -2px 0 0 0 #333331 inset, 0 -2px 0 0 #333331 inset'
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
  }
};

export default Landing;