"""You Were There — Ep 1: You Find the Ghost Ship (Mary Celeste, 1872).
Told through Oliver Deveau, first mate of the Dei Gratia. Dialogue is dramatized; events follow the 1873 Gibraltar
salvage-hearing record as summarised by RMG, Britannica, maryceleste.net and Wikipedia's sourced article.
SHOTS = [(shot_id, chapter, [(speaker, text) | ("PAUSE", seconds)])]
"""
VOICES = {"N": ("bm_george", 0.92), "DEVEAU": ("am_michael", 1.0), "WRIGHT": ("am_puck", 1.04),
          "MOREHOUSE": ("am_onyx", 0.92), "FLOOD": ("bm_lewis", 0.95)}

SHOTS = [
    # ---------- CH1 HOOK ----------
    ("s01_sail", 1, [("PAUSE", 0.4), ("WRIGHT", "Sail! Sail off the bow!"), ("N", "December the fourth, eighteen seventy-two. The open Atlantic, somewhere between the Azores and Portugal.")]),
    ("s02_scope", 1, [("N", "You raise your telescope. A two-masted ship, about six miles off. And something is wrong with the way she moves.")]),
    ("s03_drift", 1, [("N", "Her sails hang in rags. She swings one way, then the other, as if nobody is at the wheel.")]),
    ("s04_hail", 1, [("MOREHOUSE", "Ahoy there! Do you need help?"), ("PAUSE", 1.3), ("N", "No answer."), ("PAUSE", 0.5), ("MOREHOUSE", "Mister Deveau. Take a boat. Go and look.")]),
    ("s05_aye", 1, [("DEVEAU", "Aye, Captain."), ("PAUSE", 2.6)]),
    ("s06_promise", 1, [("N", "In a few minutes, you will climb aboard one of the most famous mysteries of the sea."), ("N", "Ten people. Gone. And more than a century and a half later, nobody can say for certain where they went.")]),
    ("s07_title", 1, [("PAUSE", 4.4)]),
    # ---------- CH2 THE DEI GRATIA ----------
    ("s08_map", 2, [("N", "You are Oliver Deveau, a sailor from Nova Scotia, and first mate of a small British brigantine, the Dei Gratia. Like the ship ahead of you, you sailed from New York in November.")]),
    ("s09_deck", 2, [("N", "Eight men on a wooden ship, in the North Atlantic, in winter. You haven't been properly dry for weeks."), ("WRIGHT", "Lovely weather, sir."), ("DEVEAU", "Shut up, Wright.")]),
    ("s09b_watch", 2, [("N", "Your days are counted in four-hour watches. You sleep in a damp bunk, and eat hard biscuit and salt meat.")]),
    ("s10_hull", 2, [("N", "But the ship ahead of you is no wreck. She floats high. Her hull looks sound."), ("N", "Ships like that don't get left behind. Not by choice.")]),
    ("s11_row", 2, [("N", "So you and the second mate, John Wright, row across through a heavy swell."), ("WRIGHT", "If there's nobody aboard, who's been sailing her?"), ("DEVEAU", "The wind.")]),
    ("s12_climb", 2, [("N", "You grab her side, and pull yourself up onto the deck of the Mary Celeste.")]),
    # ---------- CH3 NOBODY HOME ----------
    ("s13_empty", 3, [("DEVEAU", "Hello?"), ("PAUSE", 1.4), ("N", "Nobody."), ("PAUSE", 0.4), ("N", "The deck is empty. Ropes hang loose over the side, trailing in the sea.")]),
    ("s13b_listen", 3, [("N", "The only sounds are creaking timber, slapping canvas, and the sea."), ("PAUSE", 0.8)]),
    ("s14_hatch", 3, [("N", "Two hatches stand open, their covers lying on the deck. The compass housing has been knocked out of place, and its glass is broken.")]),
    ("s15_pump", 3, [("N", "One of the two pumps has been partly taken apart. And next to it, someone has dropped a sounding rod: a stick on a line, for measuring the water in the hold.")]),
    ("s16_sound", 3, [("N", "You sound the hold yourself. About three and a half feet of water. That's a lot. But it isn't nearly enough to sink her."), ("WRIGHT", "So why leave?")]),
    ("s17_boat", 3, [("N", "Then you notice what isn't there. The ship's only boat, which normally sits across the main hatch, is gone."), ("PAUSE", 0.8)]),
    ("s18_galley", 3, [("N", "In the galley, the stove has been knocked out of place. But the pots are washed and put away. There is plenty of food, and plenty of fresh water.")]),
    # ---------- CH4 THE CAPTAIN'S CABIN ----------
    ("s19_below", 4, [("N", "You go below, to the captain's cabin. It's damp, and dark, and the water has got in here too.")]),
    ("s20_things", 4, [("N", "Clothes. Books. Personal things, left behind. Whoever lived here didn't pack.")]),
    ("s21_family", 4, [("N", "The captain, Benjamin Briggs, had brought his family. His wife, Sarah. Their daughter, Sophia, two years old.")]),
    ("s21b_crew", 4, [("N", "And seven crew: a first and second mate, a cook, and four seamen, two of them brothers.")]),
    ("s22_newyork", 4, [("N", "They left New York on the seventh of November, with seven crew, and one thousand, seven hundred and one barrels of alcohol, bound for Genoa.")]),
    ("s23_sword", 4, [("N", "Under the bed, you find a sword in its scabbard."), ("WRIGHT", "Is that... blood?"), ("PAUSE", 0.6), ("DEVEAU", "Or rust."), ("PAUSE", 0.6)]),
    ("s24_missing", 4, [("N", "And some things are missing. Most of the ship's papers. The captain's navigation instruments. Whoever left was in a hurry, but took what they'd need to find land.")]),
    ("s25_log", 4, [("N", "In the mate's cabin, you find the log. The last entry is from the twenty-fifth of November, within sight of the island of Santa Maria, in the Azores."), ("N", "That was nine days ago. Since then, the ship has sailed herself for hundreds of miles.")]),
    ("s26_creep", 4, [("WRIGHT", "Sir, I don't like this ship."), ("DEVEAU", "Neither do I."), ("PAUSE", 0.8)]),
    # ---------- CH5 GIBRALTAR ----------
    ("s27_prize", 5, [("N", "But an empty ship is also a prize. Bring her safely into port, and the law of the sea says you can claim a salvage reward."), ("MOREHOUSE", "Take two men. Sail her to Gibraltar.")]),
    ("s28_storm", 5, [("N", "So you do. Three men, on a ship built for eight, through rough winter seas, for nine days."), ("N", "You barely sleep.")]),
    ("s29_arrive", 5, [("N", "You reach Gibraltar on the thirteenth of December. You expect a reward."), ("PAUSE", 0.3), ("N", "You get an investigation.")]),
    ("s29b_testimony", 5, [("N", "In court, you tell your story again, and again. And that is why we know so much today: almost everything we know about the empty ship comes from your testimony, and your crewmates'.")]),
    ("s30_flood", 5, [("N", "Meet Frederick Solly-Flood, the Attorney General of Gibraltar. He has a theory."), ("FLOOD", "The crew got at the alcohol, murdered the captain and his family, and escaped in the boat!")]),
    ("s31_accuse", 5, [("N", "And he's suspicious of you, too. Perhaps you and your captain planned the whole thing, to collect the reward."), ("DEVEAU", "We found her. That's all."), ("FLOOD", "Hmm.")]),
    ("s32_evidence", 5, [("N", "His evidence? Marks cut into the bow. Stains on the sword, and on a rail."), ("N", "But a doctor tested the stains. They were not blood. And other experts said the sea could explain the marks.")]),
    ("s33_award", 5, [("N", "After nearly four months, the court awarded you and your crewmates one thousand seven hundred pounds. About a fifth of what ship and cargo were worth."), ("N", "Nobody was ever charged with anything.")]),
    # ---------- CH6 THE LEGEND ----------
    ("s34_doyle", 6, [("N", "Twelve years later, a young ship's doctor wrote a story about the ghost ship. His name was Arthur Conan Doyle.")]),
    ("s35_myths", 6, [("N", "He renamed her the Marie Celeste and invented a survivor. Later retellings went further: warm cups of tea on the table, a half-eaten breakfast."), ("N", "None of that was in your testimony. There was no meal on the table at all.")]),
    ("s36_fiction", 6, [("N", "Ever since, the fiction has been easier to remember than the facts."), ("PAUSE", 1.0)]),
    # ---------- CH7 WHAT HAPPENED? ----------
    ("s37_known", 7, [("N", "So what do we actually know? Ten people left a sound ship, in one small boat, apparently in a hurry, and took the papers and instruments with them.")]),
    ("s38_pirates", 7, [("N", "Pirates? Nothing of value was taken. Mutiny? There was no sign of a fight.")]),
    ("s39_barrels", 7, [("N", "But here's a clue. When the cargo was unloaded in Genoa, nine of the barrels were empty.")]),
    ("s40_vapour", 7, [("N", "Alcohol seeping from those barrels could have filled the closed hold with vapour. In twenty twenty-six, chemists from the University of Manchester tested the idea on a scale model, for a television documentary."), ("N", "Cold, the vapour wouldn't light. Warmed to the temperature of the seas around the Azores, a single spark set off a violent flash.")]),
    ("s41_flash", 7, [("N", "Twenty years earlier, a test at University College London showed that a blast like this can blow the hatches open, and leave almost no scorch marks."), ("N", "Terrifying enough to make a captain order everyone into the boat, and wait at a safe distance, perhaps at the end of a rope.")]),
    ("s42_rope", 7, [("N", "And if that rope parted, in a rising wind,"), ("PAUSE", 1.2), ("N", "the ship would sail on without them.")]),
    ("s43_other", 7, [("N", "Others blame a faulty pump that made the leak look worse, or a chronometer error that put land closer than it really was. None of it has been proven.")]),
    ("s43b_spout", 7, [("N", "Another idea is a waterspout, a tornado over the sea, that could have thrown water aboard and made her seem to be sinking. Or an undersea earthquake, shaking the hull.")]),
    ("s44_unknown", 7, [("N", "And the most important part is still unknown. Where the boat went, and what happened to the ten people in it. No trace of them was ever found."), ("PAUSE", 1.0)]),
    # ---------- CH8 ENDING ----------
    ("s45_fate", 8, [("N", "The Mary Celeste sailed on for twelve more years, with a reputation as an unlucky ship. In eighteen eighty-five, her last captain ran her onto a reef off Haiti, on purpose, for the insurance money."), ("N", "Even her wreck was a crime.")]),
    ("s45b_cussler", 8, [("N", "In two thousand and one, an expedition led by the novelist Clive Cussler announced it had found her wreck. But tree rings showed the wood came from trees still growing in the eighteen nineties. The search goes on.")]),
    ("s46_after", 8, [("N", "And you? You go back to sea. But you never forget that empty deck, and the ropes trailing in the water.")]),
    ("s47_question", 8, [("N", "So, tell me. If you had been the first to climb aboard, what would you think happened?"), ("N", "Exploding fumes? A bad pump? Or something else?"), ("WRIGHT", "I'd have stayed in the boat."), ("PAUSE", 0.8)]),
    ("s48_end", 8, [("PAUSE", 12.0)]),
]

CHAPTERS = {1: "A Ship With No One Aboard", 2: "The Dei Gratia", 3: "Nobody Home", 4: "The Captain's Cabin",
            5: "Gibraltar", 6: "The Legend", 7: "What Really Happened?", 8: "The Empty Deck"}
