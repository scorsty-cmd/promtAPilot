"""You Were There — Ep 2: You're a Telegraph Operator in 1859. Then the Sky Catches Fire. (The Carrington Event)
Told through Ned Barlow, a FICTIONAL composite junior night operator in Boston. Events follow Carrington's and Hodgson's
reports (MNRAS 1859), Elias Loomis's compilation (American Journal of Science 1859-62), the Boston Evening Traveler's
printed Boston-Portland exchange of 2 Sept 1859, and modern summaries (Wikipedia, NOAA Research, History.com).
The Boston-Portland wire lines are the words printed in 1859; all other dialogue is dramatized.
SHOTS = [(shot_id, chapter, [(speaker, text) | ("PAUSE", seconds)])]
"""
VOICES = {"N": ("bm_george", 0.92), "NED": ("am_liam", 1.04), "PIKE": ("am_eric", 0.95),
          "PORTLAND": ("am_echo", 0.98), "KANE": ("af_sarah", 1.0), "MINER": ("am_fenrir", 0.96)}

SHOTS = [
    # ---------- CH1 HOOK ----------
    ("s01_spark", 1, [("PAUSE", 0.5), ("NED", "Ow! It bit me!"), ("N", "Boston. The small hours of the second of September, eighteen fifty-nine.")]),
    ("s02_window", 1, [("N", "Your telegraph is throwing sparks. And outside the window, the sky has turned the colour of blood."), ("PIKE", "Fire! Half the city's on fire!")]),
    ("s03_nofire", 1, [("N", "But there is no smoke. No flames. The whole sky is glowing, from one horizon to the other.")]),
    ("s04_promise", 1, [("N", "Before morning, your wire will spit fire, shock the men who touch it, and then do something nobody thought possible."), ("N", "It will carry messages with the battery unplugged. Powered by the sky.")]),
    ("s05_title", 1, [("PAUSE", 4.2)]),
    # ---------- CH2 THE NIGHT WIRE ----------
    ("s06_ned", 2, [("N", "You are Ned Barlow, seventeen years old, the junior night operator at a telegraph office in Boston."), ("N", "Ned is invented. But almost everything that happens to him tonight happened to real operators, all over the world.")]),
    ("s07_wire", 2, [("N", "In eighteen fifty-nine, the telegraph is the fastest thing on Earth. News that once took days on horseback now crosses hundreds of miles in minutes, as pulses of electric current on a single iron wire.")]),
    ("s08_how", 2, [("N", "A row of glass jars, a battery of acid and metal, pushes current down the line. You tap the key. Far away, a sounder clicks. Dots, and dashes.")]),
    ("s08b_ear", 2, [("N", "A good operator doesn't even need to look. You read the clicks by ear, the way other people hear words."), ("PIKE", "Barlow can hear a typo from across the room."), ("NED", "Only yours, sir.")]),
    ("s09_pike", 2, [("N", "Your boss is the night manager, Mister Pike."), ("PIKE", "Barlow! The Portland line. Anything?"), ("NED", "Just crackling, sir."), ("PIKE", "Well, make it stop.")]),
    ("s10_week", 2, [("N", "It has been a strange week. Four nights ago, the northern lights came much further south than usual, and telegraph lines across the country went haywire for hours."), ("N", "Then things calmed down.")]),
    ("s11_dull", 2, [("NED", "Nothing ever happens on the night wire."), ("PAUSE", 1.0)]),
    # ---------- CH3 THE MAN WHO WATCHED THE SUN ----------
    ("s12_redhill", 3, [("N", "But the trouble had started the morning before, three thousand miles away, at a private observatory in Redhill, just south of London.")]),
    ("s13_carr", 3, [("N", "Richard Carrington is an amateur astronomer, and every clear morning he draws sunspots. He never looks at the sun directly. His telescope throws its image onto a white screen.")]),
    ("s14_flash", 3, [("N", "Just before noon on the first of September, two beads of blinding white light burst out of a group of sunspots."), ("PAUSE", 0.8)]),
    ("s15_run", 3, [("N", "He runs off to fetch someone to witness it. He is back within sixty seconds. By then, it is already fading. In about five minutes, it is gone.")]),
    ("s16_kew", 3, [("N", "Across London, another observer, Richard Hodgson, saw the same flash. And at the Kew Observatory, the magnetic instruments gave a sudden jump.")]),
    ("s16b_report", 3, [("N", "Both men wrote up what they had seen for the Royal Astronomical Society. Their reports were printed side by side. It was the first solar flare anyone had ever recorded.")]),
    ("s17_cloud", 3, [("N", "Nobody knew it yet, but the sun had thrown a vast cloud of charged gas into space, straight at the Earth."), ("N", "A cloud like that usually takes days to arrive. This one crossed a hundred and fifty million kilometres in about seventeen and a half hours.")]),
    # ---------- CH4 RED SKY AT MIDNIGHT ----------
    ("s18_glow", 4, [("N", "And late that night, in Boston, it arrives.")]),
    ("s19_street", 4, [("KANE", "Fire! Somebody ring the bells!"), ("N", "Many Bostonians first thought the red sky was a great fire. Then the red turned to green, and spires of light shot up toward the top of the sky.")]),
    ("s20_crowd", 4, [("N", "People pour into the streets in their nightclothes, pointing, whispering, praying.")]),
    ("s20b_end", 4, [("KANE", "Ned, is it the end of the world?"), ("NED", "I don't think so, Mrs Kane."), ("PAUSE", 0.4), ("NED", "Probably not.")]),
    ("s21_paper", 4, [("PIKE", "Barlow. I can read the shipping news."), ("N", "The light is so strong that in the northeast, people said you could read a newspaper by it. In the middle of the night.")]),
    ("s22_miners", 4, [("N", "Far to the west, in the Rocky Mountains, gold miners woke up in the glow."), ("MINER", "Up, boys! It's morning!"), ("N", "And they started cooking breakfast.")]),
    ("s23_masons", 4, [("N", "In South Carolina, bricklayers reportedly got up and went to work, until they realised what time it was. In Virginia, birds started singing at one in the morning.")]),
    ("s24_south", 4, [("N", "The lights were seen as far south as Cuba, Jamaica and Hawaii. There were even reports from Colombia, close to the equator.")]),
    # ---------- CH5 THE WIRE CATCHES FIRE ----------
    ("s25_back", 5, [("N", "But you don't get to watch for long. Inside, your sounder is clattering all by itself, spelling nonsense.")]),
    ("s25b_ghost", 5, [("NED", "It's sending by itself! There's nobody on the other end!")]),
    ("s26_sparks", 5, [("N", "Sparks jump from the instruments. At some stations, the chemically treated paper that records the messages caught fire.")]),
    ("s27_shock", 5, [("NED", "Mister Pike! The line's alive!"), ("PIKE", "Don't touch it!"), ("PAUSE", 0.5), ("NED", "Too late.")]),
    ("s28_royce", 5, [("N", "In Washington, an operator named Frederick Royce was badly shocked when his forehead brushed a ground wire. A witness said an arc of fire jumped from his head to the equipment.")]),
    ("s29_pitt", 5, [("N", "In Pittsburgh, the manager reported streams of fire pouring from the circuits.")]),
    ("s30_dead", 5, [("N", "Across North America and Europe, telegraph lines failed. For hours, the fastest network on Earth was close to useless.")]),
    ("s31_why", 5, [("N", "What nobody in eighteen fifty-nine can know: the storm is shaking the Earth's magnetic field, and that drives electric currents into long wires."), ("N", "Your line is pulling power straight out of the sky.")]),
    # ---------- CH6 UNPLUG THE BATTERY ----------
    ("s32_morning", 6, [("N", "By the morning of the second of September, the Boston office still cannot send or receive properly. The current on the line keeps swelling and fading on its own.")]),
    ("s33_idea", 6, [("NED", "Sir, what if we take the battery off?"), ("PIKE", "Then nothing will work."), ("N", "Here is what the operators on the line between Boston and Portland, Maine, actually did that morning. These are their words, as a Boston newspaper printed them.")]),
    ("s34_ask", 6, [("NED", "Please cut off your battery entirely from the line for fifteen minutes."), ("PORTLAND", "Will do so. It is now disconnected.")]),
    ("s35_unplug", 6, [("NED", "Mine is disconnected, and we are working with the auroral current. How do you receive my writing?"), ("PORTLAND", "Better than with our batteries on. Current comes and goes gradually.")]),
    ("s36_pike", 6, [("PAUSE", 0.6), ("PIKE", "Well. I'll be."), ("PAUSE", 0.8)]),
    ("s37_goahead", 6, [("NED", "Suppose we work without batteries while we are affected by this trouble."), ("PORTLAND", "Very well. Shall I go ahead with business?"), ("NED", "Yes. Go ahead.")]),
    ("s38_hours", 6, [("N", "And they did. For about two hours, Boston and Portland traded messages powered by nothing but the storm.")]),
    ("s39_after", 6, [("N", "The next day, some lines were still being worked for a while by what people called atmospheric current alone.")]),
    ("s39b_secret", 6, [("PIKE", "Barlow. Not a word to head office that we unplugged it."), ("NED", "No, sir.")]),
    # ---------- CH7 WHAT WAS IT? ----------
    ("s40_swallow", 7, [("N", "Carrington suspected that the flash he saw and the storm were connected. But he was careful. One swallow, he wrote, does not make a summer.")]),
    ("s41_loomis", 7, [("N", "In America, the Yale professor Elias Loomis gathered reports from around the world, and published them in nine articles over the next three years.")]),
    ("s42_name", 7, [("N", "Today it is called the Carrington Event: the most intense geomagnetic storm in recorded history.")]),
    ("s42b_aurora", 7, [("N", "What you saw that night was the storm hitting the air itself. Charged particles slam into the upper atmosphere, and oxygen glows: green lower down, deep red higher up. In a storm this strong, the glow spreads far from the poles.")]),
    ("s43_today", 7, [("N", "In eighteen fifty-nine, the worst it could do was shock a few operators and burn some paper. Today we run almost everything on wires. Power grids. Satellites. Navigation. The internet.")]),
    ("s44_2012", 7, [("N", "In July twenty twelve, the sun threw out a storm thought to be of similar strength. It missed the Earth by about nine days.")]),
    ("s44b_quebec", 7, [("N", "And smaller storms have already done real damage. In March nineteen eighty-nine, one knocked out the power grid of Quebec, in Canada, leaving about six million people in the dark for around nine hours.")]),
    ("s45_cost", 7, [("N", "A twenty thirteen study for the insurer Lloyd's of London estimated that a storm like eighteen fifty-nine's could cost the United States alone between six hundred billion and two point six trillion dollars.")]),
    ("s46_2024", 7, [("N", "And in May twenty twenty-four, a far weaker storm brought the northern lights to skies far to the south, where most people had never seen them.")]),
    # ---------- CH8 ENDING ----------
    ("s47_home", 8, [("N", "And you? Your shift finally ends. You walk home through streets still full of people talking about the night the sky caught fire.")]),
    ("s48_question", 8, [("N", "So, tell me. If the sky turned red tonight, and every screen went dead, what would you do first?"), ("NED", "Unplug the battery."), ("PIKE", "Make coffee."), ("PAUSE", 0.8)]),
    ("s49_end", 8, [("PAUSE", 12.0)]),
]

CHAPTERS = {1: "The Sky Is On Fire", 2: "The Night Wire", 3: "The Man Who Watched the Sun", 4: "Red Sky at Midnight",
            5: "The Wire Catches Fire", 6: "Unplug the Battery", 7: "What Was It?", 8: "The Night the Sky Caught Fire"}
