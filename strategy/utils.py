import pandas as pd

price_data = pd.read_csv('data/price_data.csv')
price_data['Date'] = pd.to_datetime(price_data['Date'])
price_data.set_index('Date', inplace=True)

def next_quarter(current_quarter):
    year, quarter = current_quarter.split('_')
    year = int(year)
    quarter_number = int(quarter[1])
    
    if quarter_number == 4:
        return f"{year + 1}_Q1"
    else:
        return f"{year}_Q{quarter_number + 1}"
    
def perma_strat(quarter, quarters_dict):
    """Return start and end dates for a buy-and-hold strategy"""
    quarters = sorted(quarters_dict)
    idx = quarters.index(quarter)
    return quarters_dict[quarters[idx+1]], quarters_dict[quarters[-1]]

def returns(price_df, days=1):
    """Calculate average return per symbol over the given window."""
    
    start_period = price_df.iloc[:days]
    end_period = price_df.iloc[-days:]

    start_avg = start_period.mean()
    end_avg = end_period.mean()

    returns_series = (end_avg - start_avg) / start_avg
    returns_df = returns_series.reset_index()
    returns_df.columns = ['symbol', 'returns']

    return returns_df

def get_data(symbol, quarter, df_dict, feature_start_idx=3):
    df = df_dict.get(quarter)
    if df is None:
        return None
    row = df[df['symbol'] == symbol]
    if row.empty:
        return None
    return row.iloc[:, feature_start_idx:].reset_index(drop=True)

quarters_dict = {
    "2021_Q1": "2021-05-15",
    "2021_Q2": "2021-08-15",
    "2021_Q3": "2021-11-15",
    "2021_Q4": "2022-02-15",
    "2022_Q1": "2022-05-15",
    "2022_Q2": "2022-08-15",
    "2022_Q3": "2022-11-15",
    "2022_Q4": "2023-02-15",
    "2023_Q1": "2023-05-15",
    "2023_Q2": "2023-08-15",
    "2023_Q3": "2023-11-15",
    "2023_Q4": "2024-02-15",
    "2024_Q1": "2024-05-15",
    "2024_Q2": "2024-08-15",
    "2024_Q3": "2024-11-15",
    "2024_Q4": "2025-02-15"
}