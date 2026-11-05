# Narration for "How a 16-Year-Old Leper King Crushed Saladin's Army | Battle of Montgisard 1177"
# Each scene: (id, [lines]) — each line becomes one TTS chunk; a short pause follows each.

SCENES = [
("cold_open", [
"November, eleven seventy-seven.",
"The most powerful ruler in the Muslim world marches on Jerusalem with an army of many thousands.",
"Standing in his way is a king who is just sixteen years old. A boy whose body is slowly being destroyed by leprosy. A boy who can barely feel his own hands.",
"He has a few hundred knights. The chronicler William of Tyre claimed the enemy had twenty-six thousand men.",
"What happened next was so unexpected, that the man who wrote it down called it a miracle.",
]),
("title", [
"This is the story of the Battle of Montgisard. The day the Leper King humbled Saladin.",
]),
("boy", [
"His name was Baldwin. He was born in eleven sixty-one, the son of King Amalric of Jerusalem, ruler of the crusader kingdom founded after the First Crusade.",
"At the age of nine, he was placed in the care of a brilliant scholar, William, the future Archbishop of Tyre.",
"One day, William watched the prince playing with other boys. They pinched and scratched each other's arms, as children do. The others cried out. Baldwin did not.",
"He could not feel pain in his right arm. William later wrote that he could not speak of it without tears. In time, the doctors understood. The boy had leprosy.",
]),
("king", [
"In the summer of eleven seventy-four, King Amalric died suddenly. On the fifteenth of July, his thirteen-year-old son was crowned in the Church of the Holy Sepulchre.",
"A sick child now ruled a small kingdom, squeezed between the sea and the desert. And films often show him in a silver mask. But no source from his lifetime mentions one.",
"What the sources do describe is something else. A boy who, by some accounts, learned to guide his horse with his knees, so that he could still hold a sword. And who refused to hide from his duty.",
]),
("saladin", [
"And he would need every bit of that courage. Because his enemy was Salah ad-Din Yusuf. History knows him as Saladin.",
"A Kurdish officer who had gone to Egypt with his uncle Shirkuh, became its vizier in eleven sixty-nine, and within a few years was its master. In eleven seventy-four, the same year Baldwin was crowned, he also took Damascus.",
"For the first time in generations, the lands to the south and to the north-east of the kingdom answered to one man. The crusader states were surrounded.",
]),
("gamble", [
"In the autumn of eleven seventy-seven, the Franks made a dangerous choice.",
"A great lord from Europe, Count Philip of Flanders, had arrived with fresh troops. Together with Count Raymond of Tripoli, many of the kingdom's best fighters marched far to the north, to besiege the fortress of Harim in Syria. The south of the kingdom was left dangerously thin.",
"Saladin saw his chance. On the eighteenth of November, he crossed the desert from Egypt with a fast-moving army. To go even faster, he left his heavy baggage behind, at al-Arish.",
]),
("ascalon", [
"Baldwin was still recovering from illness. But he gathered every knight he could find, about three hundred and seventy-five of them, and rode to the coastal fortress of Ascalon.",
"The Templars at Gaza tried to join him, but they were cut off. When Saladin's army arrived outside Ascalon on the twenty-second of November, the young king saw how badly he was outnumbered, and pulled his men back inside the walls.",
"Saladin made a decision that would haunt him. He judged the boy king harmless, left Ascalon behind, and turned towards Jerusalem.",
]),
("raid", [
"Now Saladin's army spread out across the countryside. Columns of riders raided and burned. At Ramla, the inhabitants fled to the coast. Lydda was attacked. Prisoners were rounded up across the land. Saladin seems to have believed the campaign was already won.",
"The road to Jerusalem looked open. Its people prepared for the worst.",
"But the Muslim army was no longer one army. It was a dozen raiding parties, with their baggage far behind. And no one was watching Ascalon.",
]),
("breakout", [
"Baldwin and his commander, Raynald of Châtillon, slipped out of the city and raced north along the coast. The Templar knights, under their Grand Master Odo of Saint-Amand, joined them on the way.",
"Behind the knights came perhaps a few thousand foot soldiers. Together they shadowed Saladin's army, unseen.",
"On the twenty-fifth of November, near Ramla, at a hill the Franks called Montgisard, they found it. Saladin's men were tired, disordered, and busy crossing difficult ground.",
]),
("cross", [
"According to the Christian accounts, the Franks carried with them their most sacred relic. A piece of what they believed was the True Cross.",
"It was raised before the army. And the sick young king, so the story goes, was helped down from his horse. He knelt before the relic and prayed.",
"Then he rose, mounted again, and gave the order to charge.",
]),
("battle", [
"The armoured knights crashed into Saladin's army before it could form up. The surprise was complete. Heavy cavalry was the Franks' deadliest weapon, and against an army caught on the move, it was devastating.",
"Saladin's own guard of mamluks, his elite slave soldiers, fought desperately to hold the line around him. Among the dead was a young nephew of the sultan's family, Ahmad, the son of his commander Taqi al-Din.",
"Baldwin fought with his army, his ruined hands wrapped in bandages, according to later accounts. Raynald and the Templars drove deep into the enemy ranks.",
"Then the Muslim army broke.",
]),
("camel", [
"Saladin himself came close to death. An English chronicler wrote that he escaped on a racing camel, as his bodyguards gave their lives to cover him.",
"The Franks chased the fleeing army for some twelve miles, until darkness fell. Then came the desert. Without their baggage and with winter rain turning the ground to mud, many of the survivors never made it home.",
"Saladin reached Cairo on the eighth of December. According to the sources, only a fraction of the army that had left Egypt came back with him.",
]),
("aftermath", [
"The victory was not cheap. One report said eleven hundred Christians were killed, and seven hundred and fifty wounded.",
"Modern historians believe William of Tyre's numbers were exaggerated. But even the cautious estimates leave the Franks heavily outnumbered.",
"Baldwin founded a monastery on the battlefield, dedicated to Saint Catherine, whose feast fell on the day of the battle. And Saladin learned a lesson he would never forget. Never underestimate the Leper King.",
]),
("ending", [
"But Baldwin's disease could not be defeated. He kept fighting for eight more years, even when he had lost his sight and had to be carried into battle on a litter.",
"Saladin kept fighting too. In eleven seventy-nine, he defeated Baldwin at Marj Ayyun, and destroyed the new crusader castle at Jacob's Ford. The balance of power was shifting.",
"In eleven eighty-five, Baldwin the Fourth died. He was only twenty-three.",
"Two years later, Saladin returned. And this time, at a place called the Horns of Hattin, there was no Leper King to stop him.",
"Watch that story, the Battle of Hattin, right here. And subscribe to History Sourced, so you don't miss what comes next.",
]),
]

if __name__ == "__main__":
    w = sum(len(l.split()) for _, ls in SCENES for l in ls)
    print("words", w)
