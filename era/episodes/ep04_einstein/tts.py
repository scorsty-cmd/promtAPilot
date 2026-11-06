"""Multi-voice dialogue for 'If You Were Einstein's Student'.
-> public/vo.wav, src/timeline.json (lines with speaker), src/mouth.json (per-speaker mouth openness at 30 fps)."""
import json, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICES = {  # speaker: (voice, speed, lang)
    'NARR': ('am_michael', .97, 'en-us'), 'YOU': ('am_liam', 1.0, 'en-us'), 'EIN': ('bm_lewis', .93, 'en-gb'),
    'HAB': ('am_puck', 1.03, 'en-us'), 'SOL': ('em_alex', .95, 'en-us'), 'MIL': ('bf_lily', .97, 'en-gb'),
    'BES': ('im_nicola', .95, 'en-us'), 'EDD': ('bm_fable', .96, 'en-gb'), 'BOHR': ('bm_daniel', .96, 'en-gb'),
    'SZI': ('am_eric', .97, 'en-us'), 'DOC': ('am_adam', .97, 'en-us'), 'GRO': ('am_onyx', .96, 'en-us'),
}
# (key, chapter, speaker, text, pause after)
L = [
 ("o1","open","NARR","Princeton, New Jersey. April, nineteen fifty-five. An old man in a hospital bed asks for only one thing.",.35),
 ("o2","open","EIN","My papers, please. And my glasses. I am not finished.",.3),
 ("o3","open","DOC","Professor Einstein, you need to rest.",.3),
 ("o4","open","EIN","Rest? I have rested enough. There is still one equation missing.",.35),
 ("o5","open","NARR","That's him. And you've known him for fifty years. To see how, we go back to a newspaper ad.",.9),

 ("d1","ad","NARR","Bern, Switzerland. Nineteen-oh-two. You're a broke young student, and a tiny ad catches your eye.",.3),
 ("d2","ad","YOU","Private lessons in mathematics and physics. Trial lesson free. Albert Einstein. Free? I'll take it.",.35),
 ("d3","ad","NARR","A young man with wild dark hair opens the door. He's twenty-three, and he has no job.",.3),
 ("d4","ad","EIN","Come in, come in! You want to learn physics? Good. Then tell me first: what is time?",.3),
 ("d5","ad","YOU","Time? It's, um, what clocks measure?",.25),
 ("d6","ad","EIN","Ha! And what do clocks measure? Time! You see? We are already in trouble.",.3),
 ("d6b","ad","YOU","So what is time, really?",.25),
 ("d6c","ad","EIN","I don't know yet. That is the fun part!",.35),
 ("d7","ad","NARR","The trial lesson lasts four hours. He never asks you for a single franc.",.3),
 ("d8","ad","EIN","Forget the lessons. Come back tomorrow. Talking is better than teaching.",.9),

 ("k1","academy","NARR","Soon you're part of a tiny club with his friends, Maurice Solovine and Conrad Habicht. They give it a grand name.",.3),
 ("k2","academy","HAB","I hereby open the session of the Olympia Academy! Tonight's feast: one sausage, some cheese, and tea.",.3),
 ("k3","academy","SOL","And tonight's book is David Hume. Albert, you start.",.25),
 ("k4","academy","EIN","Hume says we never see a cause. We see one thing, and then another. So, can we be sure of anything?",.3),
 ("k5","academy","YOU","We can be sure the sausage is gone.",.35),
 ("k6","academy","HAB","Psst. For his birthday, we bought real caviar. Watch this.",.3),
 ("k7","academy","NARR","He's busy explaining Galileo's law of inertia. He eats the whole plate, and never notices.",.3),
 ("k8","academy","EIN","So that was caviar? Well. Fine food is wasted on a peasant like me.",.35),
 ("k9","academy","NARR","He needs money, so a friend helps him get a job: Technical Expert, Third Class, at the Swiss Patent Office. Soon after, he marries Mileva Marić, a physics student from his university.",.3),
 ("k10","academy","MIL","Albert, you'll be reading patents for electric clocks all day.",.25),
 ("k11","academy","EIN","Exactly, Mileva! Clocks! How do you make two clocks in two cities agree? That is a deep question.",.9),

 ("m1","miracle","NARR","Nineteen-oh-five. A warm evening in May. He drags you and his best friend, Michele Besso, to a café.",.3),
 ("m2","miracle","EIN","Besso, you must help me. I think I am going mad.",.25),
 ("m3","miracle","BES","Calm down, Albert. Which problem is it this time?",.25),
 ("m4","miracle","EIN","Light! If I chase a beam of light, does it slow down for me? It cannot. Light always moves at the same speed.",.3),
 ("m5","miracle","BES","Then something else must give way.",.25),
 ("m6","miracle","EIN","But what? Space? Time?",.35),
 ("m7","miracle","NARR","The next morning, at the patent office, he walks straight up to Besso. No hello.",.3),
 ("m8","miracle","EIN","Thank you. I've completely solved the problem.",.3),
 ("m9","miracle","EIN","Time is not the same for everyone. Two clocks, moving differently, do not agree.",.3),
 ("m10","miracle","YOU","So my now and your now aren't the same?",.25),
 ("m11","miracle","EIN","Not if we are moving. Isn't it wonderful?",.35),
 ("m11b","miracle","YOU","Albert, how many papers did you send out this year?",.25),
 ("m11c","miracle","EIN","Five! Light, atoms, relativity, and my doctorate. Not bad for a clerk, no?",.35),
 ("m12","miracle","NARR","That year, a twenty-six-year-old patent clerk publishes papers on light, on atoms, and on relativity. They call it his miracle year.",.9),

 ("e1","emc2","YOU","You wrote one more paper? It's only three pages!",.25),
 ("e2","emc2","EIN","Short, but important. Mass and energy are the same thing, in different clothes.",.3),
 ("e3","emc2","YOU","So how much energy is in, say, one raisin?",.25),
 ("e4","emc2","EIN","Take its mass. Multiply by the speed of light, squared. A very, very big number.",.35),
 ("e5","emc2","NARR","E equals m c squared. One gram of matter holds the energy of about twenty thousand tons of explosives. In nineteen-oh-five, nobody imagines where this leads.",.9),

 ("h1","happy","NARR","Nineteen-oh-seven. He's still at the patent office, staring out of the window.",.3),
 ("h2","happy","EIN","Ach! I just had the happiest thought of my life.",.25),
 ("h3","happy","YOU","They finally promoted you?",.25),
 ("h4","happy","EIN","Better! A man falling from a roof does not feel his own weight.",.25),
 ("h5","happy","YOU","Until he hits the ground.",.3),
 ("h6","happy","EIN","Before that! Falling and floating are the same. So gravity is not a pull at all. It is space and time, bending.",.35),
 ("h7","happy","NARR","Turning that one thought into mathematics takes him years. By nineteen twelve, he begs an old classmate for help.",.3),
 ("h8","happy","EIN","Grossmann, you must help me, or I'll go crazy!",.25),
 ("h9","happy","GRO","Riemann's geometry? Albert, it's a terrible mess. Physicists should stay away from it.",.25),
 ("h10","happy","EIN","Then I will make a mess, my friend.",.9),

 ("s1","eclipse","NARR","November, nineteen fifteen. Berlin. He tests his finished theory on an old puzzle: the strange orbit of Mercury.",.3),
 ("s2","eclipse","EIN","It fits. Exactly! My heart is racing. I am beside myself with joy!",.35),
 ("s3","eclipse","EIN","But the real test needs the Sun. If I'm right, starlight bends around it. We can only see that during a total eclipse.",.3),
 ("s4","eclipse","NARR","May, nineteen nineteen. The British astronomer Arthur Eddington photographs the eclipse from an island off Africa.",.3),
 ("s5","eclipse","EDD","The stars have shifted. Just as Einstein predicted.",.35),
 ("s6","eclipse","YOU","Professor, they confirmed it! But what if the photos had proved you wrong?",.25),
 ("s7","eclipse","EIN","Then I would have felt sorry for the dear Lord. The theory is correct.",.35),
 ("s8","eclipse","NARR","Overnight, he's the most famous scientist on Earth. Newspapers call it a revolution in science.",.35),
 ("s9","eclipse","YOU","And now the Nobel Prize! For relativity, right?",.25),
 ("s10","eclipse","EIN","No! For my little paper on light, from nineteen-oh-five. They still don't trust relativity.",.9),

 ("q1","bohr","NARR","Brussels, nineteen twenty-seven. The greatest physicists alive meet to argue about the strange rules of atoms.",.3),
 ("q2","bohr","BOHR","At the smallest scales, nature is a game of chance. We can only know probabilities.",.25),
 ("q3","bohr","EIN","I cannot believe that. God does not play dice.",.25),
 ("q4","bohr","BOHR","Einstein, stop telling God what to do!",.35),
 ("q5","bohr","NARR","At every meeting, he brings a new thought experiment to break the theory. And every time, Bohr finds an answer.",.3),
 ("q5b","bohr","EIN","Bohr! A box full of light, with a clock inside. Weigh the box, and your uncertainty is broken!",.25),
 ("q5c","bohr","BOHR","Ah, but a clock that moves in gravity runs differently, Albert. Your own relativity saves me!",.3),
 ("q6","bohr","YOU","So who's winning?",.25),
 ("q7","bohr","EIN","Bohr, today. Tomorrow? We shall see.",.3),
 ("q8","bohr","NARR","Experiments mostly side with Bohr. But Einstein's objections lead to quantum entanglement, the idea behind today's quantum computers.",.9),

 ("x1","exile","NARR","Nineteen thirty-three. Hitler takes power. Einstein is visiting America, and he never goes back.",.3),
 ("x2","exile","EIN","I will not live in a country where people are not equal before the law.",.35),
 ("x3","exile","NARR","The Nazis seize his home and burn his books. He settles in Princeton. Six years later, a visitor brings a warning.",.3),
 ("x4","exile","SZI","German scientists have split the uranium atom. A chain reaction could make a bomb of enormous power.",.25),
 ("x5","exile","EIN","I never even thought of that.",.3),
 ("x6","exile","YOU","What will you do?",.25),
 ("x7","exile","EIN","Then we must warn the President. Before Hitler gets there first.",.35),
 ("x8","exile","NARR","His letter to Roosevelt helps start the atomic bomb project. Einstein never works on it himself.",.3),
 ("x9","exile","EIN","I made one great mistake in my life, when I signed that letter. But there was the danger that the Germans would make it first.",.9),

 ("c1","legacy","NARR","Back to that hospital bed. April eighteenth, nineteen fifty-five. He dies in his sleep, at seventy-six. His last calculations lie beside him.",.35),
 ("c2","legacy","YOU","He never found the equation he was looking for.",.3),
 ("c3","legacy","NARR","But the GPS in your phone corrects for relativity every day. Without it, your position would drift by about ten kilometers a day.",.3),
 ("c4","legacy","NARR","Lasers, solar panels, even the first photo of a black hole, all trace back to his ideas.",.3),
 ("c5a","legacy","YOU","Professor, what should I tell my own students one day?",.25),
 ("c5","legacy","EIN","The important thing is not to stop questioning. I have no special talents. I am only passionately curious.",.35),
 ("c6","legacy","NARR","So, if you were his student, which question would you chase for fifty years? Tell me in the comments.",.5),
]
if __name__ == "__main__":
    k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin"); SR = 24000
    t = .3; chunks = [np.zeros(int(.3 * SR), np.float32)]; tl = []; prev = None; mouth_src = []
    for key, ch, sp, text, gap in L:
        if prev and ch != prev: chunks.append(np.zeros(int(1.3 * SR), np.float32)); t += 1.3
        prev = ch; v, s, lang = VOICES[sp]
        a, _ = k.create(text, voice=v, speed=s, lang=lang); a = np.asarray(a, np.float32)
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
