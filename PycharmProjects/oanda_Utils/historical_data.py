import pandas as pd
import oandapyV20
import oandapyV20.endpoints.instruments as instruments

def get_historical_forex_data(access_token, instrument, start_date, end_date, timeframe='M1', return_df=True):
    """
    Function returns historical Forex data for the given instrument sampled with the timeframe provided.
    :param access_token: Your Oanda API access token
    :param instrument: The Forex instrument symbol (e.g., "EUR_USD")
    :param start_date: The start date of the data in "YYYY-MM-DD" format
    :param end_date: The end date of the data in "YYYY-MM-DD" format
    :param timeframe: The data sampling period. Can be a value from ['S', 'M', 'H', 'D', 'W', 'M']
    :param return_df: Whether to return the data in the form of a pandas DataFrame or numpy Array
    :return: The Forex data collected
    """

    client = oandapyV20.API(access_token=access_token)

    params = {
        "from": start_date,
        "to": end_date,
        "granularity": timeframe
    }

    r = instruments.InstrumentsCandles(instrument=instrument, params=params)
    client.request(r)

    data = []
    for candle in r.response['candles']:
        time = candle['time']
        volume = candle['volume']
        open_price = candle['mid']['o']
        high_price = candle['mid']['h']
        low_price = candle['mid']['l']
        close_price = candle['mid']['c']
        data.append([time, volume, open_price, high_price, low_price, close_price])

    df = pd.DataFrame(data, columns=['timestamp', 'volume', 'open', 'high', 'low', 'close'])
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.set_index('timestamp')

    if return_df is True:
        return df
    elif return_df is False:
        return df.values

# Example usage
# access_token = '45adf40df1477e2e6ddccca15210c823-0f97de3c837cf2c8f542c6821db9cf56'
#
#
#
#
# df = get_historical_forex_data(access_token, instrument = 'USD_CHF', start_date = '2023-05-30',end_date = '2023-05-31',timeframe = 'M5')
# print(df)





