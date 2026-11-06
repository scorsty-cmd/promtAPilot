"""Multi-voice dialogue for 'If You Were a Soldier at Troy' (Trojan side).
-> public/vo.wav, src/timeline.json, src/mouth.json"""
import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICES = {
    'NARR': ('am_michael', .97, 'en-us'), 'YOU': ('am_liam', 1.0, 'en-us'), 'ILOS': ('am_puck', 1.04, 'en-us'),
    'DAD': ('am_onyx', .94, 'en-us'), 'HEC': ('am_fenrir', .96, 'en-us'), 'AND': ('bf_emma', .97, 'en-gb'),
    'PRI': ('bm_fable', .9, 'en-gb'), 'LAO': ('bm_george', .97, 'en-gb'), 'CAS': ('bf_isabella', 1.02, 'en-gb'),
    'AEN': ('am_adam', .97, 'en-us'), 'SCOUT': ('am_echo', 1.03, 'en-us'), 'ACH': ('bm_daniel', .95, 'en-gb'), 'SIN': ('am_eric', 1.0, 'en-us'),
}
L = [
 # ---- HOOK: the horse is already inside ----
 ("o1","open","NARR","This is the last night of Troy.",.3),
 ("o2","open","ILOS","They're gone! The Greeks are gone! Ten years, and they just sailed away!",.25),
 ("o3","open","YOU","And they left us a giant wooden horse. Doesn't that seem strange to you?",.25),
 ("o4","open","ILOS","It's a gift to the gods, brother. Drink! We won!",.35),
 ("o5","open","NARR","You are a Trojan soldier. You survived ten years of war. In six hours, your city will burn. To see how, go back ten years.",.9),

 ("h1","home","NARR","Troy. A rich city on the coast of Anatolia, guarding the sea road to the Black Sea. Today, its ruins lie in Turkey, near Çanakkale.",.3),
 ("h2","home","DAD","Hold the reins steady, son. Troy breeds the finest horses in the world.",.25),
 ("h2b","home","ILOS","Did you see her at the harbor? They say she's the most beautiful woman alive.",.25),
 ("h2c","home","YOU","I saw a lot of Spartan gold. And a lot of guards.",.3),
 ("h3","home","YOU","Father, is it true? Prince Paris came back from Sparta with another man's wife?",.25),
 ("h4","home","DAD","Helen. Queen of Sparta. And her husband's brother is Agamemnon, the most powerful king in Greece.",.25),
 ("h5","home","YOU","So what happens now?",.25),
 ("h6","home","DAD","Now? Now we sharpen our spears.",.3),
 ("h7","home","YOU","A war? Over one woman?",.25),
 ("h8","home","DAD","Wars are never about one woman, son. Every ship that sails to the Black Sea passes our coast. The Greeks want what we have.",.9),

 ("s1","ships","NARR","A year later, you're on the wall at dawn.",.25),
 ("s2","ships","ILOS","Gods. Look at the sea. How many ships are there?",.25),
 ("s3","ships","YOU","I stopped counting at three hundred.",.3),
 ("s3b","ships","ILOS","Look! Prince Hector is coming down from the palace!",.3),
 ("s4","ships","NARR","Homer lists more than a thousand ships. Probably far fewer. But to you, it looks like the whole world has come for Troy.",.3),
 ("s5","ships","HEC","Trojans! To the beach! Push them back into the sea!",.3),
 ("s6","ships","NARR","A prophecy said the first Greek to step onto Trojan soil would die. He jumps anyway. He dies at once.",.25),
 ("s7","ships","ILOS","Ha! Who wants to be second?",.3),
 ("s8","ships","NARR","Thousands do. The Greeks take the beach.",.9),

 ("w1","siege","NARR","But they can't take the city. So they build a camp on the shore, and they stay. Year after year.",.3),
 ("w2","siege","YOU","Nine years, Ilos. I was sixteen when this started.",.25),
 ("w3","siege","ILOS","And now you're old and ugly. Pass the bread.",.25),
 ("w3b","siege","ILOS","My uncle says the Greeks are so hungry, they're eating their own horses.",.25),
 ("w3c","siege","YOU","Your uncle also says he once wrestled a lion.",.25),
 ("w3d","siege","ILOS","A small lion. It still counts.",.35),
 ("w4","siege","YOU","Father, why don't they just attack the walls?",.25),
 ("w5","siege","DAD","Look at them. The old songs say Poseidon himself built these walls.",.25),
 ("w6","siege","YOU","Did he?",.2),
 ("w7","siege","DAD","No. But the walls are real. And no ladder in Greece is tall enough.",.3),
 ("w8","siege","NARR","A full bronze armor costs as much as a farm. Most men fight with a spear, a shield of wood and leather, and a lot of hope.",.3),
 ("w9","siege","DAD","Shield high. And never, ever break the line. A line of shields is a wall. A man alone is just a target.",.25),
 ("w10","siege","YOU","Yes, Father. Never break the line.",.9),

 ("a1","achilles","SCOUT","News from the Greek camp! Achilles has quarreled with King Agamemnon!",.25),
 ("a2","achilles","ILOS","Achilles? Their best fighter?",.2),
 ("a3","achilles","SCOUT","He's sitting in his tent. He swears he won't fight for them anymore.",.25),
 ("a3b","achilles","YOU","What did they fight about?",.2),
 ("a3c","achilles","SCOUT","A captive girl named Briseis. Agamemnon took her from him, so Achilles took himself out of the war.",.3),
 ("a4","achilles","HEC","Then tomorrow we attack. We will burn their ships!",.25),
 ("a4b","achilles","YOU","If their ships burn, they can never go home.",.25),
 ("a4c","achilles","ILOS","Then they'll fight like wolves in a corner. Sleep well, brother.",.3),
 ("a5","achilles","NARR","This is what Homer's Iliad is really about: the anger of Achilles. And for the first time in nine years, Troy is winning.",.9),

 ("b1","battle","NARR","Dawn. The gates open, and thousands of Trojans pour onto the plain. You're in the front line.",.25),
 ("b1b","battle","HEC","Trojans! Today we fight for our wives, our children, and the walls of our fathers! Forward!",.3),
 ("b2","battle","ILOS","Shields up! Stay together! Whatever happens, stay next to me!",.25),
 ("b3","battle","NARR","Chariots thunder past. Arrows hiss overhead. Then the two armies crash together.",.25),
 ("b3b","battle","ILOS","Chariot! Get down!",.2),
 ("b4","battle","YOU","Ilos! On your left!",.2),
 ("b5","battle","ILOS","I see him! Push! Push!",.2),
 ("b5b","battle","YOU","Hold the line! Don't break the line!",.25),
 ("b6","battle","HEC","Fire! Bring fire to the ships!",.3),
 ("b7","battle","NARR","The first Greek ship goes up in flames. And then, out of the smoke, a warrior in shining armor charges straight at you.",.25),
 ("b8","battle","YOU","Achilles! It's Achilles!",.3),
 ("b9","battle","NARR","It isn't. It's his best friend, Patroclus, wearing his armor. Hector cuts him down. And now, Achilles will come for revenge.",.3),
 ("b10","battle","YOU","Ilos! Are you hurt?",.2),
 ("b11","battle","ILOS","Just a scratch. Bronze is cheaper than skin.",.9),

 ("k1","hector","NARR","That evening, you're guarding the gate when Hector stops to say goodbye to his wife.",.25),
 ("k2","hector","AND","Hector, please. Stay inside the walls. If you die, what happens to us?",.25),
 ("k3","hector","HEC","If I hide, I could never look a Trojan in the eye again. I have to fight.",.25),
 ("k3b","hector","AND","Then come back to us.",.25),
 ("k3c","hector","HEC","I will try. That is all a soldier can promise.",.3),
 ("k4","hector","NARR","He reaches for his baby son. The child screams, terrified of the horsehair crest on his helmet. Hector laughs, takes it off, and kisses him.",.3),
 ("k4b","hector","HEC","One day, may they say of you: he is even braver than his father.",.35),
 ("k5","hector","NARR","The next day, Achilles returns. Every Trojan runs for the gates. Except one.",.25),
 ("k6","hector","ILOS","Hector! Get inside! Hector!",.25),
 ("k7","hector","ACH","Hector! Turn and face me!",.3),
 ("k8","hector","NARR","Achilles chases him around the walls three times. Then it's over.",.3),
 ("k8b","hector","YOU","Hector is dead. Who will protect Troy now?",.35),
 ("k9","hector","NARR","That night, old King Priam walks alone into the enemy camp, and kneels before Achilles.",.25),
 ("k10","hector","PRI","Remember your own father, Achilles. I have done what no man has done. I have kissed the hands of the man who killed my son.",.3),
 ("k11","hector","ACH","Get up, old man. Take him home.",.35),
 ("k12","hector","NARR","The Iliad ends right here, with Hector's funeral. Not with the fall of Troy.",.9),

 ("t1","horse","NARR","Months later, you wake up to silence. The Greek camp is empty. And on the beach stands a giant wooden horse.",.25),
 ("t2","horse","ILOS","They've given up! It's an offering. We should take it to the temple!",.25),
 ("t3","horse","LAO","Are you mad? Burn it! I fear the Greeks, even when they bring gifts!",.25),
 ("t3b","horse","SIN","Wait! I am Sinon. The Greeks left me behind. The horse is an offering to Athena. They built it huge, so you could never take it into your city, because if you did, Troy could never fall.",.25),
 ("t4","horse","CAS","Fire! I see fire and blood! Troy is burning!",.25),
 ("t5","horse","YOU","That's Princess Cassandra. The gods cursed her. She always tells the truth, and nobody ever believes her.",.25),
 ("t5b","horse","ILOS","She says that about everything.",.25),
 ("t6","horse","ILOS","Come on, grab a rope! Pull!",.3),
 ("t7","horse","NARR","The horse is too big for the gate. So the Trojans break open their own wall to bring it in.",.3),
 ("t8","horse","YOU","We just broke our own wall, for a horse.",.25),
 ("t9","horse","ILOS","Relax! Tonight, we celebrate!",.9),

 ("n1","night","NARR","Back to tonight. Midnight. While Troy sleeps, a hidden door opens in the belly of the horse.",.3),
 ("n2","night","YOU","Ilos. Ilos, wake up! Do you hear that?",.25),
 ("n3","night","ILOS","The gates! Someone has opened the gates!",.25),
 ("n3b","night","YOU","Get your shield! Where's your spear?",.2),
 ("n3c","night","ILOS","Go! Find my mother! I'll hold them here!",.3),
 ("n4","night","NARR","The Greek fleet was hiding behind the island of Tenedos. Now the whole army is inside the walls.",.3),
 ("n5","night","AEN","Trojan! This way! The city is lost. Save who you can!",.25),
 ("n6","night","YOU","Ilos! Ilos, come on!",.25),
 ("n6b","night","ILOS","Go! Remember me, brother!",.3),
 ("n7","night","NARR","You follow Prince Aeneas through the smoke. He carries his old father on his back.",.25),
 ("n8","night","YOU","Where are we going?",.2),
 ("n9","night","AEN","Wherever the sea takes us. As long as we live, Troy lives.",.35),
 ("n10","night","NARR","Roman legend says Aeneas sailed west to Italy, and his descendants founded Rome.",.9),

 ("r1","real","NARR","So, was any of it real?",.3),
 ("r2","real","NARR","In eighteen seventy-one, Heinrich Schliemann dug into a hill called Hisarlık, near Çanakkale. He found not one city, but nine, built on top of each other.",.25),
 ("r2b","real","YOU","Nine Troys? Which one was mine?",.3),
 ("r3","real","NARR","One of them burned around eleven eighty BC. Archaeologists found signs of fire, and arrowheads and sling stones in its streets.",.3),
 ("r4","real","NARR","And in Hittite archives, there are letters about a kingdom called Wilusa, which sounds a lot like Ilios, Homer's name for Troy. One of its kings was called Alaksandu.",.25),
 ("r4b","real","YOU","Alaksandu. Alexandros. That's Paris's other name!",.3),
 ("r4c","real","YOU","And the horse?",.25),
 ("r4d","real","NARR","The horse isn't in the Iliad at all. Some historians think it's a memory of a siege engine. Or of an earthquake: Poseidon was the god of both horses and earthquakes.",.3),
 ("r5","real","YOU","So the war might have been real?",.25),
 ("r6","real","NARR","The city was real. And it burned. The rest, historians are still arguing about.",.35),
 ("r7","real","NARR","So, if you'd been standing in that square, looking up at the horse, would you have pulled it inside? Tell me in the comments.",.5),
]
if __name__ == "__main__":
    k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin"); SR = 24000
    t = .3; chunks = [np.zeros(int(.3 * SR), np.float32)]; tl = []; prev = None; mouth_src = []
    for key, ch, sp, text, gap in L:
        if prev and ch != prev: chunks.append(np.zeros(int(1.3 * SR), np.float32)); t += 1.3
        prev = ch; v, s, lang = VOICES[sp]
        a, _ = k.create(text.replace('Hisarlık', 'Hisarlik').replace('Çanakkale', 'Chanakkaleh'), voice=v, speed=s, lang=lang); a = np.asarray(a, np.float32)
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
