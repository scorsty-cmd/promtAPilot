"""Multi-voice dialogue for 'If You Were Born in Çatalhöyük' (c. 6700 BC). "You" and your family are fictional; daily life follows the excavations (Mellaart 1961-65; Hodder 1993-2017) and the studies named on screen."""
import json, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICES = {  # speaker: (voice, speed, lang)
    'NARR': ('am_michael', .97, 'en-us'),   # same narrator every episode
    'YOU': ('am_liam', 1.0, 'en-us'),
    'SIS': ('af_sky', 1.04, 'en-us'),       # your little sister
    'MOM': ('af_sarah', .95, 'en-us'),      # your mother
    'FAT': ('am_adam', .95, 'en-us'),       # your father
    'HUN': ('am_eric', 1.0, 'en-us'),       # the hunt leader
    'NEI': ('bm_lewis', .98, 'en-gb'),      # the grumpy neighbour
    'TRA': ('im_nicola', 1.0, 'en-us'),     # obsidian trader from Cappadocia
}

# (key, chapter, speaker, text, pause after)
L = [
 # ---- COLD OPEN ----
 ("o1", "open", "NARR", "There are no streets in your town. No doors. No windows.", .35),
 ("o2", "open", "SIS", "Wake up! Wake up! The sun is up! Last one on the roof is a sheep!", .25),
 ("o3", "open", "YOU", "I'm coming! Stop shaking the ladder!", .25),
 ("o4", "open", "NARR", "To go outside, you climb a ladder, through a hole in the ceiling. Every single house in town works like this.", .3),
 ("o5", "open", "YOU", "Good morning, grandmother.", .25),
 ("o6", "open", "SIS", "Who are you talking to? There's nobody there.", .25),
 ("o7", "open", "YOU", "She's right here. Under my bed.", .6),
 ("o8", "open", "NARR", "And that's true. Your grandmother is buried in the floor, under the platform where you sleep. So is her mother. Here, this is completely normal.", .3),
 ("o9", "open", "NARR", "Almost nine thousand years ago, in the middle of today's Turkey, this was one of the biggest towns on Earth. Today we call it Çatalhöyük. And you were born here.", .9),

 # ---- HOME ----
 ("h1", "home", "NARR", "The Konya plain, around six thousand seven hundred BC. Your house has one main room, about five steps wide, and a small storeroom for grain.", .25),
 ("h2", "home", "MOM", "Don't step there! That's the clean side. Ash and cooking stay by the oven.", .25),
 ("h3", "home", "NARR", "Archaeologists found that families kept the messy work, like cooking and making tools, on one side, under the ladder. The other side, with the sleeping platforms, stayed clean.", .3),
 ("h4", "home", "MOM", "Bring the white clay. The walls need a new coat before the feast.", .25),
 ("h5", "home", "YOU", "Again? We did it last month!", .2),
 ("h6", "home", "MOM", "And we'll do it again next month. Clean walls, happy house.", .25),
 ("h7", "home", "SIS", "Why do we always paint? Nobody ever comes inside.", .2),
 ("h8", "home", "MOM", "We come inside. And the ancestors are inside.", .35),
 ("h9", "home", "NARR", "Some walls here have hundreds of thin layers of white plaster, put on again and again, over many years.", .3),
 ("h10", "home", "SIS", "Can I put my hand on it? While it's still wet?", .2),
 ("h11", "home", "MOM", "One hand. Red, from the ochre. Just like your father did, when he was little.", .3),
 ("h11b", "home", "SIS", "Look! My hand is on the wall forever!", .2),
 ("h11c", "home", "YOU", "Until mother paints over it next month.", .2),
 ("h11d", "home", "SIS", "Hey!", .35),
 ("h12", "home", "YOU", "Mother, why are there bull horns in our wall?", .25),
 ("h13", "home", "MOM", "Those are from the great hunt, before you were born. They watch over us.", .3),
 ("h14", "home", "NARR", "Houses here were decorated with the horns and skulls of wild cattle, set into walls and benches. What they meant exactly, nobody knows.", .9),

 # ---- ROOFS & FIELDS ----
 ("f1", "food", "NARR", "Outside, the town looks like a giant honeycomb. People walk across the rooftops, like streets in the sky.", .3),
 ("f2", "food", "NEI", "Watch your feet! My roof is still wet!", .2),
 ("f3", "food", "YOU", "Sorry! Sorry!", .3),
 ("f4", "food", "NARR", "Down on the plain, by the river, your family grows wheat, barley, peas and lentils. And you keep sheep and goats.", .25),
 ("f5", "food", "FAT", "Take the sheep to the marsh, and watch for wolves. And don't fall asleep this time.", .25),
 ("f6", "food", "YOU", "That was one time, father!", .25),
 ("f7", "food", "FAT", "One time. And we lost two sheep.", .3),
 ("f7b", "food", "YOU", "Come on, sheep. Not in the water. Not in the water!", .25),
 ("f7c", "food", "SIS", "A wolf! Over there, in the reeds!", .2),
 ("f7d", "food", "YOU", "Shout! Throw stones! Make yourself big!", .4),
 ("f8", "food", "NARR", "Bread and porridge fed the town. But all that sticky grain was bad for teeth. Many skeletons here have cavities.", .3),
 ("f9", "food", "SIS", "My tooth hurts again.", .2),
 ("f10", "food", "MOM", "Then stop stealing honey from the neighbours.", .3),
 ("f11", "food", "NARR", "That's not a joke, by the way. Traces of beeswax were found in cooking pots from this region, from around this time.", .9),

 # ---- THE HUNT ----
 ("u1", "hunt", "NARR", "One day, the hunters come back with big news.", .25),
 ("u2", "hunt", "HUN", "An aurochs! A giant bull, down by the lake! The biggest any of us has ever seen!", .25),
 ("u3", "hunt", "FAT", "You're old enough now. Get your spear. Today, you come with us.", .25),
 ("u4", "hunt", "YOU", "Me? Really?", .2),
 ("u5", "hunt", "MOM", "Stay behind your father. And come back with both your legs.", .3),
 ("u6", "hunt", "NARR", "The aurochs was the wild ancestor of today's cattle. A big bull could stand almost two meters tall at the shoulder, and weigh about a ton.", .3),
 ("u7", "hunt", "HUN", "Quiet. Spread out. Wait for my signal.", .3),
 ("u8", "hunt", "YOU", "It's looking at me. Why is it looking at me?", .2),
 ("u9", "hunt", "FAT", "Don't move. Let it come to us.", .3),
 ("u10", "hunt", "HUN", "Now! Spears!", .2),
 ("u11", "hunt", "FAT", "Run! To the side! Run!", .35),
 ("u12", "hunt", "NARR", "Paintings found in the houses here show crowds of people around giant bulls and deer, some pulling the animal's tail or tongue. Nobody knows if they show real hunts, or stories.", .3),
 ("u13", "hunt", "HUN", "We did it! Tonight, the whole town eats!", .25),
 ("u13b", "hunt", "YOU", "Father, I threw my spear! Did I hit it?", .2),
 ("u13c", "hunt", "FAT", "You hit the ground. Very bravely.", .25),
 ("u13d", "hunt", "HUN", "Ha! Next time, aim for the bull.", .3),
 ("u14", "hunt", "NARR", "A bull like this could feed hundreds of people. Big feasts may have brought the whole town together. And afterwards, the horns went into the walls.", .9),

 # ---- OBSIDIAN & THE VOLCANO ----
 ("t1", "trade", "NARR", "Your town needs something it can't make itself: obsidian. Black volcanic glass, sharper than any knife.", .25),
 ("t2", "trade", "TRA", "Black glass from the fire mountains! The sharpest edge in the world! Who wants it?", .25),
 ("t3", "trade", "YOU", "What about that round one? The shiny one?", .2),
 ("t4", "trade", "TRA", "That? That's a mirror. Go on. Look into it.", .3),
 ("t5", "trade", "YOU", "Is that me? That's what my face looks like?", .3),
 ("t6", "trade", "TRA", "Two baskets of lentils, and it's yours.", .2),
 ("t7", "trade", "YOU", "Two baskets? My mother will kill me!", .3),
 ("t7b", "trade", "TRA", "One basket, and you carry my bags to the edge of town.", .2),
 ("t7c", "trade", "YOU", "Deal!", .35),
 ("t8", "trade", "NARR", "Polished obsidian mirrors were found in graves here. They are among the oldest mirrors ever discovered.", .3),
 ("t9", "trade", "NARR", "The obsidian came from volcanoes in Cappadocia, more than a hundred kilometers away. One of them, Hasan Dağı, can be seen from the rooftops on a clear day.", .3),
 ("t10", "trade", "SIS", "Look! The mountain! The mountain is on fire!", .25),
 ("t11", "trade", "FAT", "Everyone inside! Now! Pull up the ladders!", .3),
 ("t12", "trade", "NARR", "Scientists have dated an eruption of Hasan Dağı to roughly this time. And one painting found here may show it: a mountain with two peaks, spitting fire, above rows of houses.", .3),
 ("t13", "trade", "NARR", "Some call it the oldest map in the world. Others say it's just the pattern of a leopard skin. Archaeologists are still arguing.", .9),

 # ---- A CROWDED TOWN ----
 ("l1", "life", "NARR", "Life in a crowded town wasn't easy. Several thousand people live packed together, with animals, rubbish, and smoke from every oven.", .25),
 ("l2", "life", "YOU", "Why do I cough all the time?", .2),
 ("l3", "life", "MOM", "Everybody coughs in winter. It's the smoke. Now go and wash your hands.", .3),
 ("l4", "life", "NARR", "In rooms with no windows, people breathed smoke all winter. Archaeologists found black soot on the inside of ribs from burials here.", .3),
 ("l5", "life", "NEI", "That's my roof! You built your wall on my roof!", .2),
 ("l6", "life", "FAT", "Your roof? My grandfather built this wall before you were even born!", .25),
 ("l7", "life", "MOM", "Enough! Both of you! The elders will decide.", .35),
 ("l7b", "life", "NEI", "Fine. But your sister stays off my roof!", .2),
 ("l7c", "life", "SIS", "That was one time!", .4),
 ("l8", "life", "NARR", "And sometimes, people fought. A study in twenty nineteen found healed head wounds on about one in four skulls examined. Many were hit from behind, probably by clay balls thrown with slings.", .3),
 ("l9", "life", "NARR", "But here's something surprising. The bones show that men and women ate the same food, did similar work, and were buried in the same way.", .25),
 ("l10", "life", "SIS", "When I grow up, I want to hunt aurochs, like you.", .2),
 ("l11", "life", "YOU", "Then you'll need a bigger spear.", .25),
 ("l12", "life", "SIS", "Then make me one!", .9),

 # ---- UNDER THE FLOOR ----
 ("d1", "death", "NARR", "One winter, the old storyteller who lived in your house dies in his sleep. He wasn't your grandfather. He wasn't even related to you by blood.", .25),
 ("d2", "death", "YOU", "Where will we put him?", .2),
 ("d3", "death", "MOM", "Where we put everyone we love. Under the floor. Close to us.", .35),
 ("d3b", "death", "SIS", "Can I give him something to take with him?", .2),
 ("d3c", "death", "MOM", "Give him his beads. He loved those beads.", .35),
 ("d4", "death", "NARR", "The body is folded tightly, wrapped in cloth or matting, and buried under a platform. Then the floor is plastered smooth again.", .3),
 ("d5", "death", "NARR", "In twenty twenty-one, a DNA study found that many people buried in the same house here were not close relatives. Family was something you made. Not only something you were born into.", .3),
 ("d6", "death", "SIS", "Will he be lonely down there?", .25),
 ("d7", "death", "YOU", "No. He's right under my bed. Now I'll tell him the stories.", .4),
 ("d8", "death", "NARR", "Sometimes, the skull of an important person was taken out later, covered with plaster, and painted. One woman was found buried, holding a plastered skull in her arms.", .9),

 # ---- HOUSE ON HOUSE ----
 ("b1", "build", "NARR", "Years pass. You're grown up now. Your house is old, and the walls are cracking.", .25),
 ("b2", "build", "FAT", "It's time. We build the new house.", .25),
 ("b3", "build", "YOU", "Where?", .2),
 ("b4", "build", "FAT", "Right here. On top of this one.", .3),
 ("b5", "build", "NARR", "When a house got old, people took off the roof, filled the room with earth, and built a new house on top. Often with the walls in exactly the same place.", .3),
 ("b6", "build", "NARR", "Over more than a thousand years, house on house, the town grew into a hill twenty meters high.", .3),
 ("b7", "build", "SIS", "So our old house is under our new house?", .2),
 ("b8", "build", "YOU", "And grandmother's house is under that one. And her grandmother's under that.", .3),
 ("b9", "build", "NARR", "That's where the name comes from. In Turkish, höyük means a mound, a hill made by people. Çatal means fork.", .9),

 # ---- THE END OF THE TOWN ----
 ("z1", "end", "NARR", "Your town lasted more than a thousand years. Then, around six thousand BC, people moved across the river, and later they left for good.", .3),
 ("z2", "end", "NARR", "Why? Maybe the climate got drier. Maybe the town was simply too crowded. Nobody knows for sure.", .3),
 ("z3", "end", "YOU", "When I'm old, they'll bury me under this floor too. And one day, someone will build a house on top of me.", .3),
 ("z4", "end", "SIS", "And they'll never know you were here.", .3),
 ("z5", "end", "YOU", "Maybe they will.", .9),

 # ---- WAS IT REAL? ----
 ("r1", "real", "NARR", "In nineteen fifty-eight, a British archaeologist named James Mellaart noticed the mound. In the nineteen sixties, his team found the houses, the paintings, and the bull horns.", .3),
 ("r2", "real", "NARR", "And a little clay figure of a large woman, seated between two big cats. People called her the Mother Goddess.", .3),
 ("r3", "real", "NARR", "For decades, books said the people here worshipped a great goddess, and that women ruled. Today, most archaeologists think that's too simple. Most figurines aren't goddesses at all, and many are animals.", .3),
 ("r4", "real", "NARR", "Some of Mellaart's drawings were later questioned too. A few famous wall designs he published were never seen by anyone else.", .3),
 ("r5", "real", "NARR", "But the town itself is very real. Since nineteen ninety-three, teams from around the world have excavated here. In twenty twelve, it became a UNESCO World Heritage Site.", .3),
 ("r6", "real", "NARR", "Your town is older than Stonehenge, and older than the pyramids of Egypt, by more than four thousand years.", .3),
 ("r7", "real", "YOU", "No streets. No doors. Just ladders, white walls, and the people we loved, under our feet.", .4),
 ("r8", "real", "NARR", "So, could you live here? On the rooftops, in the smoke, sleeping above your ancestors? Tell me in the comments. And if you're ever near Konya, you can still visit it.", .5),
]
SAY = {'Çatalhöyük': 'Chatal höyük', 'Dağı': 'Dah', 'Mellaart': 'Mellart', "Mellaart's": "Mellart's"}

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
