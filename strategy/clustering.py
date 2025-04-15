import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from datetime import timedelta
from strategy.utils import quarters_dict, next_quarter, returns, get_data


def train_kmeans(df_dict, n_clusters=15, seed=42, feature_start_idx=3):
    models = {}
    for quarter, df in df_dict.items():
        X = df.iloc[:, feature_start_idx:]
        model = KMeans(n_clusters=n_clusters, random_state=seed, n_init=10)
        model.fit(X)
        models[quarter] = model
    return models


def get_cluster_mapping(df_dict, model, quarter, stock_list):
    cluster_stock_mapping = {}
    for stock in stock_list:
        data = get_data(stock, quarter, df_dict)
        if data is not None:
            cluster = model.predict(data)[0]
            cluster_stock_mapping.setdefault(cluster, []).append(stock)
    return cluster_stock_mapping


def construct_data(cluster, quarter, df_dict):
    cluster_data = {symbol: get_data(symbol, quarter, df_dict) for symbol in cluster}
    cluster_df = pd.concat(cluster_data, axis=0).reset_index(level=0).rename(columns={'level_0': 'symbol'})
    return cluster_df


def centroid(cluster_data):
    cols = cluster_data.columns[1:]
    values = cluster_data[cols].mean()
    centroid_df = pd.DataFrame([values], columns=cols)
    centroid_df.insert(0, 'symbol', 'centroid')
    return centroid_df


def centroid_distance(cluster_data):
    cols = cluster_data.columns[1:]
    c_df = centroid(cluster_data)
    all_data = pd.concat([cluster_data, c_df], ignore_index=True)
    delta = all_data[cols].sub(c_df.iloc[0][cols], axis=1)
    all_data[cols] = delta
    return all_data


def calculate_relative_performance(price_data, cluster, train_quarter, days=1):
    start_date = pd.to_datetime(quarters_dict[train_quarter])
    end_date = start_date + timedelta(days=90)
    
    valid_stocks = [stock for stock in cluster if stock in price_data.columns]
    if not valid_stocks:
        return None
    cluster_prices = price_data[valid_stocks].loc[start_date:end_date]

    rets_df = returns(cluster_prices, days=days) # days = window for average price calculation

    results = []
    for symbol in cluster:
        stock_ret = rets_df[rets_df['symbol'] == symbol]['returns'].values
        if len(stock_ret) == 0: # skip missing stocks
            continue
        stock_ret = stock_ret[0] # flatten relative performance for x3 and target 
        cluster_avg = rets_df[rets_df['symbol'] != symbol]['returns'].mean()
        rel_perf = stock_ret - cluster_avg
        results.append({'symbol': symbol, 'relative_performance': rel_perf})

    return pd.DataFrame(results)

def calculate_outright_performance(price_data, cluster, train_quarter, quarters_ahead=1, days=7):
    start_date = pd.to_datetime(quarters_dict[train_quarter])

    current_q = train_quarter
    for _ in range(quarters_ahead):
        next_q = next_quarter(current_q)
        if next_q not in quarters_dict:
            break
        current_q = next_q

    end_date = pd.to_datetime(quarters_dict[current_q]) + timedelta(days=90)

    valid_stocks = [stock for stock in cluster if stock in price_data.columns]
    if not valid_stocks:
        return None

    price_window = price_data[valid_stocks].loc[start_date:end_date]

    rets_df = returns(price_window, days=days)

    return rets_df.rename(columns={'returns': 'outright_performance'})

def construct_params(price_data, cluster, quarter, df_dict, relative_performance=True):
    q1 = next_quarter(quarter)
    q2 = next_quarter(q1)

    # gather base features
    cluster_data_base = construct_data(cluster, quarter, df_dict)
    base_features = cluster_data_base.copy()

    # centroid distances
    d0 = centroid_distance(cluster_data_base)
    d1 = centroid_distance(construct_data(cluster, q1, df_dict))

    d0 = d0[d0['symbol'] != 'centroid'].reset_index(drop=True)
    d1 = d1[d1['symbol'] != 'centroid'].reset_index(drop=True)

    # calculate delta
    feature_cols = d0.columns.drop('symbol')
    delta = d1[feature_cols] - d0[feature_cols]
    delta.columns = [f"{col}_delta" for col in feature_cols]
    delta.insert(0, 'symbol', d0['symbol'].values)

    if relative_performance:
        rel_perf_q1 = calculate_outright_performance(price_data, cluster, q1)
        rel_perf_q2 = calculate_outright_performance(price_data, cluster, q2)
        rel_perf_q2.columns = ['symbol', 'target']

        # --- Final merge ---
        df = base_features.merge(d0, on='symbol') \
                        .merge(delta, on='symbol') \
                        .merge(rel_perf_q1, on='symbol') \
                        .merge(rel_perf_q2, on='symbol')
        
    else:
        out_perf_q1 = calculate_outright_performance(price_data, cluster, q1)
        out_perf_q2 = calculate_outright_performance(price_data, cluster, q2)
        out_perf_q2.columns = ['symbol', 'target']

        # --- Final merge ---
        df = base_features.merge(d0, on='symbol') \
                        .merge(delta, on='symbol') \
                        .merge(out_perf_q1, on='symbol') \
                        .merge(out_perf_q2, on='symbol')
         


    return df
