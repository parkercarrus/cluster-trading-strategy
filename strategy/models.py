import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from .clustering import train_kmeans, get_cluster_mapping, construct_params


def train_random_forest(X_train, y_train, threshold, seed):
    """Train and return a Random Forest classifier using top-quantile labeling."""
    threshold = y_train.quantile(0.75)
    y_binary = (y_train > threshold).astype(int)

    model = RandomForestClassifier(
        max_depth=10,
        n_estimators=100,
        random_state=seed,
        n_jobs=-1
    )
    model.fit(X_train, y_binary)
    return model


def train_model(X_train, y_train, model='RandomForest', threshold=0.25, seed=17):
    """Train a model based on a string identifier."""
    if model == 'RandomForest':
        return train_random_forest(X_train, y_train, threshold, seed)
    else:
        raise NotImplementedError(f"Model '{model}' not supported.")


def get_top_k_predictions(clf, X_test, y_test, symbols, k=10):
    """Return top-k predicted symbols with associated scores and targets."""
    df = pd.DataFrame({
        'symbol': symbols.reset_index(drop=True),
        'target': y_test.reset_index(drop=True),
        'prob': clf.predict_proba(X_test)[:, 1]
    })
    return df.sort_values(by='prob', ascending=False).head(k)


def build_training_data(df_dict, price_data, n_clusters=15, seed=42):
    models = train_kmeans(df_dict, n_clusters=n_clusters, seed=seed)
    stock_list = sorted({symbol for df in df_dict.values() for symbol in df['symbol'].unique()})
    data_dict = {}

    for quarter in sorted(df_dict.keys())[:-2]:
        model = models.get(quarter)
        if model is None:
            continue

        cluster_map = get_cluster_mapping(df_dict, model, quarter, stock_list)

        for cluster in cluster_map.values():
            df = construct_params(price_data, cluster, quarter, df_dict)
            if df is not None and not df.empty:
                if quarter not in data_dict:
                    data_dict[quarter] = []
                data_dict[quarter].append(df)

    for quarter in data_dict:
        data_dict[quarter] = pd.concat(data_dict[quarter], ignore_index=True)

    if not data_dict:
        raise ValueError("No data generated. Check cluster mapping or construct_params.")

    return data_dict

