"""One Year, One Body — Ep 1: You Have a Toothache in 1665 London.
SHOTS = [(shot_id, chapter, [(speaker, text) | ("PAUSE", seconds)])]
Speakers: N (narrator, bm_george), TOM, BARBER, AGNES, HOLLIS. Spoken numbers as words (TTS); subs.py turns them into digits.
"""
VOICES = {"N": ("bm_george", 0.92), "TOM": ("bm_fable", 1.04), "BARBER": ("bm_lewis", 0.9),
          "AGNES": ("bf_emma", 0.98), "HOLLIS": ("bm_daniel", 0.95)}

SHOTS = [
    # ---------- CH1 HOOK ----------
    ("s01_attic", 1, [("PAUSE", 0.6), ("N", "London. August, sixteen sixty-five. Three in the morning."), ("N", "You haven't slept for two nights.")]),
    ("s02_window", 1, [("N", "Outside, a bell is ringing for the dead. Half the city is running from the plague.")]),
    ("s03_situp", 1, [("PAUSE", 0.3), ("TOM", "Ow. Ow. Ow. Ow."), ("PAUSE", 0.2), ("N", "And you... have a toothache."), ("PAUSE", 2.4)]),
    ("s04_promise", 1, [("N", "Over the next three days, you will try everything London has to offer."), ("N", "Every cure will be worse than the last. And one of them could kill you.")]),
    ("s05_title", 1, [("PAUSE", 4.2)]),
    # ---------- CH2 THE WORLD ----------
    ("s06_map", 2, [("N", "You are Tom. Fifteen years old, and two years into a seven-year apprenticeship with a baker, inside the old city walls.")]),
    ("s07_bakery", 2, [("N", "Your day starts at four, in the heat of the oven. Whatever happens, London still needs bread."), ("HOLLIS", "Faster, boy! Bread doesn't bake itself!")]),
    ("s07b_apprentice", 2, [("N", "As an apprentice, you are not paid. You get a bed under the roof, your meals, and the right to be shouted at."), ("N", "Survive seven years, and you could become a baker yourself.")]),
    ("s08_crust", 2, [("N", "Your trouble began with a crust. One bite, on the left side,"), ("PAUSE", 0.2), ("N", "and a bolt of pain shot straight up into your eye.")]),
    ("s09_flinch", 2, [("TOM", "Aaagh!"), ("HOLLIS", "Quiet! You'll wake the whole street."), ("PAUSE", 0.4)]),
    ("s10_street", 2, [("N", "And this is a very bad summer to be ill."), ("N", "When plague is found in a house, the house is shut up for forty days, with everyone still inside.")]),
    ("s11_door", 2, [("N", "A red cross is painted on the door, with the words: Lord have mercy upon us."), ("N", "A watchman stands outside, day and night, to make sure nobody leaves.")]),
    ("s11b_cart", 2, [("N", "By August, thousands of Londoners are dying every week, and the numbers are still climbing. The king and his court have already left town.")]),
    ("s12_bill", 2, [("N", "Every week, the parish clerks print a Bill of Mortality: who died, and of what."), ("N", "Run your finger down the list. Plague. Fever. Consumption. And then, a word you really don't want to see.")]),
    ("s13_teeth", 2, [("PAUSE", 0.3), ("N", "Teeth."), ("PAUSE", 1.0), ("TOM", "...Teeth?"), ("PAUSE", 1.2)]),
    # ---------- CH3 THE WORM ----------
    ("s14_worm", 3, [("N", "Ask anyone what's wrong with you, and they'll give you the same answer. A worm."), ("N", "For thousands of years, people believed toothache was caused by a tiny worm, boring holes through your tooth.")]),
    ("s15_truth", 3, [("N", "There is no worm. A cavity has eaten down to the nerve, and bacteria are building a pocket of pus at the root."), ("N", "That's the swelling. And it is getting bigger.")]),
    ("s16_why", 3, [("N", "Your teeth never had much of a chance. Bread from stone mills carried grit that wore them down,"), ("N", "and sugar, once a rich man's treat, was getting cheaper every year. And toothbrushes, as we know them, won't reach England for another century.")]),
    # ---------- CH4 KITCHEN CURES ----------
    ("s17_agnes", 4, [("N", "Luckily, your master's wife has a cure for everything."), ("AGNES", "Let me see that face. Oh, Tom. That's a worm, that is.")]),
    ("s18_recipes", 4, [("N", "Households kept handwritten recipe books full of remedies, and toothache filled whole pages.")]),
    ("s19_clove", 4, [("AGNES", "Oil of cloves. Hold it on the tooth."), ("N", "Cure number one. Clove oil is expensive, and it burns."), ("N", "But for once, it actually helps. Cloves contain a natural painkiller that numbs the gum.")]),
    ("s20_happy", 4, [("TOM", "I can't feel my face!"), ("N", "For about an hour, you're a new man."), ("PAUSE", 0.6), ("N", "Then it wears off."), ("PAUSE", 1.0)]),
    ("s20b_back", 4, [("HOLLIS", "Stop moaning and knead, boy!"), ("TOM", "Yes, master."), ("N", "And the pain comes back, worse than before.")]),
    ("s21_root", 4, [("AGNES", "Then chew this. Pellitory of Spain."), ("N", "Cure number two. A hot, peppery root. You chew it until your mouth tingles, goes numb,"), ("N", "and floods with spit. Healers had praised it for toothache for centuries.")]),
    ("s22_drool", 4, [("TOM", "Ith it thuppothed to do thith?"), ("AGNES", "Yes."), ("PAUSE", 0.8)]),
    ("s23_henbane", 4, [("AGNES", "Right. Now we smoke the worm out."), ("N", "Cure number three. Henbane seeds, burned over a candle, the smoke funnelled into your mouth, so the worm comes crawling out.")]),
    ("s24_trick", 4, [("N", "Some tooth-drawers even dropped little white threads into a bowl of water afterwards. Look, worms!"), ("N", "It was a trick, as old as the worm itself.")]),
    ("s25_dizzy", 4, [("N", "And henbane is poisonous. Too much smoke brings dizziness, a racing heart, even visions."), ("N", "It can't kill a worm that doesn't exist. But it can certainly poison you."), ("TOM", "Why are there two of you?"), ("PAUSE", 0.6)]),
    ("s26_night3", 4, [("N", "By the third night, your cheek is swollen like a bread roll. You're shivering, and you know what has to happen."), ("N", "The tooth has to come out.")]),
    # ---------- CH5 WHO PULLS TEETH ----------
    ("s27_options", 5, [("N", "But who pulls teeth in sixteen sixty-five? In a normal year, you'd find a tooth-drawer at a fair, pulling teeth on a stage, with a drum to cover the screaming."), ("N", "This summer, a crowd is the last place you want to be.")]),
    ("s28_physician", 5, [("N", "A university physician would cost far more than you earn. And many of them have already left the city, following their rich patients to the countryside.")]),
    ("s29_barberopt", 5, [("N", "Which leaves the barber-surgeon. The same man who shaves your master, lets his blood, and pulls his teeth.")]),
    ("s30_route", 5, [("N", "So at first light, you walk across a city that is slowly emptying.")]),
    ("s31_nightstreet", 5, [("N", "Past shut-up doors. Past the cart that only comes out at night."), ("N", "Past people pressing vinegar-soaked sponges to their faces, because everyone knows that disease travels on bad air.")]),
    ("s32_tobacco", 5, [("N", "Some swore by tobacco smoke. At Eton school, according to a later account, boys were even whipped for not smoking."), ("PAUSE", 2.2)]),
    # ---------- CH6 THE BARBER-SURGEON ----------
    ("s33_shopfront", 6, [("N", "The barber-surgeon's shop is easy to find. He hangs the teeth he's pulled in the window."), ("N", "It's an advertisement.")]),
    ("s34_greet", 6, [("BARBER", "Toothache, is it? Sit down, lad. Sit."), ("PAUSE", 0.4), ("N", "A chair. A basin. A candle. And a row of tools you try very hard not to look at.")]),
    ("s35_tools", 6, [("N", "Iron forceps. A hooked lever called a pelican, named for the bird's beak. No anaesthetic. Nothing to numb you."), ("N", "At best, a cup of strong drink, and somebody holding your head.")]),
    ("s35b_company", 6, [("N", "Barber-surgeons had their own company, with a grand hall in the city, where they were allowed to cut open the bodies of hanged criminals, to learn anatomy."), ("TOM", "...Lovely.")]),
    ("s36_drink", 6, [("BARBER", "Drink this. All of it."), ("PAUSE", 1.6), ("TOM", "That's horrible."), ("BARBER", "That's the point.")]),
    ("s37_openwide", 6, [("BARBER", "Now. Open wide."), ("PAUSE", 0.5), ("BARBER", "This won't hurt..."), ("PAUSE", 1.3), ("BARBER", "much.")]),
    ("s38_regret", 6, [("PAUSE", 2.6)]),
    ("s39_pull", 6, [("N", "He braces his knee against the chair. Rocks the tooth once."), ("PAUSE", 0.4), ("N", "Twice."), ("PAUSE", 0.9)]),
    ("s40_pop", 6, [("PAUSE", 2.8), ("N", "And it's out.")]),
    ("s41_trophy", 6, [("BARBER", "Ha! A beauty. That one goes in the window."), ("N", "It took about three seconds. You'll remember them for the rest of your life.")]),
    # ---------- CH7 WHAT REALLY HAPPENED ----------
    ("s42_generalbill", 7, [("N", "In December, the city printed its bill for the whole year."), ("N", "Plague: sixty-eight thousand, five hundred and ninety-six deaths. Historians think the real number was closer to one hundred thousand.")]),
    ("s43_teethcount", 7, [("N", "And under one short word, Teeth, two thousand, six hundred and fourteen.")]),
    ("s44_babies", 7, [("N", "Many of them were probably babies who died while teething. The label hid a lot of guesswork."), ("N", "The causes were decided by searchers, usually poor old women, paid for each body, with no medical training at all.")]),
    ("s45_infection", 7, [("N", "But some were people like you. A rotten tooth, an infection that spread into the jaw, then the blood. Before antibiotics, that could kill in days.")]),
    ("s46_verdict", 7, [("N", "The barber's pliers were brutal. They could break a jaw, or leave an infection behind."), ("N", "But for a tooth like yours, they were the only cure in London that actually worked.")]),
    ("s46b_gap", 7, [("N", "And the hole it left would stay a hole. No fillings, no crowns, no implants."), ("N", "If you were rich, you could buy false teeth carved from ivory or bone. You are not rich.")]),
    # ---------- CH8 ENDING ----------
    ("s47_recover", 8, [("N", "The swelling goes down in a week. You go back to the ovens, chewing on the right side. By winter, the plague begins to fade.")]),
    ("s48_fire", 8, [("N", "You survived the plague year, with one tooth fewer. Now you just have to survive the next one."), ("N", "Because in September, sixteen sixty-six, a fire will start in a baker's shop, on Pudding Lane.")]),
    ("s49_question", 8, [("N", "So, tell me. Clove oil, henbane smoke, or the barber's pliers?"), ("N", "Would you have survived sixteen sixty-five?"), ("TOM", "Never. Eating. Crust. Again."), ("PAUSE", 0.8)]),
    ("s50_end", 8, [("PAUSE", 12.0)]),
]

CHAPTERS = {1: "A Toothache in the Plague Year", 2: "Tom's London", 3: "The Worm", 4: "Kitchen Cures",
            5: "Who Pulls Teeth in 1665?", 6: "The Barber-Surgeon", 7: "What Really Happened", 8: "The Next Year"}
