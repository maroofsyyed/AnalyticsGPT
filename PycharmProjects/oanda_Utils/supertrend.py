'''
 Supertrend is a trend-following indicator that uses Average True Range (ATR) and a simple high low
 average(HL2) to form a lower and an upper band.
 The gist of the indicator is, when the close price crosses above the upper band, the stock is
 considered to be entering the uptrend, hence a buy signal; when the close price crosses below the
 lower band, the stock is considered to have exited the trend and it is time to sell.

'''
def tr(data):
    '''
    Function to calculate high-low, high-pc and low-pc differences
    :param data: Stock Data. pd.Dataframe is applicable
    :return:True Range(tr)
    '''
    data['previous_close'] = data['close'].shift(1)
    data['high-low'] = (data['high']-data['low']) #high-low = (high - low)
    data['high-pc'] = abs(data['high']-data['previous_close'])#high-pc = abs(high - previous_close)
    data['low-pc'] = abs(data['low']-data['previous_close'])#low-pc = abs(low - previous_close)
    tr = data[['high-low', 'high-pc', 'low-pc']].max(axis=1)
    return tr


def atr(data, period=10):
    '''
    Function to calculate average true range(atr)
    :param data: Stock Data. pd.Dataframe is applicable
    :param period: The period for which average in features is to be obtained.
    :return: Average True Range(atr)
    '''
    data['tr'] = tr(data)
    print("calculate average true range")
    the_atr = data['tr'].rolling(period).mean()

    return the_atr


def supertrend(data=None, period=20, atr_multiplier=2):#atr_multiplier is initialised to 2 OR 3
    print("calculating supertrend")
    '''
    Function to caculate the dataframe of Supertrend values which is True or False when the trend breaks
    :param data:Stock Data. pd.Dataframe is applicable
    :param period: The period for which supertrend in features is to be obtained.
    :param atr_multiplier: generally initialised to 2 OR 3  
    :return:Dataframe with supertrend values calculated which is True or False when the trend breaks
    '''
    hl2 = (data['high']+data['low'])/2
    data['atr'] = atr(data, period)
    data['upperband'] = hl2+(atr_multiplier*data['atr'])
    data['lowerband'] = hl2-(atr_multiplier*data['atr'])
    data['Supertrend']= True*len(data)

    for current in range(1, len(data.index)):
        previous = current-1
        #if current close price crosses above upperband
        if data['close'][current] > data['upperband'][previous]:
            data['Supertrend'][current] = False
        #if current close price crosses below lowerband
        elif data['close'][current] < data['lowerband'][previous]:
            data['Supertrend'][current] = True
        #else, the trend continues
        else:
            data['Supertrend'][current] = data['Supertrend'][previous]


            if data['Supertrend'][current] and data['lowerband'][current] < data['lowerband'][previous]:
                data['lowerband'][current] = data['lowerband'][previous]
            if not data['Supertrend'][current] and data['upperband'][current] > data['upperband'][previous]:
                data['upperband'][current] = data['upperband'][previous]
                '''
                Basically, the adjustment is that, in the case of an uptrend, the final upperband will remain the same 
                until there is a higher upperband value, and vice versa
                '''


    return data