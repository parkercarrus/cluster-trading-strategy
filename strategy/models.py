import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from .clustering import train_kmeans, get_cluster_mapping, construct_params
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, GridSearchCV

def build_training_data(df_dict, price_data, n_clusters=15, seed=42, relative_performance=True):

    models = train_kmeans(df_dict, n_clusters=n_clusters, seed=seed)
    stock_list = sorted({symbol for df in df_dict.values() for symbol in df['symbol'].unique()})
    data_dict = {}

    for quarter in sorted(df_dict.keys())[:-2]:
        model = models.get(quarter)
        if model is None:
            continue

        cluster_map = get_cluster_mapping(df_dict, model, quarter, stock_list)

        for cluster in cluster_map.values():
            df = construct_params(price_data, cluster, quarter, df_dict, relative_performance)
            if df is not None and not df.empty:
                if quarter not in data_dict:
                    data_dict[quarter] = []
                data_dict[quarter].append(df)

    for quarter in data_dict:
        data_dict[quarter] = pd.concat(data_dict[quarter], ignore_index=True)

    if not data_dict:
        raise ValueError("No data generated. Check cluster mapping or construct_params.")

    return data_dict

param_grid = {
    'n_estimators': [100, 300, 500],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5],
    'min_samples_leaf': [1, 2],
    'max_features': ['sqrt', 'log2'],
}

def train_random_forest(X_train, y_train, threshold, seed):
    """Train and return a Random Forest classifier using top-quantile labeling."""
    threshold = y_train.quantile(0.75)
    y_binary = (y_train > threshold).astype(int)

    model = RandomForestClassifier(
        n_estimators=500,         
        max_depth=None,          
        min_samples_split=5,     
        min_samples_leaf=2,      
        max_features='sqrt',      
        class_weight='balanced',
        bootstrap=True,         
        oob_score=True,           
        n_jobs=-1,              
        random_state=seed,
        verbose=0
    )

    model.fit(X_train, y_binary)
    cv_auc = cross_val_score(model, X_train, y_binary, scoring='roc_auc', cv=5)
    #print(f"Cross-Validation AUC: {np.mean(cv_auc)}")
    return model

def train_random_forest_gridsearch(X_train, y_train, threshold, seed):
    """Train and return a Random Forest classifier using top-quantile labeling."""
    threshold = y_train.quantile(0.75)
    y_binary = (y_train > threshold).astype(int)

    rf = RandomForestClassifier(random_state=42, class_weight='balanced', n_jobs=-1)

    grid_search = GridSearchCV(
        estimator=rf,
        param_grid=param_grid,
        scoring='roc_auc',
        cv=5,
        verbose=1,
        n_jobs=-1,
    )
    grid_search.fit(X_train, y_binary)
    print("Best AUC:", grid_search.best_score_)
    print("Best params:", grid_search.best_params_)

    best_model = grid_search.best_estimator_
    return best_model

def train_model(X_train, y_train, model='RandomForest', threshold=0.25, seed=17):
    """Train a model based on a string identifier."""
    if model == 'RandomForest':
        return train_random_forest(X_train, y_train, threshold, seed)
    else:
        raise NotImplementedError(f"Model '{model}' not supported.")

def rank_stocks(clf, X_test, y_test, symbols):
    """Return top-k predicted symbols with associated scores and targets."""
    df = pd.DataFrame({
        'symbol': symbols.reset_index(drop=True),
        'target': y_test.reset_index(drop=True),
        'prob': clf.predict_proba(X_test)[:, 1]
    })
    return df.sort_values(by='prob', ascending=False)

def get_buys(ranked_stocks_df, k):
    return ranked_stocks_df.head(k)

def get_sells(ranked_stocks_df, positions, threshold=0.3):
    n_tail = int(len(ranked_stocks_df) * threshold)
    poor_symbols = set(ranked_stocks_df.tail(n_tail)['symbol'].values)

    # Filter current active positions for those now deemed poor
    sells = [p for p in positions if p['symbol'] in poor_symbols]
    print(sells)
    return sells