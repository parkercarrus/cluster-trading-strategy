from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from strategy.dataset import load_df_dict, price_data
from strategy.backtest import main, simulate_portfolio_ledger

df_dict = load_df_dict()

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
    ledger = pd.read_csv('data/ledger.csv')
    return ledger.to_dict(orient="records")

@app.get("/api/uploadTransactions")
def uploadTransactions():
    print('transactions upload requested')
    transactions = pd.read_csv('data/transactions.csv')
    return transactions.to_dict(orient="records")

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

    return {
        "transactions": transactions.to_dict(orient="records"),
        "ledger": ledger.to_dict(orient="records")
    }
