"""Multi-voice dialogue for 'If You Were Socrates' Student'.
-> public/vo.wav, src/timeline.json (lines with speaker), src/mouth.json (per-speaker mouth openness at 30 fps)."""
import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICES = {  # speaker: (voice, speed)
    'NARR': ('am_michael', .97), 'YOU': ('am_liam', 1.0), 'SOC': ('bm_george', .9), 'DAD': ('am_onyx', .95),
    'MOM': ('bf_emma', .97), 'CHAER': ('am_puck', 1.05), 'LACH': ('am_fenrir', .95), 'ALC': ('am_eric', 1.02),
    'XAN': ('bf_isabella', 1.0), 'PLATO': ('bm_lewis', .98), 'MEL': ('bm_daniel', .98), 'CRITO': ('am_adam', .96),
    'JAIL': ('am_echo', .92), 'HER': ('bm_fable', .95),
}
# (key, chapter, speaker, text, pause after)
L = [
 ("o1","open","NARR","Athens. The year three hundred ninety-nine B.C. An old man is about to drink poison.",.35),
 ("o2","open","JAIL","Socrates. It's time.",.3),
 ("o3","open","SOC","Then bring the cup, my friend. And don't look so sad.",.35),
 ("o4","open","YOU","Teacher, please! There's still time. We can get you out tonight!",.4),
 ("o5","open","NARR","That's you. And to understand why he won't run, we need to go back to the day you were born.",.9),

 ("b1","born","NARR","Four hundred thirty-five B.C. You're born in the potters' quarter of Athens, the richest city in Greece.",.35),
 ("b2","born","DAD","A boy! Ten days from now, we name him in front of the whole family.",.3),
 ("b3","born","MOM","And one day, he'll vote in the Assembly. Not like me.",.3),
 ("b4","born","NARR","She's right. In this famous democracy, only adult male citizens can vote. Women, slaves and foreigners can't.",.3),
 ('b6', 'born', 'MOM', 'At seven, he starts school. Letters, the lyre, and wrestling.', 0.3),
 ('b7', 'born', 'DAD', 'A slave walks him there and back. Every single day.', 0.3),
 ('b8', 'born', 'YOU', 'And my sister? Does she go too?', 0.25),
 ('b9', 'born', 'MOM', "She learns at home. Weaving, and running a house. That's Athens.", 0.9),
 ("b5","born","DAD","Then he'd better learn to speak well. Words win votes in this city.",.9),

 ("a1","agora","NARR","When you're five, a plague hits the crowded city. Up to a quarter of the people die, even Pericles, Athens' greatest leader.",.35),
 ("a2","agora","MOM","Stay inside. Don't touch anyone. The gods are angry.",.4),
 ("a3","agora","NARR","You survive. And at seventeen, you're running pots to the Agora, the beating heart of Athens.",.3),
 ("a4","agora","DAD","Two jars for the olive seller. And stay away from the barefoot man by the shoemaker's shop.",.3),
 ("a5","agora","YOU","Why? Is he dangerous?",.25),
 ("a6","agora","DAD","Worse. He asks questions.",.9),

 ('a7', 'agora', 'YOU', 'Then why does everyone crowd around him?', 0.25),
 ('a8', 'agora', 'DAD', "Because he's fun to watch. Until he turns the questions on you.", 0.9),
 ("s1","barefoot","SOC","Young man. You carry pots. Tell me, what makes a pot a good pot?",.3),
 ("s2","barefoot","YOU","Easy. It doesn't leak.",.25),
 ("s3","barefoot","SOC","Good! And what makes a man a good man?",.3),
 ("s4","barefoot","YOU","Um. He's rich? Strong? He wins arguments?",.25),
 ("s5","barefoot","SOC","Then a rich man who lies, is good? Hmm. I'm not sure. Are you?",.3),
 ("s6","barefoot","YOU","I thought I knew. Now I'm not sure of anything.",.3),
 ("s7","barefoot","SOC","Wonderful! That's where wisdom begins. My mother was a midwife. I help people give birth to ideas.",.4),
 ("s8","barefoot","NARR","He's short, snub-nosed, wears the same cloak all year, and never writes anything down. Comedy writers love mocking him.",.9),

 ('s9', 'barefoot', 'YOU', 'I saw a play about you when I was twelve. The Clouds! You hung in a basket, staring at the sky!', 0.3),
 ('s10', 'barefoot', 'SOC', 'Ha! I stood up in the theater, so people could compare the mask with the real face.', 0.3),
 ('s11', 'barefoot', 'NARR', "At least, that's how the legend goes.", 0.9),
 ("q1","questions","NARR","Soon, you follow him everywhere. Today, he corners a famous general, Laches.",.3),
 ("q2","questions","SOC","Laches, you've fought in battles. What is courage?",.3),
 ("q3","questions","LACH","Simple. A brave man stands his ground and never runs.",.3),
 ("q4","questions","SOC","And soldiers who pull back on purpose, to win the fight later? Are they cowards?",.3),
 ("q5","questions","LACH","Well, no. Then courage is, uh, being tough inside?",.25),
 ("q6","questions","SOC","Even tough and foolish? Is foolish stubbornness courage?",.3),
 ("q7","questions","LACH","By Zeus, Socrates! I know what courage is. I just can't say it!",.4),
 ("q8","questions","NARR","That's the Socratic method. No lectures. Just question after question, until the weak answers fall apart.",.3),
 ("q9","questions","PLATO","Teacher, I came here to wrestle. Can I stay and listen instead?",.3),
 ("q10","questions","NARR","That young wrestler is Plato. He'll write all of this down one day. It's how we know any of it.",.9),

 ('q11', 'questions', 'YOU', "Father, are men good because the gods love them? Or do the gods love them because they're good?", 0.3),
 ('q12', 'questions', 'DAD', 'Go to your room.', 0.4),
 ('q13', 'questions', 'NARR', 'Questioning everything is not always popular at home.', 0.9),
 ("y1","symposium","NARR","Four sixteen B.C. You're invited to a symposium. A drinking party, with couches, music and wine mixed with water.",.35),
 ('y1b', 'symposium', 'YOU', 'Why do we mix the wine with water?', 0.25),
 ('y1c', 'symposium', 'SOC', 'Only barbarians drink it straight. And this way, the talking lasts till dawn.', 0.3),
 ("y2","symposium","ALC","Make room! Where's Socrates?",.3),
 ("y3","symposium","YOU","Is that Alcibiades? The war hero? He's very drunk.",.3),
 ("y4","symposium","ALC","Friends, this man is like those little statues in the shops. Ugly on the outside. Open him up, and there are gods inside.",.35),
 ("y5","symposium","ALC","At Potidaea, I was wounded. He stood over me and saved my life. Then he let me take the medal!",.35),
 ("y6","symposium","NARR","Everyone falls asleep before dawn. Socrates simply gets up, and goes to wash, and starts another day of questions.",.9),

 ("r1","oracle","CHAER","Want to hear why he does all this? I went to the Oracle at Delphi, and asked: is anyone wiser than Socrates?",.3),
 ("r2","oracle","CHAER","And the priestess said: no one!",.3),
 ("r3","oracle","SOC","I was puzzled. I know that I know very little. So I went looking for someone wiser.",.3),
 ("r4","oracle","SOC","Politicians, poets, craftsmen. They all thought they knew everything. They didn't.",.3),
 ("r5","oracle","SOC","So perhaps I'm wiser in one small way. I don't think I know what I don't know.",.4),
 ("r6","oracle","NARR","There's one problem. Proving powerful people wrong, in public, makes you a lot of enemies.",.9),

 ('r7', 'oracle', 'XAN', 'Socrates! You talk all day and earn nothing. We have three sons to feed!', 0.3),
 ('r8', 'oracle', 'SOC', "She's right, of course. I never charge for a conversation.", 0.3),
 ('r9', 'oracle', 'NARR', 'Unlike the paid teachers of his day, the sophists, he never takes money. His family pays the price.', 0.9),
 ("w1","war","NARR","Four hundred four B.C. After twenty-seven years of war, Sparta beats Athens. Thirty tyrants grab power, and kill hundreds.",.35),
 ("w2","war","HER","Socrates! Go to Salamis, arrest a man named Leon, and bring him here to die.",.3),
 ("w3","war","SOC","No. I won't do something unjust.",.3),
 ('w3b', 'war', 'YOU', "Teacher, weren't you afraid they'd kill you?", 0.25),
 ('w3c', 'war', 'SOC', 'No one knows if death is bad. But doing wrong? That, I know, is bad.', 0.35),
 ("w4","war","NARR","He just walks home. The tyrants fall before they can punish him. But some of them had been his students. And Athens remembers.",.9),

 ("t1","trial","NARR","Three ninety-nine B.C. Democracy is back. And so are the enemies. Five hundred and one jurors. One day. One verdict.",.35),
 ('t1b', 'trial', 'NARR', 'Jurors are picked at random by a stone machine called a kleroterion, so no one can bribe them in advance.', 0.35),
 ("t2","trial","MEL","Socrates does not honor the city's gods. And he corrupts the young!",.3),
 ("t3","trial","YOU","He means us. His students.",.3),
 ('t2b', 'trial', 'SOC', 'Meletus, tell us. Who makes the young better?', 0.25),
 ('t2c', 'trial', 'MEL', 'The laws!', 0.25),
 ('t2d', 'trial', 'SOC', 'And who else? The jurors? The Assembly? Everyone in Athens, except me?', 0.25),
 ('t2e', 'trial', 'MEL', 'Exactly!', 0.25),
 ('t2f', 'trial', 'SOC', 'Then the young are very lucky. Only one corrupter, and thousands of helpers.', 0.35),
 ("t4","trial","SOC","Men of Athens, I will never stop asking questions. The unexamined life is not worth living.",.35),
 ("t5","trial","HER","The jury has voted. Two hundred and eighty, guilty. Two hundred and twenty, not guilty.",.35),
 ("t6","trial","SOC","Thirty more votes, and I'd be free. As punishment, I propose free dinners for life, like an Olympic champion.",.35),
 ("t7","trial","NARR","The jury doesn't laugh. Even more of them vote for death.",.9),

 ("h1","hemlock","CRITO","Socrates, listen. The guards are paid. A boat is ready. You can live in Thessaly.",.3),
 ("h2","hemlock","SOC","Crito, I've lived seventy years under the laws of Athens. Shall I break them now, to save myself?",.35),
 ("h3","hemlock","XAN","Oh Socrates! This is the last time you'll talk with your friends!",.3),
 ("h4","hemlock","SOC","Crito, have someone take her home. Gently.",.4),
 ('h3b', 'hemlock', 'YOU', 'How can you be so calm?', 0.25),
 ('h3c', 'hemlock', 'SOC', 'Death is either a dreamless sleep, or a journey to meet the great souls before us. Either way, why fear it?', 0.35),
 ("h5","hemlock","NARR","He drinks the hemlock calmly. His legs grow heavy, and he lies down.",.35),
 ("h6","hemlock","SOC","Crito, we owe a rooster to Asclepius. Pay it. Don't forget.",.4),
 ("h7","hemlock","NARR","Those are his last words.",1.0),

 ("c1","legacy","NARR","But the questions don't die. Plato opens a school, the Academy. His student Aristotle teaches Alexander the Great.",.35),
 ("c2","legacy","NARR","Today, law schools and classrooms still use the Socratic method, nearly two thousand four hundred years later.",.35),
 ("c3","legacy","YOU","He never wrote a single word. We wrote them for him.",.35),
 ('c3b', 'legacy', 'PLATO', "Everything I wrote, I put in his mouth. He's the hero of almost all my dialogues.", 0.35),
 ("c4","legacy","NARR","So, if you'd been there, would you have followed him? Or voted against him? Tell me in the comments.",.5),
]
k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin"); SR = 24000
t = .3; chunks = [np.zeros(int(.3 * SR), np.float32)]; tl = []; prev = None; mouth_src = []
for key, ch, sp, text, gap in L:
    if prev and ch != prev: chunks.append(np.zeros(int(1.3 * SR), np.float32)); t += 1.3
    prev = ch; v, s = VOICES[sp]
    a, _ = k.create(text, voice=v, speed=s, lang="en-gb" if v.startswith('b') else "en-us"); a = np.asarray(a, np.float32)
    nz = np.where(np.abs(a) > .01)[0]; a = a[max(0, nz[0] - 240): nz[-1] + 1200]; a = a / (np.abs(a).max() + 1e-9) * .8; d = len(a) / SR
    tl.append(dict(key=key, chapter=ch, speaker=sp, text=text, start=round(t, 3), end=round(t + d, 3)))
    mouth_src.append((sp, t, a)); chunks += [a, np.zeros(int(gap * SR), np.float32)]; t += d + gap
sf.write("public/vo.wav", np.concatenate(chunks), SR)
json.dump(dict(lines=tl, voice_end=round(t, 3)), open("src/timeline.json", "w"), indent=1)
# mouth openness per speaker at 30 fps (0..1), quantised to 2 decimals
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
