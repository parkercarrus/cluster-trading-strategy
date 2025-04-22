export interface LedgerEntry {
    date: string;
    portfolio_value: number;
    cash: number;
    invested: number;
    num_positions: number;
    SPY: number;
  }
  
  export interface TradeData {
    purchase_date: string;
    sell_date: string;
    symbol: string;
    start_price: number;
    end_price: number;
    return: number;
    strat_edge: number;
    confidence: number;
  }
  
  export interface MetricsData {
    net_return: number;
    benchmarked_return: number;
    cagr: number;
    sharpe_ratio: number;
  }

  export interface BacktestParameters {
    k: number;
    initial_capital: number;
    sell_threshold: number;
    start_quarter: string;
    end_quarter: string;
    random_state: number;
  }