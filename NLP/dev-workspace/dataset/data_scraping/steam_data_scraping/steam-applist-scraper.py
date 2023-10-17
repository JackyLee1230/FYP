from collections import deque
from datetime import datetime
import os
import time
import requests
import json

import pickle
from pathlib import Path

import traceback

def get_all_app_id():
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



def save_checkpoints(checkpoint_folder, apps_dict_filename_prefix, exc_apps_filename_prefix, error_apps_filename_prefix, apps_dict, excluded_apps_list, error_apps_list):
    save_time = datetime.now()

    # save_path = checkpoint_folder.joinpath(
    #     apps_dict_filename_prefix + f'-ckpt-{save_time.strftime("%Y%m%d%H%M%S")}.p'
    # ).resolve()

    save_path = checkpoint_folder.joinpath(
        apps_dict_filename_prefix + f'-ckpt-fin.p'
    ).resolve()

    if not save_path.parent.exists():
        save_path.parent.mkdir(parents=True)

    # save_path2 = checkpoint_folder.joinpath(
    #     exc_apps_filename_prefix + f'-ckpt-{save_time.strftime("%Y%m%d%H%M%S")}.p'
    # ).resolve()
    
    # save_path3 = checkpoint_folder.joinpath(
    #     error_apps_filename_prefix + f'-ckpt-{save_time.strftime("%Y%m%d%H%M%S")}.p'
    # ).resolve()

    save_path2 = checkpoint_folder.joinpath(
        exc_apps_filename_prefix + f'-ckpt-fin.p'
    ).resolve()
    
    save_path3 = checkpoint_folder.joinpath(
        error_apps_filename_prefix + f'-ckpt-fin.p'
    ).resolve()

    save_pickle(save_path, apps_dict)
    print(f'Successfully create app_dict checkpoint: {save_path}')

    save_pickle(save_path2, excluded_apps_list)
    print(f"Successfully create excluded apps checkpoint: {save_path2}")

    save_pickle(save_path3, error_apps_list)
    print(f"Successfully create error apps checkpoint: {save_path3}")

    print()


def load_pickle(path_to_load:Path) -> dict:
    obj = pickle.load(open(path_to_load, "rb"))
    # print(f'Successfully loaded {str(path_to_load)}')
    
    return obj

def save_pickle(path_to_save:Path, obj):
    with open(path_to_save, 'wb') as handle:
        pickle.dump(obj, handle, protocol=pickle.HIGHEST_PROTOCOL)

def check_latest_checkpoints(checkpoint_folder, apps_dict_filename_prefix, exc_apps_filename_prefix, error_apps_filename_prefix):
    # app_dict
    all_pkl = []
    
    for root, dirs, files in os.walk(checkpoint_folder):
        all_pkl = list(map(lambda f: Path(root, f), files))
        all_pkl = [p for p in all_pkl if p.suffix == '.p']
        break
            
    apps_dict_ckpt_files = [f for f in all_pkl if apps_dict_filename_prefix in f.name and "ckpt" in f.name]
    exc_apps_list_ckpt_files = [f for f in all_pkl if exc_apps_filename_prefix in f.name and "ckpt" in f.name]
    error_apps_ckpt_files = [f for f in all_pkl if error_apps_filename_prefix in f.name and 'ckpt' in f.name]

    apps_dict_ckpt_files.sort()
    exc_apps_list_ckpt_files.sort()
    error_apps_ckpt_files.sort()

    latest_apps_dict_ckpt_path = apps_dict_ckpt_files[-1] if apps_dict_ckpt_files else None
    latest_exc_apps_list_ckpt_path = exc_apps_list_ckpt_files[-1] if exc_apps_list_ckpt_files else None
    latest_error_apps_list_ckpt_path = error_apps_ckpt_files[-1] if error_apps_ckpt_files else None

    return latest_apps_dict_ckpt_path, latest_exc_apps_list_ckpt_path, latest_error_apps_list_ckpt_path

def main():
    print("Started Steam scraper process", os.getpid())


    apps_dict_filename_prefix = 'apps_dict'
    exc_apps_filename_prefix = 'excluded_apps_list'
    error_apps_filename_prefix = 'error_apps_list'

    apps_dict = {}
    excluded_apps_list = []
    error_apps_list = []

    item_count = 0

    all_app_ids = get_all_app_id()

    print('Total number of apps on steam:', len(all_app_ids))

    # path = project directory (i.e. steam_data_scraping)/checkpoints
    checkpoint_folder = Path('checkpoints').resolve()

    print('Checkpoint folder:', checkpoint_folder)

    if not checkpoint_folder.exists():
        print(f'Fail to find checkpoint folder: {checkpoint_folder}')
        print(f'Start at blank.')
        return

    latest_apps_dict_ckpt_path, latest_exc_apps_list_ckpt_path, latest_error_apps_list_ckpt_path = check_latest_checkpoints(checkpoint_folder, apps_dict_filename_prefix, exc_apps_filename_prefix, error_apps_filename_prefix)

    if latest_apps_dict_ckpt_path:
        apps_dict = load_pickle(latest_apps_dict_ckpt_path)
        print('Successfully load apps_dict checkpoint:', latest_apps_dict_ckpt_path)
        print(f'Number of apps in apps_dict: {len(apps_dict)}')
    
    if latest_exc_apps_list_ckpt_path:
        excluded_apps_list = load_pickle(latest_exc_apps_list_ckpt_path)
        print("Successfully load excluded_apps_list checkpoint:", latest_exc_apps_list_ckpt_path)
        print(f'Number of apps in excluded_apps_list: {len(excluded_apps_list)}')

    if latest_error_apps_list_ckpt_path:
        error_apps_list = load_pickle(latest_error_apps_list_ckpt_path)
        print("Successfully load error_apps_list checkpoint:", latest_error_apps_list_ckpt_path)
        print(f'Number of apps in error_apps_list: {len(error_apps_list)}')

    # remove app_ids that already scrapped or excluded or error
    all_app_ids = set(all_app_ids) \
            - set(map(int, set(apps_dict.keys()))) \
            - set(map(int, excluded_apps_list)) \
            - set(map(int, error_apps_list))
    
    # all_app_ids = set(all_app_ids) \
    #         - set(map(int, set(apps_dict.keys()))) \
    #         - set(map(int, excluded_apps_list)) \
    #         # + set(map(int, error_apps_list))
    # all_app_ids.update(set(map(int, error_apps_list)))
    # error_apps_list = []
    
    # first get remaining apps
    apps_remaining_deque = deque(set(all_app_ids))

    
    print('Number of remaining apps:', len(apps_remaining_deque))

    i = 0
    while len(apps_remaining_deque) > 0:
        appid = apps_remaining_deque.popleft()

        # test whether the game exists or not
        # by making request to get the details of the app
        try:
            appdetails_req = requests.get(f"https://store.steampowered.com/api/appdetails?appids={appid}")

            if appdetails_req.status_code == 200:
                appdetails = appdetails_req.json()
                appdetails = appdetails[str(appid)]

            elif appdetails_req.status_code == 429:
                print(f'Too many requests. Put App ID {appid} back to deque. Sleep for 10 sec')
                apps_remaining_deque.append(appid)
                time.sleep(10)
                continue


            elif appdetails_req.status_code == 403:
                print(f'Forbidden to access. Put App ID {appid} back to deque. Sleep for 5 min.')
                apps_remaining_deque.append(appid)
                time.sleep(5 * 60)
                continue

            else:
                print("ERROR: status code:", appdetails_req.status_code)
                print(f"Error in App Id: {appid}. Put the app to error apps list.")
                apps_remaining_deque.append(appid)
                continue
                
        except:
            print(f"Error in decoding app details request. App id: {appid}")

            traceback.print_exc(limit=5)
            appdetails = {'success':False}
            print()

        # not success -> the game does not exist anymore
        # add the app id to excluded app id list
        if appdetails['success'] == False:
            excluded_apps_list.append(appid)
            print(f'No successful response. Add App ID: {appid} to excluded apps list')
            continue

        appdetails_data = appdetails['data']

        appdetails_data['appid'] = appid     

        apps_dict[appid] = appdetails_data
        print(f"Successfully get content of App ID: {appid}")

        i += 1
        # for each 2500, save a ckpt
        if i > 2500:
            save_checkpoints(checkpoint_folder, apps_dict_filename_prefix, exc_apps_filename_prefix, error_apps_filename_prefix, apps_dict, excluded_apps_list, error_apps_list)
            i = 0

    # save checkpoints at the end
    save_checkpoints(checkpoint_folder, apps_dict_filename_prefix, exc_apps_filename_prefix, error_apps_filename_prefix, apps_dict, excluded_apps_list, error_apps_list)

    # print(f"Total number of apps: {len()}")
    print(f"Total number of valid apps: {len(apps_dict)}")
    print(f"Total number of skipped apps: {len(excluded_apps_list)}")
    print(f"Total number of error apps: {len(error_apps_list)}")
    # print(f"Is the sum of valid and skipped apps equal to total number of apps? {(len(data['applist']['apps']) == len(apps_dict) + len(excluded_apps_ids))}")

    print('Successful run. Program Terminates.')

if __name__ == '__main__':
    main()


    # app_dict = pickle.load(open('/Users/michaelcheng/Documents/MyDocs/HKU/COMP4801 FYP/FYP/NLP/dev-workspace/dataset/apps_dict-ckpt-20231013104700.p', "rb"))

    # with open('/Users/michaelcheng/Documents/MyDocs/HKU/COMP4801 FYP/FYP/NLP/dev-workspace/dataset/data_scraping/steam_data_scraping/checkpoints/apps_dict-ckpt-20231013163612.p', 'rb') as f:
    #     app_dict = pickle.load(f)

    # fr = open("/Users/michaelcheng/Documents/MyDocs/HKU/COMP4801 FYP/FYP/NLP/dev-workspace/dataset/apps_dict-ckpt-20231013104700.json", 'w')
    # json.dump(app_dict, fr)
    # fr.close()
    # print(app_dict['1573100'])
    # print(len(app_dict))
    # print(set(app_dict.keys()))


    # excluded_app_list = pickle.load(open('/Users/michaelcheng/Documents/MyDocs/HKU/COMP4801 FYP/FYP/NLP/dev-workspace/dataset/excluded_apps_dict-ckpt-20231013104700.p', "rb"))
    # print(len(excluded_app_list))