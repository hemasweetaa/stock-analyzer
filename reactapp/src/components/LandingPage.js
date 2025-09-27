import React from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../images/bm.jpg';

function LandingPage() {
  const containerStyle = {
    minHeight: '100vh',
    position: 'relative',
    backgroundImage: `url(${backgroundImage})`,

    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    overflow: 'hidden',
    animation: 'fadeIn 1.5s ease forwards',
  };

  const overlayStyle = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(270deg, #2a9d8f, #e9c46a, #f4a261, #e76f51)',
    backgroundSize: '800% 800%',
    animation: 'gradientShift 20s ease infinite',
    opacity: 0.3,
    zIndex: 0,
    borderRadius: '12px',
  };

  const headerStyle = {
    color: '#f0eaea',
    fontSize: '2.75rem',
    fontWeight: '800',
    marginBottom: '30px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    letterSpacing: '0.1em',
    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
  };

  const greenBoxStyle = {
    position: 'relative',
    backgroundColor: 'rgba(42, 157, 143, 0.9)',
    padding: '60px 70px',
    borderRadius: '30px',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.35)',
    textAlign: 'left',          // Align all inside content to left
    maxWidth: '900px',          // Increased width
    width: '100%',
    color: 'white',
    zIndex: 1,
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const titleStyle = {
    fontSize: '3.5rem',
    fontWeight: '900',
    marginBottom: '10px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    textShadow: '0 4px 10px rgba(0,0,0,0.7)',
    alignSelf: 'flex-start',
  };

  const accentBarStyle = {
    width: '90px',
    height: '6px',
    background:
      'linear-gradient(90deg, #e76f51, #f4a261, #e9c46a, #2a9d8f)',
    borderRadius: '12px',
    margin: '0',
    boxShadow: '0 0 15px #f4a261',
    alignSelf: 'flex-start',
  };

  const subtitleStyle = {
    fontSize: '1.3rem',
    lineHeight: '1.6',
    marginBottom: '0',
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
    alignSelf: 'flex-start',
  };

  const buttonContainer = {
    display: 'flex',
    gap: '24px',
    justifyContent: 'flex-start',  // Left align buttons
    width: '100%',
  };

  const baseButtonStyle = {
    flex: '0 0 auto',              // Buttons size based on content, not stretch
    padding: '18px 36px',
    fontSize: '1.4rem',
    fontWeight: '800',
    borderRadius: '16px',
    textDecoration: 'none',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(0,0,0,0.25)',
    userSelect: 'none',
    color: 'white',
    transition: 'transform 0.35s ease, box-shadow 0.35s ease, filter 0.35s ease',
    display: 'inline-block',
    filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.15))',
  };

  const stockButtonStyleNormal = {
    ...baseButtonStyle,
    background: 'linear-gradient(45deg, #3a0ca3, #720026)', // purple to dark red
  };

  const portfolioButtonStyleNormal = {
    ...baseButtonStyle,
    background: 'linear-gradient(45deg, #0f2027, #203a43)', // dark navy to slate blue
  };

  const activeButtonStyle = {
    ...baseButtonStyle,
    background: 'linear-gradient(45deg, #2a9d8f, #57bb8a)', // green gradient active
    boxShadow: '0 10px 30px rgba(42,157,143,0.8)',
    filter: 'brightness(1.15)',
    transform: 'scale(1.1)',
  };

  const [hovered, setHovered] = React.useState(null);
  const [active, setActive] = React.useState(null);

  const handleMouseEnter = (btn) => setHovered(btn);
  const handleMouseLeave = () => setHovered(null);
  const handleClick = (btn) => setActive(btn);

  return (
    <div style={containerStyle}>
      <div style={overlayStyle} />
      <div style={headerStyle}>
        <span>BNP PARIBAS</span>
      </div>
      <div style={greenBoxStyle}>
        <h1 style={titleStyle}>NextGen Market Analyzer</h1>
        <div style={accentBarStyle} />
        <p style={subtitleStyle}>Please select a tool to continue.</p>
        <div style={buttonContainer}>
          <Link
            to="/stock-evaluator"
            onClick={() => handleClick('stock')}
            style={
              active === 'stock'
                ? activeButtonStyle
                : hovered === 'stock'
                ? {
                    ...stockButtonStyleNormal,
                    transform: 'scale(1.1)',
                    boxShadow: '0 14px 36px rgba(114, 0, 38, 0.9)',
                    filter: 'brightness(1.1)',
                  }
                : stockButtonStyleNormal
            }
            onMouseEnter={() => handleMouseEnter('stock')}
            onMouseLeave={handleMouseLeave}
          >
            Stock Evaluator
          </Link>
          <Link
            to="/portfolio-analyzer"
            onClick={() => handleClick('portfolio')}
            style={
              active === 'portfolio'
                ? activeButtonStyle
                : hovered === 'portfolio'
                ? {
                    ...portfolioButtonStyleNormal,
                    transform: 'scale(1.1)',
                    boxShadow: '0 14px 36px rgba(32, 58, 67, 0.9)',
                    filter: 'brightness(1.1)',
                  }
                : portfolioButtonStyleNormal
            }
            onMouseEnter={() => handleMouseEnter('portfolio')}
            onMouseLeave={handleMouseLeave}
          >
            Portfolio Analyzer
          </Link>
        </div>
      </div>

      <style>
        {`
          @keyframes gradientShift {
            0% {background-position:0% 50%}
            50% {background-position:100% 50%}
            100% {background-position:0% 50%}
          }
          @keyframes fadeIn {
            0% {opacity: 0}
            100% {opacity: 1}
          }
        `}
      </style>
    </div>
  );
}

export default LandingPage;