# define prompt tempates for the LLM model


SYSTEM_TEMPLATE = \
'''You are reading reviews of a game to understand the characteristics of the game. Use the following pieces of context to answer user's question.'''


# _check_spam
SPAM_TEMPLATE_01 = \
'''Determine if the review is a spam for a game. Output three reasons for your decision. Do NOT output other text.

The review is as follows:
\'\'\'
{review}
\'\'\'
'''

# only true/false
SPAM_TEMPLATE_02 = \
'''Is the game review a spam?
Output 'YES' if the review is a spam and 'NO' if the review is not a spam. Only output the decision. Do NOT output the reasons. Do NOT output other text.'''

# with probability
# SPAM_TEMPLATE_02 = \
# '''Determine from ["is_spam", "probability"]. Provide them in JSON format, with the label as key, and probability as value. Alternatively, state "NA". Only output the JSON. Do NOT output the reasons. Do NOT output other text. Do NOT output other things except the format'''


# gen_keywords_per_review
KEYWORD_TEMPLATE_01 = \
'''You are reading reviews of a game to understand the characteristics of the game. Use the following pieces of context to answer user's question. 

{summaries}

Question: {question}

If you don't know the answer, output only "NA". Do NOT try to make up an answer. Do NOT output other text.'''

QUESTION_TEMPLATE_01 = \
'''Extract the the following aspect of the game from the reviews. Output a paragraph with less than 200 words. The aspect is: '''

KEYWORD_TEMPLATE_02 = \
'''Extract the following aspects of the game from the reviews, and providwe a list of keywords, each of max length 5 words, for each aspect. The aspects are: {aspects}. Output a JSON with each of the aspects as key, and the list of keywords as the value. Only output the JSON. Do NOT output other text.

The context is wrapped by three consecutive apostrophes. The context is as follows:
\'\'\'
{context}
\'\'\'
'''

# gen_TLDR_per_review
TLDR_PER_REVIEW_TEMPLATE_01 = \
'''Consider all aspects in the context and provide a summary that describes the context in less than 50 words. Only output the summary. Do NOT output other text.

The context is wrapped by three consecutive apostrophes. The context is as follows:
\'\'\'
{context}
\'\'\'
'''
