# Clustering-Informed Algorithmic Trading

This project implements a **cluster-aware, step-forward backtested machine learning strategy** for ranking and selecting top-performing stocks based on predicted future relative performance. Stocks are grouped into clusters using KMeans, and features are engineered to reflect both relative positioning and cluster dynamics.

## Highlights

- **Cluster-Aware**: KMeans clustering per quarter allows models to learn relationships within clusters.
- **Relative Performance Prediction**: Targets and features are defined relative to a stock's cluster.
- **Step-Forward Backtest**: Simulates realistic future-looking trading behavior.
- **Top-K Long Strategy**: Each quarter, the model selects K stocks to long.
- **Baseline Comparison**: Compares performance to a SPY-equivalent baseline.

## Project Structure

```
main/
├── run.py               # Main execution script
├── strategy/
│   ├── backtest.py      # Backtesting functions
│   ├── clustering.py    # Clustering logic & feature engineering
│   ├── dataset.py       # Data loading and dataset construction
│   ├── models.py        # Model training and prediction
│   └── utils.py         # Utility functions (e.g. quarter handling)
└── data/
    ├── price_data.csv   # Historical prices for all stocks
    └── processed/       # Per-quarter stock features
```

## How to Run

1. Ensure per-quarter processed CSVs in `data/processed/quarterly/`
2. Ensure `data/price_data.csv` is present and formatted with prices
3. From the `main/` directory, run:

```bash
pip install requirements.txt
python run.py
```

## Dependencies

- Python 3.9+
- `pandas`, `numpy`, `scikit-learn`

## Example Output

```
===== Backtest Summary =====
Avg Return:         15.33%
Avg Baseline:       10.13%
Avg Strategy Edge:  5.20%
Sharpe (Edge):      1.38
Total Trades:       100
============================
```

## TODO

- Add algorithmic position closing
- Adjust bet-sizing proportional to model confidence
- Implement functionality for different classifiers (ie. MLP, XGBoost)

---

**Author**: Algory Capital \
**License**: MIT