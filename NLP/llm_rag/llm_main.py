import chromadb

from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter, TokenTextSplitter
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_core.prompts import PromptTemplate

import _prompts
from _utils import _print_message

import json
import os
from datetime import datetime
from hashlib import sha224


# OLLAMA_IP = os.environ.get('OLLAMA_IP', 'localhost')

# global constants
GAME_ASPECTS = ['Gameplay', 'Narrative', 'Accessibility', 'Sound', 'Graphics & Art Design', 'Performance', 'Bug', 'Suggestion', 'Price', 'Overall']

# global variables
llm_mistral7b = Ollama(
    model='mistral:7b-instruct-v0.2-q4_0', temperature=0.2,                         # lower temperature for more deterministic results
    base_url = 'http://localhost:11434'
)       
llm_gemma2b = Ollama(
    model='gemma:2b-instruct-q4_0', temperature=0.2,                                # lower temperature for more deterministic results
    base_url='http://localhost:11454'
)                

chroma_client = chromadb.HttpClient(host='localhost', port=8000)

def _check_spam(review:str):

    chat_prompt_01 = ChatPromptTemplate.from_messages([
        ("system", _prompts.SYSTEM_TEMPLATE),
        ("human", _prompts.SPAM_TEMPLATE_01)
    ])

    chain_01 = chat_prompt_01 | llm_mistral7b
    response_01 = chain_01.invoke({
        "review": review
    })

    chat_prompt_02 = ChatPromptTemplate.from_messages([
        ("system", _prompts.SYSTEM_TEMPLATE),
        ("human", _prompts.SPAM_TEMPLATE_01),
        ("ai", response_01),
        ("human", _prompts.SPAM_TEMPLATE_02)
    ])

    chain_02 = chat_prompt_02 | llm_mistral7b
    response_02 = chain_02.invoke({
        "review": review
    })

    _print_message(f'LLM result for spam check: {response_01}')
    _print_message(f'LLM result_2 for spam check: {response_02}')

    if "YES" in response_02 or "Yes" in response_02 or "yes" in response_02:
        return True
    else:
        return False
    

def _create_review_obj(review:str):
    '''Create a review object with the review text and a hash of the review text as the key
    for creating a temporary in-menory db for one-time RAG
    '''
    review_obj = {
        "review_text": review,
        "datetime": datetime.now()
    }

    hash = sha224(str(review).encode()).hexdigest()
    review_obj['hash'] = hash

    return review_obj


def _get_aspects_content(review:str):
    # create a temporary db for one-time RAG

    _review_obj = _create_review_obj(review)

    # text_splitter = CharacterTextSplitter(chunk_size=800, chunk_overlap=0)
    text_splitter = TokenTextSplitter(chunk_size=250, chunk_overlap=40)
    docs = text_splitter.create_documents([review], metadatas=[{"source":"review_01"}])
    embedding_func = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    db = Chroma.from_documents(
        docs, embedding_func,
        collection_name=_review_obj['hash']
    )
    retriever = db.as_retriever(search_kwargs={"k": 5})

    n_docs = len(docs)
    _print_message(f'Number of splited documents: {n_docs}')

    if n_docs <= 10:
        aspects_response = _get_aspects_334(retriever)
    else:
        aspects_response = _get_aspects_10(retriever)

    _print_message(f'LLM aspects content: {aspects_response}')

    # clean up
    db.delete_collection()      # delete the collection from the db
    del db

    return aspects_response



def _get_aspects_334(retriever):
    aspects_response = {k: '' for k in GAME_ASPECTS}

    for (start, end) in [(0, 3), (3, 6), (6, 10)]:
        aspects = GAME_ASPECTS[start:end]

        my_question = _prompts.QUESTION_TEMPLATE_01 + f"{'is ' if len(aspects) <= 1 else 'are '}" + ': ' + f'{aspects}'
        output_format = _prompts.OUTPUT_FORMAT_TEMPATE.format(aspects_list_01=str(aspects)[1:-1], output_json_template=str({k: '...' for k in aspects}))

        relevant_docs = retriever.get_relevant_documents(query=my_question, k=5)

        prompt = PromptTemplate(
            template=_prompts.KEYWORD_TEMPLATE_01,
            input_variables=["aspects", 'output_format', 'summaries'],
        )

        chain = prompt | llm_gemma2b

        # retry loop if the response is not a JSON
        for i in range(5):

            _print_message(f'Attempt {i+1} for getting aspects...')

            resp = chain.invoke({
                "aspects": aspects,
                "output_format": output_format,
                "summaries": str('\n'.join([d.page_content for d in relevant_docs]))
            })

            _print_message(f'LLM result for _get_aspects_334: {resp}')


            # string processing for the response to get a JSON object

            # get the first '{'
            first_brace = resp.find('{')
            if first_brace == -1:
                continue
            resp_ans = resp[first_brace:]

            try:
                resp_json = json.loads(resp_ans)

                aspects_response.update(resp_json)

                break
            except:
                print(f'response: \'\'\'{resp_ans}\'\'\' is not a JSON. Resort to manual parse...')

            for i, aspect in enumerate(aspects):
                if f'\"{aspect}\"' not in resp_ans:
                    print(f'aspect: {aspect} not in resp_ans. Retry...')
                    continue

                if i != len(aspects) - 1:
                    next_aspect = aspects[i + 1]
                    next_aspect_start = resp_ans.find(f'\"{next_aspect}\"')
                    if next_aspect_start == -1:
                        print(f'next_aspect: {next_aspect} not in resp_ans. Retry...')
                        continue
                else:
                    next_aspect_start = len(resp_ans)


                resp_start = resp_ans.find(f'\"{aspect}\"') + len(f'\"{aspect}\"')
                value_start = resp_ans.find('\"', resp_start + 1)
                value_end = resp_ans.find('\"', value_start + 1)

                if aspects_response[aspect] == '':
                    aspects_response[aspect] = resp_ans[value_start + 1:value_end]

                try:
                    for aspect in aspects:
                        _ = aspects_response[aspect]      # attempting to have access to each value
                except:
                    print(f'Error in response_02: {aspect}. Retry...')
                    continue
            
            # leave the retry loop if the response is a JSON
            break

    return aspects_response


def _get_aspects_10(retriever):
    aspects_response = {k: '' for k in GAME_ASPECTS}

    for aspect in GAME_ASPECTS:
        my_question = _prompts.QUESTION_TEMPLATE_01 + f"is {aspect}"
        output_format = _prompts.OUTPUT_FORMAT_TEMPATE.format(aspects_list_01=aspect, output_json_template=str({aspect: '...'}))

        relevant_docs = retriever.get_relevant_documents(query=my_question, k=5)

        prompt = PromptTemplate(
            template=_prompts.KEYWORD_TEMPLATE_01,
            input_variables=["aspects", 'output_format', 'summaries'],
        )

        chain = prompt | llm_gemma2b

        # retry loop if the response is not a JSON
        for i in range(5):

            _print_message(f'Attempt {i+1} for getting aspects...')

            resp = chain.invoke({
                "aspects": [aspect],
                "output_format": output_format,
                "summaries": str('\n'.join([d.page_content for d in relevant_docs]))
            })

            _print_message(f'LLM result for _get_aspects_10: {resp}')


            # string processing for the response to get a JSON object

            # get the first '{'
            first_brace = resp.find('{')
            if first_brace == -1:
                continue
            resp_ans = resp[first_brace:]

            try:
                resp_json = json.loads(resp_ans)

                aspects_response.update(resp_json)

                break
            except:
                print(f'response: \'\'\'{resp_ans}\'\'\' is not a JSON. Resort to manual parse...')

            if f'\"{aspect}\"' not in resp_ans:
                print(f'aspect: {aspect} not in resp_ans. Retry...')
                continue

            resp_start = resp_ans.find(f'\"{aspect}\"') + len(f'\"{aspect}\"')
            value_start = resp_ans.find('\"', resp_start + 1)
            value_end = resp_ans.find('\"', value_start + 1)

            aspects_response[aspect] = resp_ans[value_start + 1:value_end]

            try:
                _ = aspects_response[aspect]      # attempting to have access to each value
            except:
                print(f'Error in response_02: {aspect}. Retry...')
                continue
            
            # leave the retry loop if the response is a JSON
            break
    
    return aspects_response


def _gen_keywords_per_review(review:str, is_spam:bool, aspects_response:dict):
    # step 1: prompt LLM to determine if the review is a spam given the game name and description
    # step 2: if spam, simply return None
    # step 3: if not spam, prompt LLM to generate keywords for the review. Return a JSON

    if is_spam:
        return None
    

    # set a number of times for repeating if the response is not a JSON
    repeat_limit = 5

    for i in range(repeat_limit):

        _print_message(f'Attempt {i+1} for generating keywords...')

        chat_prompt_02 = ChatPromptTemplate.from_messages([
            ("system", _prompts.SYSTEM_TEMPLATE),
            ("human", _prompts.KEYWORD_TEMPLATE_02)
        ])
        
        chain_02 = chat_prompt_02 | llm_gemma2b
        response_02 = chain_02.invoke({
            "aspects": GAME_ASPECTS,
            "context": str(aspects_response)
        })

        # check whether response_02 is a JSON
        # get the first '{'
        first_brace = response_02.find('{')
        if first_brace == -1:
            continue
        
        response_02 = response_02[first_brace:]

        try:
            response_02_json = json.loads(response_02)
        except:
            print(f'response_02: \'\'\'{response_02}\'\'\' is not a JSON. Retry...')
            continue

        # further tidying
        # replace a list of 'NA' with only a list of 'NA'
        for k, v in response_02_json.items():
            if isinstance(v, list):
                if all([x == 'NA' for x in v]) or all([x == '...' for x in v]):
                    response_02_json[k] = ['NA']

        _print_message(f'LLM result for keywords extraction: {response_02_json}')

        return response_02_json
    
    # return None if the response is not a JSON after repeat_limit times of trying
    return None

def _gen_TLDR_per_review(review:str, is_spam:bool, aspects_response:dict):
    # step 1: if the number of words in the review is less than 50, return None
    # step 2: else: prompt LLM to determine if the review is a spam given the game name and description
    # step 3: if spam, simply return None
    # step 4: if not spam, prompt LLM to generate a TLDR for the review. Return a JSON

    if is_spam:
        return None

    if len(review.split()) < 50:
        return None
    
    chat_prompt_01 = ChatPromptTemplate.from_messages([
        ("system", _prompts.SYSTEM_TEMPLATE),
        ("human", _prompts.TLDR_PER_REVIEW_TEMPLATE_01)
    ])

    chain_01 = chat_prompt_01 | llm_gemma2b
    response_01 = chain_01.invoke({
        "context": aspects_response
    })

    _print_message(f'LLM result for generating TLDR: {response_01}')

    return response_01

def get_per_review_analysis(review:str) -> tuple[bool, dict, str]:
    '''Get the LLM assisted analysis for a review
    
    :param review: the review to be analyzed

    return a tuple of three elements:
    - a boolean, whether the review is a spam
    - a dictionary, the keywords for each aspect
    - a string, the TLDR for the review
    '''
    
    is_spam = _check_spam(review)
    
    if not is_spam:
        aspects_response = _get_aspects_content(review)
    else:
        aspects_response = None

    aspect_keywords = _gen_keywords_per_review(review, is_spam, aspects_response)

    print(aspect_keywords)
    print('\n\n')

    tldr = _gen_TLDR_per_review(review, is_spam, aspects_response)

    return is_spam, aspect_keywords, tldr





def gen_TLDR_per_game(game_name:str):
    # step 1: go to chromadb to find the collection with all critic reviews. If not found, return None
    # step 2: prompt LLm to generate a JSON with a list of keywords per aspect from those critic reviews with RAG
    # step 3: ask for sentiment analysis stats
    # step 4: ask for tm stats
    # step 5: return a TLDR (str) for displaying in the "game page"

    pass


if __name__ == "__main__":
    # testing 

    # most repr reviews from bertopic
    sample_01 = "poorly optimized, runs between 25 - 35 fps on both low and ultra settings. you ' d think that if ultra was 30 - 35 then low should be 60, but no. even with max settings game still looked odd after disabling up - scaling. a $ 70 title should run at 50 - 60 fps on the lowest settings minimum. and trying to optimize the settings to get better frames i have dumped to many hours into it to get a refund. so here i will sit and wait till they fix the performance."
    sample_02 = "good game, todd"
    sample_03 = "okay this game is getting some bad reviews. however i do not think this game is bad. i ' ll agree that you need a pretty good pc to run it. but the game itself isn ' t bad. yes there are some bugs, i have not come across many but i have experienced a few. the story isn ' t great either but the latest assassins creed games did not have very good stories, so people can ' t blame this game alone. after you ' ve played for an hour or so and you ' ve learned how the game plays, you can start exploring paris, which is really cool. paris is huge and you have a lot of things you can do. coop missions, random events and a ton of other cool stuff, are some of the things you can keep yourself busy with. the customization in this game is great. you can choose between many different clothings. you can also buy color so you can make the character dress like a rainbow. there are a lot of different weapons in this game, from swords to axes even rifels. obisoft also made a great decision putting stealth into the game. now you can sneak around without being seen. the graphics in this game are really good. standing on a high point and"
    sample_04 = "glados, oh, glados. you bring so much fun into a game. while there are some people who might not like portal, i ' m one of the many who love it. i don ' t think there is much i can say about the game that many do not already know. it ' s a very intriguing puzzle / ' shooter ' that was pretty freaking original when it came out. it can be a little confusing if you ' re not able to wrap your head around the puzzles, but most people shouldn ' t have many issues. i ' ve played the game many times over ( not all on steam ) and have enjoyed it every single time. many years from now, it ' ll be still yeah, i know."
    sample_05 = "was good, until the social club app stopped working. i followed some steps on the offical rockstar website about how to fix this problem and now gta 5 is permanently broken. either the social club app crashes on startup or the program made to patch and fix this problem says ' grand theft auto 5 isnt installed on your if anybody can help me please respond but until then. rip gta 5 it was fun while it lasted."
    sample_06 = "make this for mac!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    sample_07 = "the first rpg ive ever played. hated rpgs before this, and only picked this up on a steam sale, that too, reluctantly. however, gave it a try, and got so engaged in the story right from the start, only because of the narrator ' s voice. the music ' s reall good as well. one of the best for a game. i feel the developers, supergiant games, did a better job with bastion ' s music than that of transistor ' s. the handpainted graphics felt so unique to me as well. haven ' t seen something like this in other games before this. i ' d give it a 10 / 10 rating for story, music, weapons / upgrades, visuals."
    sample_08 = "although the game is old, and the combat is weird, its very fun. after 5 hours of game play, im satisfied with the $ 1 i spent. if you plan on buying the witcher 3, buy this game, and witcher 2 when they are on sale, so you have an understanding of the story. witcher 3 will make alot more sense if you do."
    sample_09 = "we were ready to clean up all of the trash on our streets once and for all. the first cat was tough to kill, since we had no idea what we would be up against. we lost jerry and milton in the process, but we all knew what was on the line in order to exterminate all of the cats. after the 10th cat, we didn ' t even pay attention to the ones that had died because we had become used to it. after 20, it seemed that some were just killing the cats for sport. the 30th cat was a bit stronger. it had wiped out over half of our entire army, but crazy steve strapped on his vest and let himself get swallowed, where he detonated the cat and saved many of our lives that day. i will never forget the sacrifice he made. it was a rough day. cat 39 had killed all but 8 of us. there was only one left. the next day, i saw him. he had a scar. it was him. it was the one who had killed my parents. i had trained my whole life for this moment. i had done everything i could to get the revenge i wanted. it was my moment. the first rat had blown himself up, along with the second rat."
    sample_10 = "uncensored boobs on a steam game 11 / 10"
    sample_11 = "overall good magic card game. the only issue i can really see is the random algorithem for shuffeling the deck, more times than not you either hit a major mana pocket or no mana at all for half the deck reguardless of deck size. i would also suggest to the devs to allow specific card buying for coins as its really hard to get a single card from an entire set of cards, and yes i would expect the cost to be much higher than for booster packs, adjusted for card value and rareity."
    sample_12 = "please update!!! this game could be so amazing!!!! achievements too!!!!"


    # they're most repr reviews from LDA
    sample_w_01 = "'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!' 'Fire in the hole!'"
    sample_w_02 = "lyrics: give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money give me that money"
    sample_w_03 = "Hours, and hours, and hours, and hours, and hours, and hours back in the day, and still these days every now and then."
    sample_w_04 = "SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT SUPER HOT"
    sample_w_05 = "Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack Quack   Fun game would reccomend"
    sample_w_06 = "Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies Custom Zombies   That is all."
    sample_w_07 = "Where are the Updates. Where are the Updates. Where are the Updates. Where are the Updates. Where are the Updates. Where are the Updates. Where are the Updates. Where are the Updates. Where are the Updates.  Do NOT buy this game, or any game made by this developer."
    sample_w_08 = "*click click click click click click click click click click click click click* YOU WIN"
    sample_w_09 = "Even for this price its bad.  2 many bugs, bad collision detection and, on higher difficulty settings, enemies that can hear a mosquito fart..."
    sample_w_10 = "This was a very frustrating experience for me. The controls and mechanics were not explained properly and I wasn't able to complete even the basic missions. I gave up very soon."
    sample_w_11 = "This is the most immersive MMO on the market. It takes features from the previous Elder Scrolls games with MMO mechanics and seamlessly combine them to form a smooth gameplay experience. If you love TES you'll find a home here."
    sample_w_12 = "The bosses are WAY too hard. I died 30 times on a boss, rage quit."


    # https://steamcommunity.com/profiles/76561198085425935/recommended/1245620/
    long_review_01 = \
'''I'm only writing this review because Shadow of the Erdtree was finally announced and I want to go on the record for anyone who never got around to playing it yet for whatever reason. If you heard about the DLC and are thinking "yeah, maybe now is the time I'll finally dive in", then this is directed at you.

Elden Ring is not for everyone. If you don't respect the grind, then it will kick the ♥♥♥♥ out of you without remorse. There is no easy mode, no save-scumming, no cheat codes, and absolutely no hand holding. Yeah sure.. you can rely on Youtubers and Wiki pages to tell you what some of the ULTIMATE BUILDS might be... but even if you're relying on a crutch like that, you STILL have to put the work in and "git gud" when it's all said and done. It also takes a while to even get access to all the weapons/gear that those guides expect you to be using, not to mention earning the experience needed for the build to be viable. So my suggestion to you is to worry less about building an exact carbon copy of a character that some other person already played as, and just try to take it all in and experience it for yourself first.

I got every achievement, defeated every boss, and it was the most rewarding grind I've ever embarked upon in a game. I made a lot of mistakes along the way, but I learned from every single one of them. I got my ass kicked every time I booted up the game, but every triumph I celebrated was unlike any other thanks to all of those ass-kickings. From the hardest boss fights to the most annoying mobs, you truly feel every single victory... and that's where I got hooked because the sense of accomplishment you get from progressing in Elden Ring... I'm telling you, it is the ultimate dopamine shot.

Now, I personally loved the story, but it's definitely a subjective experience. Elden Ring is a mythological story about gods and demi-gods, and if you take the time to read through the item descriptions, look closer at the game world, and try to fill in the gaps kind of like a detective would, then you will probably enjoy it too. If you are expecting the cutscenes to be the only thing you have to pay attention to in order to know what's going on, you might be disappointed.

Without a quest menu or anything like that to keep track of things, the game forces you to do your own due diligence and keep track of the NPCs you've spoken to, and to really listen to what they say because completing side quests isn't like most open world games that just plop a waypoint down for you to walk to after you've skipped all the dialogue. You need to listen and think about it, and if you've already progressed through certain points of the main-story, then you might not even get to experience some of the side quests. This aspect of Elden Ring can be a bit frustrating because you really aren't given any indication if you've missed a part of a quest or if you missed a quest entirely until it's too late. I will just say that if you're bee-lining it straight to the main bosses, you are definitely missing a LOT of what makes the game so good (and you're also missing out on side quests that lead to valuable ITEMS and EXPERIENCE!!!). So if you don't want to miss anything, my advice is to take it all very slow, and just try to clear regions and talk to everyone you see before moving on to new areas. If you think you missed stuff, keep in mind that you can always try again in NG+.

Multiplayer is completely optional, but opting in to allow invasions can be rewarding because testing your build against actual players is pretty fun, plus you get to also see what other people are doing with their characters. Sometimes seeing someone else in action can inspire you to try new stuff, or it can make you aware of a flaw in your own character. I will say that I personally played with the player messages turned off though because I didn't want to read possible spoilers, and I felt reading messages left by other players all over the place broke my immersion.. but to each their own.

If you've never played Elden Ring before and are finally considering a run through the game for the first time... I truly envy you because I would do anything to wipe my memory and play it again for the first time. It is a game like no other, and it will test you in more ways than one. Just don't get discouraged when you hit a wall.. because we've ALL been there... all you have to do is learn to overcome it. Once you do, I promise there is no greater feeling in all of gaming.'''

    # https://steamcommunity.com/id/sexphynx/recommended/1245620/
    long_review_02 = \
'''Being my first souls game, I was convinced I would be wasting my money, and that the first boss I encountered would kick my ass. And I was proven right in no time, by the Grafted Scion. “But you were expected to be defeated by that one!”, you say. Worry not, the Tree Sentinel was also quick to put me back in my place once I had built the tiniest bit of confidence after beating the tutorial boss.

The game is fantastic. It got more and more rewarding as I progressed, and I was happy to beat the game a second and a third time, finding out new secrets during each playthrough. There’s no compliment I can come up with that hasn’t already been used to describe this game.

There are so many weapons with so many different builds to try. Bosses can be frustrating but there’s so much fun to be had. Even what is considered to be one of the toughest fights (looking at you, Malenia) is incredibly fair and fun. And the spectral horse you get is most likely the best horse I’ve ever ridden in any game, ever.

If I had anything to complain about, are the platforming sections. But after looking it up a bit, apparently FromSoftware never really knew how to do those, and they are so few and far between, that's hardly a reason not to buy the game.

I could also complain that I was unable to romance Boggart or Blaidd. They’re so cool.

10/10, the DLC cannot come a day too soon.'''

    # https://steamcommunity.com/profiles/76561198125518593/recommended/1245620/
    long_review_03 = \
'''Since the release of Skyrim on 11/11/11 I have been craving an open world experience with rewarding combat, build theories, crazy-beautiful aesthetics, and a real sense of accomplishment (items, dungeons completed, etc).

This game delivers the entire experience in a way I've never quite seen. I'm new to the souls-like genre, and FROMSOFTWARE games. Here are the takeaways for me:

1. Combat is extremely rewarding by being unforgiving. At first glance, it's hard, but as you delve just a little deeper you realize that combat in this game is an art form that takes practice, and then more practice. The satisfaction is higher than any game I've played in the last decade. The light attacks, heavy attacks, blocks, parrying, sprint attacks, sneak attacks, all play a little different and allow you to really pick your method or avenue of approach.
2. Items in game (from armor and weapons, to craftables and ashes) are each, individually, potentially game changing or build changing and can really flesh out a 'build'. It's rewarding to find items in game as any one of them could be the weapon of choice for your desired build.
3. Open world is absolutely stunning and feels very scary, yet very exciting. Every new enemy seen needs to be studied, practiced, and learned for optimal combat. New enemies can be scary as you don't immediately know their capabilities. Boss fights are hard (some more than others) and many enemies are the type that require you to come back at a later time when you have stronger tools, or more HP, or you git gud. Roaming new areas is thrilling and you begin to truly have to balance and manage your HP, FP, and Stamina while in combat. The lighting in caves with torches or lanterns is immersive and you feel the danger.
4. Character building is straightforward. You level up as you beat enemies and use the runes (XP, currency) as you see fit to either purchase things, or level up....etc and you can decide what attribute to increase. Trying new weapons, new armors, is both fun and interesting.

The need to knows:
1. Game won't hold your hand. You are in a labyrinth with many things that all can kill you. You will not know exactly what you're doing, where you're going, or why you are existing.
2. Everything you see can kill you if you become too careless. Slow and steady usually is the best method. Slow is smooth and smooth is fast.
3. Ashes of War, summoning and crafting must be experimented with to understand. Again, no hand holding.
4. You will ask yourself, "How in the world am I supposed to ever be able to complete this?" Many, many times.
5. Puzzles and secrets abound, exploration and a good memory are key.
6. While there is a multiplayer experience (PVP and PVE) it's a bit confusing and from what I've experienced so far, not necessarily mandatory. The single player experience is strong with this one.

I've spent 42 hours in this game as of writing this and I've barely left the starting area - Limgrave. My nightmares consist of Runebears, traversing the mist, and boss fights. I've been startled, pillaged, rekt, and absolutely confused many times, but I wouldn't change any of it. I remember the first time I saw a giant I had Attack on Titan flashbacks and began trying to summon my inner Captain Levi. It's just a blast. An absolute blast. The greatest feeling of accomplishment is when you start to beat bosses or new enemies on your first attempt. You can feel your ability, your reaction time, your muscle-memory coming more and more into play as you practice, and it creates a thrilling experience. Struggling with an enemy type for hours only to come back a few days later and realize how much stronger and faster you've gotten is a very rewarding experience.'''

    # https://steamcommunity.com/id/apasserby/recommended/1817190/
    long_review_04 = \
    '''Pros
+ Carries over the great traversal and combat mechanics from the first game
+ You can now perform wall and ceiling takedowns
+ Great port; runs smooth for the most part
+ You can get a Spider-Cat travel companion
+ More air tricks variations
+ Great soundtrack
+ Great accessibility options: action shortcuts, disabling button mashing QTEs etc

Cons
- Too short to be worth the price; has only around 1/3 the content of the first game
- Cutscenes are unskippable, even in NG+; only a select few cinematics can be skipped
- Not as many fun variations to take down enemies due to fewer and less interesting gadgets
- Finishing move mechanics were better in the first game
- Several bugs and visual glitches, with some being carried over from the first game
- The story villain is barely a footnote in the story
- No DLC

Neutral
- Story is too generic, even by stereotypical comic book standards
- Miles is significantly squishier than Peter; may be enjoyable for those looking for a challenge
- Camouflage and Venom attacks overcompensate and can be quite overpowered
- I find Miles's sQuEAky voice mildly annoying, but perhaps it's fitting for a 17 year old teenager.

Worth the play, but wait for a sale
~16 hours for 100% completion, and ~21 hours for 100% achievements is just too short for this game to be worth a buy at full price. You also get fewer gadgets and they feel rather uninspired. While I enjoyed using all 8 gadgets in the first game, I found myself mainly using only 2 in this one.

And while this game is inferior to the first in almost every way, 2018's Spider-Man set such a ridiculously high standard that simply sharing the same core gameplay still makes this game great. So if you enjoyed the first game, this is definitely worth the play, but definitely only get it at at least 25% off unless you're impatient like me.'''


    # https://steamcommunity.com/id/KnyH/recommended/1817190/6
    long_review_05 = \
'''Spider-Man: Miles Morales is definitely a great superhero game and it does a lot to improve on its predecessor in terms of combat and traversal. It never really gets old to web-sling through an accurate depiction of New-York City. The story and game play was enjoyable enough for me to at least want a game play session in everyday. The story had like able characters and not one really stood out to me as a bad character. Graphics are amazing and as expected.

However, the game did miss two marks for me. One big gripe I had with the game was the overall playtime. If we disregard side missions and the open-world activities, we are looking at 6-7 hours of main mission playtime. It also does not help that the first game doubles this playtime. It only took me around 22 hours to complete the game 100%. Another issue I could not look over was the lack of memorable boss fights, its hard not to compare it to the first game but, the first game did have many good boss fights against Spider-Man's iconic villains. This game did not even reach to half of that. Although, the final boss was a banger.

Overall, it is pretty difficult to justify paying full price for this game, but I can say that it is game that should not be looked over, especially if you were a fan of the first game. If you want to wait for a sale, that's cool, if you want to buy asap I'd say that's cool too.'''


    # change the sample to test diff reviews
    temp_sample = long_review_01

    print('The review is:',temp_sample)
    print('\n\n')

    is_spam, aspect_keywords, tldr = get_per_review_analysis(temp_sample)

    print('Is spam:', is_spam)
    print('Aspect keywords:', aspect_keywords)
    print('TLDR:', tldr)
