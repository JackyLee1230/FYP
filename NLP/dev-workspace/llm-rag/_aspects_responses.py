# we provide 10 generated aspects response from different reviews
# instead of using the response from different models, we believed this is more controlled and thus better evaluate the performance of the models
# the aspects response are first generated using mixtral8x7b and then manually reviewed and corrected to ensure the quality of the response

# from _sample_reviews.sample_01
aspects_response_01 = {
    'Gameplay': 'The game has issues with performance, running between 25 - 35 fps even on low settings, which is disappointing for a $70 title.', 
    'Narrative': 'NA', 
    'Accessibility': 'NA', 
    'Sound': 'Sound details are not mentioned in the reviews.', 
    'Graphics & Art Design': "The game has an odd appearance even with max settings, and disabling up-scaling doesn't help.", 
    'Performance': 'The game is poorly optimized, running between 25 - 35 fps on both low and ultra settings, which is not acceptable for a $70 title.', 
    'Bug': 'NA', 
    'Suggestion': 'should run at 50 - 60 fps on the lowest settings. Try to optimize the settings to get better frames.', 
    'Price': '$70', 
    'Overall': 'Trying to optimize settings to get better frames has been time-consuming, and a refund is not possible due to hours invested in the game.'
}

# from _sample_reviews.sample_03
aspects_response_02 = {
    'Gameplay': 'The game features good graphics, stealth gameplay, and a variety of weapons. Exploring Paris and completing coop missions are possible gameplay elements. Customization is also a focus.', 
    'Narrative': 'The story isn\'t great either but the latest games of the same series did not have very good stories', 
    'Accessibility': 'The game requires a good PC and may have some bugs. It may not be easy to run on lower-end systems.', 
    'Sound': 'NA', 
    'Graphics & Art Design': 'The graphics in this game are really good. Paris is huge and you have a lot of things you can do.', 
    'Performance': 'You need a pretty good PC to run the game. There are some bugs that can affect the gameplay.', 
    'Bug': 'Yes, there are some bugs and the reviewer has experienced a few of them.', 
    'Suggestion': 'NA', 
    'Price': 'NA', 
    'Overall': "The reviewer thinks the game isn't bad, praising the graphics, stealth mechanics, and customization, but acknowledges the need for a good PC, some bugs, and a so-so story."
}

# from _sample_reviews.sample_05
aspects_response_03 = {
    'Gameplay': 'Not mentioned in the review.', 
    'Narrative': 'Not mentioned in the review.', 
    'Accessibility': 'The game was not accessible due to issues with the Social Club app, which caused the game to become permanently broken.', 
    'Sound': 'No information provided.', 
    'Graphics & Art Design': "The review does not provide information about the game's graphics and art design.", 
    'Performance': "The game's performance is negatively impacted by issues with the Social Club app, resulting in crashes and the game becoming 'permanently broken.'", 
    'Bug': 'Game became permanently broken after attempting to fix Social Club app issue, resulting in crashes or error messages.', 
    'Suggestion': 'NA', 
    'Price': 'NA', 
    'Overall': 'Enjoyed the game while it worked, but ultimately left with a negative experience due to the unresolved bug.'}

# from _sample_reviews.sample_11
aspects_response_04 = {
    'Gameplay': 'The random algorithm for shuffling the deck can lead to inconsistent mana distribution. Allowing specific card buying for coins could improve card acquisition.', 
    'Narrative': 'NA', 
    'Accessibility': 'NA', 
    'Sound': 'NA', 
    'Graphics & Art Design': 'NA', 
    'Performance': 'NA', 
    'Bug': 'Potential bug in random algorithm for shuffling the deck, resulting in inconsistent mana distribution. No other bugs mentioned.', 
    'Suggestion': 'The random algorithm for shuffling the deck could be improved. Also Implement specific card buying for coins.', 
    'Price': 'NA', 
    'Overall': 'The game is overall good despite the mentioned issues.'}

# from _sample_reviews.middle_review_01
aspects_response_05 = {
    'Gameplay': 'Gameplay is too short compared to previous title of the same series. Great gameplay design of venom and cloaking abilities.', 
    'Narrative': '', 
    'Accessibility': 'Run really well on Steam Deck (finished it on deck).', 
    'Sound': 'No specific mention of sound in the reviews.', 
    'Graphics & Art Design': "Costumes are downright sick, better than the Spiderman ones' imo.",
    'Performance': 'Ran really well on Steam Deck (finished it on deck).', 
    'Bug': 'NA', 
    'Suggestion': 'This game could benefit from more gameplay content, enemies, and bosses.', 
    'Price': "The original price isn't worth it, but consider getting it on sale.", 
    'Overall': 'This game is worth playing, with great venom and cloaking abilities and sick costumes. However, it is too short and could use more variety in enemies and bosses.'}

# from _sample_reviews.long_review_04
aspects_response_06 = {
    'Gameplay': 'While sharing the same core gameplay as the first game, there are fewer gadgets and they feel less inspired. Miles is squishier than Peter, but camouflage and venom attacks can be overpowered. Gameplay is enjoyable but has some issues such as fewer enemy take-down variations and several bugs.', 
    'Narrative': 'The story is generic and the story villain is barely a footnote. Some may enjoy the challenge of Miles being squishier than Peter.', 
    'Accessibility': 'The game offers great accessibility options, including action shortcuts and disabling button mashing QTEs.', 
    'Sound': 'Great soundtrack.', 
    'Graphics & Art Design': 'NA', 
    'Performance': 'Great port with smooth performance for the most part, but several bugs and visual glitches were reported.', 
    'Bug': 'Several bugs and visual glitches, with some being carried over from the first game.',
    'Suggestion': 'NA', 
    'Price': "Too short to be worth the price; has only around 1/3 the content of the first game. Definitely only get it at at least 25% off unless you're impatient.", 
    'Overall': "While I enjoyed playing it, this game is inferior to the first in almost every way. If you enjoyed the first game, it's worth the play but wait for a sale."}

# from _sample_reviews.sample_w_09
aspects_response_07 = {
    'Gameplay': 'The game has several bugs, bad collision detection. Enemies that can hear tiny noise even on higher difficulty settings.', 
    'Narrative': 'NA', 
    'Accessibility': 'NA', 
    'Sound': 'NA', 
    'Graphics & Art Design': 'NA', 
    'Performance': 'The game has several bugs and poor collision detection, making it difficult to play, especially on higher difficulty settings.', 
    'Bug': 'Even for this price its bad. Too many bugs, bad collision detection and, on higher difficulty settings, enemies can hear the smallest noise...', 
    'Suggestion': 'NA', 
    'Price': 'NA', 
    'Overall': 'Poor gameplay makes this game bad even for this price.'}

# from _sample_reviews.sample_02
# the hallunciation one
# aspects_response_08 = {
#     'Gameplay': 'NA', 
#     'Narrative': 'The game has a unique and engaging storyline.', 
#     'Accessibility': 'NA', 
#     'Sound': "The sound design is impressive, with a haunting soundtrack that adds to the game's atmosphere.", 
#     'Graphics & Art Design': 'The graphics and art design are stunning, with detailed environments and character models that bring the game to life.', 
#     'Performance': 'The game runs smoothly with minimal lag or framerate issues, providing a seamless gaming experience.', 
#     'Bug': 'NA', 'Suggestion': 'NA', 'Price': 'NA', 
#     'Overall': 'Enjoyable game with good replayability.'
# }
# after manual reading
aspects_response_08 = {
    'Gameplay': 'NA', 
    'Narrative': 'NA', 
    'Accessibility': 'NA', 
    'Sound': "NA", 
    'Graphics & Art Design': 'NA', 
    'Performance': 'NA', 
    'Bug': 'NA', 'Suggestion': 'NA', 'Price': 'NA', 
    'Overall': 'Good game.'
}

# from _sample_reviews.sample_w_11
aspects_response_09 = {
    'Gameplay': 'The game combines features from previous Elder Scrolls games with MMO mechanics for a smooth experience', 
    'Narrative': 'NA', 
    'Accessibility': 'Not mentioned in the review', 
    'Sound': '', 
    'Graphics & Art Design': '', 
    'Performance': '', 
    'Bug': 'NA', 
    'Suggestion': 'NA', 
    'Price': "NA", 
    'Overall': 'This MMO is a must-play for Elder Scrolls fans, with smooth gameplay and immersive features.'}

# from _sample_reviews.critic_review_01
aspects_response_10 = {
    'Gameplay': 'The gameplay in Cyberpunk 2077 is a joy, offering players a variety of ways to approach different situations, from sneaky sniper tactics to all-out assaults.', 
    'Narrative': 'The narrative in Cyberpunk 2077 is thought-provoking, with a compelling storyline and impactful player choices that make it memorable. Dialog options are available based on your character\'s background.', 
    'Accessibility': 'The game has issues with accessibility, being unplayable on some consoles and PCs. The reviewer faced crashes and glitches, but the experience may vary.', 
    'Sound': "The game's sound is well-done, with reviewers praising the music and voice acting as excellent. There were some minor glitches in the audio, but they did not detract significantly from the overall experience.", 
    'Graphics & Art Design': 'The Night City is full of distinct elements, from buildings and roads to the NPCs walking around. Details from residential and business area to rural areas are well designed.', 
    'Performance': 'Control was great on PC with PS4 controller. No trouble in movements and interacting with gameplay elements. Both keyword and controller fans can enjoy.', 
    'Bug': 'The game has been reported to be unplayably glitchy on consoles and some PCs.', 
    'Suggestion': "Reviewers suggest considering both the impact of the game's ecosystem and the personal gaming experience when evaluating certain elements of Cyberpunk 2077. They also highlight the importance of addressing issues with transgender representation in the game.", 
    'Price': 'NA', 
    'Overall': 'The game features great story, gameplay and characters. But the unplayably gitches may ruin the experience for some players. Fantastic game if your device can handle it.'
}

ALL_ASPECTS_RESPONSES = [
    aspects_response_01, 
    aspects_response_02, 
    aspects_response_03, 
    aspects_response_04, 
    aspects_response_05, 
    aspects_response_06, 
    aspects_response_07, 
    aspects_response_08, 
    aspects_response_09, 
    aspects_response_10
]