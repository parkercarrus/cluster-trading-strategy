import React from 'react';
import algoryLogo from '../assets/algory-capital.jpeg';

const About: React.FC = () => {
  return (
    <main style={{ padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto', color: '#f0f0f0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>
        Clustering-Informed Algorithmic Trading
      </h1>
      <p style={{ marginBottom: '20px' }}>
        This project implements a <strong>cluster-aware, step-forward backtested machine learning strategy</strong> for ranking and selecting top-performing stocks based on predicted future relative performance. Stocks are grouped into clusters using KMeans, and features are engineered to reflect both relative positioning and cluster dynamics.
      </p>
      <p>
        <a
          href="../whitepaper.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white', fontWeight: 'bold', textDecoration: 'none' }}
        >
          Read more
        </a>
      </p>
      <p>
        <a
          href="mailto:parker.carrus@emory.edu"
          style={{ color: '#90caf9', textDecoration: 'none', fontWeight: 'bold' }}
        >
          Help
        </a>
      </p>
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', gap: '24px', alignItems: 'center', zIndex: 1000 }}>
        <a href="https://algorycapital.com" style={iconStyle}><img src={algoryLogo} alt="Algory Capital" style={{ height: '72px' }} /></a>
      </div>
    </main>
  );
};

export default About;

const iconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  color: 'white',
  textDecoration: 'none',
  opacity: 0.7,
  transition: 'opacity 0.2s',
};
