"""Narration for the Maya long video: one Kokoro clip per line -> public/vo.wav + src/timeline.json (with chapters)"""
import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
VOICE, SPEED = "am_michael", .97
# (key, chapter, text, pause after)
LINES = [
 ("c1","open","Imagine you're born in a Maya city, about thirteen hundred years ago.",.5),
 ("c2","open","Your money might be chocolate. Your head might be shaped by a board. And the sky might choose your name.",.5),
 ("c3","open","By the end of this video, you'll know how you'd live, what you'd eat, what you'd fear, and why your city would one day be swallowed by the jungle.",.45),
 ("c4","open","But your story doesn't end there.",.9),
 ("1a","birth","It's around the year seven hundred and fifty. You're born in a pole and thatch house, near the great city of Tikal, in what is now Guatemala.",.45),
 ("1b","birth","Your first days are a little strange. Your mother straps you to a cradleboard, with a flat board pressing gently on your soft skull.",.4),
 ("1c","birth","Over months, your head grows longer and flatter. To the Maya, this isn't cruel. It may protect your soul, and it shows the world which people you belong to.",.45),
 ("1d","birth","And your name? It can come from the day you were born, in a sacred calendar of two hundred and sixty days.",.4),
 ("1e","birth","So before you can even walk, you already carry the sky, and your people, on your head.",.9),
 ("h1","home","Your home is simple, but crowded. A few small houses around a shared patio, raised on a stone platform to stay dry in the rainy season.",.4),
 ("h2","home","Grandparents, parents, aunts, cousins. Everyone works, eats and sleeps close together, on woven mats.",.4),
 ("h3","home","Dogs bark in the yard. Turkeys strut between the houses. Smoke from the cooking fire drifts up through the thatch.",.45),
 ("h4","home","And here's something that might surprise you. Many Maya families buried their dead right beneath the floors of their homes. Your ancestors aren't far away. They're under your feet.",.45),
 ("h5","home","For your family, that's not creepy. It's comforting. The dead stay close, and they still belong to the household.",.9),
 ("2a","city","Now look around. Tikal is not a lonely ruin in the jungle. It's alive.",.4),
 ("2b","city","Stone temples rise above the trees, painted red. Plazas fill with traders, priests and musicians.",.4),
 ("2c","city","Laser scans from the air now suggest that, at their peak, the Maya lowlands may have held more than nine million people.",.45),
 ("2d","city","But here's the honest part. You probably aren't royal. Most people were farmers. And most likely, so are you.",.9),
 ("2e","city","Your city is also plugged into a huge trading world. Salt comes from the coast. Sharp black obsidian comes from volcanic highlands. Green jade comes from river valleys far to the south.",.4),
 ("2f","city","Traders carry it all on their backs, because there are no horses, no oxen, and no carts for long trips.",.9),
 ("3a","maize","Your life runs on maize. In a famous Maya creation story, the gods make the first people out of corn.",.4),
 ("3i","maize","Maize is so central that the Maya maize god is often shown as a young, handsome man, with a long head shaped a little like a corn cob.",.4),
 ("3b","maize","Your family's field, the milpa, grows maize, beans and squash together.",.4),
 ("3c","maize","Every morning, the women of your house kneel at a grinding stone, and turn hard kernels into dough. It takes hours. Every single day.",.4),
 ("3h","maize","And you? As a kid, you're working too. Carrying water, chasing birds from the field, gathering firewood. Childhood is short.",.4),
 ("3d","maize","Tamales, maize porridge, a little chili. That's your menu, most days.",.4),
 ("3e","maize","And chocolate? It's not a candy bar. It's a bitter, frothy drink, often saved for nobles and feasts.",.4),
 ("3f","maize","But cacao beans weren't just food. Researchers think that, by the eighth century, cacao may have worked like money.",.4),
 ("3g","maize","Imagine paying for your lunch with chocolate beans. Now imagine trying not to eat your savings.",.9),
 ("4a","ball","Then there's the game. In the city's ballcourt, two teams fight over a heavy ball of solid rubber.",.4),
 ("4b","ball","No hands allowed. Players hit it mostly with their hips, wrapped in thick padding, and every hit hurts.",.4),
 ("4c","ball","Crowds cheer from the slopes. The rules changed from city to city, and we still don't know all of them.",.4),
 ("4d","ball","For you, it's sport and celebration. For the kings, it can also be politics, religion, and a replay of the gods' own myths.",.9),
 ("f1","fear","So what keeps you up at night? Jaguars in the forest. Snakes in the field. Fever. Hunger.",.4),
 ("f2","fear","And something bigger. In Maya stories, the dead travel to Xibalba, a dark underworld ruled by lords of disease and death.",.4),
 ("f3","fear","In one famous tale, two hero twins go down there, and beat the lords of death at, you guessed it, the ballgame.",.9),
 ("5a","sky","At night, look up. Maya astronomers watch the sky with incredible patience.",.4),
 ("5b","sky","They track Venus, eclipses and the seasons, and they run several calendars at once.",.4),
 ("5c","sky","They even write numbers with a symbol for zero, carved on a monument by around one hundred eighty A D, long before zero reached Europe.",.45),
 ("5f","sky","One of their great cycles, the Long Count, rolled over on December twenty first, twenty twelve. Not the end of the world. Just a new page in the calendar.",.4),
 ("5d","sky","Scribes paint glyphs in folding books made of bark paper. Books of history, astronomy and prophecy.",.4),
 ("5e","sky","Almost all of them are gone. In fifteen sixty two, a Spanish bishop burned Maya books in a public fire. Only four are known to survive today.",.9),
 ("6a","kings","Above everyone stands the king, the holy lord, dressed in jade and green quetzal feathers.",.4),
 ("6e","kings","Some nobles even had tiny discs of jade set into their front teeth. Imagine smiling, and flashing a little green treasure.",.4),
 ("6b","kings","He's seen as a bridge between people and the gods. To feed those gods, kings and queens offered their own blood in sacred rituals.",.4),
 ("6c","kings","And sometimes, captives from wars were sacrificed. It's a dark part of the story, but it's part of the world you're born into.",.45),
 ("6d","kings","For a farmer like you, the deal is simple. Pay tribute, help build, and trust the king to keep the rains coming.",.9),
 ("7a","rain","And then, the rains don't come.",.6),
 ("7b","rain","Between about eight hundred and nine hundred fifty A D, studies suggest rainfall in the region dropped by twenty five to forty percent.",.4),
 ("7c","rain","Crops fail. Reservoirs shrink. Cities fight each other. People stop believing the king can fix it.",.4),
 ("7g","rain","Archaeologists still debate the details. Drought, war, too many people on too little land. Most think it was several of these at once.",.4),
 ("7d","rain","Over a few generations, the great southern cities are abandoned. Maybe your own grandchildren pack up and walk away.",.4),
 ("7e","rain","The jungle grows back over the plazas, the temples, the ballcourts. For centuries, roots crack the stones.",.9),
 ("7f","rain","Some families move north, to cities like Chichen Itza, which grow powerful after the southern cities fall.",.9),
 ("8a","today","But here's what many people get wrong. The Maya never disappeared.",.45),
 ("8b","today","Today, more than eleven million Maya people live in Guatemala, Mexico, Belize and beyond, and many still speak Mayan languages.",.4),
 ("8g","today","Tikal itself is now a World Heritage site, wrapped in rainforest, where howler monkeys roar from the tops of the temples.",.45),
 ("8f","today","And the writing that bishop tried to burn? In the last few decades, scholars have learned to read most Maya glyphs again. The old kings are speaking once more.",.45),
 ("8c","today","Some still plant milpa. Some still keep the sacred calendar. Some are probably watching this video.",.45),
 ("8d","today","So if you'd been born in a Maya city thirteen hundred years ago, your city would fall. But your people, your language, and your corn would still be here.",.6),
 ("8e","today","Which civilization should you be born in next? Tell me in the comments.",0),
]
k = Kokoro("models/kokoro-v1.0.onnx", "models/voices-v1.0.bin"); SR = 24000
t = .3; chunks = [np.zeros(int(.3 * SR), np.float32)]; tl = []
prev = None
for key, ch, text, gap in LINES:
    if prev and ch != prev:
        chunks.append(np.zeros(int(1.3 * SR), np.float32)); t += 1.3
    prev = ch
    a, _ = k.create(text, voice=VOICE, speed=SPEED, lang="en-us"); a = np.asarray(a, np.float32)
    nz = np.where(np.abs(a) > .01)[0]; a = a[max(0, nz[0] - 240): nz[-1] + 1200]; d = len(a) / SR
    tl.append(dict(key=key, chapter=ch, text=text, start=round(t, 3), end=round(t + d, 3)))
    chunks += [a, np.zeros(int(gap * SR), np.float32)]; t += d + gap
sf.write("public/vo.wav", np.concatenate(chunks), SR)
json.dump(dict(lines=tl, voice_end=round(t, 3)), open("src/timeline.json", "w"), indent=1)
print("total", round(t, 1), "words", sum(len(l[2].split()) for l in LINES))
ch = {}
for l in tl: ch.setdefault(l['chapter'], [l['start'], l['end']])[1] = l['end']
for c, (a, b) in ch.items(): print(f"{c:6s} {a:6.1f} {b:6.1f}")
