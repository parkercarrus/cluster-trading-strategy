# Clustering-Informed Algorithmic Trading

This project implements a **cluster-aware, step-forward backtested machine learning strategy** for ranking and selecting top-performing stocks based on predicted future relative performance. Stocks are grouped into clusters using KMeans, and features are engineered to reflect both relative positioning and cluster dynamics.

## Highlights

- **Cluster-Aware**: KMeans clustering per quarter allows models to learn relationships within clusters.
- **Relative Performance Prediction**: Targets and features are defined relative to a stock's cluster.
- **Step-Forward Backtest**: Simulates realistic future-looking trading behavior.
- **Top-K Long Strategy**: Each quarter, the model selects K stocks to long.
- **Baseline Comparison**: Compares performance to a SPY-equivalent baseline.

```bash
pip install requirements.txt
git lfs install
git lfs pull
python run.py
```

## Dependencies

- Python 3.9+
- `pandas`, `numpy`, `scikit-learn`

**Author**: Algory Capital \
**License**: MIT
