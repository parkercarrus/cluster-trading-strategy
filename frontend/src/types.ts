export interface Transaction {
    quarter: string;
    purchase_date: string; // ISO format
    sell_date: string;     // ISO format
    baseline_return: number;
    symbol: string;
    start_price: number;
    end_price: number;
    return: number;
    strat_edge: number;
    confidence: number;
  }
  
  export interface LedgerEntry {
    date: string; // ISO date string
    portfolio_value: number;
    cash: number;
    invested: number;
    num_positions: number;
  }
  
  export interface BacktestResponse {
    transactions: Transaction[];
    ledger: LedgerEntry[];
  }
  