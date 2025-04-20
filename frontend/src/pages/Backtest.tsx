import React, { useState } from 'react';
import Chart from '../components/Chart';
import Table from '../components/Table';
import BacktestParametersForm from '../components/BacktestForm';
import type { FC } from 'react';

interface BacktestParameters {
  k: number;
  initial_capital: number;
  sell_threshold: number;
  start_quarter: string;
  end_quarter: string;
  model_strategy: string;
  random_state: number;
}

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

const Backtest: FC = () => {
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [transactionsData, setTransactionsData] = useState<TradeData[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (params: BacktestParameters) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });

      const url = `http://127.0.0.1:8000/api/backtest/?${queryParams.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const responseJson = await response.json();
      setTransactionsData(responseJson.transactions);
      setLedgerData(responseJson.ledger);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to fetch backtest data', err);
      setError('Failed to fetch backtest data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ padding: '120px 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        {!submitted ? (
        <BacktestParametersForm onSubmit={handleSubmit} isLoading={isLoading} />
        ) : (
        <>
            <div style={boxStyle}>
            <Chart data={ledgerData} showPortfolioValue showNumPositions showCash showInvested showSpy />
            </div>
            <div style={{ marginTop: '40px' }}>
            <div style={boxStyle}>
                <h2 style={boxTitleStyle}>Strategy Trades</h2>
                <Table data={transactionsData} />
            </div>
            </div>
        </>
        )}
    </main>
  );
};

export default Backtest;

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
