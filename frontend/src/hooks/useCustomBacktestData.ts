import { useState } from 'react';
import { LedgerEntry, TradeData, MetricsData } from '../types/dashboard';

export interface BacktestParameters {
  k: number;
  initial_capital: number;
  sell_threshold: number;
  start_quarter: string;
  end_quarter: string;
  random_state: number;
}

const useCustomBacktestData = () => {
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [transactionsData, setTransactionsData] = useState<TradeData[]>([]);
  const [metricsData, setMetricsData] = useState<MetricsData>();
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runBacktest = async (params: BacktestParameters) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        k: params.k.toString(),
        initial_capital: params.initial_capital.toString(),
        random_state: params.random_state.toString(),
        model_strategy: 'Random Forest',
        sell_threshold: params.sell_threshold.toString(),
        start_quarter: params.start_quarter,
        end_quarter: params.end_quarter,
      }).toString();
      
      const res = await fetch(`http://127.0.0.1:8000/api/backtest?${query}`);
      const data = await res.json();

      setLedgerData(data.ledger);
      setTransactionsData(data.transactions);
      setMetricsData(data.metrics);
      setHasRun(true);
    } catch (err) {
      console.error('Error running backtest:', err);
    }
    setLoading(false);
  };

  return {
    runBacktest,
    loading,
    hasRun,
    ledgerData,
    transactionsData,
    metricsData,
  };
};

export default useCustomBacktestData;
