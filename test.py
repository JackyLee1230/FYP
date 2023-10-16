
import re
s = '''<strong>PlanetSide 2</strong> is a free-to-play, massively multiplayer online first person shooter (MMOFPS).  
                               <br><br>Empires and their soldiers battle in 
                               an all-out planetary war on a scale never 
                               before seen, in stunning, breathtaking detail. 
                               PlanetSide 2 battles persist and the war never 
                               ends, offering constant challenges of 
                               individual skill, team grit, and empire-wide 
                               coordination. Take up arms and drop into 
                               intense infantry, vehicle, and air combat. 
                               <br><br>Players come together in enormous 
                               battles across four massive continents to win 
                               control of critical territories, gaining key 
                               resources for their empire. With an extensive 
                               skill tree and class-based system, players can 
                               customize their soldier, weapons, and vehicles 
                               to match their playstyle and meet the needs of 
                               their squads, outfits, and empires. In the 
                               world of PlanetSide 2, every soldier makes a 
                               difference.<br><br><img 
                               src="https://cdn.akamai.steamstatic.com/steam/apps/1083500/extras/PS2_HZTL_Logo_Blacksmall.jpg?t=1623778069" 
                               /> <br><br><ul class="bb_ul"><li>\t
                               <strong>THREE WARRING EMPIRES:</strong> 
                               Players will choose to align with one of three 
                               empires: the militaristic, authoritarian 
                               Terran Republic; the rebellious, 
                               freedom-fighting New Conglomerate; or the 
                               technocratic, alien-influenced Vanu 
                               Sovereignty. Each empire has access to 
                               empire-specific weapons, attachments, 
                               vehicles, abilities, and more.<br></li><li>\t
                               <strong>MASSIVE WARFARE:</strong> Battles take 
                               place not between dozens of soldiers, but 
                               between hundreds. They fight on foot. They 
                               pile into vehicles. They take to the skies in 
                               devastating aircraft. Each battleground holds 
                               valuable resources and strategic positions, 
                               and the empire that can conquer and hold these 
                               territories will be rewarded with the 
                               resources and the means to achieve victory.  
                               <br></li><li>\t<strong>ENORMOUS MAPS:</strong> 
                               PlanetSide 2 features four incredible and 
                               diverse continent maps with dozens of square 
                               kilometers of seamless gameplay space, every 
                               inch of which is hand-crafted and contestable. 
                               Whether in open fields, barren desert, in 
                               armed and armored bases, or in the skies, 
                               victory will rely on knowing your 
                               surroundings. <br></li><li>\t
                               <strong>PERSISTENCE THAT PAYS:</strong> In 
                               PlanetSide 2 the war isn’t won by a single 
                               base capture. The core gameplay of PlanetSide 
                               2 is about holding crucial territories and 
                               controlling resources. Working strategically 
                               as a team to secure tactical positions has 
                               long-lasting effects that can shift the tide 
                               of battle.<br></li><li>\t<strong>CLASS-BASED 
                               COMBAT:</strong> Players can build their 
                               "soldier to match wants and their allies "
                               needs. Six distinct classes provide a wealth 
                               of squad options and combat tactics. Grow your 
                               soldier over time as you master each combat 
                               role, weapon, and vehicle, laterally unlocking 
                               hundreds of weapons, attachments, gear, 
                               skills, vehicles, and 
                               more.<br><br><strong>Heavy Assault:</strong> 
                               Rush into the battle guns blazing. You are the 
                               dedicated foot soldier of 
                               Auraxis.<br><br><strong>Light 
                               Assault:</strong> Go where the Heavies can’t 
                               with your short-burst jetpack. Pick a high 
                               spot, throw a grenade, and out maneuver your 
                               foes!<br><br><strong>Combat Medic:</strong> 
                               Keep your fellow soldiers alive and in 
                               fighting shape. You are the beating heart of 
                               any squad. 
                               <br><br><strong>Infiltrator:</strong> Stay 
                               silent. Stay invisible. You are death from the 
                               shadows, whether with a knife from behind or a 
                               "single shot from a snipers nest. You are the "
                               "enemys constant fear. "
                               <br><br><strong>Engineer: </strong> Deploy 
                               crucial equipment. Resupply your allies. Fix 
                               the thing, then fix it again. You keep the 
                               machines running, the tanks firing, and the 
                               war effort moving forward. 
                               <br><br><strong>MAX:</strong> Step into your 
                               Mechanized Assault Exo-Suit (MAX). Cannons for 
                               hands, armor for flesh, and a disposition to 
                               match, you are a walking mass of nigh 
                               unstoppable death.</li></ul><br><ul 
                               class="bb_ul"><li>\t<strong>OUTFIT 
                               TEAMWORK:</strong> Join or form your own 
                               Outfit, a like-minded group of soldiers who 
                               train together day in and day out. Whether a 
                               small rapid response team or a massive clan, 
                               "Outfits are vital to each empires strategic "
                               organization. <br></li><li>\t<strong>VEHICLES 
                               &amp; WEAPONS:</strong> Train and equip your 
                               solider how you want, with a huge array of 
                               weapons and vehicles which can be extensively 
                               customized by preference or purpose, using 
                               attachments, upgrades, and add-ons earned in 
                               the war.  <br></li><li>\t<strong>PLAY FOR 
                               FREE:</strong> PlanetSide 2 is free to play 
                               with optional in-game purchases.  <br><br><img 
                               src="https://cdn.akamai.steamstatic.com/steam/apps/1083500/extras/hossin8_small.jpg?t=1623778069" 
                               /></li></ul>'''
                               
pattern = re.compile('<.*?/>')
print(re.sub(pattern, '',s))