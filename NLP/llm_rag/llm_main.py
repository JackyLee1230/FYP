import chromadb

from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_core.prompts import PromptTemplate

import _prompts

import json

# global constants
GAME_ASPECTS = ['Gameplay', 'Narrative', 'Accessibility', 'Sound', 'Graphics & Art Design', 'Performance', 'Bug', 'Suggestion', 'Price', 'Overall']

# global variables
llm = Ollama(model='llama2', temperature=0.2)       # lower temperature for more deterministic results
chroma_client = chromadb.HttpClient(host='localhost', port=8000)

def _check_spam(review:str):

    chat_prompt_01 = ChatPromptTemplate.from_messages([
        ("system", _prompts.SYSTEM_TEMPLATE),
        ("human", _prompts.SPAM_TEMPLATE_01)
    ])

    chain_01 = chat_prompt_01 | llm
    response_01 = chain_01.invoke({
        "review": review
    })

    chat_prompt_02 = ChatPromptTemplate.from_messages([
        ("system", _prompts.SYSTEM_TEMPLATE),
        ("human", _prompts.SPAM_TEMPLATE_01),
        ("ai", response_01),
        ("human", _prompts.SPAM_TEMPLATE_02)
    ])

    chain_02 = chat_prompt_02 | llm
    response_02 = chain_02.invoke({
        "review": review
    })

    print('LLM result for spam check:', response_01)
    print('LLM result_2 for spam check:', response_02)

    if "YES" in response_02 or "Yes" in response_02 or "yes" in response_02:
        return True
    else:
        return False
    

def _get_aspects_content(review:str):
    # create a temporary db for one-time RAG
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
    docs = text_splitter.create_documents([review], metadatas=[{"source":"review_01"}])
    embedding_func = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    db = Chroma.from_documents(docs, embedding_func)
    retriever = db.as_retriever(search_kwargs={"k": 5})

    aspects_response = {k: '' for k in GAME_ASPECTS}

    for aspect in GAME_ASPECTS:
        question = _prompts.QUESTION_TEMPLATE_01 + f'{aspect}'

        chain_01 =  RetrievalQAWithSourcesChain.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            chain_type_kwargs={
                "prompt": PromptTemplate(
                    template=_prompts.KEYWORD_TEMPLATE_01,
                    input_variables=["summaries", "question"],
                )
            },
            return_source_documents=True,
        )

        response_01 = chain_01.invoke({
            "question": question
        })

        aspects_response[aspect] = response_01['answer']

    del db
    del retriever

    print('LLM result for aspects_response:', aspects_response)

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

        print(f'Attempt {i+1} for generating keywords...')

        chat_prompt_02 = ChatPromptTemplate.from_messages([
            ("system", _prompts.SYSTEM_TEMPLATE),
            ("human", _prompts.KEYWORD_TEMPLATE_02)
        ])
        
        chain_02 = chat_prompt_02 | llm
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
                if all([x == 'NA' for x in v]):
                    response_02_json[k] = ['NA']

        print('LLM result for response_02_json:', response_02_json)

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

    chain_01 = chat_prompt_01 | llm
    response_01 = chain_01.invoke({
        "context": aspects_response
    })

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

    # change the sample to test diff reviews
    temp_sample = sample_01

    print('The review is:',temp_sample)
    print('\n\n')

    is_spam, aspect_keywords, tldr = get_per_review_analysis(temp_sample)

    print('Is spam:', is_spam)
    print('Aspect keywords:', aspect_keywords)
    print('TLDR:', tldr)
