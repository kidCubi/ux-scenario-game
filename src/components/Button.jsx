import React from 'react';

const Button = ({ children, onClick, disabled = false, style = {}, ...props }) => {
  const handleMouseDown = (e) => {
    e.currentTarget.style.borderStyle = 'inset';
    e.currentTarget.style.borderTopColor = '#7b7b7b';
    e.currentTarget.style.borderLeftColor = '#7b7b7b';
    e.currentTarget.style.borderBottomColor = '#dfdfdf';
    e.currentTarget.style.borderRightColor = '#dfdfdf';
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.borderStyle = 'solid';
    e.currentTarget.style.borderTopColor = '#dfdfdf';
    e.currentTarget.style.borderLeftColor = '#dfdfdf';
    e.currentTarget.style.borderBottomColor = '#7b7b7b';
    e.currentTarget.style.borderRightColor = '#7b7b7b';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.borderStyle = 'solid';
    e.currentTarget.style.borderTopColor = '#dfdfdf';
    e.currentTarget.style.borderLeftColor = '#dfdfdf';
    e.currentTarget.style.borderBottomColor = '#7b7b7b';
    e.currentTarget.style.borderRightColor = '#7b7b7b';
  };

  return (
    <button
      style={{
        ...styles.button,
        ...(disabled ? styles.disabled : {}),
        ...style
      }}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={!disabled ? handleMouseDown : undefined}
      onMouseUp={!disabled ? handleMouseUp : undefined}
      onMouseLeave={!disabled ? handleMouseLeave : undefined}
      {...props}
    >
      {children}
    </button>
  );
};

const styles = {
  button: {
    backgroundColor: '#c0c0c0',
    color: '#000000',
    border: '2px solid',
    borderTopColor: '#dfdfdf',
    borderLeftColor: '#dfdfdf',
    borderBottomColor: '#7b7b7b',
    borderRightColor: '#7b7b7b',
    padding: '4px 12px',
    fontSize: '11px',
    fontFamily: 'W95Font, MS Sans Serif, sans-serif',
    cursor: 'pointer',
    outline: 'none',
    position: 'relative',
    textAlign: 'center',
    minWidth: '75px',
    transition: 'none',
    userSelect: 'none'
  },
  disabled: {
    color: '#7b7b7b',
    cursor: 'not-allowed',
    borderTopColor: '#dfdfdf',
    borderLeftColor: '#dfdfdf',
    borderBottomColor: '#7b7b7b',
    borderRightColor: '#7b7b7b'
  }
};

export default Button;