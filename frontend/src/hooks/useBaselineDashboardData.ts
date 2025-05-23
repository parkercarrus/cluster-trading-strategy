import { useEffect, useState } from 'react';

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

interface MetricsData {
  net_return: number;
  benchmarked_return: number;
  cagr: number;
  sharpe_ratio: number;
}
const apiUrl = import.meta.env.VITE_API_URL;

const useBaselineDashboardData = () => {
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [transactionsData, setTransactionsData] = useState<TradeData[]>([]);
  const [metricsData, setMetricsData] = useState<MetricsData>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ledgerRes = await fetch(`${apiUrl}/api/uploadLedger`);
        const ledger = await ledgerRes.json();
        setLedgerData(ledger);

        const transactionsRes = await fetch(`${apiUrl}/api/uploadTransactions`);
        const transactions = await transactionsRes.json();
        setTransactionsData(transactions);

        const metricsRes = await fetch(`${apiUrl}/api/uploadMetrics`);
        const metrics = await metricsRes.json();
        setMetricsData(metrics);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, []);

  return { ledgerData, transactionsData, metricsData };
};

export default useBaselineDashboardData;
