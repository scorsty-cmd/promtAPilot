# Hidden Layer · The Algorithm · "Your Uber Price Isn't Random — Here's What Actually Decides It"
# Research read on 22 Oct 2026. Every quote below is verbatim from the named source.
B = []
def beat(section, text, kind, **v):
    B.append(dict(section=section, text=text, kind=kind, **v))

READ = 'read 22 Oct 2026'

# ---------------- COLD OPEN ----------------
beat(0, "Your Uber price isn't random. And by the end of this video, you'll know exactly what decides it.",
     'doc_quote', style='memo', photo='traffic_1',
     doc='UBER SPOKESPERSON  ·  STATEMENT ON ROUTE-BASED PRICING  ·  MAY 2017',
     quote="We price routes differently based on our understanding of riders' choices.",
     hl=[0], src='Uber statement, May 2017, reported by Engadget · ' + READ)
beat(0, "That sentence came from Uber itself, back in twenty seventeen. It means two trips of the same length can be priced differently, for reasons the meter never shows you.",
     'photo', photo='rainwin_1', mode='push', lines=['Same length.', 'Different price.'], accent=1)
beat(0, "And in twenty twenty-five, researchers at Oxford went through one point five million trips, and found something even stranger on the other side of the screen.",
     'counter', photo='carint_0', value=1500000, fmt='{:,.0f}', label='Uber trips analysed',
     sub='University of Oxford · FAccT 2025', src='Binns et al., "Not Even Nice Work If You Can Get It", FAccT 2025 · ' + READ)
beat(0, "So let's open the hidden layer. What Uber says officially, what independent research shows, and which popular theories are just myths.",
     'hero', photo='traffic_0', lines=['Official. Proven.', 'Or just a myth?'], accent=1, illo='none')
beat(0, "And stay for the myth about your phone battery. The real answer is more interesting than the rumor.",
     'hero', photo='phone_0', lines=['The battery', 'myth'], accent=1, illo='none', reveal=True)

# ---------------- 1 · THE PRICE BEFORE THE PRICE ----------------
beat(1, "Chapter one. The price before the price.", 'tool', num=1, name='The price before the price',
     tag='Upfront fares, explained', chips=['Time', 'Distance', 'Prediction'], kicker='CHAPTER ONE', photo='carint_0')
beat(1, "When you type in a destination, the app shows you a price before you even confirm. Uber calls this an upfront fare.",
     'photo', photo='carint_0', mode='parallax', label='THE UPFRONT FARE')
beat(1, "On its own rider pages, Uber says the base rate is determined by the time and distance of a trip. A flat operating fee may be added, and tolls are added when your route uses one.",
     'point', photo='rainwin_0', head='What Uber officially says', body='Base rate = time + distance. Plus fees and tolls.',
     illo='formula', src='uber.com fare-estimate page; Uber ANZ upfront-fares post · ' + READ)
beat(1, "But here's the catch. Before the trip starts, nobody knows how long it will take. So the price you see is really a prediction.",
     'photo', photo='traffic_1', mode='pull', lines=['The price is a', 'prediction.'], accent=1)
beat(1, "Uber's own engineering blog says it plainly: we use E T A's to calculate fares, estimate pickup times, match riders to drivers, plan deliveries, and more.",
     'doc_quote', style='blog', photo='server_0',
     doc='UBER ENGINEERING BLOG  ·  "DeepETA: How Uber Predicts Arrival Times"  ·  10 FEB 2022',
     quote='We use ETAs to calculate fares, estimate pickup times, match riders to drivers, plan deliveries, and more.',
     hl=[0], src='Uber Engineering blog, 10 Feb 2022 · ' + READ)
beat(1, "That arrival time comes from a deep learning model called Deep E T A. Uber says it has hundreds of millions of parameters, and it has to answer within a few milliseconds.",
     'point', photo='server_0', head='DeepETA', body='Hundreds of millions of parameters. An answer in milliseconds.',
     illo='nn', src='Uber Engineering blog, 10 Feb 2022 · ' + READ)
beat(1, "So before a driver even moves, a neural network has already guessed your route, your traffic, and your arrival time. And that guess feeds your price.",
     'photo', photo='server_0', mode='parallax', label='PREDICTION FIRST, PRICE SECOND')
beat(1, "Here's a simplified example, with made-up numbers. A base rate for a twelve-minute, five-mile trip. An operating fee. A toll. That's the floor. Now watch what happens when the city gets busy.",
     'receipt', photo='rainwin_0', head='Example fare', rows=[('Base rate · 12 min, 5 mi', '$11.40'), ('Operating fee', '$2.50'),
     ('Toll', '$1.75'), ('Busy-time adjustment', '?')], total='$15.65 + ?')

# ---------------- 2 · WHY SURGE EXISTS ----------------
beat(2, "Chapter two. Why surge exists.", 'tool', num=2, name='Why surge exists', tag='When riders outnumber drivers',
     chips=['Demand', 'Supply', 'Location'], kicker='CHAPTER TWO', photo='stadium_1')
beat(2, "Picture a big concert letting out. Thousands of people open the app in the same few minutes, and there are only so many cars nearby.",
     'photo', photo='stadium_1', mode='push', label='EXAMPLE · A CONCERT LETS OUT')
beat(2, "Uber's rider page says that when there are more riders than available drivers, prices may temporarily increase until the marketplace is rebalanced.",
     'doc_quote', style='web', photo='stadium_1',
     doc='UBER  ·  RIDER FARE-ESTIMATE PAGE  ·  "BUSY TIMES AND AREAS"',
     quote='When there are more riders than available drivers, prices may temporarily increase until the marketplace is rebalanced.',
     hl=[0], src='uber.com fare-estimate page · ' + READ)
beat(2, "Uber's own researchers argue this isn't only about profit. In a paper called Surge Pricing Solves the Wild Goose Chase, they describe what happens without it.",
     'photo', photo='rush_1', mode='pull', lines=['The wild', 'goose chase'], accent=1)
beat(2, "Demand spikes, and idle cars disappear. The app has to send drivers from far away. They spend more time driving empty, earn less, and log off. And the shortage gets worse.",
     'steps', photo='rush_1', head='Without surge, a spiral', items=['Idle cars vanish', 'Pickups get far away', 'Drivers log off'])
beat(2, "Their conclusion is blunt. Banning surge pricing would thus likely result in always-high prices. That's Uber's research team, so treat it as their argument, not a neutral verdict.",
     'doc_quote', style='paper', photo='rush_1',
     doc='CASTILLO, KNOEPFLE & WEYL  ·  "SURGE PRICING SOLVES THE WILD GOOSE CHASE"  ·  UBER RESEARCH',
     quote='Banning surge pricing would thus likely result in always-high prices.',
     hl=[0], src='Uber research blog summary of Castillo, Knoepfle & Weyl (2017) · ' + READ, reveal=True)
beat(2, "Surge is also hyper-local. A twenty fifteen audit by Northeastern University tracked Uber for four weeks from forty-three locations. It found Manhattan split into sixteen separate surge areas, with prices changing every five minutes.",
     'surgemap', photo='skyline_0', head='Surge is hyper-local', src='Chen, Mislove & Wilson, Northeastern University, 2015 · ' + READ)
beat(2, "In Times Square, about twenty percent of the time, riders could have saved fifty percent or more just by being in the next area over.",
     'counter', photo='street_1', value=50, fmt='{:.0f}%', label='possible saving, one area over',
     sub='Times Square, about 20% of the time · 2015 audit', src='Northeastern University news, 29 Oct 2015 · ' + READ)
beat(2, "That study is from twenty fifteen, and the system has changed a lot since. But the core idea still holds. Your price can depend on exactly where, and exactly when, you ask.",
     'point', photo='street_1', head='Fair caveat', body='Old data. But where and when still matter.', illo='clock')

# ---------------- 3 · PRICED BY ROUTE ----------------
beat(3, "Chapter three. Priced by route.", 'tool', num=3, name='Priced by route', tag='Beyond simple supply and demand',
     chips=['Machine learning', 'Routes', 'Demand patterns'], kicker='CHAPTER THREE', photo='rainwin_0')
beat(3, "So far, this sounds like simple supply and demand. Here's where it gets more interesting.",
     'hero', photo='taxi_0', lines=['Not just', 'supply & demand'], accent=1, illo='none')
beat(3, "In twenty seventeen, Bloomberg reported on a pricing approach that Uber's head of product, Daniel Graf, called route-based pricing.",
     'photo', photo='rainwin_0', mode='push', label='2017 · ROUTE-BASED PRICING')
beat(3, "As reported, it used machine learning to estimate what riders would be willing to pay for a particular route. So two trips with the same distance and duration could get different prices.",
     'point', photo='rainwin_0', head='Route-based pricing', body='Same distance. Same time. Different route, different price.',
     illo='routes', src='Bloomberg report via Engadget, 19 May 2017 · ' + READ)
beat(3, "Uber's response was short. We price routes differently based on our understanding of riders' choices. A spokesperson said it was based on rider demand, not on how wealthy anyone looked.",
     'doc_quote', style='memo', photo='traffic_1',
     doc='UBER SPOKESPERSON  ·  STATEMENT TO THE PRESS  ·  MAY 2017',
     quote="We price routes differently based on our understanding of riders' choices.",
     hl=[0], src='Uber statement, reported by Engadget, 19 May 2017 · ' + READ)
beat(3, "Notice the wording. Uber describes this as pricing routes and demand patterns, not you as a person. And there was a second change hiding in that story. The rider's price and the driver's pay were no longer the same number.",
     'point', photo='traffic_0', head='The hidden second change', body="Your price and your driver's pay split apart.", illo='split')
beat(3, "Hold on to that. We'll come back to it, because it changes everything for the person driving you.",
     'hero', photo='carint_0', lines=['Remember', 'this one.'], accent=1, illo='none')

# ---------------- 4 · MYTHS VS FACTS ----------------
beat(4, "Chapter four. Myths versus facts.", 'tool', num=4, name='Myths vs facts', tag='What the evidence supports',
     chips=['Battery', 'Phone brand', 'Verdicts'], kicker='CHAPTER FOUR', photo='charging_0')
beat(4, "Now, the myth you've probably heard. Uber charges you more when your phone battery is low.",
     'photo', photo='charging_0', mode='push', lines=['Low battery,', 'higher price?'], accent=1)
beat(4, "It started in twenty sixteen, when Uber's head of economic research at the time, Keith Chen, said on a podcast that people with a low battery are more likely to accept surge prices.",
     'point', photo='charging_0', head='Where the rumor started', body='Low-battery riders accept surge more often.', illo='battery',
     src='TechRadar, 22 May 2016 · ' + READ)
beat(4, "But in the same conversation he said: We absolutely don't use that to kind of like push you a higher surge price. The app reads your battery level to switch on a low-power mode.",
     'doc_quote', style='memo', photo='charging_0',
     doc='KEITH CHEN, THEN HEAD OF ECONOMIC RESEARCH AT UBER  ·  PODCAST INTERVIEW  ·  MAY 2016',
     quote="We absolutely don't use that to kind of like push you a higher surge price.",
     hl=[0], src='Quoted by TechRadar, 22 May 2016 · ' + READ)
beat(4, "So, the verdict. There's no public evidence that Uber uses battery level to price rides, and the company says it doesn't. The real lesson is about us. Under pressure, we accept higher prices.",
     'myth', photo='charging_0', claim='Low battery = higher price', verdict='NO EVIDENCE',
     fact="Uber says it doesn't. The effect is in our behaviour.", reveal=True)
beat(4, "Myth two. iPhone users pay more. In January twenty twenty-five, India's consumer protection authority sent notices to Uber and Ola about apparent price differences between iPhone and Android users.",
     'photo', photo='phone_0', mode='parallax', label='JAN 2025 · NOTICES FROM INDIA\'S CCPA')
beat(4, "Uber's reply, as reported by Reuters: We do not set prices based on a rider's phone manufacturer.",
     'doc_quote', style='memo', photo='phone_0',
     doc='UBER STATEMENT  ·  REPORTED BY REUTERS  ·  JANUARY 2025',
     quote="We do not set prices based on a rider's phone manufacturer.",
     hl=[0], src='Reuters report via ETV Bharat, Jan 2025 · ' + READ)
beat(4, "Verdict: a claim that drew official questions, denied by Uber, and not proven in public. That makes it unproven. Not a fact, and not a closed case either.",
     'myth', photo='phone_0', claim='iPhone users pay more', verdict='UNPROVEN', fact='A regulator asked. Uber denies it.')
beat(4, "So here's what's actually documented. Time, distance, predicted traffic, demand, and route-level patterns. Not your battery. And, as far as public evidence goes, not your phone brand.",
     'checklist', photo='traffic_1', head='What is documented', items=['Time + distance', 'Predicted traffic', 'Demand + route'])

# ---------------- 5 · THE OTHER SIDE OF THE SCREEN ----------------
beat(5, "Chapter five. The other side of the screen.", 'tool', num=5, name='The other side of the screen',
     tag="What happened to driver pay", chips=['1.5M trips', '258 drivers', '2016–2024'], kicker='CHAPTER FIVE', photo='london_0')
beat(5, "Remember the price and the pay drifting apart? In twenty twenty-five, a team at the University of Oxford measured what that looks like in practice.",
     'photo', photo='london_0', mode='push', label='LONDON · DRIVER DATA')
beat(5, "Two hundred fifty-eight UK drivers, mainly in London, shared their own data through legal data access requests. Together, more than one point five million trips, from twenty sixteen to twenty twenty-four.",
     'counter', photo='wet_0', value=258, fmt='{:.0f}', label='drivers shared their own data',
     sub='1.5M+ trips · 2016–2024 · mostly London', src='Binns et al., FAccT 2025 · ' + READ)
beat(5, "The paper describes a system where the price the passenger pays and the fee the driver receives vary independently of each other.",
     'doc_quote', style='paper', photo='wet_0',
     doc='BINNS, STEIN, DATTA, VAN KLEEK & SHADBOLT  ·  UNIVERSITY OF OXFORD  ·  FAccT 2025',
     quote='the price the passenger pays and the fee the driver receives vary independently of each other',
     hl=[0], src='Binns et al., FAccT 2025, arXiv 2506.15278 · ' + READ)
beat(5, "Uber's advertised commission was twenty-five percent. After dynamic pricing reached London in twenty twenty-three, the median share Uber kept per driver rose to twenty-nine percent. On many trips, drivers now keep only fifty to sixty percent.",
     'chart', photo='wet_0', head="Uber's share of the fare (median per driver)", unit='%',
     bars=[('Before dynamic pricing', 25, '25%'), ('After dynamic pricing', 29, '29%')], vmax=40,
     note='Drivers frequently keep only 50–60% of a fare', src='Binns et al., FAccT 2025 · ' + READ)
beat(5, "And by the researchers' working-time measure, inflation-adjusted hourly pay fell from twenty-two pounds twenty to nineteen pounds six. Unpaid waiting time rose by more than an hour a week.",
     'chart', photo='london_0', head='Driver hourly pay (inflation-adjusted)', unit='£',
     bars=[('Year before', 22.20, '£22.20'), ('Year after', 19.06, '£19.06')], vmax=26,
     note='Working-time definition used by the UK Employment Tribunal', src='Binns et al., FAccT 2025 · ' + READ, reveal=True)
beat(5, "To be fair, the authors say their design can't prove dynamic pricing alone caused this. Demand, traffic, and the number of drivers changed too. But it's one of the clearest looks we have at the other side of your price.",
     'point', photo='london_0', head='Fair caveat', body='A trend over time. Not proof of a single cause.', illo='info')
beat(5, "So the algorithm isn't only pricing you. It's also pricing the person driving you.",
     'hero', photo='carint_0', lines=['It prices you.', 'And your driver.'], accent=1, illo='none')

# ---------------- 6 · WHAT YOU CAN ACTUALLY DO ----------------
beat(6, "Chapter six. What you can actually do.", 'tool', num=6, name='What you can actually do', tag='Fair, simple habits',
     chips=['Check', 'Wait', 'Compare'], kicker='CHAPTER SIX', photo='terminal_0')
beat(6, "First, some balance. A study using almost fifty million Uber sessions estimated that Uber X created six point eight billion dollars of value for US riders in twenty fifteen. About one dollar sixty for every dollar spent.",
     'counter', photo='skyline_1', value=1.60, fmt='${:.2f}', label='value to riders per $1 spent',
     sub='UberX, US, 2015 · ~50M sessions', src='Cohen, Hahn, Hall, Levitt & Metcalfe, NBER w22627, 2016 · ' + READ)
beat(6, "So here are a few fair, simple habits. Check the upfront price before you confirm. If it's surging and you're not in a hurry, wait a few minutes, or walk a couple of blocks away from the busiest spot. And compare more than one option.",
     'steps', photo='street_1', head='Fair habits', items=['Check the price first', 'Wait a few minutes', 'Walk a block or two', 'Compare options'])
beat(6, "Big events, airports, bad weather, and the end of a night out are the classic busy moments. Planning around them helps more than any trick.",
     'photo', photo='terminal_0', mode='pull', lines=['Plan around', 'busy moments.'], accent=1)
beat(6, "And skip the hacks you see online. There's no secret setting that switches the algorithm off, and faking your location or messing with the app can break its terms.",
     'point', photo='traffic_0', head='Skip the hacks', body='No secret setting switches the algorithm off.', illo='info')

# ---------------- OUTRO ----------------
beat(7, "Quick recap.", 'hero', photo='traffic_1', lines=['Quick', 'recap'], accent=1, illo='none', small=True)
beat(7, "Your price is a prediction built from time and distance. Surge rebalances busy moments. Routes can be priced by demand patterns. The battery myth has no evidence behind it. And driver pay is now set separately from your fare.",
     'recap', items=[('1', 'Upfront fare', 'A prediction'), ('2', 'Surge', 'Rebalances busy moments'),
                     ('3', 'Route pricing', 'Demand patterns'), ('4', 'Battery myth', 'No evidence'),
                     ('5', 'Driver pay', 'Set separately')])
beat(7, "Which algorithm should we open next? Airline seats, food delivery, or your streaming feed? Tell me in the comments.",
     'hero', photo='skyline_0', lines=['What should we', 'open next?'], accent=1, illo='comment')
beat(7, "Every source, with the date I read it, is linked in the description.",
     'hero', lines=['Sources in the', 'description'], accent=1, illo='none', small=True)
beat(7, "And if you want to see the hidden rules behind the apps you use every day, subscribe. New ones every Tuesday and Sunday.",
     'subscribe', lines=['SUBSCRIBE', 'Hidden Layer · new hidden rules every Tuesday & Sunday'])

SECTION_NAMES = {1: 'The price before the price', 2: 'Why surge exists', 3: 'Priced by route', 4: 'Myths vs facts',
                 5: 'The other side of the screen', 6: 'What you can actually do'}
SECTION_ORDER = [1, 2, 3, 4, 5, 6]
SECTION_PREFIX = ''
INTRO_CHAPTER = "Your price isn't random"
RECAP_TITLE = 'What decides your price'
TIMER_TEXT = '9:00'
PALETTE = {'A1': (255, 196, 61), 'A2': (64, 156, 255)}   # P2 amber / blue
THUMB = dict(top='THE ALGORITHM', big=['NOT', 'RANDOM'], stamp='PREDICTED', badge='$?', big_color='A1')

PHOTO_BLUR = {'phone_0': [(0.435, 0.33, 0.565, 0.73)], 'rush_1': [(0.0, 0.5, 0.1, 0.72)], 'rainwin_1': [(0.15, 0.18, 0.3, 0.36)]}
