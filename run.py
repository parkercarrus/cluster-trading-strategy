from strategy.dataset import load_df_dict, price_data
from strategy.models import build_training_data, train_model, get_top_k_predictions
from strategy.backtest import backtest

if __name__ == "__main__":
    df_dict = load_df_dict()

    results = backtest(
        df_dict=df_dict,
        price_data=price_data,
        random_state=42,
        use_step_forward=True,
        k=10,
        log=True,
        write_csv=False,
        fundamentals_only=False,
        relative_performance=False
    )

    print(results.sort_values(by='return', ascending=False))