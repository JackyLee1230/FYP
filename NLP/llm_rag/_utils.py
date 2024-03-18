from datetime import datetime

def _print_message(message):
    '''Print message with a timestamp in front of it

    Timestamp format: YYYY-MM-DD HH:MM:SS,mmm
    '''
    print(f'{datetime.now().strftime("%Y-%m-%d %H:%M:%S,%f")[:-3]} - {message}')