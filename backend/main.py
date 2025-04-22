from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from strategy.dataset import load_df_dict, price_data
from strategy.backtest import main, simulate_portfolio_ledger
from strategy.utils import getMetrics

df_dict = load_df_dict()
spy_baseline = pd.read_csv('data/seed/spy_data.csv')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/uploadLedger")
def uploadLedger():
    print('ledger upload requested')
    ledger = pd.read_csv('data/seed/ledger.csv')
    return ledger.to_dict(orient="records")

@app.get("/api/uploadTransactions")
def uploadTransactions():
    print('transactions upload requested')
    transactions = pd.read_csv('data/seed/transactions.csv')
    return transactions.to_dict(orient="records")

@app.get("/api/uploadMetrics")
def uploadMetrics():
    print('metrics upload requested')
    ledger = pd.read_csv('data/seed/ledger.csv')
    metrics = getMetrics(ledger, spy_baseline)
    return metrics

@app.get("/api/backtest")
def customBacktest(
    k: int,
    initial_capital: float,
    random_state: int,
    model_strategy: str,
    sell_threshold: float,
    start_quarter: str,
    end_quarter: str
):
    print("Backtest request received with:")
    print(f"k={k}, capital={initial_capital}, model={model_strategy}, threshold={sell_threshold}, start={start_quarter}, end={end_quarter}")

    transactions = main(
        df_dict=df_dict,
        price_data=price_data,
        random_state=random_state,
        k=k,
        sell_threshold=sell_threshold,
        log=True,
        write_csv=False,
        fundamentals_only=False,
        relative_performance=False
    )
    
    ledger = simulate_portfolio_ledger(
        returns_df=transactions,
        price_data=price_data,
        initial_capital=initial_capital
    )

    ledger = ledger.iloc[:-1] # for some reason ledger returns a zero row at the end

    # janky method to get SPY baseline (see top of script) --> refine
    metrics = getMetrics(ledger, spy_baseline)

    return {
        "transactions": transactions.to_dict(orient="records"),
        "ledger": ledger.to_dict(orient="records"),
        "metrics": metrics
    }