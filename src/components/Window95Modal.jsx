import React, { useState, useRef } from 'react';

const Window95Modal = ({ title, children, onClose, buttons = [] }) => {
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return; // Don't drag when clicking close button
    
    // Initialize position from current DOM position if not set
    if (position === null) {
      const rect = windowRef.current.getBoundingClientRect();
      const currentPos = { x: rect.left, y: rect.top };
      setPosition(currentPos);
      setDragStart({
        x: e.clientX - currentPos.x,
        y: e.clientY - currentPos.y
      });
    } else {
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
    
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep modal within viewport bounds
    const maxX = window.innerWidth - (windowRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (windowRef.current?.offsetHeight || 0);
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div style={styles.overlay}>
      <div 
        ref={windowRef}
        style={{
          ...styles.window,
          ...(position && {
            position: 'fixed',
            left: position.x,
            top: position.y,
            transform: 'none'
          }),
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        <div 
          style={{
            ...styles.titleBar,
            cursor: 'grab'
          }}
          onMouseDown={handleMouseDown}
        >
          <span style={styles.titleText}>{title}</span>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseDown={(e) => {
              e.currentTarget.style.borderStyle = 'inset';
              e.currentTarget.style.borderTopColor = '#333331';
              e.currentTarget.style.borderLeftColor = '#333331';
              e.currentTarget.style.borderBottomColor = '#fcf9fb';
              e.currentTarget.style.borderRightColor = '#fcf9fb';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.borderStyle = 'solid';
              e.currentTarget.style.borderTopColor = '#fcf9fb';
              e.currentTarget.style.borderLeftColor = '#fcf9fb';
              e.currentTarget.style.borderBottomColor = '#333331';
              e.currentTarget.style.borderRightColor = '#333331';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderStyle = 'solid';
              e.currentTarget.style.borderTopColor = '#fcf9fb';
              e.currentTarget.style.borderLeftColor = '#fcf9fb';
              e.currentTarget.style.borderBottomColor = '#333331';
              e.currentTarget.style.borderRightColor = '#333331';
            }}
          >
            X
          </button>
        </div>
        <div style={styles.content}>
          {children}
        </div>
        {buttons.length > 0 && (
          <div style={styles.buttonRow}>
            {buttons.map((button, index) => (
              <button
                key={index}
                style={styles.button}
                onClick={button.onClick}
                onMouseDown={(e) => {
                  e.currentTarget.style.borderStyle = 'inset';
                  e.currentTarget.style.borderTopColor = '#333331';
                  e.currentTarget.style.borderLeftColor = '#333331';
                  e.currentTarget.style.borderBottomColor = '#fcf9fb';
                  e.currentTarget.style.borderRightColor = '#fcf9fb';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.borderStyle = 'solid';
                  e.currentTarget.style.borderTopColor = '#fcf9fb';
                  e.currentTarget.style.borderLeftColor = '#fcf9fb';
                  e.currentTarget.style.borderBottomColor = '#333331';
                  e.currentTarget.style.borderRightColor = '#333331';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderStyle = 'solid';
                  e.currentTarget.style.borderTopColor = '#fcf9fb';
                  e.currentTarget.style.borderLeftColor = '#fcf9fb';
                  e.currentTarget.style.borderBottomColor = '#333331';
                  e.currentTarget.style.borderRightColor = '#333331';
                }}
              >
                {button.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  window: {
    backgroundColor: '#c0c0c0',
    border: '2px solid',
    borderTopColor: '#fcf9fb',
    borderLeftColor: '#fcf9fb',
    borderBottomColor: '#333331',
    borderRightColor: '#333331',
    boxShadow: '2px 2px 0px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '513px'
  },
  titleBar: {
    backgroundColor: '#05007f',
    color: 'white',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    fontSize: '14px',
    fontWeight: 600
  },
  titleText: {
    fontSize: '14px',
    userSelect: 'none'
  },
  closeButton: {
    backgroundColor: '#c0c0c0',
    border: '2px solid',
    borderTopColor: '#fcf9fb',
    borderLeftColor: '#fcf9fb',
    borderBottomColor: '#333331',
    borderRightColor: '#333331',
    width: '20px',
    height: '20px',
    fontSize: '10px',
    fontWeight: 600,
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000000'
  },
  content: {
    backgroundColor: '#d6d6d6',
    border: '2px inset',
    borderTopColor: '#999999',
    borderLeftColor: '#999999',
    borderBottomColor: '#fafafa',
    borderRightColor: '#fafafa',
    padding: '12px',
    fontSize: '12px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  buttonRow: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'flex-end',
    padding: '8px'
  },
  button: {
    backgroundColor: '#d6d6d6',
    border: '2px solid',
    borderTopColor: '#fcf9fb',
    borderLeftColor: '#fcf9fb',
    borderBottomColor: '#333331',
    borderRightColor: '#333331',
    padding: '8px',
    fontSize: '18px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    cursor: 'pointer',
    minWidth: '75px',
    color: '#000000'
  }
};

export default Window95Modal;