"""Multi-voice dialogue for 'If You Were Spartacus's Best Friend' (73-71 BC).
"You" are a fictional gladiator; everything around you follows Plutarch (Crassus 8-11) and Appian (Civil Wars 1.116-120).
-> public/vo.wav, src/timeline.json, src/mouth.json"""
import json, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICES = {  # speaker: (voice, speed, lang)
    'NARR': ('am_michael', .97, 'en-us'),   # same narrator every episode
    'YOU': ('am_liam', 1.0, 'en-us'),
    'SPA': ('am_onyx', .93, 'en-us'),       # Spartacus
    'CRI': ('am_fenrir', .98, 'en-us'),     # Crixus
    'OEN': ('am_puck', 1.02, 'en-us'),      # Oenomaus
    'BAT': ('bm_fable', .94, 'en-gb'),      # Lentulus Batiatus, the lanista
    'DOC': ('bm_george', .98, 'en-gb'),     # the doctore (trainer)
    'HER': ('im_nicola', 1.0, 'en-us'),     # arena herald (Italian accent)
    'REF': ('am_eric', .98, 'en-us'),       # the referee (summa rudis)
    'OPP': ('am_adam', 1.0, 'en-us'),       # your first opponent, a Samnite
    'WIFE': ('af_kore', .95, 'en-us'),      # Spartacus's wife, a Thracian prophetess
    'GLA': ('bm_daniel', .98, 'en-gb'),     # praetor Claudius Glaber
    'CRA': ('bm_lewis', .92, 'en-gb'),      # Marcus Licinius Crassus
    'PIR': ('am_santa', .98, 'en-us'),      # Cilician pirate captain
}

# (key, chapter, speaker, text, pause after)
L = [
 # ---- COLD OPEN: the last morning ----
 ("o1", "open", "NARR", "Southern Italy. Seventy-one BC. The last morning of the slave war.", .3),
 ("o2", "open", "YOU", "Spartacus! What are you doing? That's your horse!", .25),
 ("o3", "open", "SPA", "If we win today, brother, I'll have a thousand Roman horses.", .25),
 ("o4", "open", "YOU", "And if we lose?", .3),
 ("o5", "open", "SPA", "Then I won't need one.", .45),
 ("o6", "open", "NARR", "Across the valley, eight Roman legions are forming lines. They're led by the richest man in Rome.", .25),
 ("o7", "open", "YOU", "Two years ago we were slaves in a gladiator school. Look at us now.", .25),
 ("o8", "open", "SPA", "Look at them. They're afraid of us. Remember that.", .35),
 ("o9", "open", "NARR", "You are a gladiator. You are Spartacus's closest friend. And you were there from the very first night. To see how it began, go back two years.", .9),

 # ---- THE SCHOOL OF BATIATUS ----
 ("l1", "ludus", "NARR", "Capua, seventy-three BC. One of the gladiator schools in this city belongs to a man named Lentulus Batiatus.", .25),
 ("l2", "ludus", "BAT", "Teeth. Shoulders. Turn around. Hm. This one is strong. Put him with the Thracian.", .25),
 ("l3", "ludus", "YOU", "I'm not a slave! I was a farmer. Pirates took me off a ship!", .25),
 ("l4", "ludus", "BAT", "And now you belong to me. Swear the oath, boy.", .3),
 ("l5", "ludus", "DOC", "Every man here swore it. To be burned, chained, beaten, and killed by the sword. Say it!", .3),
 ("l6", "ludus", "NARR", "The gladiator's oath is real. Roman writers quote it word for word.", .25),
 ("l7", "ludus", "YOU", "I swear to be burned, chained, beaten, and killed by the sword.", .5),
 ("l8", "ludus", "NARR", "That night, they lock you in a stone cell, smaller than a horse stall. Your cellmate is a Thracian.", .3),
 ("l9", "ludus", "SPA", "First night?", .25),
 ("l10", "ludus", "YOU", "Is it that obvious?", .25),
 ("l11", "ludus", "SPA", "You're shaking. I'm Spartacus. I was a soldier once. Then a deserter. Then a slave.", .25),
 ("l12", "ludus", "YOU", "How long have you been here?", .25),
 ("l13", "ludus", "SPA", "Long enough to count the guards. Get some sleep. Tomorrow, the doctore will try to break you.", .3),
 ("l14", "ludus", "CRI", "Thracian! Teaching the new puppy to bark?", .25),
 ("l15", "ludus", "SPA", "Crixus. Go back to your corner.", .25),
 ("l16", "ludus", "CRI", "Ha! Welcome to the house of Batiatus, puppy. Most of you don't last a season.", .9),

 # ---- A GLADIATOR'S DAY ----
 ("t1", "school", "NARR", "Your days begin at dawn. Every single day.", .25),
 ("t2", "school", "DOC", "Wooden swords! To the post! Strike! Again! Again!", .3),
 ("t3", "school", "DOC", "Twice the weight of a real sword! In the arena, the real one will feel like a feather!", .25),
 ("t3b", "school", "NARR", "The post was called the palus. Roman writers say recruits used weapons twice as heavy as real ones.", .25),
 ("t4", "school", "YOU", "My arms. I can't lift them anymore.", .25),
 ("t5", "school", "DOC", "The crowd pays to see you fight, not to see you rest! Shield up! Again!", .5),
 ("t6", "school", "OEN", "Here. Eat. You'll need it.", .25),
 ("t7", "school", "YOU", "What is this?", .25),
 ("t8", "school", "OEN", "Barley and beans. Every day. They call us the barley men.", .3),
 ("t9", "school", "NARR", "That nickname is real: hordearii. Bones from a gladiator graveyard in Ephesus show they ate mostly grains and beans.", .25),
 ("t9b", "school", "OEN", "And drink this after training. Plant ash in water.", .25),
 ("t9c", "school", "YOU", "Ugh! It's bitter!", .25),
 ("t9d", "school", "OEN", "Bitter, but it makes your bones strong. The doctors swear by it.", .3),
 ("t10", "school", "OEN", "They want us fat, too. Fat protects you. A cut bleeds, but you keep fighting.", .25),
 ("t11", "school", "YOU", "So they feed us like prize horses.", .25),
 ("t12", "school", "SPA", "We are prize horses. Batiatus paid a lot for us. He doesn't want us dead. He wants us bleeding in front of a crowd.", .5),
 ("t13", "school", "DOC", "You! New one! Curved sword, small shield. You'll fight in the Thracian style.", .25),
 ("t14", "school", "YOU", "Like Spartacus?", .25),
 ("t15", "school", "SPA", "Like my people. The Romans named a whole way of fighting after us.", .3),
 ("t16", "school", "NARR", "Back then, the three main styles were named after peoples Rome had beaten: the Samnite, the Gaul, and the Thracian.", .3),
 ("t17", "school", "CRI", "And I'm the Gaul. Big shield, straight sword. When we meet in the arena, puppy, try not to cry.", .9),

 # ---- THE ARENA ----
 ("a1", "arena", "NARR", "Three months later. Your first games.", .25),
 ("a2", "arena", "HER", "People of Capua! The house of Batiatus presents ten pairs of gladiators!", .3),
 ("a3", "arena", "OEN", "First the parade. Animal hunts in the morning. Criminals at noon. We fight in the afternoon.", .25),
 ("a4", "arena", "YOU", "There are thousands of them. Women. Children. Old men eating bread.", .25),
 ("a5", "arena", "SPA", "They're not here for you. They're here for a good fight. Give them one, and you live.", .3),
 ("a6", "arena", "NARR", "First, a warm-up with blunt weapons. Then the real swords come out.", .25),
 ("a7", "arena", "REF", "Gladiators! Fight clean. When I raise my stick, you stop. Begin!", .3),
 ("a8", "arena", "NARR", "Yes, there was a referee. Roman mosaics show him with a long stick, right between the fighters.", .25),
 ("a9", "arena", "OPP", "Come on, Thracian! Show me that little sword!", .25),
 ("a10", "arena", "YOU", "Shield up. Watch his feet. Watch his feet.", .3),
 ("a11", "arena", "SPA", "His shield covers everything! Go low! Go for the legs!", .3),
 ("a12", "arena", "OPP", "Agh! My leg!", .25),
 ("a13", "arena", "HER", "He is down! He is down!", .3),
 ("a14", "arena", "REF", "Stop! He raises a finger! He asks for mercy! The editor decides!", .25),
 ("a14b", "arena", "NARR", "The editor was the rich man who paid for the games. The loser's life was in his hands.", .25),
 ("a15", "arena", "YOU", "Do I have to kill him?", .25),
 ("a16", "arena", "SPA", "Look at the crowd. Watch the editor's hand.", .3),
 ("a17", "arena", "NARR", "Movies show a thumb pointing down for death. That idea comes from a painting made in eighteen seventy-two. Nobody knows exactly what the Roman gesture looked like.", .3),
 ("a18", "arena", "HER", "The editor grants mercy! Missio!", .25),
 ("a19", "arena", "YOU", "He lives. I live.", .35),
 ("a20", "arena", "NARR", "Most fights did not end in death. Gladiators were expensive. Records from a century later suggest about one fight in five ended with a dead man.", .25),
 ("a21", "arena", "SPA", "One in five, brother. Fight ten times, and do the math.", .25),
 ("a22", "arena", "YOU", "That's not a life. That's a slow execution.", .25),
 ("a23", "arena", "SPA", "Exactly. So let's not stay.", .9),

 # ---- KITCHEN KNIVES ----
 ("e1", "escape", "NARR", "Summer, seventy-three BC. Two hundred gladiators are planning an escape.", .25),
 ("e2", "escape", "SPA", "Tonight. The kitchen. Knives, cleavers, roasting spits. Anything with an edge.", .25),
 ("e3", "escape", "CRI", "Kitchen knives against Roman swords? You're mad, Thracian.", .25),
 ("e4", "escape", "SPA", "You have a better plan, Gaul? Or do you want to die for Batiatus's money?", .3),
 ("e5", "escape", "CRI", "Hm. I'm in.", .35),
 ("e6", "escape", "NARR", "But someone talks. The guards find out.", .25),
 ("e7", "escape", "YOU", "They know! Spartacus, they know!", .2),
 ("e8", "escape", "SPA", "Then it's now or never! Go! Go!", .35),
 ("e9", "escape", "NARR", "Of two hundred, only about seventy make it out, armed with kitchen tools.", .3),
 ("e10", "escape", "OEN", "Look! On the road! A wagon!", .25),
 ("e11", "escape", "YOU", "It's full of gladiator weapons! Real swords!", .25),
 ("e12", "escape", "SPA", "Throw away the kitchen knives, brothers. We're gladiators again. But this time, we fight for ourselves.", .9),

 # ---- THE VINE LADDERS ----
 ("v1", "vesuv", "NARR", "They hide on a mountain near Naples. You know it today as Vesuvius. In seventy-three BC, it's just a quiet, green mountain.", .25),
 ("v2", "vesuv", "GLA", "Three thousand men. One road up. We don't attack. We wait until they starve.", .3),
 ("v3", "vesuv", "NARR", "The praetor Claudius Glaber blocks the only path. Behind the rebels, there are only cliffs.", .5),
 ("v4", "vesuv", "WIFE", "Spartacus. I dreamed of you. A snake was coiled around your face while you slept.", .25),
 ("v5", "vesuv", "SPA", "Is that good, or bad?", .25),
 ("v6", "vesuv", "WIFE", "Both. Great power. And a terrible end.", .3),
 ("v7", "vesuv", "NARR", "Plutarch really tells this story. Spartacus's wife was a Thracian prophetess.", .5),
 ("v8", "vesuv", "YOU", "These wild vines. Look how thick they are. Spartacus, we could make ladders!", .25),
 ("v9", "vesuv", "SPA", "Ladders. Down the cliff. Brother, you're a genius.", .3),
 ("v10", "vesuv", "NARR", "That night they weave ladders from wild grapevines, and climb down the cliffs in the dark.", .3),
 ("v11", "vesuv", "GLA", "What's that noise? Who's out there?", .2),
 ("v12", "vesuv", "SPA", "Now! Attack!", .3),
 ("v13", "vesuv", "YOU", "They're running! Take their swords! Take their armor!", .25),
 ("v14", "vesuv", "NARR", "Attacked from behind, the Romans flee. The slaves take their weapons, and their whole camp.", .9),

 # ---- SEVENTY THOUSAND ----
 ("w1", "army", "NARR", "Word spreads. Slaves run away from farms and villas all over southern Italy.", .25),
 ("w2", "army", "YOU", "Spartacus, look! There are hundreds more on the road. Women. Old men. Children.", .25),
 ("w3", "army", "SPA", "Let them come. Every one of them was chained, like us.", .3),
 ("w4", "army", "OEN", "We need iron. Swords, armor, horses.", .25),
 ("w5", "army", "SPA", "Then we take iron. But no gold. No silver. Gold makes men lazy.", .3),
 ("w6", "army", "NARR", "Appian writes that Spartacus banned merchants from bringing gold or silver into the camp, and shared the loot equally.", .3),
 ("w7", "army", "NARR", "Not everyone lived to see what came next. Oenomaus, who gave you his bowl on your first day, was killed in the first year.", .4),
 ("w8", "army", "NARR", "But the army keeps growing. Seventy thousand people, led by gladiators. They beat one Roman army after another.", .25),
 ("w9", "army", "YOU", "We beat them again! Two praetors! Two consuls!", .25),
 ("w10", "army", "SPA", "And every time we win, they send a bigger army.", .9),

 # ---- THE SPLIT ----
 ("x1", "split", "NARR", "Seventy-two BC. The leaders argue about what to do next.", .25),
 ("x2", "split", "SPA", "We go north. Over the Alps. Then everyone goes home. Thrace. Gaul. Free.", .25),
 ("x3", "split", "CRI", "Home? Why run? Rome is weak! We should burn every villa from here to the sea!", .25),
 ("x4", "split", "SPA", "And then what? Rome never runs out of soldiers, Crixus. We do.", .25),
 ("x5", "split", "CRI", "Then I'll take my Gauls and do it myself.", .25),
 ("x6", "split", "YOU", "Crixus, don't. Together we're seventy thousand. Apart, we're two easy targets.", .25),
 ("x7", "split", "CRI", "You're his dog, puppy. You always were. Come with me, and be a wolf.", .4),
 ("x8", "split", "NARR", "So, who do you follow? Your best friend, or the man who wants revenge?", .4),
 ("x9", "split", "YOU", "I stay with Spartacus.", .25),
 ("x10", "split", "CRI", "Then good luck. Both of you.", .5),
 ("x11", "split", "NARR", "Crixus left with about thirty thousand men. Near Mount Garganus, a consul caught them. Crixus and two thirds of his men were killed.", .35),
 ("x12", "split", "YOU", "He's dead. Crixus is dead.", .3),
 ("x13", "split", "SPA", "Then Rome will pay for him. The way they made us pay.", .3),
 ("x14", "split", "NARR", "Appian writes that Spartacus held funeral games for Crixus. Three hundred Roman prisoners were forced to fight each other, like gladiators.", .3),
 ("x15", "split", "YOU", "Now they know what it feels like.", .3),
 ("x16", "split", "SPA", "Now they know.", .9),

 # ---- CRASSUS ----
 ("c1", "crassus", "NARR", "Rome is terrified. The richest man in the city, Marcus Licinius Crassus, takes command.", .25),
 ("c2", "crassus", "CRA", "Some of my men ran away from slaves. Line them up. Every tenth man dies.", .3),
 ("c3", "crassus", "NARR", "This was called decimation. Plutarch says fifty soldiers were killed by their own comrades.", .25),
 ("c4", "crassus", "YOU", "His soldiers are more afraid of him than of us now.", .5),
 ("c5", "crassus", "NARR", "Spartacus heads for the sea. He wants to cross to Sicily, where thousands of slaves could join him.", .25),
 ("c6", "crassus", "PIR", "Pay us, and our ships will carry your army across. You have my word.", .25),
 ("c7", "crassus", "SPA", "Then we have a deal.", .35),
 ("c8", "crassus", "NARR", "The pirates take the money, and sail away. They never come back.", .25),
 ("c9", "crassus", "YOU", "They're gone! The ships are gone!", .4),
 ("c10", "crassus", "CRA", "Dig. A ditch from sea to sea, and a wall behind it. Let them starve.", .25),
 ("c10b", "crassus", "NARR", "Crassus cut off the whole toe of Italy. Plutarch says the ditch was about fifty-five kilometers long.", .25),
 ("c11", "crassus", "YOU", "He's trapped us. Sea on three sides, a wall on the fourth.", .25),
 ("c12", "crassus", "SPA", "Then we wait for the right night.", .3),
 ("c13", "crassus", "NARR", "On a snowy winter night, the rebels fill part of the ditch with earth and branches, and break through.", .25),
 ("c14", "crassus", "YOU", "We're out! We're through the wall!", .9),

 # ---- THE LAST BATTLE ----
 ("f1", "last", "NARR", "Spring, seventy-one BC. And now you're back on that last morning.", .3),
 ("f2", "last", "YOU", "Spartacus. If this is the end, thank you. For the night in the kitchen. For all of it.", .25),
 ("f3", "last", "SPA", "Don't thank me, brother. You were free before you met me. They just forgot to tell you.", .3),
 ("f4", "last", "SPA", "Today, I want Crassus. Only Crassus.", .4),
 ("f5", "last", "NARR", "Plutarch writes that Spartacus fought his way toward Crassus himself. He killed two centurions. He never reached him.", .25),
 ("f6", "last", "YOU", "Spartacus! Where are you? Spartacus!", .35),
 ("f7", "last", "NARR", "He was surrounded and cut down. His body was never found.", .6),
 ("f8", "last", "NARR", "Six thousand captured rebels were crucified along the Appian Way, the road from Capua to Rome. For about two hundred kilometers, the crosses lined the road.", .4),
 ("f9", "last", "YOU", "I run into the mountains. A few of us made it. Most of us didn't.", .3),
 ("f10", "last", "NARR", "Pompey caught five thousand more running north, and told Rome he had ended the war. Crassus never forgave him.", .9),

 # ---- WAS IT REAL? ----
 ("r1", "real", "NARR", "So, how much of this is true?", .25),
 ("r2", "real", "NARR", "Almost everything we know comes from two Greek writers, Plutarch and Appian. They wrote more than a century and a half later.", .25),
 ("r3", "real", "YOU", "So nobody who was there wrote it down?", .25),
 ("r4", "real", "NARR", "Nothing that survived. But in Pompeii, archaeologists found a painted fight on a wall. Above one rider, someone wrote a name: Spartaks.", .25),
 ("r5", "real", "YOU", "Spartaks. Painted while people still remembered him?", .25),
 ("r6", "real", "NARR", "Maybe. It's written in Oscan, an old language of the region, and the painting may be from his own lifetime.", .3),
 ("r7", "real", "NARR", "And the famous scene where every slave stands up and shouts, I'm Spartacus? That's from a movie made in nineteen sixty. It never happened.", .3),
 ("r8", "real", "YOU", "Two years. A stone cell, a kitchen knife, and a ladder made of vines. And the most powerful city on Earth was afraid of us.", .35),
 ("r9", "real", "NARR", "So, if you'd been there in seventy-two BC, would you have followed Spartacus north, or Crixus into the fight? Tell me in the comments.", .5),
]
SAY = {'doctore': 'dottoray', 'Batiatus': 'Bah-tee-AH-tus', 'hordearii': 'hor-day-AH-ree-ee', 'Spartaks': 'Spar-tahks', 'Garganus': 'Gar-GAH-nus', 'Oenomaus': 'Ee-no-MAY-us', 'Crixus': 'Crick-sus', 'Missio': 'Miss-ee-oh', 'palus': 'PAH-luss', 'Glaber': 'Glah-ber'}

if __name__ == "__main__":
    k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin"); SR = 24000
    os.makedirs("public", exist_ok=True)
    t = .3; chunks = [np.zeros(int(.3 * SR), np.float32)]; tl = []; prev = None; mouth_src = []
    for key, ch, sp, text, gap in L:
        if prev and ch != prev: chunks.append(np.zeros(int(1.3 * SR), np.float32)); t += 1.3
        prev = ch; v, s, lang = VOICES[sp]
        say = text
        for a_, b_ in SAY.items(): say = say.replace(a_, b_)
        import hashlib; h = hashlib.md5(f"{say}|{v}|{s}|{lang}".encode()).hexdigest(); cp = f"tts_cache/{h}.npy"
        if os.path.exists(cp): a = np.load(cp)
        else:
            a, _ = k.create(say, voice=v, speed=s, lang=lang); a = np.asarray(a, np.float32); os.makedirs("tts_cache", exist_ok=True); np.save(cp, a)
        nz = np.where(np.abs(a) > .01)[0]; a = a[max(0, nz[0] - 240): nz[-1] + 1200]; a = a / (np.abs(a).max() + 1e-9) * .8; d = len(a) / SR
        tl.append(dict(key=key, chapter=ch, speaker=sp, text=text, start=round(t, 3), end=round(t + d, 3)))
        mouth_src.append((sp, t, a)); chunks += [a, np.zeros(int(gap * SR), np.float32)]; t += d + gap
    sf.write("public/vo.wav", np.concatenate(chunks), SR)
    json.dump(dict(lines=tl, voice_end=round(t, 3)), open("src/timeline.json", "w"), indent=1)
    NF = int((t + 1.5) * 30); M = {}
    for sp, st, a in mouth_src:
        arr = M.setdefault(sp, np.zeros(NF)); hop = SR // 30
        for i in range(len(a) // hop):
            f = int(round(st * 30)) + i
            if f < NF: arr[f] = max(arr[f], np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)))
    for sp in M:
        x = M[sp]; x = np.clip(x / (np.percentile(x[x > 0], 90) + 1e-9), 0, 1); x[x < .12] = 0
        M[sp] = [round(float(v), 2) for v in x]
    json.dump(M, open("src/mouth.json", "w"), separators=(',', ':'))
    words = sum(len(l[3].split()) for l in L); dl = sum(len(l[3].split()) for l in L if l[2] != 'NARR')
    nl = sum(1 for l in L if l[2] != 'NARR')
    print("total", round(t, 1), "words", words, "dialogue share (words)", round(dl / words, 2), "dialogue lines", nl, "/", len(L))
    ch = {}
    for l in tl: ch.setdefault(l['chapter'], [l['start'], l['end']])[1] = l['end']
    for c, (a, b) in ch.items(): print(f"{c:10s} {a:6.1f} {b:6.1f}")
