# from selenium import webdriver
import datetime
from pathlib import Path
import random
import re
from seleniumwire import webdriver
import seleniumwire.undetected_chromedriver as uc

from selenium.webdriver import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

from selenium.common.exceptions import TimeoutException

import time
import json
import traceback, sys

from queue import Queue

import pandas as pd

class HkuChatGPT:
    def __init__(self, my_email:str, my_pw:str, input_queue:Queue, output_queue:Queue):
        '''Create an HKU ChatGPT instance.
        
        params:
        my_email: email to login to the HKU ChatGPT service
        my_pw: password to login to the HKU ChatGPT service
        input_queue: currently has no use. Pass None.
        output_queue: result of the HKU ChatGPT will be put there. Use output_queu.get() to wait for a result.
        '''
        self.my_email = my_email
        self.my_pw = my_pw


        # queue for interceptors to process data and store results
        # self.input_queue = input_queue
        self.output_queue = output_queue

        # local variables

        self.current_balance = -1

        self.local_processing_query_index = -1
        self.chatgpt_messages_obj = []
        self.processing_input_obj = None
        self.processing_output_obj = None

        # selenium wire related options
        self.seleniumwire_options = {
            'enable_har': True
        }

        self.JS_ADD_TEXT_TO_INPUT = """
        var elm = arguments[0], txt = arguments[1];
        elm.value += txt;
        elm.dispatchEvent(new Event('change'));
        """

    # --------------------
    # INTERCEPTOR
    # --------------------

    # we check a specific post request after clicking the send_gpt_btn

    # check specific POST requests
    # one is hku-chatgpt message sending
    # another is get current token balance

    # the POST request URL for chating with GPT looks like this: 'https://api.hku.hk/azure-openai-aad-api/deployments/chatgpt/chat/completions?api-version=2023-07-01-preview'

    def gpt_request_interceptor(self, request):
        '''Registered interceptor function to intercept requests.

        params:
        request: request object from selenium
        '''
        # print(request.body)
        if request.method == 'POST' and request.host == 'api.hku.hk':

            # contentType = request.headers['content-type']
            # print(contentType)            # "application/json"

            try:
                body = request.body.decode('utf-8')
                # check if the body is an empty string
                if not body: return

                data = json.loads(body)
                
            except Exception as ex:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                print("An error occured in decoding the body of request with host = api.hku.hk")
                print(traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stdout))
                return

            # classify either hku-chatgpt message sending or get current token balance
            # we only intercept hku-chatgpt message sending request
            # as hku-chatgpt balance data will be in the request.response.body of this request: POST https://api.hku.hk/func-openai-balance/CurrentBalance
            if "model" in data:
                # print(request.headers)
                # print('\n\n')
                # print('intercepted original json data:', data)

                # NOTICE: the request modifying function
                new_data = self.modify_gpt_request(data)
                print('intercepted new json data:', new_data)

                # replace the body with new json :D
                request.body = json.dumps(new_data).encode('utf-8')

                # reset the content-length of the request
                del request.headers['Content-Length']
                request.headers['Content-Length'] = str(len(request.body))                
            else:
                return


    # Modify the request !!
    # like what the official api do
    def modify_gpt_request(self, json_data):
        '''Change the body of the json request sent by chatgpt.hku.hk
        
        Don't change the model to gpt4. There is a separate API call by HKU from their source script. We surmise that there is a checking mechanism on their api.hku.hk server.

        Guess that we can add parameters according to the azure API (look for the Completions section)
        
        https://learn.microsoft.com/en-us/azure/ai-services/openai/reference#completions

        params:
        json_data: intercepted json data to be sent to chatgpt (identical to chatgpt offical api sample)

        json_data input sample:

        {
            "model": "gpt-35-turbo",
            "messages": [
                {
                "role": "system",
                "content": "You are an AI assistant that helps people find information."
                },
                {
                "role": "user",
                "content": "Can you explain quantum computing shor algorithm to an university student majoring computer science. Keep it concise."
                }
            ],
            "max_tokens": 800,
            "temperature": 0.7,
            "top_p": 0.95
        }
        '''
        # "content": "You are a game enthusiast, who analyzes reaction of a game from the gaming community."

        # change the message attribute
        json_data['messages'] = self.chatgpt_messages_obj
        
        # change the temperature to 0 for more stable response
        json_data['temperature'] = 0

        # set the top_p parameter as default (as previous studies do not include info abt this, assume as default)
        json_data['top_p'] = 1

        # remove max_tokens
        # del json_data['max_tokens']

        json_data['max_tokens'] = 500

        return json_data



    # check for response after specific POST requests
    # one is hku-chatgpt message sending
    # another is get current token balance
    def gpt_response_interceptor(self, request, response):
        '''Registered interceptor to intercept response from server.
        '''
        if request.method == 'POST' and request.host == 'api.hku.hk':
            try:
                body = request.response.body.decode('utf-8')
                # check if the body is an empty string
                if not body: return

                response_body_json = json.loads(body)            # string -> json
            except Exception as ex:
                exc_type, exc_value, exc_traceback = sys.exc_info()
                print("An error occured in decoding the body of request with host = api.hku.hk")
                print(traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stdout))
                return
            
            # Success (statuscode = 200)
            if request.response.status_code == 200:
                if "model" in response_body_json:
                    request_body = request.body.decode('utf-8')
                    request_json = json.loads(request_body)

                    # response_body = response.body.decode('utf-8')
                    # response_json = json.loads(response_body)
                    print('\n\n')
                    print("gpt_response_interceptor response_json:", response_body_json)

                    self.chatgpt_response_handler(request_json, response_body_json)


                # elif "balance" in response.body json:
                elif "balance" in response_body_json:
                    # Get current token balance
                    self.chatgpt_balance_handler(response_body_json)
                    
                else:
                    return
            
            # handle statuscode = 429 (Too many request error)
            elif request.response.status_code == 429:
                request_body = request.body.decode('utf-8')
                request_json = json.loads(request_body)
                # jump back to main thread to     
                # resend the message again to resume operation.
                self.output_queue.put(
                    {
                        'index': self.local_processing_query_index,
                        'status_code': -request.response.status_code,
                        'request_json': request_json,
                        'chatgpt_response_msg': response_body_json['message'],
                        'total_tokens_used': 0
                    }
                )

                # self.run(self.processing_input_obj)
            
            # handle other statuscode , e.g. 400 (model error, the prompt violates the content policy)
            # other possible from the source are: 403, 404, 500 (chatGPT is busy. Please resend the query), 401 (Timeout. Please login again).
            # just skip them first...
            else:
                request_body = request.body.decode('utf-8')
                request_json = json.loads(request_body)
                # jump back to main thread to handle error                
                self.output_queue.put(
                    {
                        'index': self.local_processing_query_index,
                        'status_code': -request.response.status_code,
                        'request_json': request_json,
                        'chatgpt_response_msg': response_body_json,
                        'total_tokens_used': 0
                    }
                )
                
                                

    def chatgpt_response_handler(self, request_json, response_json) -> int:
        '''Get the response from chatgpt api, and the total tokens used by the message.
        '''
        # print(response_json)
        # get the body of the POST request, which stores the response from chatgpt api.

        chatgpt_response_msg = response_json["choices"][0]["message"]["content"]
        total_tokens_used = int(response_json["usage"]["total_tokens"])

        # that's the message we want to keep
        print(chatgpt_response_msg)
        print("Total token used:", total_tokens_used)


        # formulate the output object
        self.processing_output_obj = {
            'index': self.local_processing_query_index,
            'status_code': 200,
            'request_json': request_json,
            'chatgpt_response_msg': chatgpt_response_msg,
            'total_tokens_used': total_tokens_used
        }

        # transfer back to the queue
        self.output_queue.put(self.processing_output_obj)
    

    def chatgpt_balance_handler(self, response_json):
        curr_balance = int(response_json['balance'])
        print('Current balance:', curr_balance)

        self.set_current_balance(curr_balance)


    def set_current_balance(self, curr_balance):
        self.current_balance = curr_balance

    def get_current_balance(self):
        return self.current_balance


    # --------------------
    # INTERCEPTOR ENDS
    # --------------------


    def start(self):
        '''Start the browser and handle login. Load the ChatGPT prompt page at last.
        '''
        self.load_webpage()

        time.sleep(2)

        self.login()


        # get the input line
        self.input_line = self.driver.find_element(By.XPATH, "//*[@id=\"root\"]/div/div[2]/div/div[3]/div[1]/div[2]/textarea[1]")

        # get the send GPT-3.5 button
        self.send_gpt_btn = self.driver.find_element(By.XPATH, "/html/body/div/div/div[2]/div/div[3]/div[2]/div[2]/div")

        # wait for the balance feedback
        # it gives the initial balance value (handled in chatgpt_balance_handler(), triggered by response interceptor)
        request_balance = self.driver.wait_for_request('https://api.hku.hk/func-openai-balance/CurrentBalance')


    def run(self, chatgpt_input):
        '''Process the input, ask chatgpt, and acquire the response and the remaining token
        
        Input is an object with an id/index of the message, and the user-input query itself.
        '''

        # wait for the initial balance request after log-in

        self.processing_input_obj = chatgpt_input

        self.input_handler()

        
        self.send_request()

        time.sleep(1)

        # then it shall wait for interceptor to handle
        # during that time, a few local variables will be updated
        # self.query_processing_complete.wait()
        # self.balance_processing_complete.wait()


        # then it will call the interceptor automatically
        # which will get an object from the input_queue, and form a chatgpt api request

        request_chatgpt = self.driver.wait_for_request('https://api.hku.hk/azure-openai-aad-api/deployments/chatgpt/chat/completions')      # chatgpt 3.5 version link. A different link is used for chatgpt4


        request_balance = self.driver.wait_for_request('https://api.hku.hk/func-openai-balance/CurrentBalance')


    def input_handler(self):
        '''Grab the input from the queue and write to local variables'''
        self.local_processing_query_index = self.processing_input_obj['index']
        self.chatgpt_messages_obj = self.processing_input_obj['messages']

        print('\n\n\n')
        print('handling input...')
        print("input id:", self.local_processing_query_index)
        print('chatgpt_messages_obj:', self.chatgpt_messages_obj)

    def _deEmojify(self, x):
        regrex_pattern = re.compile(pattern = "["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                            "]+", flags = re.UNICODE)
        return regrex_pattern.sub(r'', x)

    def send_request(self):
        '''press the "Send GPT-3.5" button to send a request to the hku server
        '''
        # actually the input here does not matter, as it will be intercepted by Selenium
        # we just need to fill-in sth to activate the "Send" button right next to it to click
        # then we can use the web-interface as our makeshift UI :D 

        # self.input_line.send_keys("Processing...")
        
        # show our input
        # remove any emoji in the display as the text box does not allow that.
        # but we keep the emojis in the request message.
        self.input_line.send_keys(self._deEmojify(
            str(self.processing_input_obj))
        )

        # trigger the button and read the request, repeat the process
        self.send_gpt_btn.click()



    def load_webpage(self):
        '''Launch the hku chatgpt webpage'''
        # driver = webdriver.Firefox(seleniumwire_options=seleniumwire_options)
        # driver = webdriver.Chrome(seleniumwire_options=seleniumwire_options)

        # bot-detection bypassed browser
        chrome_options = uc.ChromeOptions()
        self.driver = uc.Chrome(
            options=chrome_options,
            seleniumwire_options=self.seleniumwire_options
        )

        # load interceptor
        # put your own function
        self.driver.request_interceptor = self.gpt_request_interceptor
        self.driver.response_interceptor = self.gpt_response_interceptor

        # load the hkuchatgpt website (shd load a signin page)
        # trust the ceretificate by seleniumwire
        # under the site-packages/seleniumwire/ca.crt -> select always trust
        self.driver.get("https://chatgpt.hku.hk/")

       
    def login(self):
        '''login to the hku chatgpt service'''
        # click the button (find element by xpath)
        # can change to find by type (only one button)
        login_btn = self.driver.find_element(By.XPATH, "/html/body/div/div/div[2]/div/div/div[2]/div/button")
        login_btn.click()

        # this requires stable WIFI/LAN network
        time.sleep(3)

        # wait to load a separate login page
        curr_window = self.driver.current_window_handle

        child_windows = self.driver.window_handles
        # print("no. of windows =", len(child_windows))

        for w in child_windows:
            if (w != curr_window):
                self.driver.switch_to.window(w)
                break

        # now we are in the microsoft login window
        # get both textbox for email and pw, input them
        email_input = self.driver.find_element(By.CLASS_NAME, "input")
        email_input.send_keys(self.my_email)

        # click next button
        next_btn = self.driver.find_element(By.CLASS_NAME, "button_primary")
        next_btn.click()

        # wait for loading to HKU login page
        time.sleep(5)

        # find textfield for inputing password, input that
        pw_input = self.driver.find_element(By.ID, "passwordInput")
        pw_input.send_keys(self.my_pw)

        # click the login button
        hku_login_btn = self.driver.find_element(By.ID, "submitButton")
        hku_login_btn.click()

        time.sleep(2)

        # show a page abt stay signin -> click "no"
        stay_sign_no_btn = self.driver.find_element(By.ID, "idBtn_Back")
        stay_sign_no_btn.click()

        # wait to load the chatgpt page (at the chatgpt window)
        time.sleep(2)

        # switch to the main-page

        # spin-wait
        while (len(self.driver.window_handles) > 1):
            time.sleep(1)

        child_windows = self.driver.window_handles
        # print("no. of windows =", len(child_windows))

        # switch back to the chatgpt window
        self.driver.switch_to.window(self.driver.window_handles[0])

        time.sleep(1)


    def alert_handler(self):
        '''Handling rate limit alert of the browser'''
        try:
            WebDriverWait(self.driver, 10).until(EC.alert_is_present(), 'Timed out waiting for rate limit alert to appear')
            alert = self.driver.switch_to.alert
            alert.accept()
            print("alert accepted.")

        except TimeoutException as ex:
            exc_type, exc_value, exc_traceback = sys.exc_info()

            print("Timeout exception is thrown. No rate limit alert box. Program continues.")
            print(traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stdout))
            return
            
        except Exception as e:
            exc_type, exc_value, exc_traceback = sys.exc_info()
            
            print("Other exceptions beside TimeoutException occur. Program continues.")
            print(traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stdout))
            return
            

def main(my_email:str, my_pw:str):
    '''Test driver.
    '''
    input_queue = Queue()
    output_queue = Queue()

    # app_name, review_text
    input_prompt = ["Tomb Raider", """This game is really awesome! Great story, the gameplay is really entertaining and it's really hard to stop playing it when you're in to it! 9/10"""]
    input_prompt_1 = ["Grand Theft Auto IV: The Complete Edition", """This game is AWESOME !"""]
    input_prompt_2 = ["Grand Theft Auto IV: The Complete Edition", """i cant even play it i just wasted 20 bucks"""]
    input_prompt_3 = ["Torchlight II", """good game. but im not buying when its full price."""]
    input_prompt_4 = ["Hitman: Absolution", """Goood Game ,but hard"""]
    input_prompt_5 = ["Tomb Raider", """This game, representative of the simple idea of what an adventure really means, portrayed it in such a fun and captivating way. The perfect combination of combat, adventure, puzzles, and flexibility all evoked my faintest memories of the classical Tomb Raider survival but integrated it with the ideas that modern day games like Uncharted have. If you're looking to know what it truly means to be a survivor, then Tomb Raider is the perfect way to glimpse that breathtaking world through her eyes."""]
    input_prompt_6 = ["Batman™: Arkham Knight", """The Best in the series. It runs flawless. Yes there's no multi GPU support but it was running smooth on my system. 5960-x / 980 ti SLi. I dedicated one GPU to physx and it was just constant 60 FPS. only when there's dynamic smoke it gets a hit. I played the game for 60 hours, not a single crash, I got this on sale for 10$. Best 10$ bucks I spent. Highly recommended, keep an eye on it. GET IT in the next sale. Forget about people whining about crashing. it didn't for me."""]
    input_prompt_7 = ["Drunken Robot Pornography", """Title's misleading. Still worth playing. 7/10"""]
    input_prompt_8 = ["Call of Duty: Ghosts", """You have 108 reason to buy this,but you have 0 reason to skipped this."""]
    input_prompt_9 = ["Hero Academy", """No one plays :("""]


    df = pd.DataFrame(
        [input_prompt, input_prompt_1, input_prompt_2, input_prompt_3, input_prompt_4, input_prompt_5, input_prompt_6, input_prompt_7, input_prompt_8, input_prompt_9],
        columns=['app_name', 'review_text']
    )
    # df = pd.DataFrame(
    #     [input_prompt_1],
    #     columns=['app_name', 'review_text']
    # )
    # create a new column for chatgpt response
    df['response'] = ""
    df['total_token_used'] = -1

    print(df.head())

    sentiment = ['positive', 'neutral', 'negative']

    for index, row in df.iterrows():
        input_queue.put(
            {
                "index":index,      # for tracking and putting result to dataframe
                "messages": [       # = chatgpt 'messages' object
                    {
                        "role": "system",
                        "content": f"""You are the producer of the game called {row['app_name']}, who is analyzing the comments from players to find out how the players feel towards your game."""
                    },
                    {
                        "role": "user",
                        # "content": f"""Determine from {sentiment}: probabilities. Format: [Sentiment: Probabilities for each sentiment]. Alternatively , state "NA". Do not output other things except the Format. ‘‘‘{row['review_text']}‘‘‘"""
                        "content": f"""Determine from {sentiment}: probabilities. Provide them in JSON format with the following keys: positive, neutral, negative. Alternatively , state "NA". Do not output other things except the format. ‘‘‘{row['review_text']}‘‘‘"""
                    }
                ]
            }
        )

    input_queue.put(        
        {
            "index": -1,
            "messages": []
        }           # End Of Processing symbol
    )

    # single thread is enough
    # create an object for handling HKU ChatGPT
    chatgpt = HkuChatGPT(my_email, my_pw, input_queue, output_queue)

    # launch a browser and do all the login
    chatgpt.start()

    requests_per_minute = 6
    ONE_MINUTE = 62             # purposely add some buffer preventing triggering rate limit
    remaining_sec_per_minute = ONE_MINUTE
    sleep_interval = [3, 12]

    BALANCE_LIMIT = 400000

    while(True):
        chatgpt_input = input_queue.get()       # block the operation if nth is in the queue (multi-threading design)

        if chatgpt_input == None:
            print('Input queue is empty. The thread ends.')
            break

        if chatgpt_input['index'] == -1:
            print('--------------------')
            print('End of Processing.')
            print('--------------------')
            break

        if chatgpt.get_current_balance() < BALANCE_LIMIT:
            print(f"HKU ChatGPT balance: {chatgpt.get_current_balance()} , is lower than pre-defined limit: {BALANCE_LIMIT}.")
            print("The program terminates itself.")
            break

        chatgpt.run(chatgpt_input)

        while (True):
            # wait for output from chatgpt
            chatgpt_response = output_queue.get()

            chatgpt_response_index = chatgpt_response['index']

            # not using as -1 -> end of processing
            # 429 = statuscode for too many request
            if chatgpt_response_index == -429:
                # msg example:
                # "Rate limit is exceeded. Try again in 7 seconds."
                chatgpt_response_msg = chatgpt_response['chatgpt_response_msg']
                
                no_of_sec_to_sleep = float(re.search("([0-9]+)", chatgpt_response_msg)[1])

                # sleep for 1 sec to wait for the alert popped up.
                time.sleep(1)

                chatgpt.alert_handler()

                time.sleep(no_of_sec_to_sleep)

                chatgpt.run(chatgpt_input)      # re-run after handling rate limit alert.

            elif chatgpt_response_index >= 0:
                break

        if chatgpt_response == None:
            break

        chatgpt_response_index = chatgpt_response['index']
        chatgpt_response_msg = chatgpt_response['chatgpt_response_msg']
        total_token_used = chatgpt_response['total_tokens_used']

        print('\n\n')
        print('HKU ChatGPT response:')
        print(chatgpt_response)

        # update dataframe
        df.at[chatgpt_response_index, 'response'] = chatgpt_response_msg
        df.at[chatgpt_response_index, 'total_token_used'] = total_token_used


        # sleep for random seconds to prevent hitting the rate limit
        if ((chatgpt_input['index'] + 1) % requests_per_minute == 0):
            sleep_duration = remaining_sec_per_minute
        else:
            sleep_duration = random.randint(min(sleep_interval), max(sleep_interval))

        print('Sleep duration:', sleep_duration)

        time.sleep(sleep_duration)
        remaining_sec_per_minute -= sleep_duration
        
        if ((chatgpt_input['index'] + 1) % requests_per_minute == 0):
            remaining_sec_per_minute = ONE_MINUTE

        # if chatgpt_input['index'] == 8:
        #     # df.to_csv('test_run_20-09-2023.csv', index_label='index')
        #     df.to_pickle(f'test_run_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.pkl')
        #     print('File Saved in while loop.')

    print(df.head())
    # df.to_csv('test_run_20-09-2023.csv', index_label='index')
    save_file_path = Path(f'test_run_{datetime.datetime.now().strftime("%Y%m%d_%H%M%S")}.pkl')
    df.to_pickle(save_file_path)
    print(f'Successfully saved result to: {save_file_path.resolve()}')

if __name__ == '__main__':
    secret_json_path = Path("secret.json").resolve()
    secret_json = json.load(open(secret_json_path))

    my_email, my_pw = secret_json['my_email'], secret_json["my_pw"]

    main(my_email, my_pw)

    time.sleep(1)

    print('program terminates.')