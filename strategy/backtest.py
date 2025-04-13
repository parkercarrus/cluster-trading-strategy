from .utils import perma_strat, quarters_dict
from .models import build_training_data, train_model, get_top_k_predictions
import pandas as pd
import numpy as np
import random


def long(top_df, quarter, price_data, perma=True):
    start_date, end_date = (
        perma_strat(quarter, quarters_dict)
    )

    results = []
    for symbol in top_df['symbol']:
        if symbol not in price_data.columns:
            continue
        try:
            start_price = price_data.loc[start_date:, symbol].dropna().iloc[0]
            end_price = price_data.loc[end_date:, symbol].dropna().iloc[0]
            ret = (end_price - start_price) / start_price
            results.append({
                'symbol': symbol,
                'start_price': start_price,
                'end_price': end_price,
                'return': ret,
                'purchase_date': start_date
            })
        except:
            continue

    return pd.DataFrame(results)


def compute_quarterly_returns(quarterly_predictions, price_data):
    results = []
    for quarter, top_df in quarterly_predictions.items():
        ret_df = long(top_df, quarter, price_data, perma=True)
        ret_df['quarter'] = quarter
        results.append(ret_df)
    return pd.concat(results, ignore_index=True)


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


def step_forward_backtest(df_dict, price_data, quarters_dict, k=10):

    data_dict = build_training_data(df_dict, price_data)
    quarters = list(quarters_dict.keys())
    predictions = {}

    for i in range(len(quarters) - 2):
        q_train = quarters[i]
        q_feat = quarters[i + 1]
        q_eval = quarters[i]

        try:
            train_df = data_dict[q_train].dropna(subset=['target'])
            test_df = data_dict[q_feat].dropna(subset=['target'])

        except KeyError as e:
            print(f"Missing data for quarter: {e}")
            continue

        if train_df.empty or test_df.empty:
            continue

        # Split train
        train_df = train_df.dropna()
        test_df = test_df.dropna()
        X_train = train_df.drop(columns=['symbol', 'target'])
        y_train = train_df['target']

        # Split test
        X_test = test_df.drop(columns=['symbol', 'target'])
        y_test = test_df['target']
        symbols = test_df['symbol'].reset_index(drop=True)

        train_df = train_df.dropna()
        test_df = test_df.dropna()

        # Train and predict
        model = train_model(X_train, y_train)
        top_k_df = get_top_k_predictions(model, X_test, y_test, symbols, k=k)

        # Add quarter label
        top_k_df = top_k_df.copy()
        top_k_df['quarter'] = q_feat

        # Add returns Q_feat → Q_eval
        start_date = quarters_dict[q_feat]
        end_date = quarters_dict[q_eval]
        returns = []
        for symbol in top_k_df['symbol']:
            try:
                start_price = price_data.loc[start_date:, symbol].dropna().iloc[0]
                end_price = price_data.loc[end_date:, symbol].dropna().iloc[0]
                ret = (end_price - start_price) / start_price
                returns.append(ret)
            except:
                returns.append(np.nan)

        top_k_df['return'] = returns
        predictions[q_feat] = top_k_df.dropna(subset=['return'])

    return predictions




def backtest(
    df_dict,
    price_data,
    random_state=102,
    use_step_forward=True,
    k=10,
    log=True,
    write_csv=False,
):
    np.random.seed(random_state)
    random.seed(random_state)

    if use_step_forward:
        quarterly_predictions = step_forward_backtest(df_dict, price_data, quarters_dict, k=k)
    else:
        raise NotImplementedError('Only step-forward backtest is supported.')

    strategy_returns = compute_quarterly_returns(quarterly_predictions, price_data)
    baseline_returns = compute_baseline_returns(price_data, quarters_dict)

    merged = pd.merge(baseline_returns, strategy_returns, on='quarter')
    merged['strat_edge'] = merged['return'] - merged['baseline_return']
    merged = merged[['quarter', 'purchase_date', 'baseline_return', 'symbol',
                     'start_price', 'end_price', 'return', 'strat_edge']]

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