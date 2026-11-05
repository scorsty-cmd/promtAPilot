# Narration for "The Last Viking King Invaded England. It Went Horribly Wrong | Stamford Bridge 1066"
# Each scene: (id, [paragraph lines]) — each line becomes one TTS chunk; a short pause follows each.

SCENES = [
("cold_open", [
"September, ten sixty-six.",
"Three hundred Viking ships cross the North Sea, carrying the most feared warrior in Europe.",
"A few weeks later, only twenty-four of them sail home.",
"And the reason begins with something almost absurd. On one of the hottest days of that year, thousands of Viking warriors left their armour behind.",
]),
("title", [
"This is the story of the Battle of Stamford Bridge. The day the Viking Age ended.",
]),
("harald", [
"To understand this battle, you have to understand the man who started it. Harald Sigurdsson. History remembers him as Harald Hardrada. Hard Ruler.",
"At just fifteen, he fought for his half-brother at the Battle of Stiklestad. The battle was lost, and the boy fled Norway, wounded, into exile.",
"He travelled east, to the Kievan Rus, and served Prince Yaroslav the Wise. Then he went further still, to the richest city in the world. Constantinople.",
"There he joined the Varangian Guard, the elite Norse bodyguard of the Byzantine emperor. He fought in Sicily, in Bulgaria, across the eastern Mediterranean, and he came home with a fortune in gold.",
"By ten forty-six he was king of Norway. Twenty years later, he was a veteran of more battles than almost any man alive. And he was looking west.",
]),
("crisis", [
"On the fifth of January, ten sixty-six, King Edward the Confessor of England died without a child.",
"The very next day, the most powerful nobleman in England, Harold Godwinson, was crowned king.",
"But two other men believed the crown was theirs. Across the Channel, Duke William of Normandy said Edward had promised it to him. And in Norway, Harald Hardrada claimed it through an old agreement between earlier kings.",
"Three men. One crown. And within ten months, two of them would be dead.",
]),
("tostig", [
"Harald had one more advantage. An Englishman.",
"Tostig Godwinson was King Harold's own brother. He had ruled Northumbria as its earl, until a revolt drove him out in ten sixty-five, and Harold did not stand by him.",
"Exiled and bitter, Tostig went looking for allies. In Harald Hardrada, he found one. The brother of the King of England would help the Vikings invade it.",
]),
("invasion", [
"In late summer, the Norwegian fleet set sail. Around three hundred ships, perhaps nine thousand men. They stopped in Shetland and Orkney to gather more warriors, then swept down the English coast, and Tostig joined them with his own ships.",
"They entered the Humber estuary, rowed up the River Ouse, and landed at Riccall, just south of York.",
]),
("fulford", [
"On the twentieth of September, the northern earls, Edwin and Morcar, met them at Gate Fulford.",
"The English fought hard, but Harald's warriors broke their line and drove them into the marshes. It was said the dead were piled so high that the Vikings could cross the bog on top of them.",
"York surrendered. Harald agreed to receive hostages from across the county a few days later, at a quiet crossing on the River Derwent. A place called Stamford Bridge.",
"The Vikings believed the war in the north was over. They were wrong.",
]),
("march", [
"Far to the south, King Harold had spent the whole summer guarding the coast against William. When the news of the invasion reached him, he did something nobody expected.",
"He gathered his housecarls, his professional royal warriors, and marched north. Day and night. Picking up men along the way.",
"About one hundred and eighty miles in roughly four days. By the evening of the twenty-fourth of September, he was at Tadcaster. And the Vikings had no idea he was coming.",
]),
("morning", [
"The twenty-fifth of September was hot. Harald took perhaps two thirds of his army to Stamford Bridge to collect the hostages. The rest stayed with the ships at Riccall, about twelve miles away.",
"Expecting no fight, many of the men left their mail shirts behind. They carried shields, swords and helmets. Little more.",
"Then, on the road from York, they saw a cloud of dust. And beneath it, the glitter of weapons, like a field of broken ice.",
]),
("bridge", [
"Harald sent riders racing to Riccall for reinforcements, and pulled his men back across the river to form a shield wall on the far bank.",
"Legend says that a single Norse warrior held the narrow bridge alone, cutting down every Englishman who tried to cross, until one of them floated beneath it and thrust a spear up through the planks.",
"Whether it happened or not, the bridge fell. And the English poured across.",
]),
("parley", [
"According to the Norse sagas, before the fighting began, twenty riders came forward from the English lines. One of them spoke to Tostig. Return to your brother, he said, and you can have Northumbria again.",
"And what would King Harold give to the King of Norway? The rider answered. Seven feet of English ground. Or as much more as he is taller than other men.",
"Tostig refused to betray his ally. As the riders left, Harald asked who the speaker was. That, said Tostig, was my brother. King Harold himself.",
]),
("battle", [
"The English charged into the shield wall. Without their armour, the Norwegians were cut down in hundreds.",
"Harald Hardrada fought like the warrior he had always been, in the very front rank. Then an arrow struck him in the throat. The last great Viking king was dead.",
"Tostig took up the banner, Landwaster. Harold offered peace one more time. It was refused. And Tostig fell too.",
"Then the reinforcements arrived from the ships, led by Eystein Orri. They had run all the way from Riccall in full armour, under the burning sun. Exhausted, they threw themselves into the fight. The sagas call it Orri's Storm. It was not enough.",
]),
("aftermath", [
"By nightfall, the Norwegian army had been destroyed. Harald's young son, Olaf, was allowed to sail home. Of the three hundred ships that had come to England, only twenty-four were needed to carry back the survivors.",
"For almost three centuries, the Viking raids had terrified England. After Stamford Bridge, no great Scandinavian army would ever threaten it again.",
]),
("ending", [
"King Harold had just won the greatest victory of his life. But three days later, on the twenty-eighth of September, the wind changed in the Channel, and William of Normandy landed in the south.",
"Harold would have to march his tired army the whole length of England, all over again.",
"He had nineteen days left to live.",
"Watch the next chapter of this story, the Battle of Hastings, right here. And subscribe to History Sourced, so you don't miss what comes next.",
]),
]

if __name__ == "__main__":
    w = sum(len(l.split()) for _, ls in SCENES for l in ls)
    print("words", w)
