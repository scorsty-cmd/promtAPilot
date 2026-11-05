# Hidden Layer · The Fine Print · EP 03 · "The cost of leaving" (Adobe early termination fee, Amazon Iliad, click-to-cancel)
# beat(section, narration, kind, **visual). Narration is spoken text (numbers as words); on-screen text is in the visual keys.
B = []
def beat(section, text, kind, **v):
    B.append(dict(section=section, text=text, kind=kind, **v))

ADOBE_SRC = 'helpx.adobe.com · Subscription terms · updated 27 Jan 2026 · read 5 Nov 2026'
DOJ_SRC = 'justice.gov · Office of Public Affairs · 13 Mar 2026 · read 5 Nov 2026'
Q1 = 'After 14 days, a cancellation fee (early termination fee) of 50% of the remaining balance of the contract applies.'
Q2 = 'For example, if you cancel in the ninth month, you pay 50% of the fee for the three remaining months.'
Q3 = 'If you\'re over the 5GB cloud storage limit when you cancel, you have 30 days to move files out of cloud storage.'

# ---------------- 0 · COLD OPEN (money moment first)
beat(0, "Signing up took one click. Leaving would have cost three hundred and fifteen dollars.",
     'compare', left=('JOIN', '1 click', '$0'), right=('LEAVE', 'month 3 of 12', '$314.96'), instant=True,
     note='EXAMPLE · our math, Adobe\'s rule', meter=('COST OF LEAVING', '$314.96'))
beat(0, "That number isn't a guess. It comes from a clause on Adobe's own help page, and it applies to the plan most people pick.",
     'doc', quote=Q1, mode='redact', hl='50% of the remaining balance', title='Understand Adobe\'s subscription terms and refund policies',
     clause='§ A.1', src=ADOBE_SRC, photo='laptop')
beat(0, "Quote. After fourteen days, a cancellation fee, early termination fee, of fifty percent of the remaining balance of the contract applies.",
     'doc', quote=Q1, mode='highlight', hl='50% of the remaining balance', title='Annual plan, paid monthly',
     clause='§ A.1', src=ADOBE_SRC, photo='laptop', stamp='VERBATIM', zoom=True)
beat(0, "The government later said Adobe hid that fee. Adobe disagreed, and then agreed to a hundred and fifty million dollar settlement.",
     'photo', photo='courthouse', mode='push', head=['The fee they', 'settled for *$150 million*'], fx=.5, fy=.35, meter=('COST OF LEAVING', '$314.96'))
beat(0, "So by the end of this, you'll know how to spot a contract dressed up as a monthly plan, and how to work out what leaving costs before you ever sign up.",
     'headline', head=['A contract dressed', 'up as a *monthly plan*'], note='→ the 2-minute check is in chapter 6', clause='§ 0')
beat(0, "And later, I'll show you the phrase one Adobe executive used for this fee, according to the government's complaint. It explains a lot.",
     'headline', head=['"A bit like [[heroin]]', '*for Adobe*"'], note='→ unredacted later in this video', clause='§ 0.1', redact_keep=True, pause=.5)

# ---------------- 1 · THE CLAUSE
beat(1, "Adobe sells Creative Cloud, the bundle with Photoshop and Premiere, in three shapes.",
     'photo', photo='keyboard', mode='panR', head=['One product,', '*three* ways to pay'], fx=.6, fy=.5)
beat(1, "Month to month. Annual, paid up front. And annual, paid monthly. That last one looks like a normal monthly bill, and it comes with a discount.",
     'cards3', items=[('MONTH-TO-MONTH', 'pay monthly', 'cancel any month'), ('ANNUAL, PREPAID', 'pay once', 'no refund mid-year'),
                      ('ANNUAL, PAID MONTHLY', 'pay monthly', '12-month contract')], pick=2)
beat(1, "That third one is the trap door. Adobe's page, last updated on January twenty-seventh, twenty twenty-six, which I read on November fifth, spells out the example.",
     'doc', quote=Q2, mode='redact', hl='three remaining months', title='Understand cancellation terms for Annual plan, paid monthly', clause='§ A.2', src=ADOBE_SRC, photo='calendar')
beat(1, "Quote. If you cancel in the ninth month, you pay fifty percent of the fee for the three remaining months.",
     'doc', quote=Q2, mode='highlight', hl='50% of the fee for the three remaining months', title='Understand cancellation terms for Annual plan, paid monthly',
     clause='§ A.2', src=ADOBE_SRC, photo='calendar', zoom=True)
beat(1, "Read that slowly. You're not paying for a month. You're paying for a year, in twelve slices, and you've promised every slice.",
     'slices', months=12, used=9, label='You promised all 12', pause=.45)
beat(1, "Adobe says its cancellation charges are calculated on the standard monthly fee of sixty-nine ninety-nine, for the Creative Cloud Pro plan in North America.",
     'doc', quote='The cancellation charges shown here are calculated for the standard monthly subscription fee of US$69.99 and are applicable for North America.',
     mode='highlight', hl='US$69.99', title='Creative Cloud Pro plan', clause='§ A.3', src=ADOBE_SRC, photo='calculator')
beat(1, "So let's do the math for someone who quits after three months. Nine months left, times sixty-nine ninety-nine, is about six hundred and thirty dollars. Half of that is three hundred and fifteen.",
     'receipt', lines=[('Months used', '3 of 12'), ('Months remaining', '9'), ('Standard monthly fee', '$69.99'), ('9 × $69.99', '$629.91'), ('Fee rate', '50%')],
     total=('CANCELLATION FEE', 314.96), photo='calculator', meter=('COST OF LEAVING', '$314.96'))
beat(1, "That's my arithmetic from Adobe's own rule, not a bill I was sent. Adobe also says your fee might be different. But that's the size of it.",
     'headline', head=['Our math.', '*Their rule.*'], note='→ "Your fee and cancellation charges might be different." — Adobe', clause='§ A.3')
beat(1, "And notice what the fee buys you. Nothing. It isn't charged for using anything. It's what you pay to stop.",
     'photo', photo='wallet', mode='push', head=['A fee for', '*stopping*'], fx=.5, fy=.55, pause=.5)
beat(1, "To be fair about what it doesn't mean: cancel within the first fourteen days and that fee doesn't apply. And you don't lose your files on day one.",
     'list', head='What it does NOT mean', items=['Day 1–14: no cancellation fee', 'Your files are not deleted on day one', 'You keep a free membership'])
beat(1, "Adobe's page says that if you're over the free five gigabyte limit when you cancel, you have thirty days to move files out of cloud storage.",
     'doc', quote=Q3, mode='highlight', hl='30 days to move files', title='When you cancel your plan', clause='§ A.4', src=ADOBE_SRC, photo='laptop')
beat(1, "So the clause is public. It's on a help page. Then why did the Justice Department end up suing over it?",
     'photo', photo='clock', mode='rack', head=['Public clause.', 'So why *a lawsuit*?'], fx=.5, fy=.5, pause=.5)

# ---------------- 2 · THE LAWSUIT
beat(2, "In June twenty twenty-four, after a referral from the Federal Trade Commission, the Justice Department sued Adobe and two of its executives.",
     'timeline', items=[('JUN 2024', 'DOJ sues Adobe + 2 executives'), ('MAR 2026', 'Proposed $150M settlement'), ('TODAY', 'Waiting for the court')], upto=0)
beat(2, "The government said Adobe used, quote, fine print and inconspicuous hyperlinks to hide important information, including a hefty early termination fee.",
     'doc', quote='Adobe used "fine print and inconspicuous hyperlinks to hide important information about Adobe\'s subscription plans," including a "hefty Early Termination Fee."',
     mode='redact', hl='fine print and inconspicuous hyperlinks', title='Department of Justice · Press release', clause='§ 2.1', src=DOJ_SRC, photo='pen', style='memo')
beat(2, "It also alleged that the annual, paid monthly plan was pre-selected by default, and that fee details sat behind small icons you had to hover over to see.",
     'list', head='What the government alleged', items=['Annual, paid monthly pre-selected', 'Fee hidden behind hover icons', 'Many pages to cancel'], tag='ALLEGED')
beat(2, "And cancelling? The complaint described convoluted processes, dropped calls, transfers, and some people still being charged after they thought they'd cancelled.",
     'photo', photo='door', mode='pull', head=['"Convoluted and', '*inefficient*"'], fx=.5, fy=.5)
beat(2, "Adobe denied it. Its general counsel said the fee was less than half a percent of revenue, and that cancelling had been cut to four steps back in June twenty twenty-three.",
     'headline', head=['Adobe\'s answer:', '*under 0.5%* of revenue'], note='→ Adobe says cancelling took 4 steps since June 2023', clause='§ 2.2', pause=.4)
beat(2, "Then, on March thirteenth, twenty twenty-six, came the deal. Seventy-five million dollars in civil penalties, plus seventy-five million in free services for customers.",
     'counter', value=150, prefix='$', suffix='M', parts=['$75M civil penalties', '$75M free services'], label='PROPOSED SETTLEMENT · 13 MAR 2026',
     src=DOJ_SRC, meter=('ADOBE SETTLEMENT', '$150M'))
beat(2, "It's a proposed order, and it only takes effect if the court enters it. Adobe said it disagrees with the government's claims.",
     'doc', quote='The proposed stipulated order will resolve the case if entered by the court.', mode='highlight', hl='if entered by the court',
     title='Department of Justice · Press release', clause='§ 2.3', src=DOJ_SRC, photo='courthouse', stamp='PROPOSED', style='memo')
beat(2, "If it's entered, Adobe has to clearly show the fee and how it's calculated before you enrol, remind you before a trial longer than seven days turns paid, and give you easy ways to cancel.",
     'list', head='What the order would require', items=['Show the fee + the math before you join', 'Reminder before a 7+ day trial converts', '"Easy ways to cancel"'], tag='IF ENTERED')
beat(2, "But Adobe isn't the strangest example. That title goes to a company that named its own cancellation process after a war from Greek mythology.",
     'photo', photo='vase', mode='push', head=['Named after', 'a *ten-year war*'], fx=.5, fy=.45, pause=.55)

# ---------------- 3 · THE ILIAD
beat(3, "Inside Amazon, according to the F T C, the Prime cancellation flow was called Iliad.",
     'photo', photo='vase2', mode='panL', head=['Project', '*"Iliad"*'], fx=.5, fy=.5)
beat(3, "The F T C's complaint gave it a full title. The four-page, six-click, fifteen-option Iliad Flow.",
     'flow', stage=0)
beat(3, "Page one. Reminders of what you'd lose, and three buttons. Remind me later. Keep my benefits. Continue to cancel. Only one of them moves you forward.",
     'flow', stage=1)
beat(3, "Page two. Discounted offers, and the same three buttons again. Page three. Five options. Only the last one, End Now, actually ends it.",
     'flow', stage=2)
beat(3, "Joining was the easy part. The F T C alleged Amazon pushed people into Prime without their consent, and put the number of customers it tricked at more than forty million.",
     'compare', left=('JOIN', 'checkout click', '1 click'), right=('LEAVE', 'pages · clicks · options', '4 · 6 · 15'), note='→ FTC allegation, 2023 complaint')
beat(3, "And the friction worked. Business Insider reported that a twenty seventeen version of the flow cut cancellations by fourteen percent.",
     'counter', value=14, prefix='−', suffix='%', label='CANCELLATIONS · 2017 VERSION OF THE FLOW', src='Business Insider, Jun 2023 · via Fast Company, 24 Sep 2025')
beat(3, "In September twenty twenty-five, Amazon settled for two and a half billion dollars. One billion in civil penalties, the largest the F T C has ever won, and one and a half billion in refunds.",
     'counter', value=2.5, prefix='$', suffix='B', decimals=1, parts=['$1B civil penalty', '$1.5B refunds'], label='AMAZON · FTC SETTLEMENT · SEP 2025',
     src='Las Vegas Review-Journal · eMarketer · read 5 Nov 2026', meter=('AMAZON SETTLEMENT', '$2.5B'))
beat(3, "Some customers got automatic refunds of up to fifty-one dollars. Amazon said it only needs to keep the sign-up and cancellation process it already has.",
     'photo', photo='coins', mode='push', head=['Automatic refunds:', 'up to *$51*'], fx=.5, fy=.5)
beat(3, "So why would two of the biggest companies on earth build exits like this? Because every extra step is worth money.",
     'photo', photo='maze', mode='panR', head=['Every extra step', 'is *worth money*'], note='→ next: the math of friction', pause=.5)

# ---------------- 4 · WHY FRICTION PAYS
beat(4, "Picture a thousand people heading for the exit. At each extra page, each offer, each hold queue, a few of them give up and stay. And those few keep paying.",
     'funnel', steps=['Cancel page', 'Offer 1', 'Offer 2', 'Hold queue'], stays=[60, 45, 40, 50])
beat(4, "That isn't one company's problem. The F T C said complaints about subscriptions had climbed to nearly seventy a day in twenty twenty-four, up from forty-two a day in twenty twenty-one.",
     'chart', bars=[('2021', 42), ('2024', 70)], label='FTC COMPLAINTS PER DAY · NEGATIVE-OPTION PROGRAMS', src='ftc.gov · 16 Oct 2024 · read 5 Nov 2026')
beat(4, "Which brings us back to that phrase. According to the unredacted complaint, an Adobe executive described the early termination fee as, quote, a bit like heroin for Adobe.",
     'headline', head=['"A bit like [[heroin]]', '*for Adobe*"'], note='→ unnamed executive · unredacted complaint, Jul 2024', clause='§ 4.1', reveal_redact=True, pause=.6)
beat(4, "Adobe said that person had no decision-making power. Fair enough. But the line tells you how a fee like this can look from the inside. Hard to give up.",
     'photo', photo='keyboard', mode='rack', head=['Hard to give up', '*from the inside*'], note='→ Adobe: the speaker had no decision-making authority')
beat(4, "From the outside, it looks different. It's a charge you discover at the exact moment you're trying to leave.",
     'photo', photo='pen', mode='push', head=['Found at the', '*exit*'], fx=.5, fy=.5)

# ---------------- 5 · THE RULES
beat(5, "Regulators tried to fix this in one move. In October twenty twenty-four, the F T C finalised a click to cancel rule. Cancelling had to be as easy as signing up.",
     'doc', quote='The rule will require sellers to make it as easy for consumers to cancel their enrollment as it was to sign up.', mode='highlight',
     hl='as easy for consumers to cancel', title='FTC · Press release · 16 Oct 2024', clause='§ 5.1', src='ftc.gov · read 5 Nov 2026', photo='pen', style='memo')
beat(5, "It never took effect. On July eighth, twenty twenty-five, a federal appeals court threw it out, because the F T C skipped a required preliminary analysis. A procedure problem, not a verdict on the idea.",
     'doc', quote='The rule will require sellers to make it as easy for consumers to cancel their enrollment as it was to sign up.', mode='plain',
     title='FTC · Press release · 16 Oct 2024', clause='§ 5.1', src='8th Circuit, 8 Jul 2025 · via Arnall Golden Gregory', photo='pen', style='memo', stamp='VACATED')
beat(5, "So the action moved to states and cities. Since July twenty twenty-five, California requires a way to cancel through the same channel you signed up with, plus an annual reminder with the amount you're charged.",
     'list', head='California · since 1 Jul 2025', items=['Cancel through the same channel', 'Annual reminder with the amount', 'Applies to auto-renewals'], tag='STATE LAW')
beat(5, "And on October first, twenty twenty-six, New York City became the first city in the country with its own click to cancel rule.",
     'photo', photo='city', mode='panR', head=['New York City:', '*first city* to do it'], fx=.5, fy=.5)
beat(5, "Businesses there face fines starting at five hundred and twenty-five dollars per violation. The city also cites an outside estimate that the rule could save New Yorkers up to a hundred and sixty-two million dollars a year.",
     'counter', value=525, prefix='$', suffix='', parts=['minimum fine per violation', 'est. up to $162.5M a year saved*'], sum=False, label='NYC CLICK-TO-CANCEL · IN FORCE 1 OCT 2026',
     src='nyc.gov DCWP · 1 Oct 2026 · *Roosevelt Institute estimate', meter=('NYC FINE, FROM', '$525'))
beat(5, "None of this bans annual contracts. A discount for committing to a year can be a fair deal. The problem is not knowing you made the commitment.",
     'photo', photo='calendar', mode='push', head=['The discount is fine.', 'The *surprise* isn\'t.'], note='→ next: what you can check today', pause=.5)

# ---------------- 6 · BEFORE YOU CLICK SUBSCRIBE
beat(6, "So here's what you can check today, in under two minutes. One. When you see a monthly price, look for the word annual nearby. If it's there, you're probably signing a twelve-month contract.",
     'takeaway', n=1, head='Find the word "annual"', sub='next to the monthly price = a 12-month contract', photo='laptop')
beat(6, "Two. Open the terms and search for three phrases. Early termination. Cancellation fee. Remaining balance.",
     'takeaway', n=2, head='Search the terms for:', sub='"early termination" · "cancellation fee" · "remaining balance"', photo='keyboard')
beat(6, "Three. Do the math. Months left, times the monthly price, times the fee percentage. That's your exit price, before you're in.",
     'takeaway', n=3, head='Exit price =', sub='months left × monthly price × fee %', photo='calculator', formula=True)
beat(6, "Four. If there's a refund window, like Adobe's fourteen days, put a reminder in your calendar a couple of days before it closes.",
     'takeaway', n=4, head='Set a reminder', sub='2 days before the refund window closes', photo='calendar')
beat(6, "And five. When you cancel, screenshot the confirmation and keep the email. In New York City, complaints go to n y c dot gov, slash click to cancel.",
     'takeaway', n=5, head='Keep proof', sub='screenshot + email · NYC: nyc.gov/click-to-cancel', photo='pen0')
beat(6, "Terms change, so check the current version. Every document is linked in the description. This isn't legal or financial advice.",
     'headline', head=['Terms change.', 'Check the *current* version'], note='→ not legal or financial advice', clause='§ 6')

# ---------------- 7 · OUTRO
beat(7, "One click to join should mean a clear way out. When it doesn't, the fine print usually tells you what the exit costs. You just have to read it before you need it.",
     'headline', head=['Read the exit', '*before you need it*'], note='→ recap: annual · fee · math · reminder · proof', clause='§ 7')
beat(7, "What's the most a subscription has ever charged you just to leave? Tell me in the comments, and tell me which app's terms we should read next.",
     'headline', head=['What did leaving', '*cost you*?'], note='→ comments: the next terms we read', clause='§ 7.1')
beat(7, "And if you want the next document read for you, subscribe to Hidden Layer.",
     'subscribe')

SECTION_NAMES = {1: 'The clause Adobe wrote', 2: 'Why the government sued', 3: 'Amazon\'s "Iliad" flow', 4: 'Why friction pays',
                 5: 'The rules are catching up', 6: 'Check this before you subscribe', 7: 'Recap'}
SECTION_ORDER = [1, 2, 3, 4, 5, 6, 7]
SECTION_PREFIX = ''
INTRO_CHAPTER = 'One click in, $315 out'
RECAP_TITLE = 'Recap'
SERIES = 'THE FINE PRINT'
EPISODE = 'EP. 03'
TOPIC = 'THE COST OF LEAVING'
PALETTE = 'paper'
THUMB = dict(big=['$315', 'to cancel'], hl='cancel', redact='"monthly" plan')
