import React, { useState, useEffect } from 'react';
import Chart from '../components/Chart';
import Table from '../components/Table';
import algoryLogo from '../assets/algory-capital.jpeg';

interface LedgerEntry {
  date: string;
  portfolio_value: number;
  cash: number;
  invested: number;
  num_positions: number;
  SPY: number;
}

interface TradeData {
  purchase_date: string;
  sell_date: string;
  symbol: string;
  start_price: number;
  end_price: number;
  return: number;
  strat_edge: number;
  confidence: number;
}

const Dashboard = () => {
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [transactionsData, setTransactionsData] = useState<TradeData[]>([]);
  const [showPortfolioValue, setShowPortfolioValue] = useState(true);
  const [showNumPositions, setShowNumPositions] = useState(false);
  const [showCash, setShowCash] = useState(false);
  const [showInvested, setShowInvested] = useState(false);
  const [showSpy, setShowSpy] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ledgerRes = await fetch('http://127.0.0.1:8000/api/uploadLedger');
        const ledger = await ledgerRes.json();
        setLedgerData(ledger);

        const transactionsRes = await fetch('http://127.0.0.1:8000/api/uploadTransactions');
        const transactions = await transactionsRes.json();
        setTransactionsData(transactions);
      } catch (err) {
        console.error('Error fetching data', err);
      }
    };
    fetchData();
  }, []);

  return (
    <main style={{ padding: '120px 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ position: 'relative' }}>
        <div style={boxStyle}>
          <Chart
            data={ledgerData}
            showPortfolioValue={showPortfolioValue}
            showNumPositions={showNumPositions}
            showCash={showCash}
            showInvested={showInvested}
            showSpy={showSpy}
          />
        </div>

        <div style={{ position: 'absolute', top: '24px', right: '-170px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={toggleLabelStyle(showPortfolioValue)} onClick={() => setShowPortfolioValue(p => !p)}>Portfolio Value</div>
          <div style={toggleLabelStyle(showSpy)} onClick={() => setShowSpy(p => !p)}>SPY Baseline</div>
          <div style={toggleLabelStyle(showNumPositions)} onClick={() => setShowNumPositions(p => !p)}>Number of Positions</div>
          <div style={toggleLabelStyle(showCash)} onClick={() => setShowCash(p => !p)}>Cash Amount</div>
          <div style={toggleLabelStyle(showInvested)} onClick={() => setShowInvested(p => !p)}>Invested Amount</div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <div style={boxStyle}>
          <h2 style={boxTitleStyle}>Strategy Trades</h2>
          <Table data={transactionsData} />
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', gap: '24px', alignItems: 'center', zIndex: 1000 }}>
        <a href="https://github.com/parkercarrus/cluster-trading-strategy" style={iconStyle}>
          <GitHubIcon />
        </a>
        <a href="https://algorycapital.com" style={iconStyle}>
          <img src={algoryLogo} alt="Algory Capital" style={{ height: '48px' }} />
        </a>
      </div>
    </main>
  );
};

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="48px" height="48px" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12..." />
  </svg>
);

const boxStyle: React.CSSProperties = {
  backgroundColor: 'black',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
};

const boxTitleStyle: React.CSSProperties = {
  marginBottom: '16px',
  fontSize: '1.5rem',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  paddingBottom: '8px',
};

const iconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  color: 'white',
  textDecoration: 'none',
  opacity: 0.7,
  transition: 'opacity 0.2s',
};

const toggleLabelStyle = (active: boolean): React.CSSProperties => ({
  fontSize: '0.95rem',
  fontWeight: 500,
  color: active ? 'white' : 'rgba(255,255,255,0.4)',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'color 0.2s ease',
});

export default Dashboard;
