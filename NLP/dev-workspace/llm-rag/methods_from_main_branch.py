import json


def _parsing_json_single(resp:str, aspects_response:dict, aspects:list):

    # gets the first '{' and last '}'
    first_brace = resp.find('{')
    last_brace = resp.rfind('}')

    resp_sub = resp[first_brace:] if last_brace == -1 else resp[first_brace:last_brace+1]

    try:
        resp_sub_json = json.loads(resp_sub)
        aspects_response.update(resp_sub_json)

    except:
        print(f'sub response: \'\'\'{resp_sub}\'\'\' is not a JSON. Resort to manual parse...')


    for i, aspect in enumerate(aspects):
        if ((f'\"{aspect}\"' not in resp_sub) and (f'\'{aspect}\'' not in resp_sub)):
            print(f'aspect: {aspect} not in resp_sub. Retry...')
            continue

        # manually get the JSON object by finding each aspect in the response
        # have to consider both single and double quotes
        # as mistral AI sometimes uses single quotes and sometimes double quotes
        # consider both single and double quotes, as mistral AI sometimes uses single quotes and sometimes double quotes
        resp_start = max(resp_sub.find(f'\"{aspect}\"'), resp_sub.find(f'\'{aspect}\'')) + len(f'\"{aspect}\"')
        value_start = max(resp_sub.find('\"', resp_start + 1), resp_sub.find('\'', resp_start + 1))
        value_end = max(resp_sub.find('\"', value_start + 1), resp_sub.find('\'', value_start + 1))

        # only update the value if it is empty (i.e. accept only first update for each aspect)
        if aspects_response[aspect] == '':
            aspects_response[aspect] = resp_sub[value_start + 1:value_end]
        

def _parsing_json_multiple(resp:str, open_brace_count:int, aspects_response:dict, aspects:list):

    prev_open_brace = -1
    prev_close_brace = -1

    for i in range(open_brace_count):
        # get the ith open brace and the immediate next close brace
        open_brace = resp.find('{' , prev_open_brace + 1)
        close_brace = resp.find('}', prev_close_brace + 1)

        # try to get the JSON object
        resp_sub = resp[open_brace:close_brace+1]

        try:
            resp_sub_json = json.loads(resp_sub)

            aspects_response.update(resp_sub_json)          # dict is inplace update
            

            # update the prev_open_brace and prev_close_brace ptrs if successful
            prev_open_brace = open_brace
            prev_close_brace = close_brace

            continue
        except:
            print(f'sub response: \'\'\'{resp_sub}\'\'\' is not a JSON. Resort to manual parse...')

        # manually get the JSON object by finding each aspect in the response
        for i, aspect in enumerate(aspects):
            if ((f'\"{aspect}\"' not in resp_sub) and (f'\'{aspect}\'' not in resp_sub)):
                print(f'aspect: {aspect} not in resp_sub. Skipping...')
                continue

            # manually get the JSON object by finding each aspect in the response
            # have to consider both single and double quotes
            # as mistral AI sometimes uses single quotes and sometimes double quotes
            # consider both single and double quotes, as mistral AI sometimes uses single quotes and sometimes double quotes
            resp_start = max(resp_sub.find(f'\"{aspect}\"'), resp_sub.find(f'\'{aspect}\'')) + len(f'\"{aspect}\"')
            value_start = max(resp_sub.find('\"', resp_start + 1), resp_sub.find('\'', resp_start + 1))
            value_end = max(resp_sub.find('\"', value_start + 1), resp_sub.find('\'', value_start + 1))

            if aspects_response[aspect] == '':
                aspects_response[aspect] = resp_sub[value_start + 1:value_end]

        # update the prev_open_brace and prev_close_brace ptrs
        prev_open_brace = open_brace
        prev_close_brace = close_brace