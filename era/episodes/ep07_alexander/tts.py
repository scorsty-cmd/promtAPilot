"""Multi-voice dialogue for 'If You Were Alexander the Great's Classmate' (344-323 BC).
"You" are a fictional Macedonian noble; events follow Arrian, Plutarch (Alexander), Diodorus 17 and Curtius Rufus.
-> public/vo.wav, src/timeline.json, src/mouth.json"""
import json, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICES = {  # speaker: (voice, speed, lang)
    'NARR': ('am_michael', .97, 'en-us'),   # same narrator every episode
    'YOU': ('am_liam', 1.0, 'en-us'),
    'ALE': ('am_echo', 1.0, 'en-us'),       # Alexander
    'HEP': ('am_eric', 1.0, 'en-us'),       # Hephaestion
    'ARI': ('bm_george', .92, 'en-gb'),     # Aristotle
    'PHI': ('am_onyx', .93, 'en-us'),       # Philip II
    'CLE': ('am_fenrir', .98, 'en-us'),     # Cleitus the Black
    'DIO': ('bm_fable', .95, 'en-gb'),      # Diogenes
    'PAR': ('am_adam', .95, 'en-us'),       # Parmenion
    'DAR': ('bm_lewis', .92, 'en-gb'),      # Darius III
    'SIS': ('bf_emma', .9, 'en-gb'),        # Sisygambis, Darius's mother
    'CAL': ('bm_daniel', 1.0, 'en-gb'),     # Callisthenes
    'POR': ('hm_omega', .95, 'en-us'),      # King Porus
    'COE': ('am_santa', .95, 'en-us'),      # Coenus
    'SOL': ('am_puck', 1.02, 'en-us'),      # a Macedonian soldier
}

# (key, chapter, speaker, text, pause after)
L = [
 # ---- COLD OPEN: the feast at Samarkand, 328 BC ----
 ("o1", "open", "CLE", "This hand saved your life at the Granicus, Alexander! This hand!", .25),
 ("o2", "open", "ALE", "Sit down, Cleitus. You're drunk.", .2),
 ("o3", "open", "CLE", "Your father Philip won your wars for you! And now you dress like a Persian king!", .25),
 ("o4", "open", "YOU", "Cleitus, stop! Alexander, he doesn't mean it!", .2),
 ("o5", "open", "ALE", "Guards! Give me a spear!", .2),
 ("o6", "open", "YOU", "Alexander! No!", 1.1),
 ("o7", "open", "NARR", "Samarkand, three hundred twenty-eight BC. The most powerful man on Earth has just killed one of his oldest friends.", .3),
 ("o8", "open", "YOU", "I've known him since we were boys. We sat side by side, in the same classroom.", .3),
 ("o9", "open", "NARR", "And your teacher was a man the whole world still knows. His name was Aristotle. To see how a boy became this, go back to the beginning.", .9),

 # ---- PELLA: the horse nobody could ride ----
 ("p1", "pella", "NARR", "Pella, the capital of Macedon. Three hundred forty-four BC. You're twelve, a nobleman's son, sent to the palace to serve the king.", .25),
 ("p2", "pella", "PHI", "Thirteen talents, for a horse that won't let anyone ride him? Take him away. He's useless.", .25),
 ("p3", "pella", "ALE", "Useless? You're losing a great horse, father, because nobody here knows how to handle him!", .25),
 ("p4", "pella", "PHI", "Ha! And you do, boy?", .2),
 ("p5", "pella", "ALE", "I do. And if I fail, I'll pay for him myself.", .3),
 ("p6", "pella", "YOU", "Alexander, careful! He'll kick you!", .2),
 ("p7", "pella", "ALE", "Look. He's afraid of his own shadow. So I turn him, toward the sun.", .4),
 ("p8", "pella", "NARR", "Plutarch tells this story. Alexander turned the horse to face the sun, so he couldn't see his shadow, and then jumped on his back.", .25),
 ("p9", "pella", "PHI", "My son, find yourself a kingdom big enough for you. Macedon is too small.", .3),
 ("p10", "pella", "NARR", "The horse was called Bucephalus. Ox-head. He would carry Alexander all the way to India.", .9),

 # ---- MIEZA: Aristotle's school ----
 ("m1", "mieza", "NARR", "A year later, Philip hires the most brilliant mind in Greece to teach his son. Not in the city, but in a quiet place in the hills: the sanctuary of the nymphs, at Mieza.", .25),
 ("m2", "mieza", "ARI", "Sit. Here, in the shade. Today, we talk about courage.", .25),
 ("m3", "mieza", "ALE", "Courage is easy. You charge, and you never run.", .25),
 ("m4", "mieza", "ARI", "Then a wild boar is the bravest creature alive. No. Courage lives in the middle, between running away, and running at death like a fool.", .3),
 ("m5", "mieza", "YOU", "So, a brave man is still a little bit afraid?", .2),
 ("m6", "mieza", "ARI", "Exactly. Too much is a mistake. Too little is a mistake. Good things live in the middle.", .4),
 ("m7", "mieza", "NARR", "Aristotle really taught this. Today we call it the golden mean. Remember it. Your classmate is going to forget it.", .3),
 ("m8", "mieza", "HEP", "Alexander! Come on! Race you to the caves!", .2),
 ("m9", "mieza", "ALE", "Hephaestion! You'll lose again!", .3),
 ("m10", "mieza", "NARR", "Hephaestion. Alexander's closest friend, for the rest of his life. Ancient writers never list the whole class, so nobody knows for sure if he studied here.", .3),
 ("m11", "mieza", "NARR", "The lessons covered politics, medicine, plants and animals, and Homer's poems.", .25),
 ("m12", "mieza", "ARI", "Your copy of the Iliad. I corrected it myself. Read it like a soldier, not like a poet.", .25),
 ("m13", "mieza", "ALE", "I'll keep it under my pillow. Right next to my dagger.", .3),
 ("m14", "mieza", "NARR", "Plutarch says he did exactly that, for the rest of his life.", .3),
 ("m15", "mieza", "ALE", "Teacher. If I conquer the whole world, will you be proud of me?", .25),
 ("m16", "mieza", "ARI", "I'll be proud if you can rule yourself. Conquering the world is the easy part.", .3),
 ("m17", "mieza", "NARR", "You can still visit this school today. Near the town of Naousa, in northern Greece, the caves and the stone walkways are still there.", .9),

 # ---- THE NEW KING ----
 ("k1", "king", "NARR", "Three hundred thirty-six BC. King Philip celebrates his daughter's wedding in the theatre at Aegae.", .25),
 ("k2", "king", "PHI", "Let the people see me! No guards. I'm among friends!", .3),
 ("k3", "king", "YOU", "Who's that man? He's running at the king!", .2),
 ("k4", "king", "NARR", "One of Philip's own bodyguards, a man named Pausanias, stabbed him in front of the whole crowd.", .3),
 ("k5", "king", "HEP", "The king is dead! Philip is dead!", .25),
 ("k6", "king", "YOU", "Alexander. You're the king now. At twenty.", .25),
 ("k7", "king", "ALE", "Then everyone who thinks I'm just a boy is about to learn something.", .4),
 ("k8", "king", "NARR", "Soon after, in Corinth, the young king meets the strangest man in Greece: Diogenes, who lives in a big clay jar.", .25),
 ("k9", "king", "ALE", "I am Alexander, king of Macedon. Ask me for anything you want.", .25),
 ("k10", "king", "DIO", "Then move a little to the side. You're blocking my sun.", .3),
 ("k11", "king", "HEP", "How dare you!", .2),
 ("k12", "king", "ALE", "No. If I were not Alexander, I would want to be Diogenes.", .3),
 ("k13", "king", "NARR", "Did this really happen? Many ancient writers tell it. But it's so perfect that some historians think it was polished over the years.", .9),

 # ---- ASIA ----
 ("a1", "asia", "NARR", "Spring, three hundred thirty-four BC. Alexander crosses into Asia with about thirty-five thousand men, against the largest empire in the world.", .25),
 ("a2", "asia", "ALE", "Watch.", .35),
 ("a3", "asia", "YOU", "He threw his spear into the beach! Why?", .2),
 ("a4", "asia", "HEP", "He's claiming it. All of Asia, won by the spear.", .3),
 ("a5", "asia", "NARR", "Diodorus writes that Alexander threw a spear into the shore of Asia before stepping off his ship. Today, that beach is in Turkey.", .9),
 ("a6", "asia", "NARR", "A few weeks later, at the river Granicus, the Persians are waiting on the other bank.", .25),
 ("a7", "asia", "PAR", "The river is deep, my king, and the banks are steep. Wait until tomorrow.", .2),
 ("a8", "asia", "ALE", "I crossed the Hellespont, Parmenion. I'm not afraid of a stream. Follow me!", .3),
 ("a9", "asia", "NARR", "Alexander charges straight into the river. His helmet has two tall white plumes, so everyone can see him.", .25),
 ("a10", "asia", "YOU", "He's in front of everyone! They're all aiming at him!", .2),
 ("a11", "asia", "NARR", "A Persian noble splits Alexander's helmet with an axe. Another raises his sword for the final blow.", .2),
 ("a12", "asia", "YOU", "Alexander! Behind you!", .2),
 ("a13", "asia", "CLE", "I've got him!", .3),
 ("a14", "asia", "NARR", "Cleitus, called the Black, cuts off the Persian's arm. He saves Alexander's life. Six years later, Alexander will kill him.", .9),
 ("a15", "asia", "NARR", "Gordion, in the middle of Anatolia. An old legend says: whoever unties this knot will rule all of Asia.", .25),
 ("a16", "asia", "HEP", "Nobody can find the ends. People have tried for hundreds of years.", .2),
 ("a17", "asia", "ALE", "Then it doesn't matter how I untie it.", .3),
 ("a18", "asia", "NARR", "Most writers say he cut it with his sword. But Aristobulus, who was there, says he simply pulled out the wooden pin that held it.", .9),

 # ---- ISSUS ----
 ("i1", "issus", "NARR", "November, three hundred thirty-three BC. Issus, near today's Iskenderun. For the first time, Alexander faces the Persian king himself. Darius the Third.", .25),
 ("i2", "issus", "DAR", "They are so few. Surround them. Bring me that boy in chains.", .25),
 ("i3", "issus", "ALE", "Companions! There is the king! Ride with me!", .25),
 ("i4", "issus", "YOU", "He's going straight for Darius's chariot!", .25),
 ("i5", "issus", "DAR", "Turn the chariot! Turn it! Get me out of here!", .3),
 ("i6", "issus", "NARR", "Darius ran. He left behind his treasure, his tent, and his own family.", .4),
 ("i7", "issus", "NARR", "That evening, Alexander and Hephaestion visit the captured queen mother of Persia, Sisygambis.", .25),
 ("i8", "issus", "SIS", "Great king. Please. Have mercy on my family.", .2),
 ("i9", "issus", "HEP", "My lady, I'm not the king. He is.", .25),
 ("i10", "issus", "SIS", "Forgive me! I didn't know! Forgive me!", .2),
 ("i11", "issus", "ALE", "You made no mistake, mother. He is Alexander too.", .4),
 ("i12", "issus", "NARR", "Several ancient writers tell this story. And Sisygambis grew to love Alexander like a son.", .9),

 # ---- GAUGAMELA ----
 ("g1", "gauga", "NARR", "Next, Alexander takes the whole coast. The island city of Tyre, after a seven-month siege. Then Egypt, where a priest in the desert oasis of Siwa calls him a son of the god Ammon.", .25),
 ("g2", "gauga", "YOU", "Son of a god? Alexander, your father was Philip. I knew him.", .2),
 ("g3", "gauga", "ALE", "Careful, my friend. A king can have more than one father.", .4),
 ("g4", "gauga", "NARR", "October, three hundred thirty-one BC. Gaugamela, in today's northern Iraq. Darius has gathered a giant army, and chariots with blades on their wheels.", .25),
 ("g5", "gauga", "DAR", "Flatten the ground. My chariots need a smooth field.", .3),
 ("g6", "gauga", "NARR", "But Alexander has the phalanx. Sixteen men deep, holding spears called sarissas, up to six meters long.", .3),
 ("g7", "gauga", "YOU", "Chariots! Here they come!", .2),
 ("g8", "gauga", "ALE", "Open the lines! Let them through!", .25),
 ("g9", "gauga", "NARR", "The soldiers step aside. The chariots race into the gaps, and are cut down from behind.", .3),
 ("g10", "gauga", "ALE", "There! A gap in their line! Companions, with me!", .2),
 ("g11", "gauga", "YOU", "Darius is running again!", .3),
 ("g12", "gauga", "NARR", "Darius escaped. A few months later, his own nobles killed him. Alexander was now the king of Persia.", .9),

 # ---- PERSEPOLIS ----
 ("e1", "persia", "NARR", "Persepolis. The most magnificent palace in the world, and now it belongs to Alexander.", .25),
 ("e2", "persia", "SOL", "Gold! The rooms are full of gold!", .2),
 ("e3", "persia", "NARR", "Plutarch says it took ten thousand pairs of mules and five thousand camels to carry the treasure away.", .3),
 ("e4", "persia", "NARR", "Then, one night, after a drinking party, the palace burns.", .25),
 ("e5", "persia", "HEP", "Alexander, why? It's beautiful!", .2),
 ("e6", "persia", "ALE", "The Persians burned Athens. Now Persia burns.", .3),
 ("e7", "persia", "NARR", "Was it revenge, or a drunken mistake? The ancient writers disagree.", .3),
 ("e8", "persia", "YOU", "He's wearing Persian robes now. He has Persian guards. Hephaestion, does he even remember Mieza?", .25),
 ("e9", "persia", "HEP", "He remembers. He just doesn't want to be that boy anymore.", .9),

 # ---- THE FEAST ----
 ("f1", "feast", "NARR", "And so we're back, on that night in Samarkand.", .3),
 ("f2", "feast", "ALE", "What have I done? Cleitus. Cleitus!", .3),
 ("f3", "feast", "NARR", "For three days, Alexander locked himself in his tent. He didn't eat. He didn't speak.", .25),
 ("f4", "feast", "HEP", "He won't talk to anyone. Not even me.", .25),
 ("f5", "feast", "YOU", "Remember what Aristotle said? Too much is a mistake. He's lost the middle.", .4),
 ("f6", "feast", "NARR", "A year later, Alexander asks his men to bow down before him, the Persian way.", .25),
 ("f7", "feast", "CAL", "In Greece, we bow only to the gods. I will not kneel to a man.", .25),
 ("f8", "feast", "ALE", "You're Aristotle's own relative, Callisthenes. He taught you to argue. Not to obey.", .3),
 ("f9", "feast", "NARR", "Callisthenes was Alexander's official historian. Soon after, he was arrested, and died in captivity.", .3),
 ("f10", "feast", "YOU", "First Cleitus. Now Callisthenes. Who's next?", .9),

 # ---- INDIA ----
 ("n1", "india", "NARR", "Three hundred twenty-six BC. The army reaches India, at the river Hydaspes. On the other side, King Porus is waiting, with war elephants.", .25),
 ("n2", "india", "YOU", "What are those? They're as big as houses!", .2),
 ("n3", "india", "HEP", "Elephants. The horses won't go near them.", .3),
 ("n4", "india", "NARR", "So Alexander crossed the river at night, in a thunderstorm, far from Porus's camp.", .25),
 ("n5", "india", "POR", "Elephants forward! Crush them!", .2),
 ("n6", "india", "ALE", "Spears up! Aim for the drivers!", .25),
 ("n7", "india", "YOU", "One's coming right at me! Shields! Shields!", .3),
 ("n8", "india", "NARR", "The wounded elephants panic, and trample both armies. Porus fights on, wounded, until the very end.", .3),
 ("n9", "india", "ALE", "How do you want to be treated?", .25),
 ("n10", "india", "POR", "Like a king.", .35),
 ("n11", "india", "NARR", "Alexander was so impressed that he gave Porus his kingdom back, and more land on top of it.", .3),
 ("n12", "india", "NARR", "But soon after the battle, Bucephalus died, of old age and exhaustion. He was about thirty. Alexander named a city after him.", .4),
 ("n13", "india", "ALE", "Further east! To the Ganges, and the end of the world. Just one more river.", .25),
 ("n14", "india", "COE", "No, my king. Eight years we've followed you. Our fathers are dead. Our children don't know our faces. Let us go home.", .3),
 ("n15", "india", "ALE", "Then go! Go home, and tell them you left your king among his enemies!", .3),
 ("n16", "india", "NARR", "Once again, Alexander shut himself in his tent for three days. But the army didn't move. For the first time in his life, he turned back.", .9),

 # ---- THE DESERT ----
 ("d1", "desert", "NARR", "The way home crosses the Gedrosian desert, in today's Pakistan and Iran. The heat kills thousands of soldiers, women, and animals.", .25),
 ("d2", "desert", "SOL", "My king. We found a little water. It's for you.", .25),
 ("d3", "desert", "YOU", "Drink it, Alexander. You need it.", .2),
 ("d4", "desert", "ALE", "If my men can't drink, then neither can I.", .35),
 ("d5", "desert", "NARR", "Arrian writes that Alexander poured the water into the sand, in front of the whole army. And it was as if every man had drunk.", .4),
 ("d6", "desert", "NARR", "A year later, in Ecbatana, Hephaestion falls ill with a fever. Within days, he's dead.", .3),
 ("d7", "desert", "YOU", "Alexander. He's gone.", .25),
 ("d8", "desert", "ALE", "Then half of me is gone with him.", .9),

 # ---- BABYLON ----
 ("z1", "end", "NARR", "Babylon. June, three hundred twenty-three BC. After a long night of drinking, Alexander gets a fever. It doesn't go away.", .25),
 ("z2", "end", "YOU", "Alexander. Can you hear me? It's me.", .25),
 ("z3", "end", "ALE", "Remember Mieza? The shade. The caves. Aristotle and his long lessons.", .3),
 ("z4", "end", "YOU", "I remember everything.", .25),
 ("z5", "end", "ALE", "I wanted to be the greatest. Maybe I was. But I never learned the middle.", .4),
 ("z6", "end", "SOL", "My king. Who gets the empire?", .2),
 ("z7", "end", "ALE", "To the strongest.", .6),
 ("z8", "end", "NARR", "Did he really say that? Some ancient writers report it. Others say he could no longer speak at all.", .3),
 ("z9", "end", "NARR", "Alexander died in June, three hundred twenty-three BC. He was thirty-two. His generals fought over his empire for the next forty years.", .9),

 # ---- WAS IT REAL? ----
 ("r1", "real", "NARR", "So, how much of this really happened?", .25),
 ("r2", "real", "NARR", "Here's the strange part. Every full history of Alexander that survives was written three to four hundred years after his death.", .25),
 ("r3", "real", "YOU", "But people were there! Didn't anyone write it down?", .2),
 ("r4", "real", "NARR", "They did. Ptolemy, Aristobulus, Callisthenes. But all their books are lost. We only have pieces of them, quoted by later writers.", .3),
 ("r5", "real", "NARR", "And one famous line is a myth: that Alexander cried because there were no more worlds to conquer. Plutarch actually wrote the opposite. He cried because there were endless worlds, and he hadn't even conquered one.", .3),
 ("r6", "real", "NARR", "And his tomb? It stood in Alexandria, in Egypt. Roman emperors visited it. Then it vanished. Nobody has found it to this day.", .3),
 ("r7", "real", "YOU", "Twenty years. From a stone bench in Mieza, to the edge of India. And I was there for all of it.", .35),
 ("r8", "real", "NARR", "So, if you'd been in that tent in Samarkand, would you have kept quiet? Or told him the truth, like Cleitus? Tell me in the comments.", .5),
]
SAY = {'Mieza': 'Mee-ehza', 'Cleitus': 'Klytus', 'Gaugamela': 'Gowgameela', 'Hydaspes': 'Hy-dass-peez', 'Coenus': 'Seenus', 'Aegae': 'Eejee', 'Naousa': 'Na-oosa', 'Arrian': 'Airian', 'Diogenes': 'Diogenees'}

if __name__ == "__main__":
    k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin"); SR = 24000
    os.makedirs("public", exist_ok=True)
    t = .3; chunks = [np.zeros(int(.3 * SR), np.float32)]; tl = []; prev = None; mouth_src = []
    for key, ch, sp, text, gap in L:
        if prev and ch != prev: chunks.append(np.zeros(int(1.3 * SR), np.float32)); t += 1.3
        prev = ch; v, s, lang = VOICES[sp]
        say = text
        for a_, b_ in SAY.items(): say = __import__('re').sub(r'\b' + a_ + r'\b', b_, say)
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
