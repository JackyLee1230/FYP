from datetime import datetime
import os
import time
from typing import Iterable
import requests
import json
import re

import pickle
from pathlib import Path
from collections import deque

import scrapy
from scrapy.exceptions import DontCloseSpider
from scrapy.spiders import CrawlSpider

import traceback

from scrapy.http import Request


class SteamSpider(CrawlSpider):

    # name to start our scraper from console line
    name = 'steam_apps'
    
    

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)

        self.apps_dict = {}
        self.excluded_apps_list = []
        self.error_apps_list = []

        self.item_count = 0

        self.apps_dict_filename_prefix = 'apps_dict'
        self.exc_apps_filename_prefix = 'excluded_apps_list'
        self.error_apps_filename_prefix = 'error_apps_list'
        
        # path = project directory (i.e. steam_data_scraping)/checkpoints
        self.checkpoint_folder = Path('checkpoints').resolve()

        print('Checkpoint folder:', self.checkpoint_folder)

        if not self.checkpoint_folder.exists():
            print(f'Fail to find checkpoint folder: {self.checkpoint_folder}')
            print(f'Start at blank.')
            return

        latest_apps_dict_ckpt_path, latest_exc_apps_list_ckpt_path, latest_error_apps_list_ckpt_path = self.check_latest_checkpoints()

        if latest_apps_dict_ckpt_path:
            self.apps_dict = self.load_pickle(latest_apps_dict_ckpt_path)
            print('Successfully load apps_dict checkpoint:', latest_apps_dict_ckpt_path)
            print(f'Number of apps in apps_dict: {len(self.apps_dict)}')
        
        if latest_exc_apps_list_ckpt_path:
            self.excluded_apps_list = self.load_pickle(latest_exc_apps_list_ckpt_path)
            print("Successfully load excluded_apps_list checkpoint:", latest_exc_apps_list_ckpt_path)
            print(f'Number of apps in excluded_apps_list: {len(self.excluded_apps_list)}')

        if latest_error_apps_list_ckpt_path:
            self.error_apps_list = self.load_pickle(latest_error_apps_list_ckpt_path)
            print("Successfully load error_apps_list checkpoint:", latest_error_apps_list_ckpt_path)
            print(f'Number of apps in error_apps_list: {len(self.error_apps_list)}')


    @classmethod
    def from_crawler(cls, crawler, *args, **kwargs):
        spider = super(SteamSpider, cls).from_crawler(crawler, *args, **kwargs)
        crawler.signals.connect(spider.on_closed, signal=scrapy.signals.spider_closed)
        return spider

    def start_requests(self) -> Iterable[Request]:

        all_app_ids = self.get_all_app_id()

        # remove app_ids that already scrapped or excluded or error
        all_app_ids = set(all_app_ids) \
                - set(map(int, set(self.apps_dict.keys()))) \
                - set(map(int, self.excluded_apps_list)) \
                - set(map(int, self.error_apps_list))
        
        self.app_ids_queue = deque(all_app_ids)

        print(f'Total number of remaining apps: {len(self.app_ids_queue)}')
        
        # form request
        while len(self.app_ids_queue) > 0:
            appid = self.app_ids_queue.popleft()

            request_url = f"https://store.steampowered.com/api/appdetails?appids={appid}"
        
            yield scrapy.Request(url=request_url, method='GET', callback=self.parse)

        return super().start_requests()
    
    def parse(self, response):
        self.item_count += 1

        appid = re.search('appids=([0-9]*)', response.url)[1]

        if response.status == 200:
            # further processing
            self.process_appdetails(response, appid)

        elif response.status == 429:
            print(f'Too many requests. Readd the App ID {appid} to queue.')
            self.app_ids_queue.append(appid)

        elif response.status == 403:
            print(f'Forbidden to access. Readd the App ID {appid} to queue.')
            # save_checkpoints(apps_dict, excluded_apps_ids, filename_prefix, excluded_apps_ids_filename_prefix)
            self.app_ids_queue.append(appid)

        else:
            print(f"Error in App Id: {appid}. Fail to optain the game's info. Add the app to error app list.")

            self.error_apps_list.append(appid)

        # save for every N requests
        if (self.item_count > 2000):
            self.save_checkpoints()

            self.item_count = 0


    def process_appdetails(self, response, appid):
        try:
            response_json = response.json()
            response_json = response_json[str(appid)]

        except Exception:
            print('Fail to parse the data to json.')
            response_json = {'success':False}

        if response_json['success'] == False:
            print(f'No successful response. Add App ID: {appid} to excluded apps list')

            # add to excluded list
            self.excluded_apps_list.append(appid)

            return
        
        app_data = response_json['data']

        self.apps_dict[str(appid)] = app_data


    def on_idle(self):
        print("on_idle is called.")
        self.save_checkpoints()
        print('Checkpoints saved.')

        raise DontCloseSpider()


    def on_closed(self, reason):
        print("SELF CLOSED is called.")
        print(reason)


    def get_all_app_id(self):
        # get all app id
        req = requests.get("https://api.steampowered.com/ISteamApps/GetAppList/v2/")

        if (req.status_code != 200):
            print("Failed to get all games on steam.")
            return
        
        try:
            data = req.json()
        except Exception as e:
            traceback.print_exc(limit=5)
            return {}
        
        apps_data = data['applist']['apps']

        apps_ids = []

        for app in apps_data:
            appid = app['appid']
            name = app['name']
            
            # skip apps that have empty name
            if not name:
                continue

            apps_ids.append(appid)

        return apps_ids
    

    def save_checkpoints(self):

        save_time = datetime.now()

        save_path = self.checkpoint_folder.joinpath(
            self.apps_dict_filename_prefix + f'-ckpt-{save_time.strftime("%Y%m%d%H%M%S")}.p'
        ).resolve()

        if not save_path.parent.exists():
            save_path.parent.mkdir(parents=True)

        save_path2 = self.checkpoint_folder.joinpath(
            self.exc_apps_filename_prefix + f'-ckpt-{save_time.strftime("%Y%m%d%H%M%S")}.p'
        ).resolve()
        
        save_path3 = self.checkpoint_folder.joinpath(
            self.error_apps_filename_prefix + f'-ckpt-{save_time.strftime("%Y%m%d%H%M%S")}.p'
        ).resolve()

        self.save_pickle(save_path, self.apps_dict)
        print(f'Successfully create app_dict checkpoint: {save_path}')

        self.save_pickle(save_path2, self.excluded_apps_list)
        print(f"Successfully create excluded apps checkpoint: {save_path2}")

        self.save_pickle(save_path3, self.error_apps_list)
        print(f"Successfully create error apps checkpoint: {save_path3}")

        print()


    def load_pickle(self, path_to_load:Path) -> dict:
        obj = pickle.load(open(path_to_load, "rb"))
        # print(f'Successfully loaded {str(path_to_load)}')
        
        return obj
    
    def save_pickle(self, path_to_save:Path, obj):
        with open(path_to_save, 'wb') as handle:
            pickle.dump(obj, handle, protocol=pickle.HIGHEST_PROTOCOL)

    def check_latest_checkpoints(self):
        # app_dict
        all_pkl = []
        
        for root, dirs, files in os.walk(self.checkpoint_folder):
            all_pkl = list(map(lambda f: Path(root, f), files))
            all_pkl = [p for p in all_pkl if p.suffix == '.p']
            break
              
        apps_dict_ckpt_files = [f for f in all_pkl if self.apps_dict_filename_prefix in f.name and "ckpt" in f.name]
        exc_apps_list_ckpt_files = [f for f in all_pkl if self.exc_apps_filename_prefix in f.name and "ckpt" in f.name]
        error_apps_ckpt_files = [f for f in all_pkl if self.error_apps_filename_prefix in f.name and 'ckpt' in f.name]

        apps_dict_ckpt_files.sort()
        exc_apps_list_ckpt_files.sort()
        error_apps_ckpt_files.sort()

        latest_apps_dict_ckpt_path = apps_dict_ckpt_files[-1] if apps_dict_ckpt_files else None
        latest_exc_apps_list_ckpt_path = exc_apps_list_ckpt_files[-1] if exc_apps_list_ckpt_files else None
        latest_error_apps_list_ckpt_path = error_apps_ckpt_files[-1] if error_apps_ckpt_files else None

        return latest_apps_dict_ckpt_path, latest_exc_apps_list_ckpt_path, latest_error_apps_list_ckpt_path