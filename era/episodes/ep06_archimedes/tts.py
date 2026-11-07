"""Multi-voice dialogue for 'If You Were Archimedes' Student' (Syracuse, c. 230–212 BC).
-> public/vo.wav, src/timeline.json, src/mouth.json"""
import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICES = {
    'NARR': ('am_michael', .97, 'en-us'), 'YOU': ('am_liam', 1.0, 'en-us'), 'ARCH': ('bm_george', .92, 'en-gb'),
    'KLEO': ('am_puck', 1.05, 'en-us'), 'HIERO': ('am_onyx', .93, 'en-us'), 'GOLD': ('am_echo', 1.0, 'en-us'),
    'MARC': ('bm_daniel', .95, 'en-gb'), 'SOLD': ('am_fenrir', 1.0, 'en-us'), 'MOM': ('bf_emma', .98, 'en-gb'),
    'CAPT': ('am_eric', 1.0, 'en-us'), 'CIC': ('bm_lewis', .96, 'en-gb'),
}
L = [
 # ---- HOOK ----
 ("o1","open","NARR","Syracuse, Sicily. Two hundred and twelve BC. The Romans are inside the city.",.3),
 ("o2","open","SOLD","You! Old man! The general wants you. Get up!",.25),
 ("o3","open","ARCH","Not now. Do not disturb my circles!",.35),
 ("o4","open","NARR","You are the student of the greatest mind of the ancient world. And this is his last day. Go back twenty years.",.9),

 ("w1","workshop","NARR","You're twelve, and your mother sends you to deliver bread to a strange old man near the harbor.",.25),
 ("w2","workshop","MOM","Give him the bread, and make sure he eats it. His servants say he forgets.",.25),
 ("w3","workshop","YOU","Sir? Your bread. Sir? Why are you drawing circles in the ashes?",.25),
 ("w4","workshop","ARCH","Because I have no sand tray, and the fire went out. Come here. Tell me: which is bigger, this circle, or this square?",.3),
 ("w5","workshop","YOU","The square?",.2),
 ("w6","workshop","ARCH","Wrong! But a good guess. Come back tomorrow, and I'll show you why.",.35),
 ("w7","workshop","NARR","His name is Archimedes. He's about fifty-five, a relative of the king, and the most famous mathematician alive. You never deliver bread again. You become his student.",.3),
 ("w8","workshop","KLEO","I'm Kleon, the other apprentice. Rule one: when he's thinking, don't talk. Rule two: he's always thinking.",.9),

 ("c1","crown","NARR","One day, a message comes from King Hiero himself.",.25),
 ("c2","crown","HIERO","I gave a goldsmith pure gold to make a crown for the gods. I think he kept some gold, and mixed in silver. Prove it, Archimedes. And don't damage the crown.",.3),
 ("c3","crown","GOLD","Your Majesty, it's pure gold, I swear by every god in Sicily!",.3),
 ("c4","crown","YOU","Master, how can you see inside a crown without breaking it?",.25),
 ("c5","crown","ARCH","I don't know yet. I am going to take a bath and think.",.35),
 ("c6","crown","NARR","He steps into a full bath, and the water spills over the edge. And he jumps out.",.25),
 ("c7","crown","ARCH","Eureka! Eureka! I have found it!",.25),
 ("c8","crown","KLEO","Master! Your clothes! You're running through the streets with no clothes!",.3),
 ("c9","crown","ARCH","Silver is lighter than gold, so the same weight of silver takes more space. A cheating crown will push out more water than the pure gold!",.3),
 ("c9b","crown","YOU","But why not just weigh it?",.2),
 ("c9c","crown","ARCH","I did. Same weight! The trick is not the weight. It is the space the crown takes up.",.3),
 ("c10","crown","NARR","The crown spills more water than the gold. The goldsmith is caught. This story was written down two hundred years later, so maybe it's true, and maybe it's too good to be true.",.9),

 ("l1","lever","HIERO","Archimedes, they say you can move anything. Prove it. My new ship, the Syracusia, is too heavy for a hundred men to launch.",.25),
 ("l2","lever","ARCH","Give me a place to stand, Your Majesty, and I will move the Earth.",.3),
 ("l3","lever","CAPT","The Earth? Sir, just move the boat. It's the biggest ship ever built.",.3),
 ("l4","lever","NARR","He builds a system of pulleys and ropes. Then he sits down, alone, and slowly pulls.",.25),
 ("l5","lever","KLEO","It's moving! The whole ship is moving!",.25),
 ("l6","lever","YOU","Master, how? You're not even sweating!",.25),
 ("l7","lever","ARCH","Every pulley halves the effort. Use enough of them, and one old man is stronger than a hundred.",.3),
 ("l7b","lever","HIERO","From this day on, Archimedes is to be believed in everything he says!",.3),
 ("l8","lever","NARR","On that same ship, sailors use a turning screw to pump water out of the hull. Farmers still use the Archimedes screw today.",.9),

 ("p1","numbers","YOU","Master, what are you counting now?",.2),
 ("p2","numbers","ARCH","Grains of sand. How many grains would it take to fill the whole universe?",.25),
 ("p3","numbers","KLEO","That's impossible. There are infinitely many.",.25),
 ("p4","numbers","ARCH","No, Kleon. Very many is not infinitely many. I need a number with sixty-three zeros. So I'll invent a new way to write big numbers.",.3),
 ("p5","numbers","YOU","And the circle from the first day? Why was it bigger than the square?",.25),
 ("p6","numbers","ARCH","Watch. I draw a shape with six sides inside the circle. Then twelve. Then twenty-four, forty-eight, ninety-six. The closer they hug the circle, the better I can measure it.",.3),
 ("p7","numbers","NARR","That's how Archimedes trapped the number pi between two fractions: a little more than three and ten seventy-firsts, and a little less than three and one seventh. Engineers used his bounds for more than a thousand years.",.9),

 ("s1","siege","NARR","Then King Hiero dies, and Syracuse switches sides, from Rome to Carthage. In two-fourteen BC, a Roman army arrives.",.25),
 ("s2","siege","MARC","Syracuse has old walls and an old mathematician. We attack from the land and the sea at once. Five days, and the city is ours.",.3),
 ("s3","siege","KLEO","Sixty Roman warships, with ladders on them! Master, what do we do?",.25),
 ("s3b","siege","YOU","Master, you're over seventy. Shouldn't you hide?",.25),
 ("s3c","siege","ARCH","At my age, hiding takes too long.",.3),
 ("s4","siege","ARCH","We do geometry. Boys, bring the ropes. And the big hook.",.9),

 ("k1","claw","NARR","As the Roman ships reach the walls, giant wooden arms swing out over the water.",.25),
 ("k2","claw","YOU","Lower it! Lower the claw! Now pull!",.25),
 ("k3","claw","NARR","An iron hook grabs a warship by the bow, lifts it out of the sea, and drops it.",.25),
 ("k4","claw","KLEO","Ha! Look at them swim!",.25),
 ("k5","claw","NARR","Catapults hit the ships far out at sea. Smaller ones hit them up close. The Romans have nowhere to hide.",.3),
 ("k5b","claw","KLEO","The ladder ships! They're tying ships together to carry a ladder!",.2),
 ("k5c","claw","YOU","Drop the stones! Now! Break the ladder!",.3),
 ("k6","claw","MARC","Are we going to keep fighting this geometrical giant, who plays catch with our ships?",.3),
 ("k7","claw","NARR","Soon, if the Romans see so much as a rope or a beam over the wall, they turn and run. The siege drags on for two years.",.9),

 ("m1","mirrors","KLEO","Master, people in the market say you burn Roman ships with mirrors.",.25),
 ("m2","mirrors","ARCH","Do they? How clever of me.",.25),
 ("m3","mirrors","YOU","Could we? If every soldier on the wall held a polished shield?",.25),
 ("m4","mirrors","ARCH","The sun is strong, but ships move. And the sky is not always clear. Try it, and tell me.",.35),
 ("m5","mirrors","NARR","No writer from the time mentions burning mirrors. The story appears centuries later. In two thousand and five, MIT students lit a model ship with a hundred and twenty-seven mirrors, but only after ten minutes of perfect sun on a ship that didn't move.",.9),

 ("f1","fall","NARR","Two-twelve BC. The city celebrates a festival for Artemis. Wine, music, and tired guards.",.25),
 ("f2","fall","KLEO","Listen. Do you hear that? Something on the wall.",.25),
 ("f3","fall","YOU","Ladders! The Romans are on the wall! Wake up! Wake up!",.3),
 ("f3b","fall","KLEO","Where's the master?",.2),
 ("f3c","fall","YOU","In the courtyard, drawing. Where else? Come on!",.3),
 ("f4","fall","NARR","By morning, the Romans hold most of the city. General Marcellus looks down at Syracuse, and he weeps.",.25),
 ("f5","fall","MARC","Find Archimedes. Bring him to me alive. No one touches him.",.9),

 ("d1","circles","YOU","Master, we have to go! The soldiers are everywhere!",.25),
 ("d2","circles","ARCH","One moment. I am so close. Look at this figure.",.25),
 ("d3","circles","SOLD","You! Old man! The general wants you. Get up!",.25),
 ("d4","circles","ARCH","Not now. Do not disturb my circles!",.35),
 ("d5","circles","NARR","The soldier doesn't know who he is. The greatest mind of the ancient world dies over a drawing in the sand. Some versions say so, at least. Even Plutarch tells three different stories.",.3),
 ("d6","circles","MARC","Who did this? I gave an order! He was worth more than the whole city.",.3),
 ("d7","circles","NARR","Marcellus gives Archimedes an honorable burial. On his tomb, as he wished: a sphere inside a cylinder. His proudest discovery.",.9),

 ("b1","book","NARR","A hundred and thirty-seven years later, the Roman orator Cicero comes to Syracuse and searches for the tomb.",.25),
 ("b2","book","CIC","Cut away these bushes. There! A sphere and a cylinder. The Syracusans had forgotten their own greatest citizen.",.3),
 ("b3","book","NARR","Then his books almost vanish too. In twelve twenty-nine, a monk scrapes the ink off an old copy of Archimedes and writes a prayer book on top of it.",.25),
 ("b4","book","YOU","They erased him?",.25),
 ("b5","book","NARR","Almost. In nineteen-oh-six, a Danish scholar in Istanbul spots faint mathematics under the prayers. In nineteen ninety-eight, the book sells for two million dollars. Scientists scan it with X-rays.",.3),
 ("b6","book","NARR","Underneath is a lost book called The Method. Archimedes was slicing shapes into infinitely thin pieces: ideas close to calculus, almost two thousand years early.",.3),
 ("b7","book","ARCH","Very many is not infinitely many. But it is a beginning.",.35),
 ("b8","book","NARR","So, if you'd been his student, which of his machines would you have built first? Tell me in the comments.",.5),
]
if __name__ == "__main__":
    k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin"); SR = 24000
    t = .3; chunks = [np.zeros(int(.3 * SR), np.float32)]; tl = []; prev = None; mouth_src = []
    for key, ch, sp, text, gap in L:
        if prev and ch != prev: chunks.append(np.zeros(int(1.3 * SR), np.float32)); t += 1.3
        prev = ch; v, s, lang = VOICES[sp]
        a, _ = k.create(text.replace('Syracusia', 'Sirakusia').replace('two-fourteen', 'two fourteen').replace('Two-twelve', 'Two twelve'), voice=v, speed=s, lang=lang); a = np.asarray(a, np.float32)
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
    print("total", round(t, 1), "words", words, "dialogue share", round(dl / words, 2))
    ch = {}
    for l in tl: ch.setdefault(l['chapter'], [l['start'], l['end']])[1] = l['end']
    for c, (a, b) in ch.items(): print(f"{c:10s} {a:6.1f} {b:6.1f}")
