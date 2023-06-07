import configparser
from oandapyV20 import API
from oandapyV20.exceptions import V20Error
from oandapyV20.endpoints.accounts import AccountDetails
from oandapyV20.endpoints.orders import OrderCreate
from oandapyV20.endpoints.positions import PositionClose





def get_config():
    """
    Read the configuration from config.ini file.
    """
    config = configparser.ConfigParser()
    config.read('config.ini')
    return config['DEFAULT']


def create_market_order(instrument='EUR_USD', units=1000, time_in_force='FOK', position_fill='DEFAULT', take_profit=1.2050, stop_loss=1.1950):
    config = get_config()
    api = API(access_token=config['api_key'], environment="practice")

    account_id = config['account_id']

    try:
        # Get margin rate
        request = AccountDetails(accountID=account_id)
        response = api.request(request)
        margin_rate = response['account']['marginRate']

        order_data = {
            'order': {
                'type': 'MARKET',
                'instrument': instrument,
                'units': str(units),
                'timeInForce': time_in_force,
                'positionFill': position_fill,
                'takeProfitOnFill': {
                    'price': str(take_profit)
                },
                'stopLossOnFill': {
                    'price': str(stop_loss)
                },
                'marginRate': str(margin_rate)  # Embed margin rate in the order
            }
        }

        request = OrderCreate(accountID=account_id, data=order_data)
        response = api.request(request)

        if 'orderCreateTransaction' in response:
            print("Response: {} ({})".format(response['orderCreateTransaction']['type'], response['orderCreateTransaction']['reason']))
        else:
            print("Response: Unknown")

        print("")
    except V20Error as e:
        print("Error: {}".format(str(e)))

#print(create_market_order(instrument='EUR_USD', units=1000, time_in_force='FOK', position_fill='DEFAULT', take_profit=1.2050, stop_loss=1.1950))










def create_market_order_with_trailing_stop_loss(instrument='EUR_USD', units=1000, time_in_force='FOK',
                                                position_fill='DEFAULT', take_profit=1.2050, stop_loss=1.1950,
                                                trailing_stop_loss_distance=0.0050):

    config = get_config()
    api = API(access_token=config['api_key'], environment="practice")

    account_id = config['account_id']

    try:
        # Get margin rate
        request = AccountDetails(accountID=account_id)
        response = api.request(request)
        margin_rate = response['account']['marginRate']

        order_data = {
            'order': {
                'type': 'MARKET',
                'instrument': instrument,
                'units': str(units),
                'timeInForce': time_in_force,
                'positionFill': position_fill,
                'takeProfitOnFill': {
                    'price': str(take_profit)
                },
                'stopLossOnFill': {
                    'price': str(stop_loss)
                },
                'trailingStopLossOnFill': {
                    'distance': str(trailing_stop_loss_distance)
                },
                'marginRate': str(margin_rate)  # Embed margin rate in the order
            }
        }

        request = OrderCreate(accountID=account_id, data=order_data)
        response = api.request(request)

        if 'orderCreateTransaction' in response:
            print("Response: {} ({})".format(response['orderCreateTransaction']['type'], response['orderCreateTransaction']['reason']))
        else:
            print("Response: Unknown")

        print("")
    except V20Error as e:
        print("Error: {}".format(str(e)))

# print(create_market_order_with_trailing_stop_loss(instrument='EUR_USD', units=1000, time_in_force='FOK',
#                                                  position_fill='DEFAULT', take_profit=1.2050, stop_loss=1.1950,
#                                                  trailing_stop_loss_distance=0.0050))








def close_all_positions():
    """
    Close all open positions in an Account.
    """
    config = get_config()
    api = API(access_token=config['api_key'], environment="practice")

    try:
        account_id = config['account_id']

        # Get a list of open positions
        response = api.position.list_open(account_id)
        positions = response.get('positions', [])

        # Close each position
        for position in positions:
            instrument = position['instrument']
            request = PositionClose(accountID=account_id, instrument=instrument)
            response = api.request(request)
            print("Closed position for instrument {}: {} ({})".format(
                instrument, response.status, response.reason
            ))

        print("All positions closed successfully.")
        print("")

    except V20Error as e:
        print("Error: {}".format(str(e)))

close_all_positions()






# def get_all_positions():
#     """
#     Get all open positions in an Account.
#     """
#     config = get_config()
#     api = API(access_token=config['api_key'])
#
#     try:
#         response = api.position.list(config['account_id'])
#         print("Response: {} ({})".format(response.status, response.reason))
#         print("")
#         positions = response.get("positions", [])
#         for position in positions:
#             print(position)
#     except V20Error as e:
#         print("Error: {}".format(str(e)))
#
# def get_last_data_bar(instrument, granularity):
#     """
#     Get the last available data bar for the specified instrument and granularity.
#     """
#     config = get_config()
#     api = API(access_token=config['api_key'])
#
#     params = {
#         'instrument': instrument,
#         'granularity': granularity,
#         'count': 1
#     }
#
#     try:
#         response = api.instrument.candles(config['account_id'], **params)
#         print("Response: {} ({})".format(response.status, response.reason))
#         print("")
#         candles = response.get("candles", [])
#         if candles:
#             print(candles[0])
#     except V20Error as e:
#         print("Error: {}".format(str(e)))
#
# def main():
#     parser = argparse.ArgumentParser()
#
#     parser.add_argument(
#         "command",
#         choices=["create_market_order", "create_market_order_with_trailing_stop_loss", "close_all_positions", "get_all_positions", "get_last_data_bar"],
#         help="The command to execute."
#     )
#
#     parser.add_argument(
#         "--instrument",
#         help="The instrument for the order or data bar."
#     )
#
#     parser.add_argument(
#         "--units",
#         type=int,
#         help="The number of units to buy or sell."
#     )
#
#     parser.add_argument(
#         "--time_in_force",
#         choices=["FOK", "IOC", "GTD", "GFD", "GTC"],
#         help="The time-in-force for the order."
#     )
#
#     parser.add_argument(
#         "--price_bound",
#         type=float,
#         help="The price bound for the order."
#     )
#
#     parser.add_argument(
#         "--position_fill",
#         choices=["DEFAULT", "REDUCE_ONLY"],
#         help="The position fill option for the order."
#     )
#
#     parser.add_argument(
#         "--take_profit",
#         type=float,
#         help="The take profit price for the order."
#     )
#
#     parser.add_argument(
#         "--stop_loss",
#         type=float,
#         help="The stop loss price for the order."
#     )
#
#     parser.add_argument(
#         "--trade_id",
#         help="The ID of the trade for the trailing stop loss order."
#     )
#
#     parser.add_argument(
#         "--distance",
#         type=float,
#         help="The distance for the trailing stop loss order."
#     )
#
#     parser.add_argument(
#         "--client_extensions",
#         help="The client extensions for the trailing stop loss order."
#     )
#
#     parser.add_argument(
#         "--granularity",
#         choices=["M1", "M5", "M15", "M30", "H1", "H4", "D", "W", "M"],
#         help="The granularity of the data bar."
#     )
#
#     args = parser.parse_args()
#
#     if args.command == "create_market_order":
#         create_market_order(args.instrument, args.units, args.time_in_force, args.price_bound, args.position_fill, args.take_profit, args.stop_loss)
#     elif args.command == "create_market_order_with_trailing_stop_loss":
#         create_market_order_with_trailing_stop_loss(args.trade_id, args.distance, args.time_in_force, args.client_extensions)
#     elif args.command == "close_all_positions":
#         close_all_positions()
#     elif args.command == "get_all_positions":
#         get_all_positions()
#     elif args.command == "get_last_data_bar":
#         get_last_data_bar(args.instrument, args.granularity)
#
# if __name__ == "__main__":
#     main()




#print(create_market_order(instrument='EUR_USD',units=1000, time_in_force= 'FOK' , position_fill='DEFAULT' ,take_profit=1.2050, stop_loss=1.1950 ))