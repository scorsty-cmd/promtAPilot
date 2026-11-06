"""Multi-voice dialogue for 'If the Whole World Turned Into Zombies'.
Scientific survival breakdown: epidemiology, biology, water/food grids, geography.
-> public/vo.wav, src/timeline.json (lines with speaker), src/mouth.json (per-speaker mouth openness at 30 fps)."""
import json, sys, os, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICES = {  # speaker: (voice, speed, lang)
    'NARR': ('am_michael', 1.04, 'en-us'),
    'YOU': ('am_liam', 1.06, 'en-us'),
    'SARAH': ('af_sarah', 1.05, 'en-us'),     # Epidemiologist Dr. Sarah Chen
    'MARCUS': ('am_adam', 1.04, 'en-us'),     # Survival expert Marcus
    'KAHN': ('am_eric', 1.04, 'en-us'),       # Microbiologist Dr. Kahn
}

# (key, chapter, speaker, text, pause after)
L = [
    # CH 1: DAY ZERO (0 - 45s) - HOOK FIRST 10 SECONDS
    ("o1", "open", "NARR", "Three in the morning. An emergency alert shrills on every phone at once.", 0.25),
    ("o2", "open", "YOU", "Marcus! Wake up! The streetlights just vanished and people are screaming outside!", 0.3),
    ("o3", "open", "MARCUS", "Do not open that front door! Turn off your lights and get away from the windows!", 0.3),
    ("o4", "open", "YOU", "Is this a riot? An invasion?", 0.25),
    ("o5", "open", "MARCUS", "Worse. The hospital downtown was overrun twenty minutes ago. It's biting. It spreads through saliva.", 0.35),
    ("o6", "open", "YOU", "Biting? That's impossible. That's a movie trope!", 0.25),
    ("o7", "open", "SARAH", "It is not a movie anymore. I'm looking at the epidemiological transmission curve right now.", 0.3),
    ("o8", "open", "SARAH", "Whatever this pathogen is, its basic reproduction number is breaking every historical record.", 0.35),
    ("o9", "open", "NARR", "You look out the blinds. A neighbor you have known for ten years is running on all fours in the street, snarling into the dark.", 0.85),

    # CH 2: THE OUTBREAK MATH (45 - 90s)
    ("r1", "rzero", "YOU", "Sarah, explain the math. How fast can an infection like this actually take down a city?", 0.3),
    ("r2", "rzero", "SARAH", "In epidemiology, we track R-zero: the number of secondary infections caused by one infected individual.", 0.3),
    ("r3", "rzero", "SARAH", "Seasonal flu has an R-zero of about one point three. Measles is twelve to eighteen. But with this?", 0.3),
    ("r4", "rzero", "SARAH", "Because the infected remain mobile and aggressively hunt others, the effective R-zero in a crowded city exceeds twenty.", 0.35),
    ("r5", "rzero", "MARCUS", "Which means doubling time is measured in hours, not weeks.", 0.25),
    ("r6", "rzero", "SARAH", "Exactly. A team of physicists at Cornell University modeled this exact scenario in twenty fifteen.", 0.3),
    ("r7", "rzero", "SARAH", "Their statistical simulation proved that in a city like New York, ninety percent of the population becomes infected within seventy-two hours.", 0.35),
    ("r8", "rzero", "YOU", "Seventy-two hours? Then trying to drive across the bridges right now is suicide.", 0.25),
    ("r9", "rzero", "MARCUS", "The highways are already parking lots. If you want to survive day one, you do not run. You lock down.", 0.85),

    # CH 3: NATURE'S REAL ZOMBIES (90 - 140s)
    ("b1", "parasite", "YOU", "Doctor Kahn, biologically speaking, dead flesh cannot walk. Muscles need ATP. What are we actually dealing with?", 0.3),
    ("b2", "parasite", "KAHN", "You are completely correct. Hollywood zombies violate the first law of thermodynamics.", 0.3),
    ("b3", "parasite", "KAHN", "These are not dead corpses resurrected by magic. They are living hosts hijacked by a ruthless parasitic agent.", 0.35),
    ("b4", "parasite", "YOU", "Does nature actually produce parasites that control minds?", 0.25),
    ("b5", "parasite", "KAHN", "All the time. Look at Ophiocordyceps unilateralis, the famous zombie ant fungus in tropical rainforests.", 0.3),
    ("b6", "parasite", "KAHN", "The fungus does not destroy the brain first; it infiltrates muscle fibers throughout the ant's body, severing central control.", 0.35),
    ("b7", "parasite", "KAHN", "It forces the ant to climb to the highest leaf, bite into the main vein, lock its jaw in place, and die so spores rain down on the colony.", 0.35),
    ("b8", "parasite", "SARAH", "Combine that motor hijacking with the rabies virus, which attacks the limbic system to induce relentless biting and fear of water.", 0.3),
    ("b9", "parasite", "YOU", "So their nervous system is rewired for maximum transmission, but their organs are still subject to human biology.", 0.25),
    ("b10", "parasite", "KAHN", "Precisely. And that physical limitation is our greatest weapon.", 0.85),

    # CH 4: THE 72-HOUR BLACKOUT (WATER & POWER) (140 - 190s)
    ("w1", "water", "NARR", "Day three. The lights flickered and died yesterday. Now, you turn the bathroom faucet, and nothing comes out.", 0.3),
    ("w2", "water", "YOU", "The tap is dry. Not a single drop.", 0.25),
    ("w3", "water", "MARCUS", "Municipal water networks rely on electric booster pumps. Without the power grid, elevated reservoir tanks drain within forty-eight hours.", 0.35),
    ("w4", "water", "YOU", "How long do we have without clean water?", 0.25),
    ("w5", "water", "SARAH", "Three days. That's the hard physiological limit. Dehydration will kill you ten times faster than any infected horde.", 0.3),
    ("w6", "water", "MARCUS", "Fill every bathtub, bucket, and pot immediately while pressure remnants linger.", 0.25),
    ("w7", "water", "YOU", "What about rainwater from the roof or nearby ponds?", 0.25),
    ("w8", "water", "KAHN", "Never drink standing water untreated. You need three barriers: coarse filtration through sand and charcoal to remove sediment, then a rolling boil for three full minutes.", 0.35),
    ("w9", "water", "KAHN", "If you cannot light a fire without drawing attention, two drops of unscented household bleach per liter of water will destroy bacterial pathogens in thirty minutes.", 0.35),
    ("w10", "water", "MARCUS", "Remember: boiling water makes steam and smell. Keep windows covered. Silence keeps you alive.", 0.85),

    # CH 5: THE FOOD EQUATION (190 - 240s)
    ("f1", "food", "YOU", "Marcus, our fresh food spoiled in the fridge. I found fifteen cans of beans, tuna, and tomatoes in the pantry.", 0.3),
    ("f2", "food", "MARCUS", "Count the calories, not the cans. An adult in high-stress survival requires at least eighteen hundred calories a day.", 0.3),
    ("f3", "food", "SARAH", "Check the cans carefully before you open anything. Look at the seals.", 0.25),
    ("f4", "food", "YOU", "What am I looking for?", 0.25),
    ("f5", "food", "SARAH", "Any bulging lid or dent along the seam. Anaerobic bacteria like Clostridium botulinum produce botulinum toxin, the most lethal neurotoxin known to science.", 0.35),
    ("f6", "food", "KAHN", "A single microscopic taste from a spoiled can will paralyze your diaphragm within hours. In a world without ventilators, botulism is a death sentence.", 0.35),
    ("f7", "food", "YOU", "How long can non-acidic canned goods actually stay safe?", 0.25),
    ("f8", "food", "KAHN", "Intact commercial canned meats and beans remain biologically sterile for decades. The nutritional value degrades slowly, but the food will keep you alive.", 0.3),
    ("f9", "food", "MARCUS", "Store salt, sugar, and multivitamins. Scurvy from vitamin C deficiency used to destroy armies in four months. You cannot fight if your teeth are falling out.", 0.85),

    # CH 6: GEOGRAPHY OF SURVIVAL (240 - 290s)
    ("g1", "geography", "NARR", "Day fifteen. The city below is silent, broken only by wandering shadows and distant alarms that refuse to stop.", 0.3),
    ("g2", "geography", "YOU", "We have rationed our water, but city supplies are finite. Where on Earth is actually safe?", 0.3),
    ("g3", "geography", "SARAH", "The Cornell simulation gave a very clear answer to that question: get to high elevation and extreme low population density.", 0.3),
    ("g4", "geography", "SARAH", "In their model, the Rocky Mountains in North America or the Swiss Alps in Europe take months to see even a single case.", 0.35),
    ("g5", "geography", "MARCUS", "What about islands? Everybody dreams of taking a boat to an island.", 0.25),
    ("g6", "geography", "KAHN", "Islands are phenomenal natural quarantine zones, provided you reach one with its own freshwater lens.", 0.3),
    ("g7", "geography", "KAHN", "Infected hosts cannot swim across deep maritime channels; without pulmonary respiration control, their lungs fill with water and they sink to the seafloor.", 0.35),
    ("g8", "geography", "YOU", "So our route must avoid major river valleys, interstate junctions, and suburban bottlenecks.", 0.3),
    ("g9", "geography", "MARCUS", "Exactly. You navigate by topography, not highways. High ground gives you visibility, defensive chokepoints, and clean mountain runoff.", 0.85),

    # CH 7: THE FREEZING DEAD (290 - 340s)
    ("z1", "winter", "YOU", "Look at the calendar. Winter is arriving in three weeks. Can these infected creatures survive freezing temperatures?", 0.3),
    ("z2", "winter", "KAHN", "This is where human physiology wins the war. The infected cannot put on heavy winter coats or start cabin fires.", 0.3),
    ("z3", "winter", "KAHN", "Human muscle tissue is over seventy percent water. When ambient temperatures drop below freezing, ice crystals form inside the cells, rupturing muscle membranes.", 0.35),
    ("z4", "winter", "SARAH", "In forensic science, freezing completely arrests movement. If the temperature hits minus ten degrees Celsius, their joints lock solid.", 0.3),
    ("z5", "winter", "MARCUS", "A frozen enemy cannot chase you. In northern latitudes, winter is your greatest tactical ally.", 0.25),
    ("z6", "winter", "YOU", "What happens when summer returns? Do they thaw out and keep running?", 0.25),
    ("z7", "winter", "KAHN", "Cellular freeze-thaw cycles destroy tissue integrity. Once thawed, bacterial decomposition and blowfly larvae accelerate decay exponentially.", 0.35),
    ("z8", "winter", "SARAH", "Forensic taphonomy shows that an unmaintained body in warm weather skeletonizes in less than three weeks.", 0.3),
    ("z9", "winter", "YOU", "So if we survive through the first winter, nature does most of the heavy lifting for us.", 0.25),
    ("z10", "winter", "MARCUS", "Nature always cleans house. You just have to live long enough to watch it happen.", 0.85),

    # CH 8: THE PHYSICS OF SILENCE (340 - 390s)
    ("n1", "noise", "NARR", "Night forty. You are scouting an old warehouse along the ridge. A rusted tin can rolls under your boot.", 0.3),
    ("n2", "noise", "YOU", "Shh! I kicked something metal!", 0.25),
    ("n3", "noise", "MARCUS", "Freeze! Do not take another step.", 0.3),
    ("n4", "noise", "NARR", "In the dark valley below, three heads snap in your direction in unison.", 0.3),
    ("n5", "noise", "SARAH", "Remember acoustic physics: sound intensity obeys the inverse square law in open air, but echoes amplify along canyon walls.", 0.35),
    ("n6", "noise", "KAHN", "Without higher cognitive distraction, their sensory processing relies entirely on auditory and olfactory triggers.", 0.3),
    ("n7", "noise", "YOU", "How acute is their night vision?", 0.25),
    ("n8", "noise", "KAHN", "Without cellular maintenance, corneal dehydration clouds their eyes within two weeks. They are nearly blind in the dark. They hunt by your sound and your scent.", 0.35),
    ("n9", "noise", "MARCUS", "Always stay downwind. Wrap your boots in burlap or cloth to muffle footsteps. Never run when you can crawl.", 0.3),
    ("n10", "noise", "YOU", "The footsteps stopped below. They lost the trace.", 0.25),
    ("n11", "noise", "MARCUS", "Good. Now exhale slowly and back away.", 0.85),

    # CH 9: THE METABOLIC CRASH (390 - 440s)
    ("d1", "dieoff", "YOU", "Doctor Kahn, it has been sixty days since Day Zero. The roaming packs outside are moving noticeably slower.", 0.3),
    ("d2", "dieoff", "KAHN", "Welcome to the metabolic crash. Every living cell demands glucose to sustain muscle contraction.", 0.3),
    ("d3", "dieoff", "KAHN", "Infected hosts have frantic basal metabolic rates, yet they have depleted the easily accessible prey across the countryside.", 0.35),
    ("d4", "dieoff", "SARAH", "Without continuous hydration and calories, human kidney failure and cardiovascular collapse occur within two to three weeks.", 0.3),
    ("d5", "dieoff", "YOU", "So the apocalyptic wave has an expiration date built directly into human biochemistry.", 0.25),
    ("d6", "dieoff", "SARAH", "Every uncontrolled biological outbreak in history follows an epidemic bell curve. When susceptible hosts become scarce, transmission cascades toward zero.", 0.35),
    ("d7", "dieoff", "MARCUS", "The streets that were deadly sixty days ago are now littered with inactive hosts that simply collapsed from cellular exhaustion.", 0.3),
    ("d8", "dieoff", "YOU", "Which means the primary threat now isn't the infected anymore, is it?", 0.25),
    ("d9", "dieoff", "MARCUS", "Never was. The real threat is other desperate survivors competing for the remaining seeds, tools, and clean springs.", 0.85),

    # CH 10: REBUILDING THE WORLD (440 - 485s)
    ("c1", "rebuild", "NARR", "Day one hundred. Smoke rises from a chimney high on the pine ridge. You hold a bag of heirloom seeds in your hands.", 0.35),
    ("c2", "rebuild", "YOU", "Sarah, Marcus, Doctor Kahn... we made it through the storm.", 0.3),
    ("c3", "rebuild", "SARAH", "The emergency radio frequency picked up a broadcast this morning from a naval base in Maine. Pockets of civilization survived all along the coast.", 0.35),
    ("c4", "rebuild", "KAHN", "Soil pH is balanced, and our gravity-fed spring water is crystal clear. We plant wheat, potatoes, and legumes today.", 0.35),
    ("c5", "rebuild", "MARCUS", "Surviving an apocalypse is not about how many weapons you carry. It is about understanding the fundamental laws of biology, physics, and patience.", 0.35),
    ("c6", "rebuild", "YOU", "Science didn't just explain the nightmare. It kept us alive.", 0.3),
    ("c7", "rebuild", "NARR", "Now, put yourself in this world. If the emergency sirens sounded outside your window tonight, what is your very first move? Would you run, or would you lock down? Tell us in the comments below.", 0.5),
]

if __name__ == "__main__":
    model_path = "models/kokoro-v1.0.onnx"
    voices_path = "models/voices-v1.0.bin"
    if not os.path.exists(model_path):
        model_path = "../../models/kokoro-v1.0.onnx"
        voices_path = "../../models/voices-v1.0.bin"
    k = Kokoro(model_path, voices_path)
    SR = 24000
    t = 0.3
    chunks = [np.zeros(int(0.3 * SR), np.float32)]
    tl = []
    prev = None
    mouth_src = []
    
    print(f"Generating voiceover for {len(L)} lines across 10 chapters...")
    for idx, (key, ch, sp, text, gap) in enumerate(L):
        if prev and ch != prev:
            chunks.append(np.zeros(int(0.6 * SR), np.float32))
            t += 0.6
        prev = ch
        v, s, lang = VOICES[sp]
        a, _ = k.create(text, voice=v, speed=s, lang=lang)
        a = np.asarray(a, np.float32)
        nz = np.where(np.abs(a) > 0.01)[0]
        if len(nz) > 0:
            a = a[max(0, nz[0] - 240): nz[-1] + 1200]
        a = a / (np.abs(a).max() + 1e-9) * 0.8
        d = len(a) / SR
        tl.append(dict(key=key, chapter=ch, speaker=sp, text=text, start=round(t, 3), end=round(t + d, 3)))
        mouth_src.append((sp, t, a))
        actual_gap = max(0.15, gap * 0.7)
        chunks += [a, np.zeros(int(actual_gap * SR), np.float32)]
        t += d + actual_gap
        if (idx + 1) % 5 == 0 or idx == len(L) - 1:
            print(f"  Processed {idx + 1}/{len(L)} lines (current duration: {round(t, 1)}s)", flush=True)

    os.makedirs("public", exist_ok=True)
    os.makedirs("src", exist_ok=True)
    sf.write("public/vo.wav", np.concatenate(chunks), SR)
    json.dump(dict(lines=tl, voice_end=round(t, 3)), open("src/timeline.json", "w"), indent=1)

    NF = int((t + 1.5) * 30)
    M = {}
    for sp, st, a in mouth_src:
        arr = M.setdefault(sp, np.zeros(NF))
        hop = SR // 30
        for i in range(len(a) // hop):
            f = int(round(st * 30)) + i
            if f < NF:
                arr[f] = max(arr[f], np.sqrt(np.mean(a[i * hop:(i + 1) * hop] ** 2)))
    for sp in M:
        x = M[sp]
        nz = x[x > 0]
        denom = (np.percentile(nz, 90) if len(nz) else 1.0) + 1e-9
        x = np.clip(x / denom, 0, 1)
        x[x < 0.12] = 0
        M[sp] = [round(float(v), 2) for v in x]
    json.dump(M, open("src/mouth.json", "w"), separators=(',', ':'))

    words = sum(len(l[3].split()) for l in L)
    dl = sum(len(l[3].split()) for l in L if l[2] != 'NARR')
    print("--------------------------------------------------")
    print(f"TOTAL DURATION: {round(t, 1)}s ({round(t/60, 2)} min)")
    print(f"TOTAL WORDS: {words}")
    print(f"DIALOGUE SHARE: {round(dl / words, 2)} (Target: >= 0.55)")
    print("--------------------------------------------------")
    ch = {}
    for l in tl:
        ch.setdefault(l['chapter'], [l['start'], l['end']])[1] = l['end']
    for c, (a, b) in ch.items():
        print(f"  Chapter {c:10s} : {a:6.1f}s -> {b:6.1f}s")
