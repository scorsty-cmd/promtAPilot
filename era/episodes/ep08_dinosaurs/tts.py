"""Multi-voice dialogue for 'If the Dinosaurs Never Went Extinct'.
-> public/vo.wav, src/timeline.json, src/mouth.json"""
import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICES = {
    'NARR': ('am_michael', .97, 'en-us'), 'YOU': ('am_liam', 1.0, 'en-us'), 'TROOD': ('bf_alice', .98, 'en-gb'),
    'PIP': ('af_sky', 1.12, 'en-us'), 'CROW': ('am_echo', 1.06, 'en-us'), 'DOC': ('af_nova', .99, 'en-us'),
}
L = [
 # ---- HOOK ----
 ("o1","open","NARR","You wake up. The ground is warm. And something is breathing on your face.",.3),
 ("o2","open","YOU","Okay. Okay. Nobody move. Especially you, big guy.",.3),
 ("o3","open","TROOD","Don't worry. He only eats things that run. So, please, don't run.",.35),
 ("o4","open","NARR","Sixty-six million years ago, a giant asteroid was heading for Earth. In this world, it missed. And now, you're here.",.9),

 ("m1","miss","YOU","Wait. You can talk?",.2),
 ("m2","miss","TROOD","Of course I can talk. I'm a troodont. Seventy million years of evolution. You're the one who looks strange.",.3),
 ("m3","miss","YOU","Where I come from, a rock ten kilometers wide hit Mexico and wiped out the dinosaurs.",.25),
 ("m4","miss","TROOD","Ten kilometers? That's a mountain. What happened?",.25),
 ("m5","miss","NARR","The impact threw so much soot and dust into the sky that the sun went dark for months. About three quarters of all species on Earth died, including every dinosaur that couldn't fly.",.3),
 ("m6","miss","YOU","And here's the crazy part. It hit one of the worst possible places, rocks full of oil and sulfur. Scientists calculated that if it had landed almost anywhere else, the dinosaurs might have survived.",.3),
 ("m7","miss","TROOD","So we were just unlucky?",.25),
 ("m8","miss","YOU","Very unlucky. A study from twenty seventeen says only about thirteen percent of the planet would have caused a mass extinction.",.3),
 ("m9","miss","YOU","Some scientists back home even say dinosaurs were already in decline before the asteroid.",.25),
 ("m10","miss","TROOD","Rude. Do I look like I'm in decline?",.3),
 ("m11","miss","NARR","That idea is still debated. Many dinosaur groups seem to have been doing fine right up to the very end.",.9),

 ("w1","world","NARR","Your guide's name is Trood. She leads you through a forest that has never seen a winter.",.25),
 ("w2","world","YOU","It's so hot. Where is all the ice?",.25),
 ("w3","world","TROOD","Ice? On the poles, there are only forests. And the sea comes much further inland.",.3),
 ("w4","world","NARR","In the age of dinosaurs, the Earth was a greenhouse. No ice caps. Sea levels were around a hundred meters higher than today. In this world, the planet never cooled down so far.",.3),
 ("w5","world","YOU","Are those flowers? I thought dinosaurs lived with ferns.",.25),
 ("w6","world","TROOD","Ferns are for my grandparents. We have flowers, fruit, and grass. They appeared while my ancestors were still around.",.3),
 ("w7","world","YOU","And something just bit me. Are there mosquitoes here too?",.25),
 ("w8","world","TROOD","Of course. Insects are older than all of us. And your blood is new to them. They will love you.",.9),

 ("l1","locals","YOU","Is that a T. rex? I knew it! I always knew they were real!",.25),
 ("l2","locals","TROOD","A what? That's a tyrannosaur, yes, but the one you know died out sixty-six million years ago, even here. Species don't last forever. This is its great-great-great, a million times great, grandchild.",.3),
 ("l3","locals","YOU","Does it have feathers? Back home, scientists argue about that all the time.",.25),
 ("l3b","locals","YOU","And how hard can it bite?",.2),
 ("l3c","locals","TROOD","Hard enough to crush a car. Whatever a car is.",.3),
 ("l4","locals","TROOD","Feathers? Babies do, for warmth. The big ones are mostly scales. Too hot for a fur coat when you weigh as much as an elephant.",.3),
 ("l5","locals","NARR","Skin fossils of big tyrannosaurs show mostly scales. Their smaller relatives had feathers.",.25),
 ("l5b","locals","YOU","What is that, in the sky? Is that a plane?",.2),
 ("l5c","locals","TROOD","A pterosaur. When it lands, it's as tall as a giraffe. Its wings are wider than a bus.",.3),
 ("l6","locals","YOU","And the ground is shaking. Why is the ground shaking?",.2),
 ("l7","locals","TROOD","Long-necks. Two hundred of them. Step behind the tree, please.",.9),

 ("s1","sea","NARR","Trood takes you to the coast. The sea is warm, shallow, and full of things you have only seen in museums.",.25),
 ("s2","sea","YOU","Can I swim?",.2),
 ("s3","sea","TROOD","You can. Once.",.3),
 ("s4","sea","NARR","Something huge rises out of the water. A mosasaur: a sea lizard longer than a school bus, with a double row of teeth in the roof of its mouth.",.25),
 ("s5","sea","YOU","Okay, I'll stay on the sand. Are there sharks too?",.25),
 ("s5b","sea","TROOD","Sharks are older than both of us. They survived everything.",.3),
 ("s6","sea","TROOD","Smart. Your species learns fast.",.25),
 ("s7","sea","NARR","Mosasaurs died out with the dinosaurs. Here, they rule the oceans. There are no whales, no dolphins, no seals. Those were all mammals that grew big after the asteroid.",.9),
 ("p1","mammals","YOU","Wait. If dinosaurs are still here, where are the mammals? Where are the people?",.25),
 ("p2","mammals","PIP","Down here! Hi! Please don't step on me!",.25),
 ("p3","mammals","YOU","A mouse?",.2),
 ("p4","mammals","PIP","A primate! Well, almost. I eat fruit, I climb trees, and I'm the size of a rat. My family has been doing this for millions of years.",.3),
 ("p5","mammals","NARR","Real fossils of a tiny tree-climber called Purgatorius date to just after the asteroid. Its family probably lived alongside the last dinosaurs. It may be one of your oldest ancestors.",.3),
 ("p6","mammals","YOU","So you're my great-grandparent?",.2),
 ("p7","mammals","PIP","Your great-great-great, a few million times great! But here, we never grew up. Every time a mammal gets big, something with teeth eats it.",.3),
 ("p8","mammals","NARR","That's the hard truth. With dinosaurs ruling the land, mammals would probably have stayed small. No apes. No humans. In this world, you shouldn't exist.",.9),

 ("i1","minds","YOU","Then who built that?",.25),
 ("i2","minds","TROOD","Our nests? My family did. Bigger brain, better hands, and we've had a lot of time.",.3),
 ("i3","minds","NARR","In nineteen eighty-two, the paleontologist Dale Russell imagined this exact idea. He took a smart dinosaur called Troodon and asked: what if it kept evolving? He called the result the dinosauroid.",.3),
 ("i4","minds","YOU","But yours doesn't look human at all.",.25),
 ("i5","minds","TROOD","Why would I? Your body is good for your history. Mine is good for mine. I keep the tail. It's great for balance.",.3),
 ("i6","minds","NARR","Many scientists criticized Russell's human-shaped version. A smart dinosaur would more likely look like a big, clever bird.",.3),
 ("i7","minds","TROOD","So tell me. What did your kind do with your big brains?",.25),
 ("i8","minds","YOU","We built cities. We flew to the Moon. We invented pizza. And we also made a pretty big mess.",.3),
 ("i9","minds","TROOD","Hmm. Maybe that asteroid did your planet a favor. Or maybe not.",.3),
 ("i10","minds","NARR","Trood shows you her town: hundreds of woven nests in the trees, and a field where her family herds duck-billed dinosaurs like cattle.",.25),
 ("i11","minds","YOU","You farm dinosaurs?",.2),
 ("i12","minds","TROOD","You farm birds, don't you? Same thing. These ones give eggs the size of your head.",.3),
 ("i13","minds","YOU","Okay, that's actually breakfast for a week.",.9),

 ("d1","danger","YOU","Okay, honest question. Could I survive here?",.25),
 ("d2","danger","TROOD","For a few days. Maybe. You're slow, you're soft, and you smell delicious.",.3),
 ("d3","danger","YOU","Thank you. Very helpful.",.2),
 ("d4","danger","TROOD","The air is fine for you, the fruit is fine. But at night, the small hunters come out, and they hunt in groups.",.25),
 ("d5","danger","PIP","That's why we sleep in holes! Want to share my hole?",.25),
 ("d6","danger","YOU","I don't think I'll fit.",.3),
 ("d7","danger","NARR","Night falls. Shapes move between the trees. Small, fast, feathered, and very quiet.",.25),
 ("d8","danger","TROOD","Don't move. Raptors see movement. Breathe slowly.",.25),
 ("d9","danger","PIP","Breathe slowly, he says. My heart beats ten times a second!",.25),
 ("d10","danger","YOU","Trood, what do we do?",.2),
 ("d11","danger","TROOD","Now? Now we run.",.3),
 ("d12","danger","NARR","You run. Trood runs faster. Pip rides on your shoulder, screaming the whole way.",.25),
 ("d13","danger","PIP","Left! No, right! No, up! Up the tree!",.25),
 ("d14","danger","YOU","I can't climb that fast!",.2),
 ("d15","danger","TROOD","Then grab my tail!",.9),

 ("t1","twist","NARR","And then you wake up again. A real bed. A real window. Your world.",.25),
 ("t2","twist","CROW","Caw. Morning.",.25),
 ("t3","twist","YOU","Wait. Did you just say morning?",.25),
 ("t3b","twist","DOC","It's a crow, not a parrot. And you were talking in your sleep. Something about please don't run?",.25),
 ("t3c","twist","YOU","Long night. Very long night.",.3),
 ("t4","twist","DOC","Crows can't talk, but they do something just as impressive. They make tools, remember faces, and plan ahead. And they are dinosaurs.",.3),
 ("t5","twist","YOU","Dinosaurs? Crows?",.2),
 ("t5b","twist","DOC","The asteroid really hit, by the way. The crater is still under Mexico. It's called Chicxulub, and it's about a hundred and eighty kilometers wide.",.25),
 ("t5c","twist","YOU","So in my world, the dinosaurs lost.",.25),
 ("t6","twist","DOC","Not all of them. Birds are the dinosaurs that survived the asteroid. In two thousand and eight, scientists compared proteins from a T. rex bone. Its closest living relatives were chickens and ostriches.",.3),
 ("t7","twist","NARR","There are about eleven thousand species of birds alive today. And a parrot's brain packs more neurons than a monkey's brain of the same size.",.3),
 ("t8","twist","YOU","So the dinosaurs never really went extinct.",.25),
 ("t9","twist","DOC","Exactly. They just got smaller, grew wings, and learned to sing.",.35),
 ("t9b","twist","YOU","Morning, little dinosaur.",.2),
 ("t9c","twist","CROW","Caw!",.35),
 ("t10","twist","NARR","So, which world would you rather live in? Theirs, or ours? Tell me in the comments.",.5),
]
if __name__ == "__main__":
    k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin"); SR = 24000
    t = .3; chunks = [np.zeros(int(.3 * SR), np.float32)]; tl = []; prev = None; mouth_src = []
    for key, ch, sp, text, gap in L:
        if prev and ch != prev: chunks.append(np.zeros(int(1.3 * SR), np.float32)); t += 1.3
        prev = ch; v, s, lang = VOICES[sp]
        a, _ = k.create(text.replace('troodont', 'troo-o-dont').replace('T. rex', 'T rex'), voice=v, speed=s, lang=lang); a = np.asarray(a, np.float32)
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
