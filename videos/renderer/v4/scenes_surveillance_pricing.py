# Hidden Layer · The Algorithm · EP 04 · "Surveillance pricing" (Instacart test, FTC data findings, myths, FTC Aug 2026 policy, state laws)
# beat(section, narration, kind, **visual). Narration = spoken text (numbers as words); on-screen text in visual keys.
B = []
def beat(section, text, kind, **v):
    B.append(dict(section=section, text=text, kind=kind, **v))

GW = 'Groundwork Collaborative · Consumer Reports · "Same Cart, Different Price" · Dec 2025 · read 12 Nov 2026'
FTC25 = 'ftc.gov · Press release · 17 Jan 2025 · read 12 Nov 2026'
FTC26 = 'ftc.gov · Proposed Enforcement Policy Statement · 19 Aug 2026 · read 12 Nov 2026'
NY = 'N.Y. Gen. Bus. Law § 349-a · via Duane Morris, 12 Mar 2026 · read 12 Nov 2026'
EGGS = [('$3.99', 'shopper A'), ('$4.28', 'shopper B'), ('$4.59', 'shopper C'), ('$4.69', 'shopper D'), ('$4.79', 'shopper E')]

# ---------------- 0 · COLD OPEN (number + scenario)
beat(0, "A dozen eggs. One Safeway store in Washington. Shoppers ordering them through the same app, in the same test, saw five different prices.",
     'ladder', items=EGGS, head='1 dozen eggs · 1 store · 5 prices', src='Groundwork Collaborative · Consumer Reports · Sep 2025 test', meter=('SAME EGGS, GAP', '$0.80'), instant=True)
beat(0, "Same eggs. Same store. The cheapest was three ninety-nine. The most expensive was four seventy-nine.",
     'compare', left=('SHOPPER A', 'same eggs', '$3.99'), right=('SHOPPER E', 'same eggs', '$4.79'), note='→ same store, same test, Sep 2025')
beat(0, "That's what people now call surveillance pricing. A price that depends on who's looking. And in August, the Federal Trade Commission put in writing where it thinks that crosses the line.",
     'doc', quote='…set personalized prices based on analysis of consumers\' personal data and resulting conclusions.', mode='highlight',
     hl='personal data', title='Proposed Enforcement Policy Statement Regarding Personalized Pricing', clause='§ I', src=FTC26, photo='servers', style='memo')
beat(0, "So by the end of this, you'll know what's documented, what's a myth, and four quick checks that tell you whether the price you're seeing is the price.",
     'headline', head=['Documented, myth,', 'or *just a test*?'], note='→ the 4 checks are in chapter 5', clause='§ 0')
beat(0, "And one of the F T C's own examples involves a hotel room and a funeral. Hold on to that one. It explains where this is heading.",
     'headline', head=['A hotel room', 'and a [[funeral]]'], note='→ unredacted in chapter 4', clause='§ 0.1', pause=.55)

# ---------------- 1 · THE EGG TEST
beat(1, "Here's how those egg prices were found. Consumer Reports and Groundwork Collaborative, with More Perfect Union, recruited four hundred and thirty-seven volunteers.",
     'counter', value=437, label='VOLUNTEER SHOPPERS · INSTACART PRICE STUDY', src=GW, parts=['same basket', 'same store', 'same time'], sum=False)
beat(1, "In September twenty twenty-five, they loaded the same basket, at the same store, at the same moment, and wrote down what they were charged.",
     'photo', photo='cart', mode='push', head=['Same basket,', '*same moment*'])
beat(1, "Seventy-four percent of the items showed more than one price.",
     'counter', value=74, suffix='%', label='ITEMS WITH MORE THAN ONE PRICE', src=GW)
beat(1, "For those items, the gap between the lowest and highest price averaged thirteen percent. The biggest gap was twenty-three.",
     'chart', bars=[('AVERAGE GAP', 13), ('BIGGEST GAP', 23)], unit='%', label='LOWEST vs HIGHEST PRICE · SAME ITEM', side=['on one item,', 'same store'],
     note='→ corn flakes: $2.99 / $3.49 / $3.69', src=GW)
beat(1, "Whole baskets moved too. At one Seattle Safeway, the same basket cost a hundred and fourteen thirty-four, a hundred and nineteen eighty-five, or a hundred and twenty-three ninety-three.",
     'baskets', items=[('A', 114.34), ('B', 119.85), ('C', 123.93)], head='Same basket · Seattle Safeway', src=GW, meter=('SAME BASKET, GAP', '$9.59'))
beat(1, "That works out to about seven percent per basket. The researchers applied it to Instacart's own estimate of what a family of four spends on groceries in a year.",
     'receipt', title='A YEAR OF GROCERIES', subtitle='family of four · Instacart estimate', head=['The yearly', '*gap*'], tag='EXTRAPOLATION · the report\'s math',
     lines=[('$363 per person', 'x 4'), ('x 12 months', '$17,424'), ('Average basket gap', '7%')], total=('PER YEAR, ROUGHLY', 1220.0), photo='cart', stamp='ESTIMATE')
beat(1, "Roughly twelve hundred dollars a year. That's a projection, not anyone's actual bill. And here's the part most of the headlines skipped.",
     'headline', head=['About *$1,200* a year', '(projected)'], note='→ the report: "not representative of the U.S. population"', clause='§ 1.1',
     meter=('PROJECTED, PER YEAR', '$1,200'), pause=.5)
beat(1, "Instacart said the tests were randomized, and that they don't use any personal or demographic data. The report itself found differences tied to demographics were small, and not statistically meaningful.",
     'doc', quote='Instacart: tests "don\'t use any personal or demographic data"; "customers are randomly assigned to price test cohorts by product category and location."',
     mode='highlight', hl='randomly assigned to price test cohorts', title='Same Cart, Different Price · company response', clause='§ 1.2', src=GW, photo='aisle', stamp='THEIR SIDE')
beat(1, "So this wasn't a price built from your profile. It was a price experiment, and the shoppers were the test subjects. Nobody told them which group they were in.",
     'photo', photo='aisle', mode='rack', head=['Not a profile.', 'A *price test*.'])
beat(1, "The tool behind it came from Eversight, a pricing company Instacart bought in twenty twenty-two. It tells retailers it can lift sales by one to three percent, and margins by two to five.",
     'counter', value=5, prefix='+', suffix='%', label='MARGIN LIFT CLAIMED · EVERSIGHT PRICING TOOLS', src=GW, parts=['sales: +1% to 3%', 'margins: +2% to 5%'], sum=False)
beat(1, "In December, Instacart ended those item price tests. But the question they raised didn't end. If prices can be tested on you, could they be built for you?",
     'photo', photo='milk', mode='push', head=['Tested on you.', 'Built *for you*?'], note='→ Instacart ended the item price tests, Dec 2025', pause=.55)

# ---------------- 2 · WHAT THEY CAN SEE
beat(2, "That's the question the F T C asked eight companies that sell pricing tools to retailers, in twenty twenty-four.",
     'photo', photo='servers', mode='panR', head=['8 companies that', '*sell prices*'])
beat(2, "In January twenty twenty-five, F T C staff published early findings. As the F T C's chair put it, the data ranged from a person's location and demographics, quote, down to their mouse movements on a webpage.",
     'datamap', items=['precise location', 'browsing history', 'demographics', 'device', 'mouse movements'], hl=4, src=FTC25)
beat(2, "Even the products you leave unpurchased in an online shopping cart can be tracked.",
     'doc', quote='The type of products that consumers leave unpurchased in an online shopping cart can be tracked.', mode='redact', hl='leave unpurchased',
     title='FTC Surveillance Pricing Study · initial staff findings', clause='§ 2.1', src=FTC25, photo='mouse', style='memo')
beat(2, "And those intermediaries worked with at least two hundred and fifty client businesses, from grocery stores to clothing retailers.",
     'counter', value=250, suffix='+', label='CLIENT BUSINESSES · PRICING INTERMEDIARIES', src=FTC25, parts=['grocery stores', 'apparel retailers'], sum=False)
beat(2, "And here's why this is so hard to catch. Online, you only ever see your own price. There's no shelf next to you showing what the person behind you was quoted.",
     'photo', photo='store', mode='push', head=['You only ever see', '*your own* price'])
beat(2, "The F T C gave one hypothetical. Someone profiled as a new parent could be shown higher priced baby thermometers on the first page of results.",
     'doc', quote='A consumer who is profiled as a new parent may intentionally be shown higher priced baby thermometers on the first page.', mode='highlight',
     hl='profiled as a new parent', title='FTC Surveillance Pricing Study · initial staff findings', clause='§ 2.2', src=FTC25, photo='mouse', style='memo', zoom=True)
beat(2, "Notice what that is. Not a different price for the same thermometer. A different shelf. And that difference, the price versus the placement, is where most of the myths come from.",
     'compare', left=('PRICE', 'same item', 'you pay more'), right=('PLACEMENT', 'pricier items', 'shown first'), note='→ next: myth or documented?', pause=.55)

# ---------------- 3 · MYTH OR DOCUMENTED
beat(3, "Myth one. Mac users pay more. What actually happened: in twenty twelve, the Wall Street Journal reported that Orbitz was showing Mac users pricier hotels higher up in the results.",
     'verdict', claim='"Mac users pay more"', fact='Orbitz showed Mac users pricier hotels first (WSJ, 2012)', verdict='STEERING', photo='hotel')
beat(3, "Same hotels, same prices, for anyone who looked. That's steering, not a personal price. Still worth knowing. Your first page isn't neutral.",
     'photo', photo='hotel0', mode='push', head=['Your first page', 'isn\'t *neutral*'])
beat(3, "Myth two. A low phone battery raises your ride price. In twenty sixteen, Uber's head of economic research said people with low battery are more willing to accept surge pricing, and that Uber doesn't use that to set prices.",
     'verdict', claim='"Low battery = higher fare"', fact='Uber said it knows, and does not use it (2016)', verdict='UNPROVEN', photo='map')
beat(3, "Now, a documented one. In twenty nineteen, a TV station in Minneapolis, KARE eleven, found that Target's app showed lower prices outside the store, and switched to higher in-store prices once the phone was inside the store.",
     'verdict', claim='"The app changes the price when you walk in"', fact='KARE 11 investigation, 2019', verdict='DOCUMENTED', photo='store')
beat(3, "Ten items they checked were two hundred and sixty-two dollars cheaper in the parking lot than in the store. Target said it showed in-store prices in stores, and it added labels saying which price is which.",
     'compare', left=('PARKING LOT', '10 items, app', 'cheaper'), right=('IN THE STORE', 'same 10 items', '+$262'), note='→ Target now labels "online" vs "in-store"',
     meter=('LOCATION GAP, 10 ITEMS', '$262'))
beat(3, "Documented, again. In twenty fourteen, Northeastern University researchers tested sixteen big shopping and travel sites, and found price steering or discrimination on nine of them.",
     'counter', value=9, suffix=' of 16', label='SITES WITH STEERING OR PRICE DIFFERENCES · 2014', src='Northeastern University · Hannak et al., 2014',
     parts=['members-only hotel prices', 'steering to pricier hotels'], sum=False)
beat(3, "And airlines? In twenty twenty-five, Delta said a company called Fetcherr was helping set fares on about three percent of its domestic network. Senators asked if that meant personal fares. Delta said it has no plans to set individual fares from personal data.",
     'verdict', claim='"AI sets your personal airfare"', fact='Delta: ~3% of domestic network AI-assisted, no personal fares', verdict='DENIED', photo='oldmap')
beat(3, "So here's the honest scoreboard. A price built from your personal profile is rare, and hard to prove. Prices that change with where you are, what device you're on, and which test group you landed in? Those are documented.",
     'list', head='The honest scoreboard', items=['Location-based prices: documented', 'Price tests on shoppers: documented', 'Profile-based prices: hard to prove'], tag='SCOREBOARD', pause=.5)

# ---------------- 4 · THE FTC LINE
beat(4, "Which is why the F T C document from August nineteenth matters. It's a proposed enforcement policy statement on personalized pricing.",
     'photo', photo='servers', mode='pull', head=['19 Aug 2026:', 'a *line in writing*'], meter=('PROJECTED, PER YEAR', '$1,200'))
beat(4, "It doesn't ban personal prices. Quote. Congress has not given the Commission the authority to prohibit personalized pricing outright.",
     'doc', quote='Congress has not given the Commission the authority to prohibit personalized pricing outright.', mode='highlight', hl='prohibit personalized pricing outright',
     title='Proposed Enforcement Policy Statement Regarding Personalized Pricing', clause='§ III', src=FTC26, photo='servers', style='memo', stamp='NO BAN')
beat(4, "But where you'd reasonably expect one price for everyone, it says the seller should tell you three things. That the price is personalized. The basis for it. And the type of data used.",
     'list', head='What you should be told', items=['The price is personalized', 'The basis for it', 'The type of data used'], tag='DISCLOSE')
beat(4, "Skip that, and the F T C says it's likely to be an unfair or deceptive practice.",
     'doc', quote='The failure to make these disclosures is likely to constitute an unfair or deceptive act or practice in violation of Section 5.', mode='redact',
     hl='unfair or deceptive', title='Proposed Enforcement Policy Statement Regarding Personalized Pricing', clause='§ I', src=FTC26, photo='servers', style='memo')
beat(4, "Then come the examples. A grocery chain charging more for milk because data shows several children live in the household. A rideshare app charging more because you haven't installed its competitors' apps.",
     'list', head='Examples the FTC chose', items=['Milk: "several children" at home', 'Rides: no rival apps installed', 'Delivery: "unable to leave" home'], tag='FTC EXAMPLES')
beat(4, "And the one I promised. A hotel charging a higher price because data leads it to believe you're traveling for a funeral, or some other can't-miss personal business.",
     'headline', head=['A hotel room', 'and a [[funeral]]'], note='→ FTC proposed policy statement, 19 Aug 2026', clause='§ 4.1', reveal_redact=True, pause=.6)
beat(4, "That's the whole logic of a personal price, in one sentence. It doesn't price the room. It prices how badly you need the room.",
     'photo', photo='hotel0', mode='rack', head=['It prices how badly', 'you *need* it'], pause=.5)
beat(4, "It's still a proposal. Comments closed on September twenty-fifth. And while Washington writes guidance, states have already written laws.",
     'photo', photo='map', mode='panL', head=['Proposal in DC.', '*Laws* in the states.'])
beat(4, "Since November twenty twenty-five, New York requires a line next to any algorithmic price built from personal data. In capital letters.",
     'doc', quote='THIS PRICE WAS SET BY AN ALGORITHM USING YOUR PERSONAL DATA.', mode='redact', hl='USING YOUR PERSONAL DATA', title='New York Algorithmic Pricing Disclosure Act',
     clause='§ 349-a', src=NY, photo='map', style='memo', stamp='REQUIRED')
beat(4, "Fines run up to a thousand dollars per violation, and a federal judge turned down retailers' attempt to block the law.",
     'counter', value=1000, prefix='$', label='NEW YORK · MAX FINE PER VIOLATION', src=NY, parts=['enforced by the Attorney General', 'retailers\' challenge rejected, Oct 2025'], sum=False,
     meter=('NY FINE, UP TO', '$1,000'))
beat(4, "And this year, Connecticut, Maryland and New Jersey passed laws restricting surveillance pricing, mostly for groceries and food delivery. At least eleven more states have bills on the table.",
     'list', head='2026: states move first', items=['Connecticut: retail + food delivery', 'Maryland: big grocers + delivery', 'New Jersey: groceries + delivery'], tag='+11 STATES WITH BILLS', pause=.5)

# ---------------- 5 · FOUR CHECKS
beat(5, "So what can you do today? Four checks, about two minutes. One. Compare logged out. Open the same item signed out, in a private window, or on a second device. A gap tells you something.",
     'takeaway', n=1, head='Compare logged out', sub='same item · private window · second device', photo='mouse')
beat(5, "Private mode won't hide your location, so if it matters, compare at home and on the go.",
     'takeaway', n=1, head='Then change place', sub='private mode does not hide your location', photo='map')
beat(5, "Two. Read the label next to the price. Online versus in-store. And in New York, look for that algorithm sentence.",
     'takeaway', n=2, head='Read the price label', sub='"online" vs "in-store" · NY: the algorithm line', photo='tags')
beat(5, "Three. Compare the final total, not the tag. In the Instacart study, some sale prices matched, but the crossed-out original prices didn't.",
     'takeaway', n=3, head='Compare the total', sub='fees + "original" prices differ too', photo='cart')
beat(5, "Four. Cut what the app knows. Set shopping apps to use location only while open, and use the opt out links many state privacy laws require.",
     'takeaway', n=4, head='Cut what it knows', sub='location: only while using · use "Do Not Sell or Share"', photo='tags2')
beat(5, "Rules here are still changing, so check the sources in the description. This isn't financial advice.",
     'headline', head=['Rules are moving.', 'Check the *sources*'], note='→ not financial advice', clause='§ 5')

# ---------------- 6 · OUTRO
beat(6, "A price used to be a number on a shelf, the same for whoever walked past. Online, it can be a guess about you. The new rules are starting to say one thing. If you're guessing, say so.",
     'headline', head=['If you\'re guessing,', '*say so*'], note='→ recap: tests · location · disclosure · 4 checks', clause='§ 6')
beat(6, "Have you ever seen two different prices for the same thing, on two phones? Tell me what it was in the comments.",
     'headline', head=['Two phones,', '*two prices*?'], note='→ tell us in the comments', clause='§ 6.1')
beat(6, "And if you want to know which rule is deciding your next price, subscribe to Hidden Layer.",
     'subscribe')

SECTION_NAMES = {1: 'The egg test', 2: 'What pricing tools can see', 3: 'Myth or documented?', 4: 'The FTC draws a line',
                 5: '4 checks before you pay', 6: 'Recap'}
SECTION_ORDER = [1, 2, 3, 4, 5, 6]
SECTION_PREFIX = ''
INTRO_CHAPTER = 'Same eggs, 5 prices'
RECAP_TITLE = 'Recap'
SERIES = 'THE ALGORITHM'
EPISODE = 'EP. 04'
TOPIC = 'SURVEILLANCE PRICING'
PALETTE = 'ink'
THUMB = dict(big=['Same eggs.', '5 prices.'], hl='5 prices.')
