import pickle
import os
import requests
import json

def findGenre(string):
    if string == "Action" or string == "Adventure":
        return "ACTION_AND_ADVENTURE"
    elif string == "RPG":
        return "RPG"
    elif string == "Simulation":
        return "SIMULATION"
    elif string == "Strategy":
        return "STRATEGY"
    elif string == "Puzzle":
        return "PUZZLE"
    elif string == "Sports":
        return "SPORTS"
    elif string == "Indie":
        return "INDIE"
    elif string == "Classic":
        return "CLASSIC"
    elif string == "Family Friendly":
        return "FAMILY_AND_KIDS"
    elif "Platformer" in string:
        return "PLATFORMER"
    elif "Shooter" in string:
        return "SHOOTER"
    elif string == "Survival":
        if "Survival" in string:
            return "HORROR"
        return "SURVIVAL"
    elif string == "MMORPG":
        return "MMO"
    elif string == "MOBA":
        return "MOBA"
    else:
        return
    


def convertJsonToDBFormat(id,game):
    dbFormat = {
        "name": game["name"],
        # "description": game,
        "genre": [
            findGenre(g["description"]) for g in game["genres"]
        ],
        "dlc": game["type"] == "dlc",
        "free": game["is_free"],
        # "legalNotice": game["legal_notice"],
        "gamePage": "https://store.steampowered.com/app/" + str(id),
        # "gamePrice": 0 if game["is_free"] == True else 100,
        "requiredAge": None if game["required_age"] == 0 else game["required_age"],
        "version": "Latest",
        "developerCompany": ", ".join([d for d in game["developers"]]),
        "publisher": ", ".join([d for d in game["publishers"]]),
        "platform": ["STEAM"],
        "inDevelopment": game["release_date"]["coming_soon"],
        "releaseDate": game["release_date"]["date"],
    }
    return dbFormat

# load json 
with open('./apps_dict-ckpt-20231013104700.json', 'rb') as f:
    s = json.load(f)
    count = 0
    for gameId in s.keys():
        dbFormat = convertJsonToDBFormat(gameId,s[str(gameId)])
        count+=1
        # print(dbFormat)
        r = requests.post("http://localhost:8080/api/game/addGame",json=dbFormat)
        data = r.json()
        print(data)
        if count >= 10:
            break
        # if gameId == "524430":
        #     print(s[str(gameId)])
        #     break