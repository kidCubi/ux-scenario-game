import React, { useState, useRef } from 'react';

const Window95Modal = ({ title, children, onClose, buttons = [], style = {}, onBringToFront }) => {
  const [position, setPosition] = useState(null);
  const [size, setSize] = useState({ width: 513, height: null });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef(null);

  // Resize handlers
  const handleResizeMouseDown = (e, direction) => {
    e.stopPropagation();
    if (onBringToFront) {
      onBringToFront();
    }
    
    // Initialize position and size if not set
    if (position === null || size.height === null) {
      const rect = windowRef.current.getBoundingClientRect();
      const currentPos = { x: rect.left, y: rect.top };
      const currentSize = { width: rect.width, height: rect.height };
      setPosition(currentPos);
      setSize(currentSize);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        width: currentSize.width,
        height: currentSize.height,
        left: currentPos.x,
        top: currentPos.y
      });
    } else {
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height,
        left: position.x,
        top: position.y
      });
    }
    
    setIsResizing(true);
    setResizeDirection(direction);
  };

  const handleResizeMouseMove = (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const minWidth = 300;
    const minHeight = 200;

    let newWidth = dragStart.width;
    let newHeight = dragStart.height;
    let newX = dragStart.left;
    let newY = dragStart.top;

    switch (resizeDirection) {
      case 'nw':
        newWidth = Math.max(minWidth, dragStart.width - deltaX);
        newHeight = Math.max(minHeight, dragStart.height - deltaY);
        newX = dragStart.left + (dragStart.width - newWidth);
        newY = dragStart.top + (dragStart.height - newHeight);
        break;
      case 'ne':
        newWidth = Math.max(minWidth, dragStart.width + deltaX);
        newHeight = Math.max(minHeight, dragStart.height - deltaY);
        newY = dragStart.top + (dragStart.height - newHeight);
        break;
      case 'sw':
        newWidth = Math.max(minWidth, dragStart.width - deltaX);
        newHeight = Math.max(minHeight, dragStart.height + deltaY);
        newX = dragStart.left + (dragStart.width - newWidth);
        break;
      case 'se':
        newWidth = Math.max(minWidth, dragStart.width + deltaX);
        newHeight = Math.max(minHeight, dragStart.height + deltaY);
        break;
    }

    const maxX = window.innerWidth - newWidth;
    const maxY = window.innerHeight - newHeight;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
    setSize({
      width: newWidth,
      height: newHeight
    });
  };

  const handleResizeMouseUp = () => {
    setIsResizing(false);
    setResizeDirection(null);
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return; // Don't drag when clicking close button
    if (isResizing) return; // Don't drag when resizing
    
    // Bring modal to front when starting to drag
    if (onBringToFront) {
      onBringToFront();
    }
    
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
    const maxX = window.innerWidth - (size.width || windowRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (size.height || windowRef.current?.offsetHeight || 0);
    
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

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleResizeMouseMove);
        document.removeEventListener('mouseup', handleResizeMouseUp);
      };
    }
  }, [isResizing, dragStart]);

  return (
    <div 
      ref={windowRef}
      style={{
        ...styles.window,
        ...(position ? {
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          transform: 'none'
        } : {
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: size.width,
          minHeight: 'auto'
        }),
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: 2000,
        ...style
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
        
        {/* Resize handles */}
        <div 
          style={{...styles.resizeHandle, ...styles.resizeHandleNW}} 
          onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
        />
        <div 
          style={{...styles.resizeHandle, ...styles.resizeHandleNE}} 
          onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
        />
        <div 
          style={{...styles.resizeHandle, ...styles.resizeHandleSW}} 
          onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
        />
        <div 
          style={{...styles.resizeHandle, ...styles.resizeHandleSE}} 
          onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
        />
    </div>
  );
};

const styles = {
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

export default Window95Modal;