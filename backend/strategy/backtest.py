from .utils import quarters_dict
from .models import build_training_data, train_model, rank_stocks, get_buys, get_sells
import pandas as pd
import numpy as np
import random

def compute_quarterly_returns(buys_df, sells_df, price_data, quarters_dict):
    results = []

    for _, row in buys_df.iterrows():
        symbol = row['symbol']
        buy_date = row['buy_date']
        buy_price = row['buy_price']
        confidence = row['confidence']
        quarter = None

        # Find matching quarter
        for q, start in quarters_dict.items():
            if start == buy_date:
                quarter = q
                break

        # Determine sell price
        sell_row = next(
            (r for r in sells_df.itertuples() if r.symbol == symbol and r.sell_date > buy_date),
            None
        )

        if sell_row:
            sell_price = sell_row.sell_price
            sell_date = sell_row.sell_date
        else:
            # Perma hold — use last available price
            try:
                sell_price = price_data.loc[buy_date:, symbol].dropna().iloc[-1]
                sell_date = price_data.loc[buy_date:, symbol].dropna().index[-1]
            except:
                continue  # skip if no future price data

        gain = (sell_price - buy_price) / buy_price

        results.append({
            'symbol': symbol,
            'buy_date': buy_date,
            'buy_price': buy_price,
            'sell_date': sell_date,
            'sell_price': sell_price,
            'gain': gain,
            'quarter': quarter,
            'confidence': confidence
        })

    return pd.DataFrame(results)

def compute_baseline_returns(price_data: pd.DataFrame, quarters_dict: dict) -> pd.DataFrame:
    capital = [100000]
    results = []

    last_date = price_data.index.max()
    for q in sorted(quarters_dict.keys())[:-2]:
        try:
            start_date = pd.to_datetime(quarters_dict[q])
            start_price = price_data.loc[start_date:, 'SPY'].dropna().iloc[0]
            end_price = price_data.loc[last_date:, 'SPY'].dropna().iloc[0]
            ret = (end_price - start_price) / start_price
            results.append({'quarter': q, 'baseline_return': ret})
            capital.append(capital[-1] * (1 + ret))
        except Exception as e:
            print(f"Skipping {q}: {e}")
            continue

    df = pd.DataFrame(results)
    df['baseline_capital'] = capital[1:]
    return df

def get_train_test_data(data_dict, q_train, q_feat, fundamentals_only):
    """Extract and prepare training and testing data for a given pair of quarters."""
    try:
        train_df = data_dict[q_train].dropna(subset=['target'])
        test_df = data_dict[q_feat].dropna(subset=['target'])
    except KeyError as e:
        print(f"Missing data for quarter: {e}")
        return None, None, None, None, None

    if train_df.empty or test_df.empty:
        return None, None, None, None, None

    train_df = train_df.dropna()
    test_df = test_df.dropna()

    if fundamentals_only:
        columns = ['currentRatio', 'quickRatio', 'returnOnEquity', 'returnOnAssets', 'netProfitMargin',
                   'priceEarningsRatio', 'priceBookValueRatio', 'priceToSalesRatio', 'freeCashFlowPerShare',
                   'operatingCashFlowPerShare', 'cashFlowToDebtRatio', 'debtEquityRatio',
                   'longTermDebtToCapitalization', 'assetTurnover', 'inventoryTurnover', 'symbol', 'target']
        train_df = train_df[columns]
        test_df = test_df[columns]

    X_train = train_df.drop(columns=['symbol', 'target'])
    y_train = train_df['target']
    X_test = test_df.drop(columns=['symbol', 'target'])
    y_test = test_df['target']
    symbols = test_df['symbol'].reset_index(drop=True)

    return X_train, y_train, X_test, y_test, symbols

def backtest_loop(df_dict, price_data, quarters_dict, fundamentals_only, k=10, relative_performance=True):
    data_dict = build_training_data(df_dict, price_data, relative_performance=relative_performance)
    quarters = list(quarters_dict.keys())
    
    active_positions = []
    buy_records = []
    sell_records = []

    for i in range(len(quarters) - 2):
        q_train, q_feat, q_eval = quarters[i], quarters[i+1], quarters[i+2]
        start_date = quarters_dict[q_feat]
        end_date = quarters_dict[q_eval]

        X_train, y_train, X_test, y_test, symbols = get_train_test_data(data_dict, q_train, q_feat, fundamentals_only)
        if X_train is None:
            continue

        model = train_model(X_train, y_train)
        rankings_df = rank_stocks(model, X_test, y_test, symbols) # rank all stocks based on predicted future returns
        buys = get_buys(rankings_df, k=k)
        # Record buys
        for _, row in buys.iterrows():
            symbol = row['symbol']
            confidence = row['prob']
            try:
                start_price = price_data.loc[start_date:, symbol].dropna().iloc[0]
                buy_records.append({
                    'symbol': symbol,
                    'buy_date': start_date,
                    'buy_price': start_price,
                    'confidence': confidence
                })
                active_positions.append({
                    'symbol': symbol,
                    'start_price': start_price,
                    'start_date': start_date,
                })
            except:
                continue

        # Record closes
        sells = get_sells(rankings_df, active_positions)
        for closed_position in sells:
            symbol = closed_position['symbol']
            try:
                end_price = price_data.loc[end_date:, symbol].dropna().iloc[0]
                gain = (end_price - closed_position['start_price']) / closed_position['start_price']
                sell_records.append({
                    'symbol': symbol,
                    'sell_date': end_date,
                    'sell_price': end_price,
                    'gain': gain
                })
                active_positions.remove(closed_position)
            except:
                continue

    buys_df = pd.DataFrame(buy_records)
    sells_df = pd.DataFrame(sell_records)
    return buys_df, sells_df

def main(df_dict, price_data, random_state=102, use_step_forward=True, k=10, log=True, write_csv=False, fundamentals_only=False, relative_performance=True, quarters_dict=quarters_dict):
    np.random.seed(random_state)
    random.seed(random_state)

    # main backtesting loop
    buys_df, sells_df = backtest_loop(
        df_dict,
        price_data,
        quarters_dict,
        fundamentals_only=fundamentals_only,
        k=k,
        relative_performance=relative_performance
    )

    # compute strategy vs. baseline returns
    strategy_returns = compute_quarterly_returns(buys_df, sells_df, price_data, quarters_dict)
    baseline_returns = compute_baseline_returns(price_data, quarters_dict)

    merged = pd.merge(baseline_returns, strategy_returns, on='quarter')
    merged['strat_edge'] = merged['gain'] - merged['baseline_return']
    merged = merged[['quarter', 'buy_date', 'sell_date', 'baseline_return', 'symbol',
                     'buy_price', 'sell_price', 'gain', 'strat_edge', 'confidence']]
    merged = merged.rename(columns={
        'buy_date': 'purchase_date',
        'buy_price': 'start_price',
        'sell_price': 'end_price',
        'gain': 'return'
    })

    if log:
        avg_return = merged['return'].mean()
        avg_baseline = merged['baseline_return'].mean()
        avg_edge = merged['strat_edge'].mean()
        sharpe = avg_edge / merged['strat_edge'].std()

        print("===== Backtest Summary =====")
        print(f"Avg Return:         {avg_return:.2%}")
        print(f"Avg Baseline:       {avg_baseline:.2%}")
        print(f"Avg Strategy Edge:  {avg_edge:.2%}")
        print(f"Sharpe (Edge):      {sharpe:.2f}")
        print(f"Total Trades:       {len(merged)}")
        print("============================")

    if write_csv:
        path = f'data/results/results_randomstate{random_state}_k{k}.csv'
        merged.to_csv(path, index=False)
        if log:
            print(f"Results written to: {path}")

    return merged

def simulate_portfolio_ledger(returns_df, price_data, initial_capital=100_000, confidence_weighted=True):
    returns_df = returns_df.copy()
    returns_df['purchase_date'] = pd.to_datetime(returns_df['purchase_date'])
    returns_df['sell_date'] = pd.to_datetime(returns_df['sell_date'])

    start = returns_df['purchase_date'].min()
    end = returns_df['sell_date'].max()
    all_dates = pd.date_range(start, end, freq='B')

    cash = initial_capital
    positions = []
    portfolio_history = []

    for current_date in all_dates:
        # Close positions
        closing_today = [pos for pos in positions if pos['sell_date'] == current_date]
        for pos in closing_today:
            try:
                sell_price = price_data.at[current_date, pos['symbol']]
                proceeds = sell_price * pos['shares']
                cash += proceeds
            except KeyError:
                continue  # missing price

        # Remove closed positions
        positions = [pos for pos in positions if pos['sell_date'] > current_date]

        # Open new positions
        todays_buys = returns_df[returns_df['purchase_date'] == current_date]
        if not todays_buys.empty:
            if confidence_weighted:
                total_conf = todays_buys['confidence'].sum()
                weights = (
                    todays_buys['confidence'] / total_conf if total_conf > 0
                    else np.repeat(1 / len(todays_buys), len(todays_buys))
                )
            else:
                weights = np.repeat(1 / len(todays_buys), len(todays_buys))

            for (_, row), weight in zip(todays_buys.iterrows(), weights):
                allocation = cash * weight
                try:
                    buy_price = price_data.at[current_date, row['symbol']]
                    shares = allocation / buy_price
                    positions.append({
                        'symbol': row['symbol'],
                        'shares': shares,
                        'buy_price': buy_price,
                        'purchase_date': row['purchase_date'],
                        'sell_date': row['sell_date']
                    })
                    cash -= allocation
                except KeyError:
                    continue  # missing buy price

        # Compute total portfolio value
        invested = 0
        for pos in positions:
            try:
                try:
                    price = price_data.at[current_date, pos['symbol']]
                except KeyError:
                    try:
                        # fallback to last known price before this date
                        price = price_data.loc[:current_date, pos['symbol']].dropna().iloc[-1]
                    except:
                        raise IndexError(f"Index out of range for {pos}")

                invested += price * pos['shares']
            except KeyError as e:
                continue

        portfolio_value = cash + invested
        portfolio_history.append({
            'date': current_date,
            'portfolio_value': portfolio_value,
            'cash': cash,
            'invested': invested,
            'num_positions': len(positions)
        })

    return pd.DataFrame(portfolio_history)
