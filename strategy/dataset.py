import pandas as pd
import os
from strategy.utils import quarters_dict, next_quarter, price_data, get_data
from strategy.clustering import train_kmeans, get_cluster_mapping, construct_params


def load_df_dict(path='data/quarterly/', feature_start_idx=3):
    df_dict = {}
    for fname in os.listdir(path):
        if fname.endswith('.csv'):
            quarter = fname.replace('.csv', '')
            df = pd.read_csv(os.path.join(path, fname))
            df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
            df = df.sort_values(by='symbol').reset_index(drop=True)
            df_dict[quarter] = df
    return df_dict


# === Cluster-Aware Dataset Builder ===
def build_dataset(stock_list, df_dict, price_data, n_clusters=15):
    """
    Constructs cluster-relative training dataset using construct_params().
    """
    cluster_models = train_kmeans(df_dict, n_clusters=n_clusters)
    all_data = []

    for quarter in sorted(df_dict.keys())[:-2]:
        model = cluster_models.get(quarter)
        if model is None:
            continue

        cluster_map = get_cluster_mapping(model, quarter, stock_list)

        for cluster in cluster_map.values():
            df = construct_params(price_data, cluster, quarter, df_dict)
            if df is not None and not df.empty:
                df['quarter'] = quarter
                all_data.append(df)

    if not all_data:
        raise ValueError("No data constructed. Check clustering or feature issues.")
    print(f'dataset: {pd.concat(all_data)}')
    return pd.concat(all_data, ignore_index=True)
