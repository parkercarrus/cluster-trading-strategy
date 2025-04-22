import React from 'react';

const About: React.FC = () => {
  return (
    <main style={{ padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto', color: '#f0f0f0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>Clustering-Informed Algorithmic Trading</h1>
      <p style={{ marginBottom: '20px' }}>
        This project implements a <strong>cluster-aware, step-forward backtested machine learning strategy</strong> for ranking and selecting top-performing stocks based on predicted future relative performance. Stocks are grouped into clusters using KMeans, and features are engineered to reflect both relative positioning and cluster dynamics.
      </p>

      <h2 style={sectionStyle}>Highlights</h2>
      <ul>
        <li><strong>Cluster-Aware:</strong> KMeans clustering per quarter allows models to learn relationships within clusters.</li>
        <li><strong>Relative Performance Prediction:</strong> Targets and features are defined relative to a stock's cluster.</li>
        <li><strong>Step-Forward Backtest:</strong> Simulates realistic future-looking trading behavior.</li>
        <li><strong>Top-K Long Strategy:</strong> Each quarter, the model selects K stocks to long.</li>
        <li><strong>Baseline Comparison:</strong> Compares performance to a SPY-equivalent baseline.</li>
      </ul>

      <h2 style={sectionStyle}>Project Structure</h2>
      <pre style={codeBlockStyle}>{`
main/
├── run.py               # Main execution script
├── strategy/
│   ├── backtest.py      # Backtesting functions
│   ├── clustering.py    # Clustering logic & feature engineering
│   ├── dataset.py       # Data loading and dataset construction
│   ├── models.py        # Model training and prediction
│   └── utils.py         # Utility functions (e.g. quarter handling)
└── data/
    ├── price_data.csv   # Historical prices for all stocks
    └── processed/       # Per-quarter stock features
      `}</pre>

      <h2 style={sectionStyle}>How to Run</h2>
      <ol>
        <li>Ensure per-quarter processed CSVs in <code>data/processed/quarterly/</code></li>
        <li>Ensure <code>data/price_data.csv</code> is present and formatted with prices</li>
        <li>From the <code>main/</code> directory, run:</li>
      </ol>
      <pre style={codeBlockStyle}>{`
pip install -r requirements.txt
git lfs install
git lfs pull
python run.py
      `}</pre>

      <h2 style={sectionStyle}>Dependencies</h2>
      <ul>
        <li>Python 3.9+</li>
        <li><code>pandas</code>, <code>numpy</code>, <code>scikit-learn</code></li>
      </ul>

      <h2 style={sectionStyle}>Example Output</h2>
      <pre style={codeBlockStyle}>{`
===== Backtest Summary =====
Avg Return:         15.33%
Avg Baseline:       10.13%
Avg Strategy Edge:  5.20%
Sharpe (Edge):      1.38
Total Trades:       100
============================
      `}</pre>

      <h2 style={sectionStyle}>TODO</h2>
      <ul>
        <li>Add algorithmic position closing</li>
        <li>Adjust bet-sizing proportional to model confidence</li>
        <li>Implement functionality for different classifiers (ie. MLP, XGBoost)</li>
      </ul>

      <p style={{ marginTop: '40px', fontStyle: 'italic' }}>
        <strong>Author:</strong> Algory Capital<br />
        <strong>License:</strong> MIT
      </p>
    </main>
  );
};

const sectionStyle: React.CSSProperties = {
  marginTop: '32px',
  marginBottom: '12px',
  fontSize: '1.25rem',
  fontWeight: 'bold',
};

const codeBlockStyle: React.CSSProperties = {
  backgroundColor: '#1f2937',
  padding: '12px',
  borderRadius: '6px',
  fontFamily: 'monospace',
  color: '#d1d5db',
  whiteSpace: 'pre-wrap'
};

export default About;
