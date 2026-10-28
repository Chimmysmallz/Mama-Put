/* Mama Put: Buka Rush  (v3)
   A Cooking Fever style time-management game set in a Nigerian buka.
   Plain JavaScript, no libraries, no build step. Open index.html to play.

   Where to change things:
     js/levels.js    the 50 days, the story chapters and how to add more days
     js/config.js    Google sign-in key for cloud saves
     FOOD / COST     selling prices and ingredient costs (below)
     SHOP            kitchen upgrades and their prices (below)
     POTS / RECIPES  the pot foods (jollof, white rice, stew, amala, ewedu) and Mama's cooking steps
     GEN_STEPS / WASH_STEPS / GAS_STEPS   the generator, washing and gas side stories
*/
(() => {
'use strict';

const W = 1600, H = 900, IMG = 'assets/img/';
const $ = s => document.querySelector(s);
const stage = $('#stage');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const naira = n => (n < 0 ? '−₦' : '₦') + Math.round(Math.abs(n)).toLocaleString('en-US');
const DATA = window.MAMAPUT_LEVELS || { LEVELS: [], CHAPTERS: {}, ENDING: [] };
const LEVELS = DATA.LEVELS, CHAPTERS = DATA.CHAPTERS;

/* =====================================================================
   MONEY
   ===================================================================== */
// Selling price of one portion (naira)
const FOOD = {
  jollof:    { n: 'Jollof rice',   p: 500, img: 'jollof-scoop.png' },
  whiterice: { n: 'White rice',    p: 500, img: 'whiterice-scoop.png' },
  stew:      { n: 'Stew',          p: 200, img: 'stew-portion.png' },
  amala:     { n: 'Amala',         p: 300, img: 'amala-wrap.png' },
  ewedu:     { n: 'Ewedu',         p: 200, img: 'ewedu-portion.png' },
  meat:      { n: 'Beef',          p: 500, img: 'meat-piece.png' },
  dodo:      { n: 'Dodo',          p: 200, img: 'dodo.png' },
  akara:     { n: 'Akara',         p: 300, img: 'akara.png' },
  egg:       { n: 'Egg',           p: 500, img: 'egg-piece.png' },
  fish:      { n: 'Fried fish',    p: 500, img: 'fish-piece.png' },
  ponmo:     { n: 'Ponmo',         p: 500, img: 'ponmo-piece.png' },
  zobo:      { n: 'Zobo (bottle)', p: 700, img: 'zobo.png' },
};
// What Mama pays for ingredients and supplies (naira)
const COST = {
  jollof: 250, whiterice: 150, stew: 100, amala: 120, ewedu: 80,   // ingredients per portion (a pot costs this x its portions)
  meat: 300, egg: 200, fish: 300, ponmo: 250,   // sides, per piece
  dodo: 100,       // plantain per portion
  akara: 150,      // beans, pepper, onion and oil per portion
  zobo: 300,       // per bottle
  fuel: 3900,      // 3 litres of petrol for the generator at ₦1,300 per litre
  soap: 500,       // dish soap
  gas: 16000,      // 12.5kg cooking gas refill
};
// Food cooked in big pots. A pot lasts several days; leftovers carry over to the next day.
const POTS = {
  jollof:    { cap: 120, img: 'jollof-pot.png',    lbl: 'Jollof' },
  whiterice: { cap: 120, img: 'pot-whiterice.png', lbl: 'White rice' },
  stew:      { cap: 160, img: 'pot-stew.png',      lbl: 'Stew' },
  amala:     { cap: 80, img: 'pot-amala.png',     lbl: 'Amala' },
  ewedu:     { cap: 120, img: 'pot-ewedu.png',     lbl: 'Ewedu' },
};
const POT_ORDER = ['jollof', 'whiterice', 'stew', 'amala', 'ewedu'];
const SIDES = ['meat', 'egg', 'fish', 'ponmo'];
const SIDE_BOWL = { meat: 'meat-bowl.png', egg: 'egg-bowl.png', fish: 'fish-bowl.png', ponmo: 'ponmo-bowl.png' };
const START_BALANCE = 30000;
const CREDIT = { stall: 60000, buka: 120000, bigbuka: 200000, interest: 0.10 };
const PRICE_LEVELS = [
  { n: 'Roadside prices', m: 1.0, pat: 1.0,  d: 'Normal prices. Customers are relaxed.' },
  { n: 'Buka prices',     m: 1.2, pat: 0.93, d: '+20% on every plate. Customers wait a little less.' },
  { n: 'Big buka prices', m: 1.4, pat: 0.86, d: '+40% on every plate. Customers are more demanding.' },
];
const EVENING_SHARE = 0.5;        // Mama keeps selling after your shift: +50% of your profit per star
const STAR = [1, 1.35, 1.7];
const RUSH = { time: 75, spawn: [2.0, 3.4], pat: 26, hearts: 3, unlockAfterDay: 3 };
const PEAK = { at: 0.5, length: 16, spawnMult: 0.45 };
const SPAWN_SPEED = 0.6;        // gap between new customers (lower = customers come faster)
const DIFF = { relaxed: { pat: 1.3, goal: 0.8, n: 'Relaxed' }, normal: { pat: 1, goal: 1, n: 'Normal' }, hard: { pat: 0.85, goal: 1.15, n: 'Hard' } };

const O = (f, d) => ({ f, d: !!d });
const ORDER_POOL = [
  O(['jollof']), O(['jollof', 'meat']), O(['jollof', 'meat'], 1), O(['jollof', 'dodo']),
  O(['jollof', 'meat', 'dodo']), O(['jollof', 'meat', 'dodo'], 1), O(['jollof', 'dodo'], 1), O(['jollof'], 1),
  O(['akara']), O(['akara'], 1), O(['akara', 'dodo']), O(['jollof', 'akara']), O([], 1),
  O(['whiterice', 'stew']), O(['whiterice', 'stew', 'meat']), O(['whiterice', 'stew', 'dodo']), O(['whiterice', 'stew', 'meat'], 1), O(['whiterice', 'stew', 'meat', 'dodo']),
  O(['amala', 'ewedu']), O(['amala', 'ewedu', 'meat']), O(['amala', 'ewedu', 'meat'], 1), O(['amala', 'ewedu'], 1),
];
const VENUE_BG = { stall: 'bg.jpg', buka: 'buka-bg.jpg', bigbuka: 'bigbuka-bg.jpg' };
const VENUE_NAME = { stall: '🏪 Roadside stall', buka: '🍽 Mama Put Buka', bigbuka: '🏛 Mama Put Big Buka' };

/* =====================================================================
   PEOPLE
   ===================================================================== */
const MALE_NAMES = ['Chidi', 'Emeka', 'Tunde', 'Kunle', 'Segun', 'Musa', 'Obinna', 'Femi', 'Ikenna', 'Yusuf', 'Dayo', 'Uche', 'Babatunde', 'Chukwuemeka'];
const FEMALE_NAMES = ['Amaka', 'Ngozi', 'Zainab', 'Adaeze', 'Ifeoma', 'Funke', 'Chioma', 'Aisha', 'Yetunde', 'Nkechi', 'Bisi', 'Halima', 'Folake', 'Ebere'];
const CUSTS = ['cust1.png', 'cust2.png', 'cust3.png', 'cust4.png', 'cust5.png', 'cust6.png'];
const GENDER = { 'cust1.png': 'm', 'cust2.png': 'f', 'cust3.png': 'm', 'cust4.png': 'f', 'cust5.png': 'f', 'cust6.png': 'm' };
const MOODS = {      // faces: [happy, impatient, angry]
  'cust1.png': ['cust1.png', 'cust1-wait.png', 'cust1-angry.png'],
  'cust2.png': ['cust2.png', 'cust2-wait.png', 'cust2-angry.png'],
  'cust3.png': ['cust3.png', 'cust3-wait.png', 'cust3-angry.png'],
  'cust4.png': ['cust4.png', 'cust4-wait.png', 'cust4-angry.png'],
  'cust5.png': ['cust5.png', 'cust5-wait.png', 'cust5-angry.png'],
  'cust6.png': ['cust6.png', 'cust6-wait.png', 'cust6-angry.png'],
  'critic.png': ['critic.png', 'critic-wait.png', 'critic-angry.png'],
};
const MOOD_EMOJI = ['😊', '😒', '😡'];
const HAPPY = ['Correct food! 👌', 'Mama, you too much! 🙌', 'I go come back tomorrow!', 'Chai! See better food!', 'Thank you Mama! 😋'];
const SWEET_JOLLOF = ['This jollof sweet die! 🤤', 'Party jollof! Chai! 🎉', 'Who cook this jollof? 😍'];
const ANGRY = ['Ah ah! I don wait tire! 😤', 'Mama, this one too slow o!', 'I go buy for road side! 😠', 'Na wa o! I dey go! 😡'];
const IMPATIENT = ['Mama, abeg hurry…', 'I get work o!', 'E don reach?', 'How far my food?'];
const HOT = ['This heat ehn! 🥵', 'No light again? 😩', 'Mama, on the gen abeg!'];
const CRITIC_HAPPY = ['Exceptional! Five stars! ⭐', 'Best buka in town! 🏆'];
const SWEET_FOOD = { whiterice: ['This rice and stew sweet o! 😋'], stew: ['This stew get correct taste! 🔥'], amala: ['Amala soft like cotton! 👌', 'No lump at all! Chai!'], ewedu: ['This ewedu draw well well! 🤤'] };
const WHO = {
  mama: { n: 'Mama', img: 'mama.png' }, tobi: { n: 'Tobi', img: 'tobi.png' },
  landlord: { n: 'Chief (landlord)', img: 'landlord.png' }, critic: { n: 'Oga Critic', img: 'critic.png' },
  iyabose: { n: 'Iya Bose (market)', img: 'cust4.png' }, bode: { n: 'Bode', img: 'cust6.png' }, ada: { n: 'Ada', img: 'cust5.png' },
  officer: { n: 'Council officer', img: 'cust3.png' }, ngozi: { n: 'Ngozi', img: 'helper-washer.png' }, chidi: { n: 'Chidi', img: 'cust1.png' },
};

const SHOP = [
  { k: 'potBig',   n: 'Big cooking pots',    d: 'Every pot you cook holds 50% more portions, so you cook less often.', c: 50000, img: 'jollof-pot.png' },
  { k: 'pan3',     n: 'Third frying pan',    d: 'Fry three things at the same time.', c: 15000, img: 'pan.png' },
  { k: 'fan',      n: 'Standing fan',        d: 'Customers stay cool and wait 25% longer.', c: 35000, img: 'cust2.png' },
  { k: 'fryFast',  n: 'Deep fryer',          d: 'Akara and dodo fry faster.', c: 60000, img: 'akara.png' },
  { k: 'stove',    n: 'Gas cooker',          d: 'Oil heats faster in the kitchen, and Mama\'s quick pot takes 4s instead of 8s.', c: 85000, img: 'cook-flame.png' },
  { k: 'cooler',   n: 'Zobo fridge',         d: 'Bottles fill twice as fast, plus a third bottle.', c: 90000, img: 'zobo.png' },
  { k: 'inverter', n: 'Inverter & batteries', d: 'When NEPA takes light, the inverter keeps the buka running. No more generator wahala!', c: 1200000, img: 'generator.png' },
];

/* =====================================================================
   SIDE STORIES
   ===================================================================== */
// Ingredients shown in the kitchen
const ING = {
  onion:       { n: 'Onion',          img: 'ing-onion.png' },
  vegoil:      { n: 'Vegetable oil',  img: 'ing-vegoil.png' },
  tomatopaste: { n: 'Tomato paste',   img: 'ing-tomatopaste.png' },
  pepper:      { n: 'Pepper blend',   img: 'ing-pepper.png' },
  seasoning:   { n: 'Seasoning',      img: 'ing-seasoning.png' },
  currythyme:  { n: 'Curry & thyme',  img: 'ing-curry-thyme.png' },
  bayleaf:     { n: 'Bay leaves',     img: 'ing-bayleaf.png' },
  stock:       { n: 'Stock',          img: 'ing-stock.png' },
  rice:        { n: 'Washed rice',    img: 'ing-rice.png' },
  water:       { n: 'Water',          img: 'ing-water.png' },
  salt:        { n: 'Salt',           img: 'ing-salt.png' },
  elubo:       { n: 'Yam flour',      img: 'ing-elubo.png' },
  iru:         { n: 'Iru',            img: 'ing-iru.png' },
  eweduleaves: { n: 'Ewedu leaves',   img: 'ing-ewedu-leaves.png' },
  egusi:       { n: 'Egusi',          img: 'ing-egusi.png' },
  beans:       { n: 'Beans',          img: 'ing-beans.png' },
};
const DECOY_MSG = {
  egusi: 'Egusi? That one is for egusi soup o!', beans: 'Beans? This is not ewa agoyin o!', elubo: 'Elubo is for amala!',
  rice: 'Rice? Ah ah, not for this pot!', iru: 'Iru belongs in ewedu, not here!', eweduleaves: 'Ewedu leaves? Wrong pot!',
  pepper: 'No pepper blend for this one!', tomatopaste: 'Tomato paste? Not for this pot!', onion: 'No onions for this one!',
};
const LIQ = {
  oil: 'radial-gradient(ellipse at 40% 35%,rgba(255,240,150,.95),rgba(214,160,20,.9))',
  water: 'radial-gradient(ellipse at 40% 35%,rgba(228,244,255,.95),rgba(120,170,220,.85))',
  red: 'radial-gradient(ellipse at 40% 35%,#e0482a,#9e1d0e)', stew: 'radial-gradient(ellipse at 40% 35%,#f05a2a,#b8260f)',
  fried: 'radial-gradient(ellipse at 40% 35%,#ffb347 0%,#e2471c 30%,#a51f0b)', orange: 'radial-gradient(ellipse at 40% 35%,#f4803a,#c2421b)',
  brown: 'radial-gradient(ellipse at 40% 35%,#9c7b62,#5e3f2c)', green: 'radial-gradient(ellipse at 40% 35%,#6fd05a,#2e7d1f)',
};
const TIMED = {
  heat:  { zone: [0.55, 0.9],  speed: 0.3,  label: 'Oil heat',      early: 'The oil is not hot yet! Soggy onions…', late: 'The oil was smoking!', finish: false },
  boil:  { zone: [0.55, 0.9],  speed: 0.32, label: 'Water boiling', early: 'The water was not boiling yet!', late: 'Too much water boiled away!', finish: false },
  party: { zone: [0.55, 0.85], speed: 0.36, label: 'Smoky bottom',  early: 'Opened too early, rice still hard small.', late: 'Small burnt at the bottom…', finish: true, best: 'PARTY JOLLOF! 🎉' },
  soft:  { zone: [0.5, 0.85],  speed: 0.36, label: 'Rice softness', early: 'The rice is still hard!', late: 'The rice is too soft and mushy!', finish: true, best: 'Perfect rice! 🍚' },
};
/* Mama's recipes (the cooking side stories). Each step:
   tap: what to tap (an ingredient, 'board', 'knob', 'pot' or 'lid')   board: the ingredient goes on the chopping board
   count: taps needed (chopping, stirring)   stir: keep tapping or it burns   multi: several ingredients in any order
   timed: a meter fills; tap inside the green (see TIMED)   stage: how the pot looks after this step (see stages)
   stages: [fill level 0-1, liquid colour, chopped food 0-1, cooked food on top 0-1]                                  */
const RECIPES = {
  jollof: { n: 'Jollof rice', top: 'jollof-scoop.png', chop: 'ing-onion-diced.png',
    tiles: ['onion', 'vegoil', 'tomatopaste', 'pepper', 'seasoning', 'currythyme', 'bayleaf', 'stock', 'rice', 'egusi', 'beans', 'elubo'],
    stages: { oil: [.05, 'oil', 0, 0], onion: [.1, 'oil', 1, 0], paste: [.2, 'red', .6, 0], stew: [.35, 'stew', .4, 0], fried: [.35, 'fried', .2, 0], stock: [.6, 'orange', .1, 0], rice: [.8, 'orange', 0, .7], done: [.9, 'orange', 0, 1] },
    steps: [
      { tap: 'onion', board: true, say: 'First, the prep. Tap the onion to put it on the chopping board.' },
      { tap: 'board', count: 6, say: 'Chop chop! Tap the board to dice the onion.' },
      { tap: 'knob', say: 'Light the fire: tap the cooker knob.' },
      { tap: 'vegoil', stage: 'oil', say: 'Pour vegetable oil into the pot.' },
      { tap: 'board', timed: 'heat', stage: 'onion', say: 'Let the oil get hot. Add the onions when the meter is in the green!' },
      { tap: 'pot', count: 6, stir: true, say: 'Fry the onions until golden. Keep tapping the pot to stir!' },
      { tap: 'tomatopaste', stage: 'paste', say: 'Add the tomato paste.' },
      { tap: 'pepper', stage: 'stew', say: 'Now pour in the pepper and tomato blend.' },
      { tap: 'pot', count: 6, stir: true, stage: 'fried', say: 'Fry the stew well. Stir until the oil rises to the top!' },
      { multi: ['seasoning', 'currythyme', 'bayleaf'], say: 'Season it: seasoning cubes, curry & thyme, and bay leaves.' },
      { tap: 'stock', stage: 'stock', say: 'Pour in the stock.' },
      { tap: 'rice', stage: 'rice', say: 'Add the washed rice.' },
      { tap: 'lid', say: 'Cover the pot and let the rice cook.' },
      { tap: 'pot', timed: 'party', stage: 'done', say: 'Smell that smoky bottom? Open the pot in the green for PARTY JOLLOF!' },
    ] },
  whiterice: { n: 'White rice', top: 'whiterice-scoop.png',
    tiles: ['water', 'salt', 'rice', 'vegoil', 'pepper', 'tomatopaste', 'elubo', 'iru', 'beans'],
    stages: { water: [.45, 'water', 0, 0], rice: [.6, 'water', 0, .6], done: [.8, 'water', 0, 1] },
    steps: [
      { tap: 'knob', say: 'Light the fire: tap the cooker knob.' },
      { tap: 'water', stage: 'water', say: 'Pour clean water into the pot.' },
      { tap: 'salt', timed: 'boil', say: 'Wait for the water to boil, then add a pinch of salt in the green!' },
      { tap: 'rice', stage: 'rice', say: 'Add the washed rice.' },
      { tap: 'pot', count: 4, stir: true, say: 'Stir so the rice does not stick to the pot.' },
      { tap: 'lid', say: 'Cover the pot and let it cook.' },
      { tap: 'pot', timed: 'soft', stage: 'done', say: 'Open the pot when the rice is soft, in the green!' },
    ] },
  stew: { n: 'Stew', chop: 'ing-onion-diced.png',
    tiles: ['onion', 'vegoil', 'pepper', 'tomatopaste', 'seasoning', 'currythyme', 'salt', 'stock', 'rice', 'elubo', 'eweduleaves', 'beans'],
    stages: { oil: [.05, 'oil', 0, 0], onion: [.1, 'oil', 1, 0], stew: [.4, 'stew', .5, 0], paste: [.45, 'red', .4, 0], fried: [.45, 'fried', .2, 0], done: [.55, 'stew', .1, 0] },
    steps: [
      { tap: 'onion', board: true, say: 'Stew time! Put the onion on the chopping board.' },
      { tap: 'board', count: 6, say: 'Chop the onion.' },
      { tap: 'knob', say: 'Light the fire: tap the cooker knob.' },
      { tap: 'vegoil', stage: 'oil', say: 'Pour in the vegetable oil.' },
      { tap: 'board', timed: 'heat', stage: 'onion', say: 'When the oil is hot, add the onions in the green!' },
      { tap: 'pepper', stage: 'stew', say: 'Pour in the pepper and tomato blend.' },
      { tap: 'tomatopaste', stage: 'paste', say: 'Add the tomato paste.' },
      { tap: 'pot', count: 6, stir: true, stage: 'fried', say: 'Fry the stew! Keep stirring until the oil floats on top.' },
      { multi: ['seasoning', 'currythyme', 'salt'], say: 'Season it: seasoning cubes, curry & thyme, and salt.' },
      { tap: 'stock', say: 'Add the beef stock.' },
      { tap: 'pot', count: 5, stir: true, stage: 'done', say: 'Let it simmer. Stir gently until it is thick and sweet.' },
    ] },
  amala: { n: 'Amala', top: 'amala-wrap.png',
    tiles: ['water', 'elubo', 'rice', 'salt', 'pepper', 'beans', 'onion', 'vegoil'],
    stages: { water: [.45, 'water', 0, 0], mix: [.5, 'brown', 0, 0], amala: [.55, 'brown', 0, .6], done: [.6, 'brown', 0, 1] },
    steps: [
      { tap: 'knob', say: 'Light the fire: tap the cooker knob.' },
      { tap: 'water', stage: 'water', say: 'Pour water into the pot.' },
      { tap: 'elubo', timed: 'boil', stage: 'mix', say: 'When the water boils, pour in the yam flour (elubo) in the green!' },
      { tap: 'pot', count: 10, stir: true, stage: 'amala', say: 'Turn the amala hard with the omorogun! Keep tapping so there are no lumps.' },
      { tap: 'water', say: 'Add a little hot water.' },
      { tap: 'lid', say: 'Cover the pot and let it steam.' },
      { tap: 'pot', count: 5, stir: true, stage: 'done', say: 'Final turn until it is smooth and stretchy!' },
    ] },
  ewedu: { n: 'Ewedu', chop: 'ing-ewedu-chopped.png',
    tiles: ['eweduleaves', 'water', 'iru', 'seasoning', 'salt', 'pepper', 'tomatopaste', 'rice', 'egusi'],
    stages: { water: [.45, 'water', 0, 0], greens: [.5, 'water', 1, 0], ewedu: [.55, 'green', .3, 0], done: [.55, 'green', .1, 0] },
    steps: [
      { tap: 'eweduleaves', board: true, say: 'Pick the fresh ewedu leaves and put them on the board.' },
      { tap: 'board', count: 6, say: 'Chop the leaves finely.' },
      { tap: 'knob', say: 'Light the fire: tap the cooker knob.' },
      { tap: 'water', stage: 'water', say: 'Pour a little water into the pot.' },
      { tap: 'board', timed: 'boil', stage: 'greens', say: 'When the water boils, add the chopped leaves in the green!' },
      { tap: 'pot', count: 8, stir: true, stage: 'ewedu', say: 'Whisk with the ijabe broom until it is smooth and drawy!' },
      { multi: ['iru', 'seasoning', 'salt'], stage: 'done', say: 'Add iru, seasoning and salt.' },
    ] },
};
const COOK_STORY = {
  jollof: [['mama', 'Ehen! The jollof don finish. Come, come to the kitchen.'], ['mama', 'Today I will teach you my secret jollof recipe. My own mother taught me this one.'], ['mama', 'One big pot lasts us many days. Follow my steps well. Wrong ingredient or burnt pot, the customers will taste it!']],
  whiterice: [['mama', 'Now that we have a real buka, people want white rice and stew.'], ['mama', 'White rice is simple, but do not let it burn or turn to pap. Come, I will show you.']],
  stew: [['mama', 'A buka is only as good as its stew. Everybody judges you by your stew!'], ['mama', 'We fry it well, well, until the oil floats on top. Let us cook a big pot.']],
  amala: [['mama', 'Customers have been asking: Mama, where is amala?'], ['mama', 'Turning amala needs strong arms. Keep turning so there are no lumps. Come!']],
  ewedu: [['mama', 'Amala without ewedu is like a car without tyres!'], ['mama', 'We chop the leaves fine, boil them small, and whisk with the ijabe until it draws. Let me show you.']],
};
const DISH_INTRO = {
  whiterice: [['mama', 'From today our menu grows! White rice and stew, just like a proper buka.'], ['mama', 'Customers will order white rice with stew, sometimes beef and dodo. The pots are empty, so we cook first.']],
  amala: [['tobi', 'Mama, everybody on my street is asking for amala and ewedu!'], ['mama', 'Then we will sell it! Amala and ewedu join the menu today. Get ready to cook both pots.']],
};
// NEPA takes light: start the generator
const GEN_STEPS = [
  { tap: 'cap', say: 'NEPA has taken light! First, open the fuel tank cap.' },
  { tap: 'can', count: 4, cost: 'fuel', say: 'Pour petrol from the jerrycan. Tap until the tank is full.' },
  { tap: 'cap', say: 'Close the tank cap tight.' },
  { tap: 'valve', say: 'Turn the fuel tap ON so petrol can reach the engine.' },
  { tap: 'switch', say: 'Flip the engine switch to ON.' },
  { tap: 'rope', timed: { speed: 0.6, zone: [0.62, 0.86], label: 'Pull strength' }, say: 'Pull the starter rope! Tap when the meter is in the green.' },
];
// The gas has finished: change the cylinder
const GAS_STEPS = [
  { tap: 'valve', say: 'The gas has finished! First, close the valve on the empty cylinder.' },
  { tap: 'reg', count: 3, say: 'Unscrew the regulator. Turn, turn, turn.' },
  { tap: 'old', cost: 'gas', say: 'Roll the empty cylinder away and bring the new one (refill ₦16,000).' },
  { tap: 'reg', count: 3, say: 'Screw the regulator tight onto the new cylinder.' },
  { tap: 'valve', say: 'Open the valve.' },
  { tap: 'soap', say: 'Safety first! Rub soapy water on the joint to check for leaks.' },
  { tap: 'knob', say: 'Now light the cooker. Tap the knob.' },
];
// The plates are finished: wash them
const WASH_STEPS = [
  { tap: 'tap', say: 'No clean plates! Open the tap to fill the sink with water.' },
  { tap: 'soap', cost: 'soap', say: 'Add some dish soap.' },
  { tap: 'stain', count: 0, say: 'Scrub! Tap every dirty spot on the plates.' },
  { tap: 'tap', count: 0, say: 'Rinse each plate under the tap. They go to the rack to dry.' },
];

/* =====================================================================
   SAVE DATA
   ===================================================================== */
const SKEY = 'mamaput.save.v3';
const defaultSettings = () => ({ sfx: 0.8, music: 0.4, amb: 0.5, conductor: true, playerName: '', vibrate: true, hints: 'auto', difficulty: 'normal', autoCash: false, showPrices: true, google: false });
const fresh = () => ({
  v: 3, unlocked: 1, stars: {}, best: {}, wallet: START_BALANCE, up: {}, seenCh: {}, bills: [], paid: {}, debt: 0,
  priceLvl: 0, priceMax: 0, rushBest: 0, ending: false, settings: defaultSettings(),
  stock: { jollof: { n: 80, q: 0.8 } }, cookStory: {}, introduced: {}, flags: {}, owed: [],
  decor: { owned: {}, on: {} }, helpers: {}, daily: { last: '', streak: 0 }, ach: {}, rushHistory: [],
  stats: { served: 0, days: 0 }, savedAt: 0,
});
let save = load();
function normalise(s) {
  const f = fresh(), o = Object.assign(f, s || {});
  o.settings = Object.assign(defaultSettings(), (s && s.settings) || {});
  o.stats = Object.assign({ served: 0, days: 0 }, o.stats || {});
  ['stock', 'cookStory', 'introduced', 'flags', 'paid', 'seenCh', 'stars', 'up', 'helpers', 'ach'].forEach(k => { if (!o[k] || typeof o[k] !== 'object') o[k] = {}; });
  ['owed', 'bills', 'rushHistory'].forEach(k => { if (!Array.isArray(o[k])) o[k] = []; });
  if (!o.decor || !o.decor.owned) o.decor = { owned: {}, on: {} };
  if (!o.daily) o.daily = { last: '', streak: 0 };
  return o;
}
function load() { try { return normalise(JSON.parse(localStorage.getItem(SKEY) || 'null')); } catch (e) { return fresh(); } }
function persist() { save.savedAt = Date.now(); try { localStorage.setItem(SKEY, JSON.stringify(save)); } catch (e) { /* private mode */ } }
const S = () => save.settings;

/* =====================================================================
   SOUND AND MUSIC (generated, no audio files needed)
   ===================================================================== */
let ac = null;
function audio() {
  if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } }
  if (ac && ac.state === 'suspended') ac.resume();
  return ac;
}
function tone(f, d, type = 'sine', v = 0.15, when = 0, slide = 0, dest = null, at = null) {
  const a = audio(); if (!a) return;
  const vol = dest ? v : v * S().sfx; if (vol <= 0) return;
  const t = at !== null ? at : a.currentTime + when, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + d);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.connect(g); g.connect(dest || a.destination); o.start(t); o.stop(t + d + 0.05);
}
function noise(d, v = 0.06, hp = 2500, dest = null, at = null) {
  const a = audio(); if (!a) return;
  const vol = dest ? v : v * S().sfx; if (vol <= 0) return;
  const len = Math.max(1, Math.floor(a.sampleRate * d)), b = a.createBuffer(1, len, a.sampleRate), c = b.getChannelData(0);
  for (let i = 0; i < len; i++) c[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
  s.buffer = b; f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(dest || a.destination); s.start(at !== null ? at : a.currentTime);
}
const SFX = {
  tap:    () => tone(620, 0.07, 'triangle', 0.12),
  ding:   () => { tone(880, 0.15, 'sine', 0.14); tone(1320, 0.25, 'sine', 0.1, 0.08); },
  till:   () => { tone(1568, 0.06, 'square', 0.05); tone(2093, 0.25, 'square', 0.05, 0.06); noise(0.08, 0.05, 4000); },
  sizzle: () => noise(0.6, 0.05, 3000),
  chop:   () => { noise(0.05, 0.12, 1500); tone(300, 0.05, 'square', 0.04); },
  scrub:  () => noise(0.18, 0.08, 1200),
  splash: () => noise(0.5, 0.06, 600),
  bad:    () => tone(170, 0.3, 'sawtooth', 0.08, 0, -60),
  grumble:() => tone(140, 0.25, 'sawtooth', 0.05, 0, 30),
  serve:  () => { tone(523, 0.1, 'triangle', 0.12); tone(659, 0.1, 'triangle', 0.12, 0.08); tone(784, 0.22, 'triangle', 0.12, 0.16); },
  star:   () => tone(1046, 0.35, 'sine', 0.14),
  rush:   () => { [0, .12, .24, .36].forEach((w, k) => tone(440 + k * 110, 0.12, 'square', 0.06, w)); },
  powerOff: () => tone(300, 0.6, 'sawtooth', 0.08, 0, -250),
  sputter:() => { for (let k = 0; k < 4; k++) { tone(70, 0.08, 'square', 0.1, k * 0.12); noise(0.06, 0.08, 400); } },
  engine: () => { for (let k = 0; k < 10; k++) tone(55 + (k % 2) * 6, 0.09, 'square', 0.07, k * 0.08); },
};
// Afrobeat-style background loop
const MUS = { timer: null, step: 0, next: 0, gain: null };
const BASS = [110, 110, 130.8, 146.8, 98, 98, 130.8, 110];
const LEAD = [440, 523.3, 587.3, 659.3, 783.99, 659.3, 587.3, 523.3];
function musicStart() {
  const a = audio();
  if (!a || MUS.timer || !(S().music > 0) || document.hidden) return;
  MUS.gain = a.createGain(); MUS.gain.gain.value = S().music * 0.35; MUS.gain.connect(a.destination);
  MUS.next = a.currentTime + 0.1; MUS.step = 0;
  MUS.timer = setInterval(musicTick, 30);
}
function musicStop() { if (MUS.timer) { clearInterval(MUS.timer); MUS.timer = null; } if (MUS.gain) { try { MUS.gain.disconnect(); } catch (e) { /* ignore */ } MUS.gain = null; } }
function musicVolume() { if (MUS.gain) MUS.gain.gain.value = S().music * 0.35; if (!(S().music > 0)) musicStop(); else musicStart(); }
function musicTick() {
  const a = ac; if (!a || !MUS.gain) return;
  const sixteenth = 60 / 108 / 4;
  while (MUS.next < a.currentTime + 0.15) {
    const s = MUS.step % 16, bar = Math.floor(MUS.step / 16) % 8, t = MUS.next, g = MUS.gain;
    if (s === 0 || s === 6 || s === 10) tone(60, 0.18, 'sine', 0.9, 0, -25, g, t);
    if (s === 4 || s === 12) noise(0.09, 0.35, 1800, g, t);
    noise(0.03, s % 2 ? 0.06 : 0.12, 7000, g, t);
    if (s === 0 || s === 3 || s === 8 || s === 11 || s === 14) tone(BASS[bar] * (s === 11 ? 1.5 : 1), 0.18, 'triangle', 0.5, 0, 0, g, t);
    if ([2, 5, 7, 10, 13, 15].includes(s)) tone(LEAD[(s + bar) % 8], 0.12, 'triangle', 0.16, 0, 0, g, t);
    MUS.next += sixteenth; MUS.step = (MUS.step + 1) % 128;
  }
}
document.addEventListener('visibilitychange', () => { if (document.hidden) musicStop(); });

/* =====================================================================
   SMALL HELPERS
   ===================================================================== */
function mk(tag, cls, parent, css) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (css) Object.assign(e.style, css);
  if (parent) parent.appendChild(e);
  return e;
}
function box(o) { return { left: o.x + 'px', top: o.y + 'px', width: o.w + 'px', height: o.h + 'px' }; }
function center(o) { return { x: o.x + o.w / 2, y: o.y + o.h / 2 }; }
function elCenter(e) { return { x: parseFloat(e.style.left) + parseFloat(e.style.width) / 2, y: parseFloat(e.style.top) + parseFloat(e.style.height) / 2 }; }
function onTap(e, fn) {
  e.addEventListener('pointerdown', ev => {
    ev.preventDefault(); ev.stopPropagation(); audio(); musicStart();
    if (S().vibrate && navigator.vibrate) { try { navigator.vibrate(10); } catch (x) { /* ignore */ } }
    if (G) G.idle = 0; fn(ev);
  });
}
let rotateOk = false;
function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `translate(-50%,-50%) scale(${s})`;
  $('#rotate').classList.toggle('show', innerHeight > innerWidth * 1.05 && !rotateOk);
}
addEventListener('resize', fit);
addEventListener('orientationchange', () => setTimeout(fit, 200));
const fx = $('#fx');
function floatText(x, y, text, color = '#fff', size = 40, layer = fx) {
  const e = mk('div', 'float', layer, { left: x + 'px', top: y + 'px', color, fontSize: size + 'px', zIndex: 9 });
  e.textContent = text;
  const an = e.animate ? e.animate([{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-90%) scale(1.1)', opacity: 1, offset: .2 }, { transform: 'translate(-50%,-260%) scale(1)', opacity: 0 }], { duration: 1400, easing: 'ease-out' }) : null;
  if (an) an.onfinish = () => e.remove(); else setTimeout(() => e.remove(), 1400);
}
function fly(img, from, to, size = 110, layer = fx, done) {
  const e = mk('img', 'flyer', layer, { width: size + 'px', height: size + 'px', zIndex: 8 });
  e.src = IMG + img;
  const a = `translate(${from.x - size / 2}px,${from.y - size / 2}px)`, b = `translate(${to.x - size / 2}px,${to.y - size / 2}px) scale(.55)`;
  const fin = () => { e.remove(); if (done) done(); };
  const an = e.animate ? e.animate([{ transform: a }, { transform: b }], { duration: 400, easing: 'cubic-bezier(.5,0,.6,1)' }) : null;
  if (an) an.onfinish = fin; else setTimeout(fin, 400);
}
function shake(e) { if (e && e.animate) e.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-12px)' }, { transform: 'translateX(12px)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(0)' }], { duration: 320 }); }
let toastT = 0, lastToast = '';
function toast(t) {
  const e = $('#toast');
  if (t === lastToast && e.classList.contains('show')) return;
  lastToast = t; e.textContent = t; e.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('show'), 1900);
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* =====================================================================
   LEVEL AND MONEY HELPERS
   ===================================================================== */
let G = null;                              // the shift being played
const SLOTS = [330, 640, 950, 1260];       // customer positions (centre x)
const REG = { x: 1402, y: 732, w: 186, h: 160 };

function levelById(id) {
  if (id === 'rush') {
    const v = venueReached();
    const lv = LEVELS[Math.min(LEVELS.length, save.unlocked) - 1];
    return { name: 'Rush Hour', venue: v, menu: lv ? lv.menu : ['jollof', 'meat'], goal: Math.max(20000, save.rushBest), time: RUSH.time, max: 4, spawn: RUSH.spawn, pat: RUSH.pat, critic: true };
  }
  return LEVELS[id];
}
function venueReached() { const L = LEVELS[Math.min(LEVELS.length, save.unlocked) - 1]; return L ? L.venue : 'stall'; }
function chapterDay(ch) { return LEVELS.findIndex(L => L.chapter === ch); }
function costMult() { let m = 1; Object.keys(save.seenCh).forEach(ch => { const c = CHAPTERS[ch]; if (c && c.costUp) m += c.costUp; }); return m; }
function creditLimit() { return CREDIT[venueReached()] || CREDIT.stall; }
function priceMult() { return PRICE_LEVELS[save.priceLvl].m; }
function itemPrice(k) { return Math.round(FOOD[k].p * priceMult() / 50) * 50; }
function orderPrice(o) { return o.f.reduce((s, x) => s + itemPrice(x), 0) + (o.d ? itemPrice('zobo') : 0); }
function balance() { return save.wallet + (G ? G.sales + G.tips - G.cashCost : 0); }
function billDue() { return save.bills.filter(b => !save.paid[b.id]); }
function lockedByBill(i) { return billDue().find(b => i + 1 >= b.dueBefore); }
function fuelCost() {   // fuel scarcity (Chapter 20): black-market petrol at ₦1,800 per litre for a while
  const d = G && typeof G.id === 'number' ? G.id + 1 : save.unlocked;
  return save.flags.scarcity && d >= 57 && d < 66 ? 5400 : COST.fuel;
}
function potCap(k) { return Math.round(POTS[k].cap * (save.up.potBig ? 1.5 : 1)); }
function stockOf(k) { return save.stock[k] || (save.stock[k] = { n: 0, q: 0.8 }); }

/* Pay for something. opts: { cat, label, at, retry, profit }.
   profit:false = buying a whole pot of ingredients (comes out of the account now; each portion counts as cost when it is served). */
function spend(base, opts) {
  if (!G) return true;
  const cat = opts.cat || 'food', scaled = cat === 'fuel' || cat === 'supplies' || cat === 'gas' ? 1 : costMult();
  const amt = Math.round(base * scaled / 10) * 10, pos = opts.at || { x: 800, y: 420 };
  const book = () => { if (opts.profit !== false) { G.pcost += amt; G.exp[cat] = (G.exp[cat] || 0) + amt; } else if (cat === 'gas') G.gasBuy += amt; else G.potBuy += amt; };
  const layer = G.kitchen ? $('#kScene') : fx;
  if (balance() >= amt) { G.cashCost += amt; book(); floatText(pos.x, pos.y - 40, '−' + naira(amt), '#ff9a8a', 28, layer); return true; }
  const room = creditLimit() - save.debt;
  if (room >= amt && G.creditOK) {
    save.debt += Math.round(amt * (1 + CREDIT.interest)); G.creditTaken += amt; book();
    floatText(pos.x, pos.y - 40, '📒 ' + naira(amt) + ' on credit', '#ffd27a', 26, layer);
    return true;
  }
  if (room >= amt) { creditPrompt(amt, opts.label, opts.retry); return false; }
  SFX.bad(); toast(`No money for ${opts.label}, and Iya Bose's credit limit is full! Collect cash or repay first.`);
  return false;
}
function creditPrompt(amt, label, retry) {
  G.paused = true;
  modal(`
    <div class="who"><img src="${IMG}mama.png" alt=""><div>
      <h2>Money is short!</h2>
      <p>${esc(label)} costs <b>${naira(amt)}</b>, but the buka account has only <b>${naira(balance())}</b>.</p>
    </div></div>
    <p class="note">Iya Bose at the market can give us the ingredients on credit. We pay her back later with 10% extra (${naira(amt * (1 + CREDIT.interest))}) from future sales.<br>Credit owed now: ${naira(save.debt)} of ${naira(creditLimit())}</p>
    <div class="row"><button class="small" data-a="no">Not now</button><button class="big" data-a="yes">📒 Buy on credit</button></div>`,
    { no: () => { showScreen(null); G.paused = false; },
      yes: () => { G.creditOK = true; showScreen(null); G.paused = false; if (retry) retry(); } });
}

/* =====================================================================
   START A SHIFT
   ===================================================================== */
function startLevel(id) {
  const rush = id === 'rush', L = levelById(id); if (!L) return;
  const up = save.up, df = DIFF[S().difficulty] || DIFF.normal;
  G = {
    id, L, mode: rush ? 'rush' : 'day', time: L.time, clock: 0, wallet0: save.wallet,
    sales: 0, tips: 0, cashCost: 0, pcost: 0, potBuy: 0, gasBuy: 0, creditTaken: 0, exp: {}, cooked: [],
    served: 0, lost: 0, combo: 0, lastServe: -99, spawnT: 1.0, running: true, paused: false, idle: 0, hintT: 0, critics: 0,
    hearts: RUSH.hearts, custs: [], cash: [], kitchen: null, peak: null, power: true, gas: true, repaidOwed: 0, washPending: false, creditOK: S().autoCredit === true,
    goal: rush ? L.goal : Math.round(L.goal * df.goal / 100) * 100,
    peakAt: (!rush && L.rush) ? L.time * PEAK.at + rand(-6, 6) : -1,
    events: (L.events || []).map(t => ({ t, at: L.time * ({ power: rand(0.22, 0.4), gas: rand(0.3, 0.5), wash: rand(0.5, 0.66) }[t] || rand(0.3, 0.7)), done: false })),
    pots: {}, pans: [], cups: [], plates: [], sources: {}, sides: {}, jug: null, reg: null, till: 0,
    fryTime: up.fryFast ? 2.8 : 4.2, burnAfter: 5.5, fillTime: up.cooler ? 1.2 : 2.5, quickTime: up.stove ? 4 : 8,
    patMult: df.pat * PRICE_LEVELS[save.priceLvl].pat * (L.venue !== 'stall' ? 1.15 : 1) * (1 + (save.flags.ngozi ? 0.08 : 0) + (save.flags.loyal ? 0.08 : 0)),
  };
  if (rush) G.peakAt = 0.5;
  G.spawnT = 0.4;   // the first customer arrives straight away
  const v = L.venue || 'stall';
  $('#bg').src = IMG + (VENUE_BG[v] || 'bg.jpg');
  $('#play').className = 'venue-' + v;
  buildStations();
  $('#custLayer').innerHTML = ''; fx.innerHTML = '';
  if (v !== 'stall') SLOTS.forEach(x => { const t = mk('img', 'table', $('#custLayer'), { left: (x - 135) + 'px' }); t.src = IMG + 'table.png'; });
  G.patMult *= 1 + comfort();
  renderDecor(v); renderHelperBar(); mamaCreate(); ambienceStart(v);
  $('#hudLevel').textContent = rush ? '🔥 Rush' : 'Day ' + (id + 1);
  $('#hudHearts').style.display = rush ? 'flex' : 'none';
  const top = G.goal * STAR[2];
  [1, 2, 3].forEach(n => {
    const el = $('#st' + n);
    el.style.display = rush ? 'none' : '';
    el.style.left = (G.goal * STAR[n - 1] / top * 100) + '%'; el.classList.remove('on');
  });
  ['#rushBanner', '#dark', '#genBtn'].forEach(s => $(s).classList.remove('show'));
  closeKitchen();
  showScreen(null);
  render();
}
const has = item => G.L.menu.includes(item);

/* ---------------- the counter ---------------- */
function station(root, o, img, label, cls) {
  const e = mk('div', 'st ' + (cls || ''), root, box(o));
  mk('img', 'main', e).src = IMG + img;
  if (label) { o.lbl = mk('div', 'lbl', e); o.lbl.textContent = label; }
  o.el = e; return e;
}
function buildStations() {
  const root = $('#stations'); root.innerHTML = '';
  // pots (top left)
  POT_ORDER.filter(has).forEach((k, n) => {
    const p = G.pots[k] = { k, x: 14 + n * 142, y: 446, w: 136, h: 136, quick: false, t: 0 };
    station(root, p, POTS[k].img, POTS[k].lbl, 'pot');
    p.badge = mk('div', 'badge', p.el); p.ring = mk('div', 'ring', p.el);
    p.steam = mk('div', 'steam', p.el, { top: '6px' }); for (let j = 0; j < 3; j++) mk('i', '', p.steam);
    onTap(p.el, () => tapPot(k));
  });
  // frying pans and raw trays (under the pots)
  const fried = ['akara', 'dodo'].filter(has);
  if (fried.length) {
    const n = save.up.pan3 ? 3 : 2;
    for (let k = 0; k < n; k++) {
      const pn = { x: 14 + k * 134, y: 610, w: 132, h: 132, state: 'empty', item: null, t: 0 };
      station(root, pn, 'pan.png', null, 'pan');
      pn.ring = mk('div', 'ring', pn.el); pn.food = mk('img', 'food', pn.el);
      pn.smoke = mk('div', 'smoke', pn.el); for (let j = 0; j < 3; j++) mk('i', '', pn.smoke);
      onTap(pn.el, () => tapPan(pn)); G.pans.push(pn);
    }
    fried.forEach((item, k) => {
      const s = { x: 14 + n * 134 + 16 + k * 124, y: 624, w: 112, h: 112, item };
      station(root, s, FOOD[item].img, item === 'dodo' ? 'Plantain' : 'Akara batter', 'src');
      s.el.querySelector('img.main').style.filter = rawFilter(item, 0);
      onTap(s.el, () => tapSource(item)); G.sources[item] = s;
    });
  }
  // plates (middle)
  for (let k = 0; k < 3; k++) {
    const pl = { x: 736 + k * 156, y: 556, w: 152, h: 144, items: [], q: [], ver: -1, v: 0, dirty: false };
    station(root, pl, 'plate.png', null, 'plate');
    const sl = mk('div', 'stainLayer', pl.el);
    [[22, 25, 34], [52, 48, 30], [30, 58, 22]].forEach(([x, y, z]) => mk('div', 'stain', sl, { left: x + '%', top: y + '%', width: z + '%', height: z + '%' }));
    pl.itemsEl = mk('div', 'items', pl.el);
    const x = mk('div', 'x', pl.el); x.textContent = '✕';
    onTap(x, () => { pl.items = []; pl.q = []; pl.v++; SFX.bad(); toast('Plate cleared. That food is wasted.'); });
    onTap(pl.el, () => tapPlate(pl)); G.plates.push(pl);
  }
  // side bowls (beef, egg, fish, ponmo) in a 2 x 2 block
  SIDES.filter(has).forEach((k, n) => {
    const s = { k, x: 1212 + (n % 2) * 106, y: 448 + Math.floor(n / 2) * 118, w: 102, h: 100 };
    station(root, s, SIDE_BOWL[k], FOOD[k].n, 'side');
    onTap(s.el, () => tapSide(k)); G.sides[k] = s;
  });
  // zobo
  if (has('zobo')) {
    const j = { x: 1440, y: 446, w: 110, h: 130 };
    station(root, j, 'zobo.png', 'Zobo');
    onTap(j.el, tapJug); G.jug = j;
    const n = save.up.cooler ? 3 : 2;
    for (let k = 0; k < n; k++) {
      const c = { x: 1432 + k * (n === 3 ? 54 : 74), y: 600, w: n === 3 ? 56 : 70, h: 88, state: 'empty', t: 0 };
      const ce = station(root, c, 'zobo.png', null, 'cup empty');
      c.fill = mk('div', 'fill', ce); mk('img', '', c.fill).src = IMG + 'zobo.png';
      onTap(ce, () => tapCup(c)); G.cups.push(c);
    }
  }
  const r = Object.assign({}, REG); station(root, r, 'register.png', null, 'register');
  r.till = mk('div', 'till', r.el); r.till.textContent = naira(0);
  onTap(r.el, () => { if (G.cash.length) G.cash.slice().forEach(collect); else toast('Tap the naira notes on the counter to put them in the till'); });
  G.reg = r;
}
function rawFilter(item, p) {
  const sat = 0.3 + 0.7 * p, br = 1.4 - 0.4 * p;
  return `saturate(${sat}) brightness(${br})` + (item === 'akara' ? ` sepia(${0.3 * (1 - p)})` : '');
}

/* ---------------- plates ---------------- */
const waiting = () => G.custs.filter(c => c.state === 'wait');
const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));
function routePlate(item) {
  const plates = G.plates.filter(p => !p.dirty);
  const sets = waiting().filter(c => !c.sf && c.order.f.length).map(c => c.order.f);
  const complete = p => sets.some(s => sameSet(s, p.items));
  const cand = plates.filter(p => p.items.length && !p.items.includes(item) && sets.some(s => s.includes(item) && p.items.every(x => s.includes(x))));
  cand.sort((a, b) => (complete(a) - complete(b)) || (b.items.length - a.items.length));
  const empty = plates.find(p => !p.items.length);
  if (cand.length && (!complete(cand[0]) || !empty)) return cand[0];
  if (empty || cand[0]) return empty || cand[0];
  // No plate matches a waiting order: still let the player add it to any plate that does not have it yet
  // (the plate built most recently first), so food can be prepared ahead of the next customer.
  const any = plates.filter(p => !p.items.includes(item) && p.items.length < 4).sort((a, b) => (b.t || 0) - (a.t || 0));
  return any[0] || null;
}
function addItem(pl, item, from, q) { pl.t = Date.now(); pl.items.push(item); if (q !== undefined) pl.q.push(q); pl.v++; fly(FOOD[item].img, from, center(pl), 90); SFX.tap(); }
function noPlate() {
  SFX.bad();
  if (G.plates.some(p => p.dirty)) toast('No clean plates! Tap a dirty plate to go and wash them.');
  else toast('Every plate already has that, or is full. Serve a plate or clear one with ✕');
  G.plates.forEach(p => shake(p.el));
}

/* ---------------- taps on the counter ---------------- */
function tapPot(k) {
  const p = G.pots[k], st = stockOf(k);
  if (p.quick) { toast(`Mama is cooking a fresh pot of ${RECIPES[k].n.toLowerCase()}…`); return; }
  if (st.n <= 0) { openKitchen(k); return; }
  const pl = routePlate(k); if (!pl) return noPlate();
  st.n--; G.pcost += Math.round(COST[k] * costMult()); G.exp.food = (G.exp.food || 0) + Math.round(COST[k] * costMult());
  addItem(pl, k, center(p), st.q);
  if (st.n === 0) { toast(`The ${RECIPES[k].n.toLowerCase()} has finished! Tap the pot to cook more.`); SFX.bad(); }
}
function tapSide(k) {
  const s = G.sides[k], pl = routePlate(k); if (!pl) return noPlate();
  if (!spend(COST[k], { cat: 'food', label: FOOD[k].n, at: center(s), retry: () => tapSide(k) })) return;
  addItem(pl, k, center(s));
}
function tapSource(item) {
  if (G.gas === false) { SFX.bad(); toast('No gas! Change the gas cylinder before frying.'); return; }
  const pn = G.pans.find(p => p.state === 'empty');
  if (!pn) { SFX.bad(); toast('All the pans are busy!'); G.pans.forEach(p => shake(p.el)); return; }
  if (!spend(COST[item], { cat: 'food', label: item === 'dodo' ? 'Plantain' : 'Akara batter', at: center(G.sources[item]), retry: () => tapSource(item) })) return;
  pn.state = 'cook'; pn.item = item; pn.t = 0; SFX.sizzle();
  fly(FOOD[item].img, center(G.sources[item]), center(pn), 90);
}
function tapPan(pn) {
  if (pn.state === 'done') {
    const pl = routePlate(pn.item); if (!pl) return noPlate();
    addItem(pl, pn.item, center(pn)); pn.state = 'empty'; pn.item = null;
  } else if (pn.state === 'burnt') { pn.state = 'empty'; pn.item = null; SFX.bad(); toast('Burnt food thrown away. Money wasted 😖'); }
  else if (pn.state === 'cook') toast('Wait until it turns golden…');
  else toast('Tap the akara batter or plantain to start frying');
}
function tapJug() {
  if (!G.power) { SFX.bad(); toast('No light! The zobo fridge is off. Start the generator first.'); return; }
  const c = G.cups.find(k => k.state === 'empty');
  if (!c) { SFX.bad(); toast('All bottles are full. Serve them first!'); return; }
  if (!spend(COST.zobo, { cat: 'food', label: 'Zobo', at: center(G.jug), retry: tapJug })) return;
  c.state = 'fill'; c.t = 0; SFX.tap();
}
function tapCup(c) {
  if (c.state === 'fill') { toast('Still filling…'); return; }
  if (c.state === 'empty') { tapJug(); return; }
  const cu = waiting().filter(k => k.order.d && !k.sd).sort((a, b) => a.pat / a.patMax - b.pat / b.patMax)[0];
  if (!cu) { SFX.bad(); shake(c.el); toast('Nobody wants zobo right now'); return; }
  c.state = 'empty'; cu.sd = true; cu.v++;
  fly('zobo.png', center(c), { x: SLOTS[cu.slot], y: 120 }, 90); SFX.tap(); mamaWalkTo(SLOTS[cu.slot] - 160);
  checkDone(cu);
}
function tapPlate(pl) {
  if (pl.dirty) { openSide('wash'); return; }
  if (!pl.items.length) { toast('Empty plate. Dish some food first!'); return; }
  const cu = waiting().filter(k => !k.sf && k.order.f.length && sameSet(k.order.f, pl.items))
    .sort((a, b) => a.pat / a.patMax - b.pat / b.patMax)[0];
  if (!cu) { SFX.bad(); shake(pl.el); toast('Nobody ordered this plate. Check the orders!'); return; }
  const items = pl.items.slice(); cu.q = pl.q.slice(); cu.potFoods = items.filter(x => POTS[x]);
  pl.items = []; pl.q = []; pl.v++;
  if (G.washPending) { pl.dirty = true; pl.el.classList.add('dirty'); }
  cu.sf = true; cu.v++;
  items.forEach((it, k) => setTimeout(() => fly(FOOD[it].img, center(pl), { x: SLOTS[cu.slot], y: 120 }, 80), k * 60));
  SFX.tap(); mamaWalkTo(SLOTS[cu.slot] - 160); checkDone(cu);
}

/* ---------------- customers ---------------- */
function orderPool() {
  if (G.L.orders) return G.L.orders;
  const out = [];
  const bases = [['jollof'], ['whiterice', 'stew'], ['amala', 'ewedu'], ['akara']];
  bases.forEach(b => {
    if (!b.every(has)) return;
    [null].concat(SIDES).forEach(sd => {
      if (sd && !has(sd)) return;
      [false, true].forEach(dodo => {
        if (dodo && (!has('dodo') || b[0] === 'amala')) return;
        [false, true].forEach(dr => {
          if (dr && !has('zobo')) return;
          const f = b.concat(sd ? [sd] : [], dodo ? ['dodo'] : []);
          if (f.length > 4) return;
          out.push(O(f, dr));
        });
      });
    });
  });
  if (has('zobo')) out.push(O([], 1));
  return out.length ? out : [O(['jollof'])];
}
function spawnCustomer() {
  const used = G.custs.map(c => c.slot);
  const free = [0, 1, 2, 3].filter(s => !used.includes(s));
  if (!free.length) return;
  const slot = pick(free), L = G.L;
  let critic = false;
  if (L.critic === 'finale' && G.critics === 0 && G.clock > L.time * 0.3) critic = true;
  else if (L.critic && G.critics < 2 && Math.random() < 0.1) critic = true;
  const pool = orderPool();
  let order = critic ? pick(pool.slice().sort((a, b) => (b.f.length + b.d) - (a.f.length + a.d)).slice(0, 4)) : pick(pool);
  order = O(order.f.slice(), order.d);
  const parts = order.f.length + (order.d ? 1 : 0);
  const fan = save.up.fan && G.power ? 1.25 : 1;
  const patMax = L.pat * G.patMult * fan * (1 + 0.1 * (parts - 1)) * (critic ? 0.9 : 1);
  const onScreen = G.custs.map(c => c.img);
  const img = critic ? 'critic.png' : pick(CUSTS.filter(c => !onScreen.includes(c)));
  const c = { slot, img, order, critic, name: critic ? 'Oga Critic' : customerName(img), sf: !order.f.length, sd: !order.d,
              pat: patMax, patMax, state: 'wait', v: 0, rv: -1, mood: 0, q: [], potFoods: [] };
  if (critic) G.critics++;
  const e = mk('div', 'cust enter' + (critic ? ' critic' : ''), $('#custLayer'), { left: (SLOTS[slot] - 140) + 'px' });
  c.body = mk('img', 'body', e); c.body.src = IMG + MOODS[img][0];
  const fm = mk('div', 'fumes', e); mk('i', '', fm); mk('i', '', fm);
  if (critic) mk('div', 'crown', e).textContent = '👑';
  c.bubble = mk('div', 'bubble', e);
  c.el = e;
  G.custs.push(c);
  walkIn(c);
  if (critic) toast('👑 Oga Critic is here! He tips big when the food is good!');
}
function customerName(img) {
  const pool = GENDER[img] === 'f' ? FEMALE_NAMES : MALE_NAMES;
  const taken = G.custs.map(c => c.name);
  const free = pool.filter(n => !taken.includes(n));
  return pick(free.length ? free : pool);
}
function setMood(c, m) {
  if (c.mood === m) return;
  const worse = m > c.mood;
  c.mood = m;
  c.body.src = IMG + MOODS[c.img][m];
  c.el.classList.toggle('mood-wait', m === 1);
  c.el.classList.toggle('mood-angry', m === 2);
  if (c.state === 'wait') {
    c.v++;
    if (worse) { SFX.grumble(); if (m === 1 && Math.random() < .5) floatText(SLOTS[c.slot], 170, pick(G.power ? IMPATIENT : HOT), '#fff', 26); }
  }
}
function renderBubble(c) {
  const b = c.bubble; b.innerHTML = '';
  const who = mk('div', 'who', b); who.textContent = c.name;
  mk('span', 'mood', who).textContent = MOOD_EMOJI[c.mood];
  const row = mk('div', 'items', b);
  c.order.f.forEach(it => { const d = mk('div', 'it' + (c.sf ? ' ok' : ''), row); mk('img', '', d).src = IMG + FOOD[it].img; });
  if (c.order.f.length && c.order.d) mk('span', 'plus', row).textContent = '+';
  if (c.order.d) { const d = mk('div', 'it' + (c.sd ? ' ok' : ''), row); mk('img', '', d).src = IMG + 'zobo.png'; }
  if (S().showPrices) mk('div', 'price', b).textContent = naira(orderPrice(c.order));
  c.patEl = mk('i', '', mk('div', 'pat', b));
}
function say(c, text) { c.bubble.innerHTML = ''; mk('div', 'say', c.bubble).textContent = text; }
/* The customer pays exactly the menu price. On top of that they may leave a small TIP ("dash"):
   fast service up to +12%, combo up to +10%, sweet pot food +5% (bad food -5%), rush hour +10%,
   Oga Critic +40%, POS machine / better food from story choices +3% each. */
function checkDone(c) {
  if (!(c.sf && c.sd)) return;
  const price = orderPrice(c.order);
  const frac = Math.max(0, c.pat / c.patMax);
  G.combo = (G.clock - G.lastServe < 7) ? G.combo + 1 : 1; G.lastServe = G.clock;
  const avgQ = c.q.length ? c.q.reduce((a, b) => a + b, 0) / c.q.length : 0.8;
  let rate = 0.12 * Math.max(0, frac - 0.3) / 0.7 + Math.min(0.1, (G.combo - 1) * 0.025) + (avgQ >= 0.9 ? 0.05 : avgQ < 0.65 ? -0.05 : 0);
  if (G.peak) rate += 0.1;
  if (c.critic) rate += 0.4;
  rate += (save.flags.pos ? 0.03 : 0) + (save.flags.quality ? 0.03 : 0) + comfort();
  const tip = Math.max(0, Math.round(price * rate / 50) * 50);
  G.served++;
  c.state = 'leaving';
  setMood(c, 0);
  const tasty = c.potFoods.find(k => SWEET_FOOD[k] || k === 'jollof');
  say(c, c.critic ? pick(CRITIC_HAPPY) : (avgQ >= 0.85 && tasty) ? pick(tasty === 'jollof' ? SWEET_JOLLOF : SWEET_FOOD[tasty]) : pick(HAPPY));
  SFX.serve();
  if (G.combo > 1) floatText(SLOTS[c.slot], 150, `COMBO x${G.combo}!`, '#ffd23f', 46);
  dropCash(c.slot, price, tip);
  setTimeout(() => leave(c), 1100);
}
function leave(c) {
  walkOut(c, () => { c.el.remove(); if (G) G.custs = G.custs.filter(k => k !== c); });
}
function dropCash(slot, price, tip) {
  const k = { x: SLOTS[slot] - 70, y: 376, w: 140, h: 120, price, tip, t: 0 };
  const e = mk('div', 'cash', $('#stations'), box(k));
  mk('img', '', e).src = IMG + 'naira.png';
  mk('b', '', e).textContent = naira(price);
  if (tip > 0) mk('i', 'tip', e).textContent = '+' + naira(tip) + ' tip';
  k.el = e; onTap(e, () => collect(k));
  G.cash.push(k);
}
function collect(k) {
  if (!G || !G.cash.includes(k)) return;
  G.cash = G.cash.filter(x => x !== k);
  k.el.remove();
  G.sales += k.price; G.tips += k.tip;
  const amt = k.price + k.tip;
  fly('naira.png', center(k), center(G.reg), 110, fx, () => {
    if (!G) return;
    G.till += amt; G.reg.till.textContent = naira(G.till);
    G.reg.el.classList.remove('bump'); void G.reg.el.offsetWidth; G.reg.el.classList.add('bump');
    floatText(center(G.reg).x, G.reg.y - 10, '+' + naira(k.price) + (k.tip ? ` (+${naira(k.tip)} tip)` : ''), '#ffe36e', 32); SFX.till();
  });
}

/* =====================================================================
   SIDE SCENES: shared screen
   ===================================================================== */
function sideScreen(bg, face, showTaste, showQuick) {
  $('#kbg').src = IMG + bg; $('#kFace').src = IMG + face;
  $('#kTaste').style.display = showTaste ? '' : 'none';
  $('#kQuick').style.display = showQuick ? '' : 'none';
  $('#kScene').innerHTML = ''; $('#kMeter').classList.remove('show'); $('#kPointer').style.display = 'none';
  $('#kitchen').classList.add('show');
  $('#hint').classList.remove('show'); $('#pointer').style.display = 'none';
}
function closeKitchen() {
  $('#kitchen').classList.remove('show');
  $('#kMeter').classList.remove('show'); $('#kPointer').style.display = 'none';
  $('#kScene').innerHTML = '';
  if (G) G.kitchen = null;
}
function pointAt(e) {
  const p = $('#kPointer'); if (!e) { p.style.display = 'none'; return; }
  const c = elCenter(e); p.style.display = 'block'; p.style.left = (c.x - 20) + 'px'; p.style.top = c.y + 'px';
}
function hot(sc, o, tag, fn) {
  const e = mk('div', 'hot', sc, box(o));
  if (tag) mk('div', 'tag', e).textContent = tag;
  onTap(e, fn); return e;
}

/* =====================================================================
   MAMA'S KITCHEN: cooking side stories (jollof, white rice, stew, amala, ewedu)
   ===================================================================== */
const K_POT = { x: 540, y: 190, w: 520, h: 454 };
const K_LID_REST = { x: 330, y: 250, w: 220, h: 200 };
const K_LID_ON = { x: 600, y: 160, w: 400, h: 365 };
function openKitchen(k) {
  if (!G || G.kitchen) return;
  if (G.gas === false) { SFX.bad(); toast('No gas! Change the gas cylinder first.'); return; }
  const R = RECIPES[k], cap = potCap(k);
  if (!spend(COST[k] * cap, { cat: 'pots', label: `Ingredients for a pot of ${R.n.toLowerCase()} (${cap} portions)`, at: center(G.pots[k]), retry: () => openKitchen(k), profit: false })) return;
  G.cooked.push(k);
  if (!save.cookStory[k]) {
    G.paused = true;
    runDialog(COOK_STORY[k], () => { save.cookStory[k] = true; persist(); showScreen(null); G.paused = false; buildKitchen(k); });
  } else buildKitchen(k);
}
function buildKitchen(dish) {
  sideScreen('cook-bg.jpg', 'mama.png', true, true);
  const R = RECIPES[dish], sc = $('#kScene');
  const K = G.kitchen = { type: 'cook', dish, R, step: 0, n: 0, multi: [], q: 1, meter: 0, meterOn: false, lid: false, idleStir: 0, cookT: 0, phase: '', el: {} };
  const el = K.el;
  el.board = mk('div', 'k tap', sc, box({ x: 40, y: 560, w: 440, h: 279 })); mk('img', '', el.board).src = IMG + 'cook-board.png';
  el.onBoard = mk('img', 'kpop', sc, { left: '190px', top: '600px', width: '150px', height: '150px', display: 'none' });
  onTap(el.board, () => kTap('board'));
  el.flame = mk('div', 'k flame', sc, box({ x: 570, y: 420, w: 460, h: 316 })); mk('img', '', el.flame).src = IMG + 'cook-flame.png';
  el.pot = mk('div', 'k tap', sc, box(K_POT)); mk('img', '', el.pot).src = IMG + 'cook-pot.png';
  el.cont = mk('div', 'contents', el.pot);
  el.liq = mk('div', 'liq', el.cont);
  el.onions = mk('img', 'onions', el.cont); el.onions.src = IMG + (R.chop || 'ing-onion-diced.png');
  el.rice = mk('img', 'rice', el.cont); if (R.top) el.rice.src = IMG + R.top;
  el.steam = mk('div', 'steam', el.pot, { top: '60px' }); for (let j = 0; j < 3; j++) mk('i', '', el.steam);
  onTap(el.pot, () => kTap('pot'));
  el.lid = mk('div', 'k tap lid', sc, box(K_LID_REST)); mk('img', '', el.lid).src = IMG + 'cook-lid.png';
  onTap(el.lid, () => kTap(K.lid ? 'pot' : 'lid'));
  el.knob = mk('div', 'k tap knob', sc, box({ x: 578, y: 660, w: 110, h: 110 }));
  onTap(el.knob, () => kTap('knob'));
  el.tiles = {};
  R.tiles.forEach((k, n) => {
    const t = mk('div', 'tile', sc, box({ x: 1110 + (n % 3) * 160, y: 170 + Math.floor(n / 3) * 170, w: 140, h: 140 }));
    mk('img', '', t).src = IMG + ING[k].img;
    mk('div', 'lbl', t).textContent = ING[k].n;
    onTap(t, () => kTap(k));
    el.tiles[k] = t;
  });
  K.needed = new Set(); R.steps.forEach(s => { if (s.tap) K.needed.add(s.tap); (s.multi || []).forEach(m => K.needed.add(m)); });
  setStage(null);
  kShowStep();
}
function setStage(name) {
  const K = G.kitchen, st = (name && K.R.stages[name]) || [0, null, 0, 0];
  const lv = st[0], cx = 49.6, cy = 46 - 8 * lv, w = 57 + 13 * lv, h = 28 + 12 * lv;
  Object.assign(K.el.cont.style, { left: (cx - w / 2) + '%', top: (cy - h / 2) + '%', width: w + '%', height: h + '%' });
  K.el.liq.style.background = st[1] ? LIQ[st[1]] : 'transparent';
  K.el.onions.style.opacity = st[2]; K.el.rice.style.opacity = K.R.top ? st[3] : 0;
}
function kStepDef() { return G.kitchen.R.steps[G.kitchen.step]; }
function kShowStep() {
  const K = G.kitchen, s = kStepDef();
  $('#kStepNo').textContent = `Mama's ${K.R.n.toLowerCase()} · step ${K.step + 1} of ${K.R.steps.length}`;
  $('#kStepText').textContent = s.say + (s.count ? `  (${K.n}/${s.count})` : '') + (s.multi ? `  (${K.multi.length}/${s.multi.length})` : '');
  Object.values(K.el.tiles).forEach(t => t.classList.remove('target'));
  ['board', 'pot', 'lid', 'knob'].forEach(k => K.el[k].classList.remove('target'));
  const targets = s.multi ? s.multi.filter(m => !K.multi.includes(m)) : [s.tap];
  targets.forEach(t => { const e = K.el.tiles[t] || K.el[t]; if (e) e.classList.add('target'); });
  pointAt(K.el.tiles[targets[0]] || K.el[targets[0]]);
  if (s.timed) {
    const T = TIMED[s.timed];
    K.meter = 0; K.meterOn = true;
    $('#kZone').style.display = ''; $('#kZone').style.left = T.zone[0] * 100 + '%'; $('#kZone').style.width = (T.zone[1] - T.zone[0]) * 100 + '%';
    $('#kMeterLbl').textContent = T.label; $('#kMeter').classList.add('show');
  } else { K.meterOn = false; $('#kMeter').classList.remove('show'); }
  kTaste();
}
function kTaste() { const q = G.kitchen.q, st = q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1; $('#kStars').textContent = '★'.repeat(st) + '☆'.repeat(3 - st); }
function kMistake(text, amount = 0.08, el) {
  const K = G.kitchen; K.q = Math.max(0.3, K.q - amount);
  SFX.bad(); if (el) shake(el);
  floatText(800, 150, text, '#ffd0c0', 32, $('#kScene'));
  kTaste();
}
function kTap(what) {
  const K = G.kitchen; if (!K || K.type !== 'cook' || K.phase === 'cooking' || K.finished) return;
  const s = kStepDef(), el = K.el.tiles[what] || K.el[what];
  if (ING[what] && !K.needed.has(what)) { kMistake(DECOY_MSG[what] || `That one does not go into ${K.R.n.toLowerCase()}!`, 0.1, el); return; }
  if (s.multi) {
    if (s.multi.includes(what) && !K.multi.includes(what)) {
      K.multi.push(what); kAdd(what); el.classList.add('used');
      if (K.multi.length === s.multi.length) kNext(); else kShowStep();
    } else if (ING[what]) kMistake('Not yet! Follow Mama\'s steps.', 0.06, el);
    return;
  }
  if (what !== s.tap) {
    if (ING[what]) kMistake('Not yet! Follow Mama\'s steps.', 0.06, el);
    else if (what === 'pot' && K.lid) toast('Wait, it is cooking…');
    return;
  }
  if (s.timed) {
    const T = TIMED[s.timed], m = K.meter;
    if (m < T.zone[0]) kMistake(T.early, 0.1);
    else if (m > T.zone[1]) kMistake(T.late, 0.08);
    else { if (T.finish) K.q = Math.min(1, K.q + 0.08); floatText(800, 150, T.best || 'Perfect timing! 🔥', '#ffe36e', 40, $('#kScene')); if (T.finish) SFX.star(); }
    if (what === 'board') { SFX.sizzle(); fly(K.R.chop || 'ing-onion-diced.png', { x: 260, y: 680 }, { x: 800, y: 380 }, 120, $('#kScene')); K.el.onBoard.style.display = 'none'; }
    else if (ING[what]) kAdd(what);
    if (s.stage) setStage(s.stage);
    if (T.finish) kFinish(); else kNext();
    return;
  }
  if (s.count) {
    K.n++; K.idleStir = 0;
    if (what === 'board') {
      SFX.chop(); const sc = 1 - K.n / s.count;
      if (K.n >= s.count / 2) K.el.onBoard.src = IMG + (K.R.chop || 'ing-onion-diced.png');
      K.el.onBoard.style.transform = `scale(${0.8 + 0.2 * sc}) rotate(${K.n * 9}deg)`;
    } else { SFX.sizzle(); if (K.el.pot.animate) K.el.pot.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-2deg)' }, { transform: 'rotate(2deg)' }, { transform: 'rotate(0)' }], { duration: 250 }); }
    if (K.n >= s.count) { if (s.stage) setStage(s.stage); if (K.step === K.R.steps.length - 1) kFinish(); else kNext(); } else kShowStep();
    return;
  }
  if (s.board) { kAdd(what, true); K.el.onBoard.src = IMG + ING[what].img; K.el.onBoard.style.display = 'block'; K.el.onBoard.style.transform = ''; }
  else if (what === 'knob') { K.el.flame.classList.add('on'); SFX.sizzle(); }
  else if (what === 'lid') { K.lid = true; Object.assign(K.el.lid.style, box(K_LID_ON)); K.phase = 'cooking'; K.cookT = 0; SFX.tap(); return; }
  else kAdd(what);
  if (s.stage) setStage(s.stage);
  if (K.step === K.R.steps.length - 1) kFinish(); else kNext();
}
function kAdd(what, toBoard) {
  const K = G.kitchen, t = K.el.tiles[what];
  fly(ING[what].img, elCenter(t), toBoard ? { x: 260, y: 680 } : { x: 800, y: 380 }, 120, $('#kScene'));
  if (!toBoard) SFX.sizzle(); else SFX.tap();
}
function kNext() {
  const K = G.kitchen; K.step++; K.n = 0; K.multi = []; K.idleStir = 0;
  if (K.step >= K.R.steps.length) { kFinish(); return; }
  kShowStep();
}
function kFinish() {
  const K = G.kitchen; if (K.finished) return;
  const q = K.q, dish = K.dish, cap = potCap(dish);
  bump('cooks'); if (q >= 0.9) { bump('perfectCooks'); if (dish === 'jollof') bump('partyJollof'); }
  K.finished = true;
  setStage('done');
  Object.assign(K.el.lid.style, box(K_LID_REST)); K.lid = false;
  K.el.steam.classList.add('show');
  $('#kMeter').classList.remove('show'); pointAt(null);
  const st = q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1;
  const title = (st === 3 ? 'Perfect ' : st === 2 ? 'Sweet ' : 'Okay ') + K.R.n.toLowerCase() + ' ' + '⭐'.repeat(st);
  $('#kStepNo').textContent = 'Done!'; $('#kStepText').textContent = `${title}! ${cap} portions ready. Back to the counter!`;
  SFX.ding();
  setTimeout(() => {
    if (!G || G.kitchen !== K) return;
    save.stock[dish] = { n: cap, q }; persist();
    closeKitchen();
    floatText(center(G.pots[dish]).x, G.pots[dish].y, title, '#ffe36e', 30);
  }, 1300);
}
function kUpdate(dt) {
  const K = G.kitchen; if (!K || K.finished) return;
  const s = kStepDef();
  if (K.phase === 'cooking' && K.lid) {
    K.cookT += dt;
    K.el.steam.classList.add('show');
    $('#kStepText').textContent = 'It is cooking… ' + '●'.repeat(1 + Math.floor(K.cookT * 2) % 3);
    if (K.cookT >= 3) { K.phase = ''; const nx = K.R.steps[K.step + 1]; if (!nx || !nx.timed) { Object.assign(K.el.lid.style, box(K_LID_REST)); K.lid = false; } kNext(); }
    return;
  }
  if (K.meterOn && s && s.timed) {
    const T = TIMED[s.timed];
    K.meter += dt * (s.timed === 'heat' && save.up.stove ? T.speed * 1.4 : T.speed);
    $('#kFill').style.width = Math.min(1, K.meter) * 100 + '%';
    if (K.meter > 1) {
      $('#kMeterLbl').textContent = T.finish ? 'Burning! Open it now!' : 'Too long! Add it now!';
      if (T.finish && K.meter > 1.4) { kMistake('Burnt! 🔥', 0.2); kFinish(); return; }
      if (!T.finish && K.meter > 1.6) { K.meter = 1.0; kMistake(T.late, 0.08); }
    }
  }
  if (s && s.stir) { K.idleStir += dt; if (K.idleStir > 2.6) { K.idleStir = 0; kMistake('Keep stirring or it will burn!', 0.05, K.el.pot); } }
}
onTap($('#kQuick'), () => {
  if (!G || !G.kitchen || G.kitchen.type !== 'cook') return;
  const dish = G.kitchen.dish;
  SFX.tap(); closeKitchen();
  G.pots[dish].quick = true; G.pots[dish].t = 0;
  toast(`Mama will finish the ${RECIPES[dish].n.toLowerCase()}. It will be okay, not sweet.`);
});

/* =====================================================================
   GENERATOR, WASHING AND GAS SIDE STORIES
   ===================================================================== */
const SIDE_TITLE = { gen: 'Start the generator', wash: 'Wash the plates', gas: 'Change the gas cylinder' };
const SIDE_COST = {
  fuel: { amt: () => fuelCost(), cat: 'fuel', label: 'Petrol for the generator (3 litres)', profit: true },
  soap: { amt: () => COST.soap, cat: 'supplies', label: 'Dish soap', profit: true },
  gas:  { amt: () => COST.gas,  cat: 'gas', label: 'Cooking gas refill (12.5kg)', profit: false },
};
function openSide(type) {
  if (!G || G.kitchen) return;
  if (type === 'gen') buildGen(); else if (type === 'wash') buildWash(); else if (type === 'gas') buildGas();
}
function buildGen() {
  sideScreen('gen-bg.jpg', 'mama.png', false, false);
  const sc = $('#kScene');
  const K = G.kitchen = { type: 'gen', step: 0, n: 0, meter: 0, busy: false, el: {}, steps: GEN_STEPS, stains: [] };
  const el = K.el;
  el.bulb = mk('div', 'bulb', sc, { left: '520px', top: '88px' });
  el.can = mk('div', 'k', sc, box({ x: 170, y: 500, w: 234, h: 240 })); mk('img', '', el.can).src = IMG + 'jerrycan.png';
  el.gen = mk('div', 'k gen', sc, box({ x: 480, y: 360, w: 640, h: 455 })); mk('img', '', el.gen).src = IMG + 'generator.png';
  el.hole = mk('div', 'capHole', sc, box({ x: 742, y: 372, w: 96, h: 40 }));
  K.targets = {
    can: hot(sc, { x: 170, y: 500, w: 234, h: 240 }, 'Petrol', () => sTap('can')),
    cap: hot(sc, { x: 718, y: 352, w: 144, h: 86 }, 'Fuel cap', () => sTap('cap')),
    valve: hot(sc, { x: 494, y: 497, w: 112, h: 120 }, 'Fuel tap', () => sTap('valve')),
    switch: hot(sc, { x: 610, y: 520, w: 96, h: 110 }, 'Switch', () => sTap('switch')),
    rope: hot(sc, { x: 1004, y: 494, w: 132, h: 140 }, 'Starter rope', () => sTap('rope')),
  };
  sShow();
}
function buildWash() {
  sideScreen('sink-bg.jpg', 'mama.png', false, false);
  const sc = $('#kScene');
  const dirty = Math.max(1, G.plates.filter(p => p.dirty).length);
  const steps = WASH_STEPS.map(s => Object.assign({}, s));
  const K = G.kitchen = { type: 'wash', step: 0, n: 0, meter: 0, busy: false, el: {}, steps, plates: [], stains: [] };
  const el = K.el;
  el.water = mk('div', 'water', sc);
  el.soap = mk('div', 'k', sc, box({ x: 60, y: 440, w: 170, h: 180 })); mk('img', '', el.soap).src = IMG + 'dish-soap.png';
  K.targets = {
    soap: hot(sc, { x: 60, y: 440, w: 170, h: 180 }, 'Dish soap', () => sTap('soap')),
    tap: hot(sc, { x: 690, y: 150, w: 200, h: 240 }, 'Water tap', () => sTap('tap')),
  };
  for (let k = 0; k < dirty; k++) {
    const p = mk('div', 'washPlate', sc, box({ x: 330 + k * 280, y: 410, w: 230, h: 210 }));
    mk('img', '', p).src = IMG + 'plate.png';
    for (let j = 0; j < 3; j++) {
      const sz = rand(22, 32), st = mk('div', 'stain', p, { left: rand(18, 62) + '%', top: rand(18, 58) + '%', width: sz + '%', height: sz + '%' });
      onTap(st, () => sTap('stain', st));
      K.stains.push(st);
    }
    K.plates.push(p);
  }
  steps[2].count = K.stains.length; steps[3].count = K.plates.length;
  sShow();
}
const GAS_BOX = { x: 900, y: 250, w: 352, h: 520 };
function buildGas() {
  sideScreen('cook-bg.jpg', 'mama.png', false, false);
  const sc = $('#kScene');
  const K = G.kitchen = { type: 'gas', step: 0, n: 0, meter: 0, busy: false, el: {}, steps: GAS_STEPS, stains: [] };
  const el = K.el;
  el.flame = mk('div', 'k flame', sc, box({ x: 570, y: 420, w: 460, h: 316 })); mk('img', '', el.flame).src = IMG + 'cook-flame.png';
  el.cyl = mk('div', 'k cyl', sc, box(GAS_BOX)); mk('img', '', el.cyl).src = IMG + 'gas-cylinder.png';
  el.cyl.style.filter = 'saturate(.5) brightness(.85)';
  el.soap = mk('div', 'k', sc, box({ x: 60, y: 440, w: 170, h: 180 })); mk('img', '', el.soap).src = IMG + 'dish-soap.png';
  K.targets = {
    valve: hot(sc, { x: 1008, y: 284, w: 124, h: 64 }, 'Valve', () => sTap('valve')),
    reg: hot(sc, { x: 1060, y: 330, w: 116, h: 96 }, 'Regulator', () => sTap('reg')),
    old: hot(sc, { x: 940, y: 440, w: 260, h: 300 }, 'Cylinder', () => sTap('old')),
    soap: hot(sc, { x: 60, y: 440, w: 170, h: 180 }, 'Soapy water', () => sTap('soap')),
    knob: hot(sc, { x: 578, y: 660, w: 110, h: 110 }, 'Cooker knob', () => sTap('knob')),
  };
  sShow();
}
function sStep() { return G.kitchen.steps[G.kitchen.step]; }
function sShow() {
  const K = G.kitchen, s = sStep();
  $('#kStepNo').textContent = `${SIDE_TITLE[K.type]} · step ${K.step + 1} of ${K.steps.length}`;
  $('#kStepText').textContent = s.say + (s.count ? `  (${K.n}/${s.count})` : '');
  Object.values(K.targets).forEach(e => e.classList.remove('target'));
  K.stains.forEach(e => e.classList.remove('target'));
  if (s.tap === 'stain') {
    const left = K.stains.filter(e => e.parentNode); left.forEach(e => e.classList.add('target'));
    if (left[0]) { const c = elCenter(left[0].parentNode); $('#kPointer').style.display = 'block'; $('#kPointer').style.left = (c.x - 20) + 'px'; $('#kPointer').style.top = c.y + 'px'; }
  } else { const first = K.targets[s.tap]; if (first) first.classList.add('target'); pointAt(first); }
  const m = $('#kMeter');
  if (s.timed) {
    K.meter = 0;
    $('#kZone').style.display = ''; $('#kZone').style.left = s.timed.zone[0] * 100 + '%'; $('#kZone').style.width = (s.timed.zone[1] - s.timed.zone[0]) * 100 + '%';
    $('#kMeterLbl').textContent = s.timed.label; m.classList.add('show');
  } else if (s.tap === 'can') {
    $('#kZone').style.display = 'none'; $('#kMeterLbl').textContent = 'Fuel tank'; $('#kFill').style.width = (K.n / s.count * 100) + '%'; m.classList.add('show');
  } else m.classList.remove('show');
}
function sPay(s, retry) {
  if (!s.cost) return true;
  const c = SIDE_COST[s.cost];
  return spend(c.amt(), { cat: c.cat, label: c.label, at: { x: 800, y: 300 }, retry, profit: c.profit });
}
function sTap(what, el) {
  const K = G.kitchen; if (!K || K.busy || K.type === 'cook') return;
  const s = sStep(), layer = $('#kScene');
  if (what !== s.tap) { SFX.bad(); shake(el || K.targets[what]); floatText(800, 150, 'Not yet! Follow the steps.', '#ffd0c0', 30, layer); return; }
  if (s.timed) {
    const m = K.meter;
    if (m >= s.timed.zone[0] && m <= s.timed.zone[1]) { genStarted(); }
    else {
      SFX.sputter(); K.el.gen.classList.remove('sputter'); void K.el.gen.offsetWidth; K.el.gen.classList.add('sputter');
      floatText(800, 150, m < s.timed.zone[0] ? 'Kpa-kpa… pull harder!' : 'Kpa-kpa-kpa… too late, try again!', '#ffd0c0', 32, layer);
      K.meter = 0;
    }
    return;
  }
  if (s.count) {
    if (what === 'can') { SFX.splash(); fly('jerrycan.png', { x: 287, y: 620 }, { x: 790, y: 393 }, 90, layer); }
    if (what === 'stain' && el) { SFX.scrub(); const c = elCenter(el.parentNode); floatText(c.x, c.y - 30, '🫧', '#fff', 40, layer); el.remove(); }
    if (what === 'tap' && K.type === 'wash') { SFX.splash(); const p = K.plates[K.n]; if (p) Object.assign(p.style, box({ x: 1290 + K.n * 60, y: 300 + K.n * 12, w: 170, h: 155 })); }
    if (what === 'reg') { SFX.chop(); floatText(1118, 330, K.step < 3 ? '↺' : '↻', '#fff', 50, layer); }
    K.n++;
    if (K.n >= s.count) {
      if (!sPay(s, () => sTap(what, el))) { K.n = s.count - 1; return; }
      sNext();
    } else sShow();
    return;
  }
  if (!sPay(s, () => sTap(what, el))) return;
  if (what === 'cap') { K.el.hole.classList.toggle('show'); SFX.tap(); }
  if (what === 'valve') { SFX.tap(); floatText(1070, 270, K.type === 'gas' ? (K.step === 0 ? 'Valve closed' : 'Valve open') : 'Fuel tap ON', '#ffe36e', 28, layer); }
  if (what === 'switch') { SFX.tap(); floatText(658, 500, 'Switch ON', '#ffe36e', 28, layer); }
  if (what === 'tap') { K.el.water.classList.add('on'); SFX.splash(); }
  if (what === 'soap') { SFX.splash(); [0, 1, 2].forEach(k => floatText(K.type === 'gas' ? 1060 + k * 40 : 500 + k * 220, K.type === 'gas' ? 380 : 470, '🫧', '#fff', 54, layer)); if (K.type === 'gas') floatText(800, 150, 'No bubbles, no leak. Safe! ✅', '#bfffbf', 32, layer); }
  if (what === 'old') {
    SFX.tap(); const c = K.el.cyl;
    Object.assign(c.style, { left: '1400px', opacity: 0, transition: 'left .5s, opacity .5s' });
    setTimeout(() => { if (G && G.kitchen === K) { c.style.transition = 'none'; c.style.filter = ''; c.style.left = '1600px'; c.style.opacity = 1; void c.offsetWidth; c.style.transition = 'left .5s'; c.style.left = GAS_BOX.x + 'px'; } }, 520);
    floatText(1060, 220, 'New cylinder!', '#ffe36e', 32, layer);
  }
  if (what === 'knob') { K.el.flame.classList.add('on'); SFX.sizzle(); }
  sNext();
}
function sNext() {
  const K = G.kitchen; K.step++; K.n = 0;
  if (K.step >= K.steps.length) { if (K.type === 'wash') washDone(); else if (K.type === 'gas') gasDone(); return; }
  sShow();
}
function genStarted() {
  const K = G.kitchen; K.busy = true; bump('gens');
  K.el.gen.classList.add('running'); K.el.bulb.classList.add('on');
  SFX.engine(); $('#kMeter').classList.remove('show'); pointAt(null);
  Object.values(K.targets).forEach(e => e.classList.remove('target'));
  $('#kStepNo').textContent = 'Done!'; $('#kStepText').textContent = 'Vroom! Light don come! 💡 Back to the counter.';
  setTimeout(() => {
    if (!G || G.kitchen !== K) return;
    G.power = true; $('#dark').classList.remove('show'); $('#genBtn').classList.remove('show');
    closeKitchen(); toast('💡 Light is back. The zobo fridge is cold again.');
  }, 1500);
}
function washDone() {
  const K = G.kitchen; K.busy = true; bump('washes');
  K.el.water.classList.remove('on'); pointAt(null);
  $('#kStepNo').textContent = 'Done!'; $('#kStepText').textContent = 'Sparkling clean! ✨ Back to the counter.';
  SFX.ding();
  setTimeout(() => {
    if (!G || G.kitchen !== K) return;
    G.plates.forEach(p => { p.dirty = false; p.el.classList.remove('dirty'); });
    G.washPending = false;
    closeKitchen(); toast('✨ Clean plates are back on the counter.');
  }, 1200);
}
function gasDone() {
  const K = G.kitchen; K.busy = true; pointAt(null); bump('gasChanges');
  $('#kStepNo').textContent = 'Done!'; $('#kStepText').textContent = 'Blue flame! 🔥 The cooker is working again.';
  SFX.ding();
  setTimeout(() => {
    if (!G || G.kitchen !== K) return;
    G.gas = true; $('#gasBtn').classList.remove('show');
    closeKitchen(); toast('🔥 Gas is back. You can fry and cook again.');
  }, 1200);
}
function sUpdate(dt) {
  const K = G.kitchen; if (!K || K.busy) return;
  const s = sStep();
  if (s && s.timed) {
    K.meter += dt * s.timed.speed;
    if (K.meter > 1.1) K.meter = 0;
    $('#kFill').style.width = Math.min(1, K.meter) * 100 + '%';
  } else if (s && s.tap === 'can') $('#kFill').style.width = (K.n / s.count * 100) + '%';
}
function triggerPower() {
  if (save.up.inverter) { toast('NEPA took light, but the inverter kicked in! 🔋 No wahala.'); return; }
  G.power = false;
  $('#dark').classList.add('show'); $('#genBtn').classList.add('show');
  G.cups.forEach(c => { if (c.state === 'fill') c.state = 'empty'; });
  SFX.powerOff(); toast('⚡ NEPA has taken light! The customers are sweating. Start the generator!');
}
function triggerWash() {
  G.washPending = true;
  G.plates.forEach(p => { if (!p.items.length) { p.dirty = true; p.el.classList.add('dirty'); } });
  SFX.bad(); toast('🍽 The clean plates have finished! Tap a dirty plate to go and wash them.');
}
function triggerGas() {
  G.gas = false;
  G.pans.forEach(p => { if (p.state === 'cook') { p.state = 'empty'; p.item = null; } });
  $('#gasBtn').classList.add('show');
  SFX.powerOff(); toast('🔥 The cooking gas has finished! You cannot fry or cook until you change the cylinder.');
}
/* In-day story moments: a customer who wants to eat now and pay later */
function triggerOwe() {
  const female = Math.random() < 0.5, name = pick(female ? FEMALE_NAMES : MALE_NAMES), amt = pick([1500, 2000, 2500]);
  G.paused = true;
  modal(`
    <div class="who"><img src="${IMG}${female ? 'cust2.png' : 'cust6.png'}" alt=""><div>
      <h2>"Mama, abeg…"</h2>
      <p>${name}: "Mama, I never collect salary this month. Abeg give me food today. I go pay you ${naira(amt)} next week, I promise!"</p>
    </div></div>
    <p class="note">If you agree, the food costs you about ${naira(Math.round(amt * 0.45 / 50) * 50)} now. Some people pay back, some people never come back.</p>
    <div class="row"><button class="small" data-a="no">Sorry, no money no food</button><button class="big" data-a="yes">Okay, eat and pay later</button></div>`,
    { no: () => { showScreen(null); G.paused = false; toast(`${name} walked away sadly.`); },
      yes: () => {
        const cost = Math.round(amt * 0.45 / 50) * 50;
        G.pcost += cost; G.exp.food = (G.exp.food || 0) + cost; G.cashCost += cost;
        bump('owesGiven');
        save.owed.push({ name, amt, due: (typeof G.id === 'number' ? G.id : save.unlocked) + 2 + Math.floor(rand(0, 4)), honest: Math.random() < 0.65 });
        persist(); showScreen(null); G.paused = false; toast(`📒 ${name} owes you ${naira(amt)}. Let us hope they come back…`);
      } });
}
onTap($('#genBtn'), () => openSide('gen'));
onTap($('#gasBtn'), () => openSide('gas'));

/* =====================================================================
   UPDATE LOOP
   ===================================================================== */
function update(dt) {
  const inSide = !!G.kitchen;
  // A side quest is on: you are in a side scene, or the light/gas/plates have run out and are waiting for you.
  const sideQuest = inSide || !G.power || G.gas === false || (G.washPending && G.plates.some(p => p.dirty) && !G.plates.some(p => !p.dirty && !p.items.length) && !hired('washer'));
  G.idle += dt;
  if (!sideQuest) { G.clock += dt; G.time -= dt; }     // the day clock stops during every side quest
  if (G.time <= 0) { G.time = 0; endLevel(); return; }
  for (const ev of G.events) if (!ev.done && G.clock >= ev.at && !inSide) {
    ev.done = true;
    if (ev.t === 'power') triggerPower(); else if (ev.t === 'wash') triggerWash(); else if (ev.t === 'gas') triggerGas(); else if (ev.t === 'owe') triggerOwe();
    if (G.paused) return;
  }
  if (G.peakAt > 0 && !G.peak && G.clock >= G.peakAt && G.time > PEAK.length) startPeak();
  if (G.peak && !sideQuest) { G.peak.t -= dt; if (G.peak.t <= 0) endPeak(); }
  G.spawnT -= sideQuest ? 0 : dt;
  if (!sideQuest && waiting().length === 0 && G.spawnT > 0.8) G.spawnT = 0.8;   // never leave the shop empty for long
  if (!sideQuest && G.spawnT <= 0 && G.time > 6) {
    const max = Math.min(4, G.L.max + (G.peak ? 1 : 0));
    if (waiting().length < max) spawnCustomer();
    G.spawnT = rand(G.L.spawn[0], G.L.spawn[1]) * SPAWN_SPEED * (G.peak ? PEAK.spawnMult : 1);
  }
  const drain = sideQuest ? 0 : 1;                   // customers wait patiently while you handle a side quest
  for (const c of G.custs) {
    if (c.state !== 'wait') continue;
    c.pat -= dt * drain;
    const r = c.pat / c.patMax;
    setMood(c, r > 0.5 ? 0 : r > 0.22 ? 1 : 2);
    if (c.pat <= 0) {
      c.state = 'leaving'; G.lost++; G.combo = 0;
      say(c, pick(ANGRY)); SFX.bad();
      setTimeout(() => leave(c), 1200);
      if (G.mode === 'rush') { G.hearts--; if (G.hearts <= 0) { endLevel(); return; } }
    }
  }
  if (inSide) { if (G.kitchen.type === 'cook') kUpdate(dt); else sUpdate(dt); updateWait(); return; }
  helpersUpdate(dt);
  for (const k in G.pots) {
    const p = G.pots[k];
    if (p.quick) { p.t += dt; if (p.t >= G.quickTime) { p.quick = false; save.stock[k] = { n: potCap(k), q: 0.6 }; SFX.ding(); floatText(center(p).x, p.y, RECIPES[k].n + ' ready!', '#ffe36e', 30); } }
  }
  for (const pn of G.pans) {
    if (pn.state === 'cook') { pn.t += dt; if (pn.t >= G.fryTime) { pn.state = 'done'; pn.t = 0; SFX.ding(); } }
    else if (pn.state === 'done') { pn.t += dt; if (pn.t >= G.burnAfter) { pn.state = 'burnt'; SFX.bad(); toast(`Ah! The ${FOOD[pn.item].n.toLowerCase()} don burn! 🔥`); } }
  }
  for (const c of G.cups) if (c.state === 'fill' && G.power) { c.t += dt; if (c.t >= G.fillTime) { c.state = 'full'; SFX.ding(); } }
  for (const k of G.cash.slice()) { k.t += dt; if (k.t > (S().autoCash ? 1.2 : 8)) collect(k); }
}
function updateWait() {
  const w = waiting().length;
  const s = Math.ceil(G.time);
  $('#kWait').textContent = `⏸ Day clock paused at ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` + (w ? ` · 👥 ${w} waiting patiently` : '');
}
function startPeak() {
  G.peak = { t: PEAK.length }; G.peakAt = -1; G.spawnT = 0.3;
  $('#rushBanner').classList.add('show'); $('#play').classList.add('rushing');
  SFX.rush(); toast('🔥 RUSH HOUR! Customers everywhere! Tips +10%');
}
function endPeak() {
  G.peak = null;
  $('#rushBanner').classList.remove('show'); $('#play').classList.remove('rushing');
  if (G.running) toast('Rush hour over. Well done!');
}

/* =====================================================================
   RENDER
   ===================================================================== */
// where each food sits on a plate: [left %, top %, size %]
const PLATE_POS = { jollof: [20, 14, 60], whiterice: [20, 14, 60], amala: [22, 16, 56], akara: [28, 4, 52], stew: [46, 34, 46], ewedu: [44, 30, 50],
  dodo: [0, 6, 44], meat: [58, 2, 44], egg: [60, 4, 40], fish: [56, 0, 46], ponmo: [58, 4, 44] };
const DRAW_ORDER = ['jollof', 'whiterice', 'amala', 'akara', 'stew', 'ewedu', 'dodo', 'meat', 'egg', 'fish', 'ponmo'];
function profit() { return G.sales + G.tips - G.pcost; }
function render() {
  const s = Math.ceil(G.time);
  const paused = G.kitchen || !G.power || G.gas === false || (G.washPending && G.plates.some(p => p.dirty) && !G.plates.some(p => !p.dirty && !p.items.length) && !hired('washer'));
  $('#hudTime').textContent = (paused ? '⏸ ' : '⏱ ') + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  $('#hudTime').style.color = s <= 10 ? '#d8402b' : '';
  const pr = profit(), top = G.mode === 'rush' ? G.goal : G.goal * STAR[2];
  $('#goalFill').style.width = `calc(${Math.max(0, Math.min(1, pr / top)) * 100}% - 6px)`;
  $('#goalText').textContent = G.mode === 'rush' ? `Profit ${naira(pr)} · best ${naira(save.rushBest)}` : `Profit ${naira(pr)} / ${naira(G.goal)}`;
  $('#hudBank').textContent = '🏦 ' + naira(balance());
  $('#hudBank').classList.toggle('neg', balance() < 0);
  if (G.mode === 'rush') $('#hudHearts').textContent = '❤'.repeat(Math.max(0, G.hearts)) + '♡'.repeat(Math.max(0, RUSH.hearts - G.hearts));
  else STAR.forEach((m, k) => { const on = pr >= G.goal * m, el = $('#st' + (k + 1)); if (on && !el.classList.contains('on')) { el.classList.add('on'); SFX.star(); } });
  for (const k in G.pots) {
    const p = G.pots[k], st = stockOf(k);
    p.badge.textContent = p.quick ? '…' : st.n > 0 ? '×' + st.n : 'COOK!';
    p.badge.classList.toggle('cook', !p.quick && st.n === 0);
    p.badge.classList.toggle('low', !p.quick && st.n > 0 && st.n <= 5);
    p.ring.classList.toggle('show', p.quick); p.ring.style.setProperty('--p', p.quick ? p.t / G.quickTime : 0);
    p.steam.classList.toggle('show', p.quick || st.n > 0);
    p.lbl.textContent = POTS[k].lbl + (st.n > 0 ? ' ' + '⭐'.repeat(st.q >= 0.9 ? 3 : st.q >= 0.7 ? 2 : 1) : '');
    p.el.querySelector('img.main').style.filter = st.n === 0 && !p.quick ? 'grayscale(.7) brightness(.8)' : '';
  }
  for (const pn of G.pans) {
    const f = pn.food;
    f.classList.toggle('show', pn.state !== 'empty');
    if (pn.item) f.src = IMG + FOOD[pn.item].img;
    let ring = 0, col = '#ffd23f';
    if (pn.state === 'cook') { const q = pn.t / G.fryTime; f.style.filter = rawFilter(pn.item, q); ring = q; }
    else if (pn.state === 'done') { const q = pn.t / G.burnAfter; f.style.filter = `brightness(${1 - 0.35 * Math.max(0, q - 0.5)}) drop-shadow(0 0 10px #fff6a0)`; ring = q; col = q > 0.6 ? '#e2412b' : '#2fae4e'; }
    else if (pn.state === 'burnt') f.style.filter = 'brightness(.25) saturate(.3)';
    pn.ring.classList.toggle('show', pn.state === 'cook' || pn.state === 'done');
    pn.ring.style.setProperty('--p', ring); pn.ring.style.setProperty('--c', col);
    pn.el.classList.toggle('ready', pn.state === 'done');
    pn.smoke.classList.toggle('show', pn.state === 'burnt' || (pn.state === 'done' && pn.t > G.burnAfter - 2));
  }
  for (const pl of G.plates) {
    if (pl.ver === pl.v) continue;
    pl.ver = pl.v; pl.itemsEl.innerHTML = '';
    pl.el.classList.toggle('has', pl.items.length > 0);
    const solo = pl.items.length === 1;
    DRAW_ORDER.filter(x => pl.items.includes(x)).forEach(it => {
      const pos = (solo ? [20, 10, 60] : PLATE_POS[it]).slice();
      mk('img', '', pl.itemsEl, { left: pos[0] + '%', top: pos[1] + '%', width: pos[2] + '%', height: pos[2] + '%' }).src = IMG + FOOD[it].img;
    });
  }
  for (const c of G.cups) {
    c.el.className = 'st cup ' + c.state;
    const q = c.state === 'full' ? 1 : c.state === 'fill' ? c.t / G.fillTime : 0;
    c.fill.style.clipPath = `inset(${(1 - q) * 100}% 0 0 0)`;
    c.fill.style.display = q > 0 ? 'block' : 'none';
  }
  for (const c of G.custs) {
    if (c.state === 'wait' && c.rv !== c.v) { c.rv = c.v; renderBubble(c); }
    if (c.state === 'wait' && c.patEl) {
      const q = Math.max(0, c.pat / c.patMax);
      c.patEl.style.width = q * 100 + '%';
      c.patEl.style.background = q > .5 ? '#2fae4e' : q > .22 ? '#f2b410' : '#e2412b';
    }
  }
  G.hintT -= 1 / 60;
  if (G.hintT <= 0) { G.hintT = 0.25; showHint(); }
}

/* ---------------- hints ---------------- */
function nextStep() {
  const W8 = waiting().sort((a, b) => a.pat / a.patMax - b.pat / b.patMax);
  const at = (t, o) => Object.assign({ t }, center(o));
  if (!G.power) return { t: 'NEPA took light! Tap the yellow button to start the generator.', x: 800, y: 190 };
  if (G.gas === false) return { t: 'The gas has finished! Tap the button to change the cylinder.', x: 800, y: 260 };
  if (G.cash.length) return at('Tap the naira notes to put them in the till!', G.cash[0]);
  for (const pl of G.plates) if (pl.items.length && W8.some(c => !c.sf && sameSet(c.order.f, pl.items))) return at('This plate is ready. Tap it to serve!', pl);
  const fc = G.cups.find(c => c.state === 'full');
  if (fc && W8.some(c => c.order.d && !c.sd)) return at('Cold zobo is ready. Tap the bottle to serve it!', fc);
  const burnt = G.pans.find(p => p.state === 'burnt'); if (burnt) return at('It burnt! Tap the pan to throw it away.', burnt);
  const done = G.pans.find(p => p.state === 'done'); if (done) return at(`The ${FOOD[done.item].n.toLowerCase()} is golden. Tap it before it burns!`, done);
  const dirty = G.plates.find(p => p.dirty);
  if (dirty && !G.plates.some(p => !p.dirty && !p.items.length)) return at('No clean plates! Tap a dirty plate to wash them.', dirty);
  const stuck = G.plates.find(p => !p.dirty && p.items.length && !W8.some(c => !c.sf && c.order.f.length && p.items.every(x => c.order.f.includes(x))));
  if (stuck && !G.plates.some(p => !p.dirty && !p.items.length)) return at('Nobody wants this plate. Tap ✕ to clear it.', stuck);
  for (const c of W8) {
    if (!c.sf && c.order.f.length) {
      const best = G.plates.filter(p => !p.dirty && p.items.every(x => c.order.f.includes(x))).sort((a, b) => b.items.length - a.items.length)[0];
      const miss = c.order.f.filter(x => !(best ? best.items : []).includes(x));
      for (const m of miss) {
        if (POTS[m] && G.pots[m]) {
          if (G.pots[m].quick) continue;
          return stockOf(m).n > 0 ? at(`${c.name} wants ${FOOD[m].n.toLowerCase()}. Tap the pot to dish it.`, G.pots[m]) : at(`The ${FOOD[m].n.toLowerCase()} is finished! Tap the pot to cook a new pot.`, G.pots[m]);
        }
        if (G.sides[m]) return at(`Add ${FOOD[m].n.toLowerCase()} for ${c.name}: tap the bowl.`, G.sides[m]);
        if (m === 'dodo' || m === 'akara') {
          if (G.pans.some(p => p.item === m && (p.state === 'cook' || p.state === 'done'))) continue;
          return at(`Tap the ${m === 'dodo' ? 'plantain' : 'akara batter'} to start frying ${FOOD[m].n.toLowerCase()}.`, G.sources[m]);
        }
      }
    }
    if (c.order.d && !c.sd && !G.cups.some(k => k.state !== 'empty')) return at(`${c.name} wants zobo. Tap the zobo to fill a bottle.`, G.jug);
  }
  return null;
}
function showHint() {
  const h = $('#hint'), ptr = $('#pointer');
  if (G.kitchen) { h.classList.remove('show'); ptr.style.display = 'none'; return; }
  const mode = S().hints;
  const always = mode === 'always' || (mode === 'auto' && G.mode === 'day' && typeof G.id === 'number' && G.id < 3);
  const step = mode === 'off' ? null : (always || G.idle > 4) ? nextStep() : null;
  if (!step) { h.classList.remove('show'); ptr.style.display = 'none'; return; }
  $('#hintText').textContent = step.t; h.classList.add('show');
  ptr.style.display = 'block'; ptr.style.left = (step.x - 20) + 'px'; ptr.style.top = (step.y + 10) + 'px';
}

/* =====================================================================
   END OF SHIFT: money report
   ===================================================================== */
function starsFor(p) { return p >= G.goal * STAR[2] ? 3 : p >= G.goal * STAR[1] ? 2 : p >= G.goal ? 1 : 0; }
function endLevel() {
  if (!G || !G.running) return;
  G.running = false;
  closeKitchen(); if (G.peak) endPeak();
  G.cash.forEach(k => { G.sales += k.price; G.tips += k.tip; k.el.remove(); }); G.cash = [];
  ['#hint', '#dark', '#genBtn', '#gasBtn'].forEach(s => $(s).classList.remove('show')); $('#pointer').style.display = 'none';
  const rush = G.mode === 'rush', id = G.id, pr = profit();
  const st = rush ? 0 : starsFor(pr);
  const evening = st > 0 ? Math.round(Math.max(0, pr) * EVENING_SHARE * st / 50) * 50 : 0;
  save.wallet += G.sales + G.tips - G.cashCost + evening;
  let repaid = 0;
  if (save.debt > 0 && save.wallet > 0) { repaid = Math.min(save.debt, Math.max(0, Math.round((pr + evening) * 0.5)), save.wallet); save.wallet -= repaid; save.debt -= repaid; }
  const billsPaid = [];
  billDue().forEach(b => { if (save.wallet >= b.amt) { save.wallet -= b.amt; save.paid[b.id] = true; billsPaid.push(b); } });
  save.stats.served += G.served; save.stats.days++;
  bump('earned', G.sales + G.tips);
  if (G.lost === 0 && G.served >= 5) bump('perfectDays');
  if (st === 3) bump('threeStars');
  if (rush) { bump('rushPlays'); save.rushHistory.push({ score: pr, at: Date.now() }); save.rushHistory = save.rushHistory.slice(-50); }
  const wages = Object.keys(HELPERS).filter(hired).reduce((a, k) => a + wageOf(k), 0);
  save.wallet -= wages;
  ambienceStop();
  const newAch = checkAchievements();
  let newBest = false;
  if (rush) { newBest = pr > save.rushBest; if (newBest) save.rushBest = pr; }
  else {
    if (st > (save.stars[id] || 0)) save.stars[id] = st;
    if (st > 0) save.unlocked = Math.max(save.unlocked, Math.min(LEVELS.length, id + 2));
  }
  persist(); cloudAuto();
  const ex = G.exp, row = (l, v, cls = '') => `<tr class="${cls}"><td>${l}</td><td class="n ${v < 0 ? 'neg' : 'pos'}">${v < 0 ? '' : '+'}${naira(v)}</td></tr>`;
  let rows = `<tr><td colspan="2"><b>Today's profit</b></td></tr>`;
  rows += row('Food sales (menu prices)', G.sales);
  if (G.tips) rows += row('Tips from happy customers', G.tips);
  if (ex.food) rows += row('Cost of the food you served', -ex.food);
  if (ex.fuel) rows += row('Petrol for the generator', -ex.fuel);
  if (ex.supplies) rows += row('Dish soap', -ex.supplies);
  rows += row('<b>Your profit</b>', pr, 'tot');
  rows += `<tr><td colspan="2"><b>🏦 Buka account</b></td></tr>`;
  rows += `<tr><td>Start of the day</td><td class="n">${naira(G.wallet0)}</td></tr>`;
  rows += row('Money into the till', G.sales + G.tips);
  if (G.repaidOwed) rows += row('Customers who paid what they owed', G.repaidOwed);
  rows += row('Money spent at the market, on gas and petrol', -G.cashCost);
  if (G.potBuy) rows += `<tr><td colspan="2" class="note">🍲 Includes ${naira(G.potBuy)} of ingredients for new pots (${G.cooked.map(k => RECIPES[k].n).join(', ')}). They will feed customers for days.</td></tr>`;
  if (G.gasBuy) rows += `<tr><td colspan="2" class="note">🔥 Includes ${naira(G.gasBuy)} for a new gas cylinder (it lasts many days).</td></tr>`;
  if (G.creditTaken) rows += `<tr><td colspan="2" class="note">📒 ${naira(G.creditTaken)} was bought on credit from Iya Bose (not paid yet).</td></tr>`;
  if (evening) rows += row(`Mama's evening sales (${'★'.repeat(st)}: +50% of your profit per star)`, evening);
  if (wages) rows += row("Helpers' wages (" + Object.keys(HELPERS).filter(hired).map(k => HELPERS[k].n).join(', ') + ')', -wages);
  if (repaid) rows += row('Paid back to Iya Bose', -repaid);
  newAch.forEach(a => { rows += row('🏆 ' + esc(a.n), a.r); });
  billsPaid.forEach(b => { rows += row('Paid: ' + esc(b.n), -b.amt); });
  rows += `<tr class="tot"><td>🏦 Buka account now</td><td class="n ${save.wallet < 0 ? 'neg' : ''}">${naira(save.wallet)}</td></tr>`;
  if (save.debt > 0) rows += `<tr><td>📒 Still owed to Iya Bose</td><td class="n neg">${naira(save.debt)}</td></tr>`;
  billDue().forEach(b => { rows += `<tr><td>💰 Due: ${esc(b.n)} (before Day ${b.dueBefore})</td><td class="n neg">${naira(b.amt)}</td></tr>`; });
  if (rush) {
    modal(`<h2>🔥 Rush Hour over!</h2>
      <div class="row"><button class="small" data-a="map">🗺 Days</button><button class="small" data-a="board">🏅 Leaderboard</button><button class="big" data-a="again">↻ Again</button></div>
      <p class="note">Served ${G.served} · Walked away ${G.lost}${newBest ? ' · 🏆 NEW BEST!' : ''}</p>
      <p class="note" id="lbStatus">${LB() ? (S().playerName ? 'Sending your score to the leaderboard…' : 'Set a player name in Settings to join the online leaderboard.') : ''}</p>
      <div class="scroll"><table class="acct">${rows}</table></div>`,
      { map: openMap, again: () => startLevel('rush'), board: () => openLeaderboard(openMap) }, true);
    if (LB() && S().playerName && save.consent) lbSubmit(pr).then(ok => { const e = $('#lbStatus'); if (e) e.textContent = ok ? '🏅 Score sent to the online leaderboard!' : 'Could not send the score.'; }).catch(() => { const e = $('#lbStatus'); if (e) e.textContent = 'Could not reach the leaderboard.'; });
    return;
  }
  const win = st > 0, last = id === LEVELS.length - 1;
  const nextLock = !last ? lockedByBill(id + 1) : null;
  modal(`
    <h2>${win ? 'Day complete!' : 'Day over'}</h2>
    <div class="stars">${[1, 2, 3].map(n => `<span class="${n <= st ? 'on' : ''}">★</span>`).join('')}</div>
    <div class="row">
      <button class="small" data-a="map">🗺 Days</button>
      <button class="small" data-a="retry">↻ Retry</button>
      ${win && !last && !nextLock ? '<button class="big" data-a="next">Next day ▶</button>' : ''}
      ${win && nextLock ? '<button class="big bank" data-a="bank">🏦 Pay bill</button>' : ''}
      ${win && last && !save.ending ? '<button class="big" data-a="ending">Finish ▶</button>' : ''}
    </div>
    <p class="note">Served ${G.served} · Walked away ${G.lost} · Profit goal ${naira(G.goal)}</p>
    ${win ? '' : '<p class="note">Make the profit goal to unlock the next day. Serve faster, waste less, or try the upgrades.</p>'}
    ${win && id + 2 === RUSH.unlockAfterDay + 1 ? '<p class="note">🔥 Rush Hour mode unlocked!</p>' : ''}
    ${nextLock && win ? `<p class="note">💰 Day ${id + 2} opens when ${esc(nextLock.n)} (${naira(nextLock.amt)}) is paid. Pay it on the Account &amp; market screen.</p>` : ''}
    <div class="scroll"><table class="acct">${rows}</table></div>`, {
    map: openMap, retry: () => openIntro(id), next: () => openIntro(id + 1), bank: () => openBank(openMap),
    ending: () => runDialog(DATA.ENDING, () => { save.ending = true; persist(); openMap(); }),
  }, true);
  if (win) setTimeout(SFX.serve, 200);
}

/* =====================================================================
   SCREENS
   ===================================================================== */
function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('show', s.id === id)); }
function modal(html, actions, wide) {
  const b = $('#modalBox'); b.innerHTML = html; b.classList.toggle('wide', !!wide);
  b.querySelectorAll('[data-a]').forEach(x => onTap(x, () => { SFX.tap(); const f = actions[x.dataset.a]; if (f) f(x); }));
  showScreen('scrModal');
}
function openTitle() { G = null; closeKitchen(); ambienceStop(); showScreen('scrTitle'); if (!firstRunNotice()) dailyCheck(); }
function openMap() {
  G = null; closeKitchen(); ambienceStop();
  $('#mapWallet').textContent = '🏦 ' + naira(save.wallet);
  const g = $('#levelGrid'); g.innerHTML = '';
  let lastVenue = null, current = null;
  LEVELS.forEach((L, i) => {
    if (L.venue !== lastVenue) {
      lastVenue = L.venue;
      let end = i; while (end + 1 < LEVELS.length && LEVELS[end + 1].venue === L.venue) end++;
      mk('div', 'mapHead', g).textContent = `${VENUE_NAME[L.venue] || L.venue} · Days ${i + 1}–${end + 1}`;
    }
    const locked = i + 1 > save.unlocked, bill = !locked && lockedByBill(i), s = save.stars[i] || 0;
    const e = mk('div', 'lvl' + (locked || bill ? ' lock' : ''), g);
    e.innerHTML = `<div class="n">${locked ? '🔒' : bill ? '💰' : i + 1}</div><div class="t">${esc(bill ? 'Pay ' + bill.n : L.name)}</div><div class="s">${[1, 2, 3].map(n => `<span class="${n <= s ? 'on' : ''}">★</span>`).join('')}</div>${L.chapter ? `<div class="v">📖 Chapter ${L.chapter}</div>` : ''}`;
    if (bill) onTap(e, () => { SFX.tap(); openBank(openMap); });
    else if (!locked) onTap(e, () => { SFX.tap(); openIntro(i); });
    if (i + 1 === save.unlocked) current = e;
  });
  showScreen('scrMap');
  if (current) setTimeout(() => { g.scrollTop = Math.max(0, current.offsetTop - g.offsetTop - 160); }, 30);
}
function openShop() {
  $('#shopWallet').textContent = '🏦 ' + naira(save.wallet);
  const g = $('#shopGrid'); g.innerHTML = '';
  SHOP.forEach(it => {
    const own = !!save.up[it.k];
    const e = mk('div', 'item' + (own ? ' owned' : ''), g);
    e.innerHTML = `<img src="${IMG + it.img}" alt=""><div><h3>${it.n}</h3><p>${it.d}</p></div>`;
    const b = mk('button', own ? 'small' : 'big', e.lastChild);
    b.textContent = own ? '✔ Owned' : naira(it.c);
    if (!own && save.wallet < it.c) b.disabled = true;
    if (!own) onTap(b, () => {
      if (save.wallet < it.c) { SFX.bad(); return; }
      save.wallet -= it.c; save.up[it.k] = true; persist(); SFX.till(); openShop();
    });
  });
  showScreen('scrShop');
}
function openBank(back) {
  back = back || openMap;
  const due = billDue(), cm = costMult();
  const acts = { back };
  let html = `<h2>🏦 Account &amp; market</h2><div class="scroll">
    <table class="acct">
      <tr><td>Buka account balance</td><td class="n ${save.wallet < 0 ? 'neg' : ''}">${naira(save.wallet)}</td></tr>
      <tr><td>📒 Owed to Iya Bose (market credit)</td><td class="n ${save.debt ? 'neg' : ''}">${naira(save.debt)}</td></tr>
      <tr><td>Credit limit at your size of buka</td><td class="n">${naira(creditLimit())}</td></tr>
      ${save.owed.length ? `<tr><td>Customers who owe Mama (${save.owed.map(o => esc(o.name)).join(', ')})</td><td class="n">${naira(save.owed.reduce((a, o) => a + o.amt, 0))}</td></tr>` : ''}
    </table>`;
  if (save.debt > 0) {
    html += `<div class="row"><button class="small" data-a="r10">Repay ₦10,000</button><button class="big" data-a="rall">Repay all</button></div>`;
    acts.r10 = () => repay(10000, back); acts.rall = () => repay(save.debt, back);
  }
  html += `<h3>💰 Bills</h3>`;
  if (!due.length) html += `<p class="note">No bills due. 🎉</p>`;
  due.forEach((b, k) => {
    html += `<table class="acct"><tr><td>${esc(b.n)} · before Day ${b.dueBefore}</td><td class="n neg">${naira(b.amt)}</td></tr></table>`;
    if (save.wallet >= b.amt) { html += `<div class="row"><button class="big" data-a="pay${k}">Pay ${naira(b.amt)}</button></div>`; acts['pay' + k] = () => { save.wallet -= b.amt; save.paid[b.id] = true; persist(); SFX.till(); toast('✅ ' + b.n + ' paid!'); openBank(back); }; }
    else html += `<p class="note">You need ${naira(b.amt - save.wallet)} more. Play days or Rush Hour to earn it.</p>`;
  });
  html += `<h3>🍽 Menu prices</h3><div class="row">`;
  PRICE_LEVELS.forEach((P, k) => {
    const lock = k > save.priceMax;
    html += `<button class="${k === save.priceLvl ? 'big' : 'small'}" data-a="pl${k}" ${lock ? 'disabled' : ''}>${lock ? '🔒 ' : ''}${P.n}</button>`;
    acts['pl' + k] = () => { if (lock) return; save.priceLvl = k; persist(); openBank(back); };
  });
  html += `</div><p class="note">${PRICE_LEVELS[save.priceLvl].d}${save.priceMax < 2 ? ' Higher prices unlock when Mama moves to a bigger buka.' : ''}</p>
    <table class="acct">${Object.keys(FOOD).map(k => `<tr><td>${FOOD[k].n}</td><td class="n">${naira(itemPrice(k))}</td></tr>`).join('')}</table>
    <h3>🍲 In the pots (portions left)</h3>
    <table class="acct">${POT_ORDER.filter(k => save.stock[k]).map(k => `<tr><td>${RECIPES[k].n}</td><td class="n">${save.stock[k].n} of ${potCap(k)}</td></tr>`).join('') || '<tr><td>Nothing cooked yet</td><td></td></tr>'}</table>
    <h3>🧺 Market prices (what Mama pays)</h3>
    <table class="acct">
      ${POT_ORDER.map(k => `<tr><td>A full pot of ${RECIPES[k].n.toLowerCase()} (${potCap(k)} portions)</td><td class="n">${naira(COST[k] * potCap(k) * cm)}</td></tr>`).join('')}
      ${SIDES.concat(['dodo', 'akara', 'zobo']).map(k => `<tr><td>${FOOD[k].n}, per portion</td><td class="n">${naira(COST[k] * cm)}</td></tr>`).join('')}
      <tr><td>Petrol for the generator (3 litres)</td><td class="n">${naira(fuelCost())}</td></tr>
      <tr><td>Cooking gas refill (12.5kg)</td><td class="n">${naira(COST.gas)}</td></tr>
      <tr><td>Dish soap</td><td class="n">${naira(COST.soap)}</td></tr>
    </table></div>
    <div class="row"><button class="big" data-a="back">◀ Done</button></div>`;
  modal(html, acts, true);
}
function repay(amt, back) {
  const pay = Math.min(amt, save.debt, Math.max(0, save.wallet));
  if (pay <= 0) { SFX.bad(); toast('Not enough money in the account to repay.'); return; }
  save.wallet -= pay; save.debt -= pay; persist(); SFX.till(); toast('Paid ' + naira(pay) + ' to Iya Bose'); openBank(back);
}
function introModal(id) {
  const L = levelById(id), isStory = typeof id === 'number';
  const menu = L.menu.map(k => `${FOOD[k].n} ${naira(itemPrice(k))}`).join(' · ');
  const notes = [];
  if (isStory && id === 0) notes.push('👉 Tap the jollof pot to dish rice onto a plate, add beef, then tap the plate to serve. Tap the naira notes to put them in the till.');
  const firstOf = k => isStory && L.menu.includes(k) && (id === 0 || !LEVELS[id - 1].menu.includes(k));
  if (firstOf('zobo')) notes.push('👉 Zobo: tap the zobo to fill a bottle, then tap the bottle to serve it.');
  if (firstOf('dodo')) notes.push('👉 Dodo: tap the plantain to fry, and take it out when golden before it burns.');
  if (firstOf('akara')) notes.push('👉 Akara: tap the akara batter to fry it in a free pan.');
  if (firstOf('egg') || firstOf('fish') || firstOf('ponmo')) notes.push('👉 New side on the menu! Tap its bowl to add it to a plate.');
  const pots = POT_ORDER.filter(k => L.menu.includes(k)).map(k => `${RECIPES[k].n} ${stockOf(k).n}`).join(' · ');
  if (pots) notes.push('🍲 In the pots: ' + pots + ' portions. Empty pots must be cooked in the kitchen (the day clock pauses while you cook).');
  if (L.rush) notes.push('🔥 Rush hour is expected today: lots of customers at once.');
  if ((L.events || []).includes('power')) notes.push('⚡ The light has been shaking. NEPA may take light!');
  if ((L.events || []).includes('gas')) notes.push('🔥 The gas cylinder is almost empty…');
  if ((L.events || []).includes('wash')) notes.push('🍽 Busy day: the clean plates may run out.');
  if (L.critic) notes.push('👑 Oga Critic ' + (L.critic === 'finale' ? 'is coming today!' : 'may visit. He tips big.'));
  billDue().forEach(b => notes.push(`💰 ${esc(b.n)}: ${naira(b.amt)} due before Day ${b.dueBefore}.`));
  modal(`
    <div class="who"><img src="${IMG}mama.png" alt=""><div>
      <h2>${isStory ? 'Day ' + (id + 1) + ': ' : ''}${esc(L.name)}</h2>
      <p class="note">${VENUE_NAME[L.venue] || ''} · ${L.time} seconds</p>
    </div></div>
    <p>🎯 Profit goal <b>${naira(Math.round(L.goal * (DIFF[S().difficulty] || DIFF.normal).goal / 100) * 100)}</b> · ★★ ×1.35 · ★★★ ×1.7</p>
    <p class="note">🍽 ${menu}</p>
    <div class="scroll">${notes.map(n => `<p class="note">${n}</p>`).join('')}</div>
    <div class="row"><button class="small" data-a="back">◀ Days</button><button class="big" data-a="go">Start ▶</button></div>`,
    { back: openMap, go: () => startDay(id) }, true);
}
function startDay(id) {
  // customers who owed Mama come back (or not)
  const today = id + 1, msgs = [];
  let paidBack = 0;
  save.owed = save.owed.filter(o => {
    if (today < o.due) return true;
    if (o.honest) { save.wallet += o.amt; paidBack += o.amt; msgs.push(`🙏 ${o.name} came back and paid the ${naira(o.amt)} they owed!`); return false; }
    if (today >= o.due + 4) { msgs.push(`😞 ${o.name} never came back to pay the ${naira(o.amt)}.`); return false; }
    return true;
  });
  persist();
  startLevel(id);
  if (G) { G.repaidOwed = paidBack; G.wallet0 -= paidBack; }
  msgs.forEach((m, k) => setTimeout(() => toast(m), 600 + k * 2200));
}
function openIntro(id) {
  const L = levelById(id); if (!L) return;
  const chain = [];
  if (typeof id === 'number' && L.chapter && !save.seenCh[L.chapter]) chain.push(next => playChapter(L.chapter, id + 1, next));
  Object.keys(DISH_INTRO).forEach(k => { if (L.menu.includes(k) && !save.introduced[k]) chain.push(next => { save.introduced[k] = true; persist(); runDialog(DISH_INTRO[k], next); }); });
  const run = () => { const f = chain.shift(); if (f) f(run); else introModal(id); };
  run();
}
function playChapter(ch, day, done) {
  const C = CHAPTERS[ch]; if (!C) { done(); return; }
  save.seenCh[ch] = true;
  if (C.bill && !save.paid[C.bill.id] && !save.bills.find(b => b.id === C.bill.id)) save.bills.push(Object.assign({}, C.bill));
  if (C.unlockPrice) save.priceMax = Math.max(save.priceMax, C.unlockPrice);
  if (C.wipeStock) POT_ORDER.forEach(k => { if (save.stock[k]) save.stock[k].n = 0; });
  if (C.flag) save.flags[C.flag] = true;
  persist();
  DLG_DAY = day;
  runDialog([['title', 'Chapter ' + ch, C.title]].concat(C.lines), done);
}
function openRush() {
  if (save.unlocked <= RUSH.unlockAfterDay) { SFX.bad(); modal(`<h2>🔥 Rush Hour</h2><p>Finish Day ${RUSH.unlockAfterDay} to unlock Rush Hour mode.</p><div class="row"><button class="big" data-a="ok">OK</button></div>`, { ok: openMap }); return; }
  modal(`
    <div class="who"><img src="${IMG}mama.png" alt=""><div>
      <h2>🔥 Rush Hour</h2>
      <p>Lunch break at the motor park! Customers keep coming nonstop for ${RUSH.time} seconds. ${RUSH.hearts} customers walk away and the rush is over. The profit goes into the buka account.</p>
    </div></div>
    <p>Best profit so far: <b>${naira(save.rushBest)}</b></p>
    <div class="row"><button class="small" data-a="back">◀ Back</button><button class="small" data-a="board">🏅 Leaderboard</button><button class="big rush" data-a="go">Start rush ▶</button></div>`,
    { back: openMap, go: () => startLevel('rush'), board: () => openLeaderboard(openRush) });
}
/* ---------------- story dialogue with choices ----------------
   A line is ['mama' | 'tobi' | 'landlord' | 'critic' | ..., text]
   ['title', 'Chapter 5', 'Landlord wahala']
   ['choice', 'question', [ { t: 'button text', money: -20000, bill: { n, amt, days }, flag: 'name', debt: 5000, reply: [lines] }, … ]]
   ['if', 'flag', [lines]]   ['ifnot', 'flag', [lines]]   shown only when a flag was (not) set by an earlier choice */
let dialogNext = null, dialogSkip = null, DLG_DAY = 1;
function applyChoice(o) {
  if (o.money) {
    if (o.money > 0 || save.wallet + o.money >= 0) { save.wallet += o.money; toast((o.money > 0 ? '+' : '−') + naira(Math.abs(o.money)) + (o.money > 0 ? ' into the account' : ' from the account')); }
    else save.bills.push({ id: 'b' + Date.now(), n: o.label || 'Story expense', amt: -o.money, dueBefore: DLG_DAY + 3 });
  }
  if (o.bill) save.bills.push({ id: 'b' + Date.now() + Math.random(), n: o.bill.n, amt: o.bill.amt, dueBefore: DLG_DAY + (o.bill.days || 3) });
  if (o.debt) save.debt += o.debt;
  if (o.flag) save.flags[o.flag] = true;
  if (o.flag === 'ngozi' && !save.helpers.washer) save.helpers.washer = { lvl: 1 };
  if (o.unflag) delete save.flags[o.unflag];
  if (o.priceLvl !== undefined) save.priceLvl = Math.min(o.priceLvl, save.priceMax);
  persist();
}
function runDialog(lines, done) {
  const seq = lines.slice(); let k = 0;
  const box2 = $('#dlgBox');
  let choices = $('#dlgChoices');
  if (!choices) { choices = mk('div', 'row', box2); choices.id = 'dlgChoices'; }
  const show = () => {
    while (k < seq.length && (seq[k][0] === 'if' || seq[k][0] === 'ifnot')) {
      const l = seq[k], on = !!save.flags[l[1]], pass = l[0] === 'if' ? on : !on;
      seq.splice(k, 1, ...(pass ? l[2] : []));
    }
    if (k >= seq.length) { dialogNext = null; done(); return; }
    const l = seq[k];
    choices.innerHTML = ''; $('#dlgNext').style.display = '';
    if (l[0] === 'title') {
      box2.classList.add('title'); $('#dlgPic').classList.add('hide');
      $('#dlgChapter').textContent = l[1]; $('#dlgText').textContent = l[2];
    } else if (l[0] === 'choice') {
      box2.classList.remove('title'); $('#dlgPic').classList.remove('hide'); $('#dlgPic').src = IMG + WHO.mama.img;
      $('#dlgName').textContent = 'What should Mama do?'; $('#dlgText').textContent = l[1];
      $('#dlgNext').style.display = 'none';
      l[2].forEach(o => { const b = mk('button', 'big choice', choices); b.textContent = o.t; onTap(b, () => { SFX.tap(); applyChoice(o); seq.splice(k + 1, 0, ...(o.reply || [])); k++; show(); }); });
    } else {
      const w = WHO[l[0]] || WHO.mama;
      box2.classList.remove('title'); $('#dlgPic').classList.remove('hide');
      $('#dlgPic').src = IMG + w.img; $('#dlgName').textContent = w.n; $('#dlgText').textContent = l[1];
    }
  };
  dialogNext = () => { k++; show(); };
  dialogSkip = () => {   // skipping still asks every choice
    while (k < seq.length && seq[k][0] !== 'choice') { k++; while (k < seq.length && (seq[k][0] === 'if' || seq[k][0] === 'ifnot')) { const l = seq[k], on = !!save.flags[l[1]]; seq.splice(k, 1, ...((l[0] === 'if' ? on : !on) ? l[2] : [])); } }
    show();
  };
  show(); showScreen('scrDialog');
}
function pause(on) {
  if (!G || !G.running) return;
  G.paused = on;
  if (on) ambienceStop(); else ambienceStart(G.L.venue);
  if (on) modal(`<h2>Paused</h2><p>${G.mode === 'rush' ? 'Rush Hour' : esc(G.L.name)}</p>
    <div class="row"><button class="small" data-a="map">🗺 Days</button><button class="small" data-a="retry">↻ Restart</button><button class="small" data-a="set">⚙ Settings</button><button class="big" data-a="go">Resume ▶</button></div>`,
    { map: openMap, retry: () => startLevel(G.id), set: () => openSettings(() => pause(true)), go: () => pause(false) });
  else showScreen(null);
}

/* =====================================================================
   REAL SOUND FILES + STREET AMBIENCE
   Drop recordings into assets/audio/ with these names (.mp3 or .ogg). Any missing file
   falls back to the built-in generated sound, so the game always has sound.
   ===================================================================== */
const AUDIO_FILES = {
  music: 'afrobeats-loop', tap: 'tap', ding: 'ding', till: 'cash-register', sizzle: 'sizzle', chop: 'chop', scrub: 'scrub', splash: 'water-splash',
  bad: 'wrong', grumble: 'grumble', serve: 'serve', star: 'star', rush: 'rush-hour', powerOff: 'power-off', sputter: 'generator-sputter',
  engine: 'generator-start', traffic: 'amb-traffic', market: 'amb-market', restaurant: 'amb-restaurant', rain: 'amb-rain',
  horn: 'car-horn', danfo: 'danfo-horn', okada: 'okada-pass', conductor: 'conductor-calls',
};
const AUD = {};
const AUDIO_DIR = 'assets/audio/';
function loadAudioFiles() {
  Object.keys(AUDIO_FILES).forEach(k => {
    const tryExt = exts => {
      if (!exts.length) return;
      const a = new Audio(); a.preload = 'auto';
      a.addEventListener('canplaythrough', () => { if (!AUD[k]) AUD[k] = a; }, { once: true });
      a.addEventListener('error', () => tryExt(exts.slice(1)), { once: true });
      a.src = AUDIO_DIR + AUDIO_FILES[k] + exts[0];
    };
    try { tryExt(['.mp3', '.ogg']); } catch (e) { /* no audio support */ }
  });
}
function playFile(k, vol = 1) {
  const a = AUD[k]; if (!a) return false;
  try { const c = a.cloneNode(); c.volume = Math.max(0, Math.min(1, vol * S().sfx)); c.play().catch(() => {}); } catch (e) { return false; }
  return true;
}
// Use a recording when there is one; otherwise the generated sound.
Object.keys(SFX).forEach(k => { const gen = SFX[k]; SFX[k] = () => { if (!playFile(k)) gen(); }; });

/* ---------------- street ambience: traffic, horns, okada, conductor, crowd ---------------- */
const AMB = { on: false, nodes: [], timers: [], loops: [] };
const CONDUCTOR_LINES = ['Oshodi! Oshodi! Oshodi!', 'Obalende, CMS! Enter with your change o!', 'Ojota, Ojota! Enter quick quick!', 'Yaba, Yaba! One more chance!', 'Ikeja along! Enter, enter!'];
function ambVol() { return (S().amb === undefined ? 0.5 : S().amb); }
function ambienceStart(venue) {
  ambienceStop();
  if (!(ambVol() > 0) || document.hidden) return;
  const a = audio(); AMB.on = true;
  const street = venue === 'stall' ? 1 : venue === 'buka' ? 0.55 : 0.3;      // inside the big buka, the road is far away
  const bed = venue === 'stall' ? 'traffic' : 'restaurant';
  if (AUD[bed] || AUD.traffic) {
    const f = (AUD[bed] || AUD.traffic).cloneNode(); f.loop = true; f.volume = Math.min(1, ambVol() * (bed === 'traffic' ? 0.6 : 0.5)); f.play().catch(() => {}); AMB.loops.push(f);
    if (venue !== 'stall' && AUD.traffic) { const t = AUD.traffic.cloneNode(); t.loop = true; t.volume = Math.min(1, ambVol() * 0.25 * street); t.play().catch(() => {}); AMB.loops.push(t); }
  } else if (a) {
    // generated: traffic rumble (low noise) + crowd murmur (mid noise), slowly breathing
    const mk = (fType, freq, q, v) => {
      const len = a.sampleRate * 2, b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const s = a.createBufferSource(); s.buffer = b; s.loop = true;
      const f = a.createBiquadFilter(); f.type = fType; f.frequency.value = freq; f.Q.value = q;
      const g = a.createGain(); g.gain.value = v * ambVol();
      const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 0.07 + Math.random() * 0.1; lg.gain.value = v * ambVol() * 0.5;
      lfo.connect(lg); lg.connect(g.gain); s.connect(f); f.connect(g); g.connect(a.destination); s.start(); lfo.start();
      AMB.nodes.push(s, lfo, g);
    };
    mk('lowpass', 220, 0.7, 0.05 * street);
    mk('bandpass', 700, 0.6, venue === 'stall' ? 0.012 : 0.03);
  }
  const every = (min, max, fn) => { const go = () => { if (!AMB.on) return; fn(); AMB.timers.push(setTimeout(go, rand(min, max) * 1000)); }; AMB.timers.push(setTimeout(go, rand(min, max) * 1000)); };
  every(5, 12, () => ambHorn(street));
  every(9, 18, () => ambOkada(street));
  if (venue !== 'bigbuka') every(16, 30, () => ambConductor(street));
}
function ambienceStop() {
  AMB.on = false;
  AMB.timers.forEach(clearTimeout); AMB.timers = [];
  AMB.nodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) { /* ignore */ } }); AMB.nodes = [];
  AMB.loops.forEach(l => { try { l.pause(); } catch (e) { /* ignore */ } }); AMB.loops = [];
  if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
}
function ambHorn(street) {
  if (G && G.paused) return;
  const danfo = Math.random() < 0.5;
  if (playFile(danfo ? 'danfo' : 'horn', ambVol() * street * 0.7)) return;
  const a = audio(); if (!a) return;
  const v = 0.05 * ambVol() * street, base = danfo ? 330 : 440, n = danfo ? 2 : 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < n; i++) { tone(base, 0.22, 'square', v, i * 0.28, 0, a.destination); tone(base * 1.26, 0.22, 'square', v * 0.8, i * 0.28, 0, a.destination); }
}
function ambOkada(street) {
  if (G && G.paused) return;
  if (playFile('okada', ambVol() * street * 0.6)) return;
  const a = audio(); if (!a) return;
  const t = a.currentTime, o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
  o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(130, t + 1.2); o.frequency.linearRampToValueAtTime(90, t + 2.4);
  f.type = 'lowpass'; f.frequency.value = 600;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03 * ambVol() * street, t + 1.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
  o.connect(f); f.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 2.5);
}
function ambConductor(street) {
  if (G && G.paused) return;
  if (playFile('conductor', ambVol() * street)) return;
  if (!S().conductor || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
  try {
    const u = new SpeechSynthesisUtterance(pick(CONDUCTOR_LINES));
    const voices = speechSynthesis.getVoices();
    u.voice = voices.find(v => /en[-_]NG/i.test(v.lang)) || voices.find(v => /en[-_](GB|ZA|KE|GH)/i.test(v.lang)) || null;
    u.rate = 1.15; u.pitch = 0.9; u.volume = Math.min(1, ambVol() * street * 0.8);
    speechSynthesis.speak(u);
  } catch (e) { /* speech not available */ }
}
// music: the recorded loop if present, otherwise the generated beat
const _musicStart = musicStart, _musicStop = musicStop;
musicStart = function () {
  if (AUD.music) {
    if (!(S().music > 0) || document.hidden) return;
    if (!MUS.file) { MUS.file = AUD.music.cloneNode(); MUS.file.loop = true; }
    MUS.file.volume = Math.min(1, S().music * 0.6); MUS.file.play().catch(() => {});
    return;
  }
  _musicStart();
};
musicStop = function () { if (MUS.file) MUS.file.pause(); _musicStop(); };
musicVolume = function () { if (MUS.file) MUS.file.volume = Math.min(1, S().music * 0.6); if (MUS.gain) MUS.gain.gain.value = S().music * 0.35; if (!(S().music > 0)) musicStop(); else musicStart(); };
document.addEventListener('visibilitychange', () => { if (document.hidden) ambienceStop(); });
loadAudioFiles();

/* =====================================================================
   ACHIEVEMENTS AND DAILY REWARDS
   ===================================================================== */
const ACH = [
  { id: 'served10',   n: 'First customers',        d: 'Serve 10 plates',                    stat: 'served',      goal: 10,      r: 2000 },
  { id: 'served100',  n: 'Busy hands',             d: 'Serve 100 plates',                   stat: 'served',      goal: 100,     r: 5000 },
  { id: 'served1000', n: 'Mama Put legend',        d: 'Serve 1,000 plates',                 stat: 'served',      goal: 1000,    r: 25000 },
  { id: 'served5000', n: 'Feeding the city',       d: 'Serve 5,000 plates',                 stat: 'served',      goal: 5000,    r: 100000 },
  { id: 'party1',     n: 'Party jollof!',          d: 'Cook 1 perfect pot of jollof',       stat: 'partyJollof', goal: 1,       r: 3000 },
  { id: 'party10',    n: 'Jollof champion',        d: 'Cook 10 perfect pots of jollof',     stat: 'partyJollof', goal: 10,      r: 20000 },
  { id: 'cook25',     n: 'Pot master',             d: 'Cook 25 pots of anything',           stat: 'cooks',       goal: 25,      r: 15000 },
  { id: 'perfect10',  n: "Chef's kiss",            d: 'Cook 10 perfect pots (3 stars)',     stat: 'perfectCooks', goal: 10,     r: 15000 },
  { id: 'gen10',      n: 'NEPA no fit stop me',    d: 'Start the generator 10 times',       stat: 'gens',        goal: 10,      r: 10000 },
  { id: 'gas5',       n: 'Gas man',                d: 'Change the gas cylinder 5 times',    stat: 'gasChanges',  goal: 5,       r: 8000 },
  { id: 'wash20',     n: 'Sparkling plates',       d: 'Wash the plates 20 times',           stat: 'washes',      goal: 20,      r: 8000 },
  { id: 'noLost5',    n: 'Nobody waka comot',      d: '5 days without losing a customer',   stat: 'perfectDays', goal: 5,       r: 15000 },
  { id: 'stars10',    n: 'Three-star buka',        d: 'Get 3 stars on 10 days',             stat: 'threeStars',  goal: 10,      r: 20000 },
  { id: 'stars50',    n: 'Five-star reputation',   d: 'Get 3 stars on 50 days',             stat: 'threeStars',  goal: 50,      r: 100000 },
  { id: 'earn1m',     n: 'Millionaire',            d: 'Earn ₦1,000,000 in sales and tips',  stat: 'earned',      goal: 1000000, r: 50000 },
  { id: 'earn10m',    n: 'Food tycoon',            d: 'Earn ₦10,000,000 in sales and tips', stat: 'earned',      goal: 10000000, r: 250000 },
  { id: 'kind5',      n: 'Big heart',              d: 'Let 5 customers eat now and pay later', stat: 'owesGiven', goal: 5,      r: 5000 },
  { id: 'rush5',      n: 'Rush hour regular',      d: 'Play Rush Hour 5 times',             stat: 'rushPlays',   goal: 5,       r: 10000 },
  { id: 'decor5',     n: 'Interior designer',      d: 'Own 5 decorations',                  stat: 'decorOwned',  goal: 5,       r: 10000 },
  { id: 'team3',      n: 'Team Mama Put',          d: 'Hire all 3 helpers',                 stat: 'helpersHired', goal: 3,      r: 20000 },
  { id: 'story28',    n: 'The whole story',        d: 'See all 28 story chapters',          stat: 'chapters',    goal: 28,      r: 100000 },
];
const DAILY = [2000, 3000, 5000, 7000, 10000, 15000, 25000];
function stat(k) {
  if (k === 'decorOwned') return Object.keys(save.decor.owned).length;
  if (k === 'helpersHired') return Object.keys(save.helpers).length;
  if (k === 'chapters') return Object.keys(save.seenCh).length;
  return save.stats[k] || 0;
}
function bump(k, n = 1) { save.stats[k] = (save.stats[k] || 0) + n; }
function checkAchievements() {
  const got = [];
  ACH.forEach(a => { if (!save.ach[a.id] && stat(a.stat) >= a.goal) { save.ach[a.id] = Date.now(); save.wallet += a.r; got.push(a); } });
  if (got.length) {
    persist(); SFX.star();
    got.forEach((a, k) => setTimeout(() => toast(`🏆 Achievement: ${a.n}! +${naira(a.r)}`), 300 + k * 2200));
  }
  return got;
}
const dayKey = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function dailyCheck(then) {
  const today = dayKey(new Date());
  if (save.daily.last === today) { if (then) then(); return; }
  const y = new Date(); y.setDate(y.getDate() - 1);
  const streak = save.daily.last === dayKey(y) ? (save.daily.streak % 7) + 1 : 1;
  const amt = DAILY[streak - 1];
  modal(`<h2>🎁 Daily reward</h2>
    <p class="note">Come back every day. Day 7 pays the most!</p>
    <div class="daily">${DAILY.map((v, i) => `<div class="dd ${i + 1 < streak ? 'got' : i + 1 === streak ? 'now' : ''}"><b>Day ${i + 1}</b><span>${naira(v)}</span></div>`).join('')}</div>
    <div class="row"><button class="big" data-a="claim">Collect ${naira(amt)}</button></div>`,
    { claim: () => { save.daily = { last: today, streak }; save.wallet += amt; persist(); SFX.till(); toast(`🎁 +${naira(amt)} added to the buka account`); if (then) then(); else showScreen('scrTitle'); } }, true);
}
function openAchievements(back) {
  const rows = ACH.map(a => {
    const v = Math.min(stat(a.stat), a.goal), done = !!save.ach[a.id];
    return `<div class="ach ${done ? 'done' : ''}"><div class="ai">${done ? '🏆' : '🔒'}</div><div class="at"><b>${a.n}</b><span>${a.d} · reward ${naira(a.r)}</span>
      <div class="ab"><i style="width:${v / a.goal * 100}%"></i></div><small>${v.toLocaleString('en-US')} / ${a.goal.toLocaleString('en-US')}</small></div></div>`;
  }).join('');
  modal(`<h2>🏆 Achievements</h2><p class="note">${Object.keys(save.ach).length} of ${ACH.length} unlocked · Daily streak: day ${save.daily.streak || 0}</p>
    <div class="scroll achList">${rows}</div><div class="row"><button class="big" data-a="back">◀ Back</button></div>`, { back: back || openMap }, true);
}

/* =====================================================================
   DECORATE THE BUKA
   Each decoration makes customers a little happier: they wait longer and tip a bit more.
   ===================================================================== */
const DECOR = [
  { id: 'sign_wood',  slot: 'sign',   n: 'Wooden signboard',        c: 15000,  img: 'decor-sign.png', d: '"MAMA PUT" painted on the counter front.' },
  { id: 'sign_neon',  slot: 'sign',   n: 'Glowing neon signboard',  c: 60000,  img: 'decor-sign.png', d: 'Your name in bright lights. Needs the Buka.', need: 'buka' },
  { id: 'plant1',     slot: 'plantL', n: 'Snake plant in ankara pot', c: 8000, img: 'decor-plant1.png', d: 'Fresh green corner, left side.' },
  { id: 'plant2',     slot: 'plantR', n: 'Potted palm',             c: 12000,  img: 'decor-plant2.png', d: 'A little palm tree, right side.' },
  { id: 'chair_red',  slot: 'chairs', n: 'Red plastic chairs',      c: 20000,  img: 'decor-chair-plastic.png', d: 'Classic buka chairs at every table.', need: 'buka' },
  { id: 'chair_wood', slot: 'chairs', n: 'Wooden ankara chairs',    c: 60000,  img: 'decor-chair-wood.png', d: 'Soft cushioned chairs for VIP customers.', need: 'buka' },
  { id: 'paint_gold', slot: 'paint',  n: 'Paint: warm gold walls',  c: 25000,  img: 'decor-sign.png', d: 'A warm golden glow.', tint: 'rgba(255,190,60,.55)' },
  { id: 'paint_green',slot: 'paint',  n: 'Paint: Naija green walls', c: 25000, img: 'decor-sign.png', d: 'Green and proud.', tint: 'rgba(40,170,80,.5)' },
  { id: 'paint_blue', slot: 'paint',  n: 'Paint: cool blue walls',  c: 25000,  img: 'decor-sign.png', d: 'Calm and fresh.', tint: 'rgba(60,130,230,.5)' },
  { id: 'cloth_red',  slot: 'cloth',  n: 'Red ankara tablecloths',  c: 10000,  img: 'table.png', d: 'New tablecloths.', need: 'buka', hue: 140 },
  { id: 'cloth_green',slot: 'cloth',  n: 'Green ankara tablecloths', c: 10000, img: 'table.png', d: 'New tablecloths.', need: 'buka', hue: 250 },
  { id: 'lights',     slot: 'lights', n: 'Party string lights',     c: 18000,  img: 'decor-sign.png', d: 'Colourful bulbs across the room.' },
];
const VENUE_RANK = { stall: 0, buka: 1, bigbuka: 2 };
function decorOn() { return Object.values(save.decor.on).filter(Boolean).length; }
function comfort() { return Math.min(0.1, decorOn() * 0.017); }    // up to +10% patience and tips
function renderDecor(venue) {
  const play = $('#play'); let layer = $('#decorLayer');
  if (!layer) { layer = mk('div', '', play); layer.id = 'decorLayer'; play.insertBefore(layer, $('#custLayer')); }
  layer.innerHTML = '';
  let front = $('#decorFront'); if (!front) { front = mk('div', '', play); front.id = 'decorFront'; play.insertBefore(front, $('#stations')); }
  front.innerHTML = '';
  const on = save.decor.on, get = s => DECOR.find(d => d.id === on[s]);
  const paint = get('paint'); if (paint) mk('div', 'paint', layer, { background: `linear-gradient(${paint.tint}, ${paint.tint.replace(/[\d.]+\)$/, '0.15)')} 70%, transparent)` });
  const lights = get('lights'); if (lights) { const l = mk('div', 'lights', layer); for (let k = 0; k < 22; k++) mk('i', '', l, { left: (k * 4.6 + 1) + '%', background: ['#ff4d4d', '#ffd23f', '#3ad16b', '#4db3ff', '#ff7af0'][k % 5], animationDelay: (k % 5) * 0.2 + 's' }); }
  const pl = get('plantL'); if (pl) mk('img', 'plantL', layer).src = IMG + pl.img;
  const pr = get('plantR'); if (pr) mk('img', 'plantR', layer).src = IMG + pr.img;
  const ch = get('chairs');
  if (ch && venue !== 'stall') SLOTS.forEach(x => { [-1, 1].forEach(sd => { const c = mk('img', 'chair', layer, { left: (x + sd * 150 - 45) + 'px' }); c.src = IMG + ch.img; if (sd > 0) c.style.transform = 'scaleX(-1)'; }); });
  const cl = get('cloth'); document.querySelectorAll('#custLayer .table').forEach(t => { t.style.filter = cl ? `hue-rotate(${cl.hue}deg) drop-shadow(0 6px 6px rgba(0,0,0,.35))` : ''; });
  const sg = get('sign');
  if (sg) { const s = mk('div', 'sign' + (sg.id === 'sign_neon' ? ' neon' : ''), front); mk('img', '', s).src = IMG + 'decor-sign.png'; mk('b', '', s).textContent = 'MAMA PUT'; }
}
function openDecor(back) {
  back = back || openMap;
  const reach = VENUE_RANK[venueReached()], acts = { back };
  const rows = DECOR.map((d, k) => {
    const own = !!save.decor.owned[d.id], on = save.decor.on[d.slot] === d.id, locked = d.need && reach < VENUE_RANK[d.need];
    let btn;
    if (locked) btn = `<button class="small" disabled>🔒 Buka first</button>`;
    else if (!own) { btn = `<button class="big" data-a="b${k}" ${save.wallet < d.c ? 'disabled' : ''}>${naira(d.c)}</button>`; acts['b' + k] = () => { if (save.wallet < d.c) return; save.wallet -= d.c; save.decor.owned[d.id] = true; save.decor.on[d.slot] = d.id; persist(); SFX.till(); checkAchievements(); openDecor(back); }; }
    else { btn = `<button class="${on ? 'big' : 'small'}" data-a="u${k}">${on ? '✔ In use' : 'Use it'}</button>`; acts['u' + k] = () => { save.decor.on[d.slot] = on ? null : d.id; persist(); openDecor(back); }; }
    const preview = d.tint ? `<div class="swatch" style="background:${d.tint}"></div>` : d.id === 'lights' ? '<div class="swatch lightsw">💡💡💡</div>' : `<img src="${IMG + d.img}" alt="" style="${d.hue ? `filter:hue-rotate(${d.hue}deg)` : ''}">`;
    return `<div class="item">${preview}<div><h3>${d.n}</h3><p>${d.d}</p>${btn}</div></div>`;
  }).join('');
  modal(`<h2>🎨 Decorate the buka</h2><p class="note">🏦 ${naira(save.wallet)} · Each decoration in use makes customers wait longer and tip more (now +${Math.round(comfort() * 100)}%).</p>
    <div class="scroll"><div class="shopGrid2">${rows}</div></div><div class="row"><button class="big" data-a="back">◀ Back</button></div>`, acts, true);
}

/* =====================================================================
   HELPERS: hire, train, pay wages
   ===================================================================== */
const HELPERS = {
  washer:  { n: 'Ngozi', role: 'Washer', img: 'helper-washer.png', d: 'Washes dirty plates for you, one by one.', hire: 15000, wage: 3000, train: [0, 20000, 40000], speed: [12, 8, 4], what: 'sec per plate' },
  server:  { n: 'Kunle', role: 'Zobo server', img: 'helper-server.png', d: 'Fills zobo bottles and serves them to the customers who want zobo.', hire: 20000, wage: 3500, train: [0, 25000, 50000], speed: [6, 4, 2.5], what: 'sec per bottle' },
  cashier: { n: 'Mr Okafor', role: 'Cashier', img: 'helper-cashier.png', d: 'Collects the naira notes into the till for you.', hire: 12000, wage: 2500, train: [0, 15000, 30000], speed: [3, 1.8, 0.8], what: 'sec per payment' },
};
function hired(k) { return save.helpers[k]; }
function wageOf(k) { const h = hired(k); return h ? Math.round(HELPERS[k].wage * (1 + 0.25 * (h.lvl - 1))) : 0; }
function openHelpers(back) {
  back = back || openMap;
  const acts = { back };
  const cards = Object.keys(HELPERS).map(k => {
    const H = HELPERS[k], h = hired(k);
    let btns = '';
    if (!h) { btns = `<button class="big" data-a="h${k}" ${save.wallet < H.hire ? 'disabled' : ''}>Hire · ${naira(H.hire)}</button>`; acts['h' + k] = () => { if (save.wallet < H.hire) return; save.wallet -= H.hire; save.helpers[k] = { lvl: 1 }; persist(); SFX.till(); checkAchievements(); toast(`${H.n} joins Mama Put! 🎉`); openHelpers(back); }; }
    else {
      if (h.lvl < 3) { const c = H.train[h.lvl]; btns += `<button class="big" data-a="t${k}" ${save.wallet < c ? 'disabled' : ''}>Train to level ${h.lvl + 1} · ${naira(c)}</button>`; acts['t' + k] = () => { if (save.wallet < c) return; save.wallet -= c; h.lvl++; persist(); SFX.star(); toast(`${H.n} is now level ${h.lvl}! Faster work, slightly higher wage.`); openHelpers(back); }; }
      else btns += `<span class="maxed">⭐ Fully trained</span>`;
      btns += `<button class="small" data-a="f${k}">Let go</button>`; acts['f' + k] = () => { delete save.helpers[k]; persist(); toast(`${H.n} has left. Goodbye!`); openHelpers(back); };
    }
    return `<div class="item helper"><img src="${IMG + H.img}" alt=""><div><h3>${H.n} · ${H.role}${h ? ` · level ${h.lvl}` : ''}</h3><p>${H.d}<br>Speed: ${H.speed[(h ? h.lvl : 1) - 1]} ${H.what}${h && h.lvl < 3 ? ` (level ${h.lvl + 1}: ${H.speed[h.lvl]})` : ''} · Wage ${naira(h ? wageOf(k) : H.wage)} per day</p><div class="row">${btns}</div></div></div>`;
  }).join('');
  modal(`<h2>👩🏾‍🍳 Helpers</h2><p class="note">🏦 ${naira(save.wallet)} · Helpers are paid at the end of every day you play. Train them to work faster.</p>
    <div class="scroll">${cards}</div><div class="row"><button class="big" data-a="back">◀ Back</button></div>`, acts, true);
}
function renderHelperBar() {
  let bar = $('#helperBar'); if (!bar) { bar = mk('div', '', $('#play')); bar.id = 'helperBar'; }
  bar.innerHTML = ''; G.helperEls = {};
  Object.keys(HELPERS).filter(hired).forEach(k => {
    const e = mk('div', 'hb', bar); mk('img', '', e).src = IMG + HELPERS[k].img;
    G.helperEls[k] = { el: e, ring: mk('i', '', e), lbl: mk('span', '', e) };
    G.helperEls[k].lbl.textContent = HELPERS[k].n;
  });
  G.help = { washer: 0, server: 0, cashier: 0 };
}
function helperBusy(k, frac, text) { const h = G.helperEls && G.helperEls[k]; if (!h) return; h.ring.style.width = Math.min(100, frac * 100) + '%'; h.el.classList.toggle('busy', frac > 0); if (text) h.lbl.textContent = text; }
function helpersUpdate(dt) {
  if (!G.helperEls) return;
  // Cashier: collects payments
  if (hired('cashier')) {
    const sp = HELPERS.cashier.speed[hired('cashier').lvl - 1], k = G.cash[0];
    if (k) { G.help.cashier += dt; helperBusy('cashier', G.help.cashier / sp, 'Collecting'); if (G.help.cashier >= sp) { G.help.cashier = 0; collect(k); } }
    else { G.help.cashier = 0; helperBusy('cashier', 0, HELPERS.cashier.n); }
  }
  // Washer: cleans one dirty plate at a time (₦100 of soap each)
  if (hired('washer')) {
    const sp = HELPERS.washer.speed[hired('washer').lvl - 1], pl = G.plates.find(p => p.dirty);
    if (pl) { G.help.washer += dt; helperBusy('washer', G.help.washer / sp, 'Washing'); if (G.help.washer >= sp && balance() >= 100) { G.help.washer = 0; G.cashCost += 100; G.pcost += 100; G.exp.supplies = (G.exp.supplies || 0) + 100; pl.dirty = false; pl.el.classList.remove('dirty'); bump('washes'); floatText(center(pl).x, pl.y, '✨ Ngozi washed it', '#fff', 24); if (!G.plates.some(p => p.dirty)) G.washPending = false; } }
    else { G.help.washer = 0; helperBusy('washer', 0, HELPERS.washer.n); }
  }
  // Server: fills and serves zobo
  if (hired('server') && G.jug) {
    const sp = HELPERS.server.speed[hired('server').lvl - 1];
    const want = waiting().filter(c => c.order.d && !c.sd);
    if (want.length && G.power) {
      G.help.server += dt; helperBusy('server', G.help.server / sp, 'Zobo…');
      if (G.help.server >= sp) {
        G.help.server = 0;
        const full = G.cups.find(c => c.state === 'full');
        if (full) tapCup(full);
        else if (!G.cups.some(c => c.state === 'fill') && balance() >= COST.zobo * costMult()) { const c = G.cups.find(x => x.state === 'empty'); if (c) { G.cashCost += Math.round(COST.zobo * costMult()); G.pcost += Math.round(COST.zobo * costMult()); G.exp.food = (G.exp.food || 0) + Math.round(COST.zobo * costMult()); c.state = 'fill'; c.t = 0; } }
      }
    } else { G.help.server = 0; helperBusy('server', 0, HELPERS.server.n); }
  }
}

/* =====================================================================
   ONLINE LEADERBOARD FOR RUSH HOUR (Supabase, free)
   Set supabaseUrl and supabaseAnonKey in js/config.js. Without them the board shows this device only.
   ===================================================================== */
function cleanName(v) { return String(v || '').normalize('NFKC').replace(/[^\p{L}\p{N} ._'-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 20); }
const LB = () => { const c = window.MAMAPUT_CONFIG || {}; return c.supabaseUrl && c.supabaseAnonKey ? { url: c.supabaseUrl.replace(/\/$/, ''), key: c.supabaseAnonKey } : null; };
async function lbSubmit(score) {
  const cfg = LB(), name = cleanName(S().playerName);
  if (!cfg || !save.consent || name.length < 2 || score <= 0) return false;
  const r = await fetch(cfg.url + '/rest/v1/rush_scores', { method: 'POST', headers: { apikey: cfg.key, Authorization: 'Bearer ' + cfg.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ name: name.slice(0, 20), score: Math.min(500000, Math.round(score)), venue: venueReached() }) });
  return r.ok;
}
async function lbTop(week) {
  const cfg = LB(); if (!cfg) return null;
  let q = '/rest/v1/rush_scores?select=name,score,created_at&order=score.desc&limit=20';
  if (week) q += '&created_at=gte.' + encodeURIComponent(new Date(Date.now() - 7 * 864e5).toISOString());
  const r = await fetch(cfg.url + q, { headers: { apikey: cfg.key, Authorization: 'Bearer ' + cfg.key } });
  if (!r.ok) throw new Error('Leaderboard error ' + r.status);
  return r.json();
}
function lbRows(list, me) { return list.length ? list.map((x, i) => `<tr class="${x.name === me ? 'me' : ''}"><td>${i + 1}. ${esc(x.name)}</td><td class="n">${naira(x.score)}</td></tr>`).join('') : '<tr><td>No scores yet. Be the first!</td><td></td></tr>'; }
function openLeaderboard(back, tab = 'all') {
  back = back || openMap;
  const me = S().playerName || '', local = (save.rushHistory || []).slice().sort((a, b) => b.score - a.score).slice(0, 10).map(x => ({ name: me || 'You', score: x.score }));
  const acts = { back, all: () => openLeaderboard(back, 'all'), week: () => openLeaderboard(back, 'week'), mine: () => openLeaderboard(back, 'mine'), name: () => openSettings(() => openLeaderboard(back, tab)) };
  const head = `<h2>🏅 Rush Hour leaderboard</h2>
    <div class="row"><button class="${tab === 'all' ? 'big' : 'small'}" data-a="all">All time</button><button class="${tab === 'week' ? 'big' : 'small'}" data-a="week">This week</button><button class="${tab === 'mine' ? 'big' : 'small'}" data-a="mine">This device</button></div>`;
  const foot = `<div class="row"><button class="small" data-a="name">✏ Player name: ${esc(me || 'not set')}</button><button class="big" data-a="back">◀ Back</button></div>`;
  if (tab === 'mine' || !LB()) {
    modal(head + `${!LB() && tab !== 'mine' ? '<p class="note">The online leaderboard is not set up for this copy of the game yet (see README, "Online leaderboard"). Showing this device.</p>' : ''}<div class="scroll"><table class="acct">${lbRows(local, me || 'You')}</table></div>` + foot, acts, true);
    return;
  }
  modal(head + `<p class="note">Loading…</p>` + foot, acts, true);
  lbTop(tab === 'week').then(list => { if ($('#scrModal').classList.contains('show')) modal(head + `<div class="scroll"><table class="acct">${lbRows(list || [], me)}</table></div>` + foot, acts, true); })
    .catch(() => { modal(head + '<p class="note">Could not reach the leaderboard. Check your internet connection.</p>' + foot, acts, true); });
}

/* =====================================================================
   ANIMATED CHARACTERS: Mama walks behind the counter, customers walk in and out
   ===================================================================== */
const MAMA_HOME = -40;
function mamaCreate() {
  const m = mk('div', 'mamaWalker idle', $('#custLayer'), { left: MAMA_HOME + 'px' });
  mk('img', '', m).src = IMG + 'mama.png';
  G.mama = { el: m, x: MAMA_HOME, back: 0 };
}
function mamaWalkTo(x, stay = 1.1) {
  if (!G || !G.mama) return;
  const M = G.mama, el = M.el, dist = Math.abs(x - M.x);
  el.style.transitionDuration = Math.max(0.25, dist / 1400) + 's';
  el.classList.remove('idle'); el.classList.add('walk');
  el.classList.toggle('left', x < M.x);
  el.style.left = x + 'px'; M.x = x;
  clearTimeout(M.t1); clearTimeout(M.t2);
  M.t1 = setTimeout(() => { el.classList.remove('walk'); el.classList.add('serve'); }, Math.max(250, dist / 1.4));
  M.t2 = setTimeout(() => { if (!G || G.mama !== M) return; el.classList.remove('serve'); if (x !== MAMA_HOME) mamaWalkTo(MAMA_HOME, 0); else { el.classList.remove('walk', 'left'); el.classList.add('idle'); } }, Math.max(250, dist / 1.4) + stay * 1000);
}
function walkIn(c) {
  const fromLeft = c.slot < 2, start = fromLeft ? -320 : 1640;
  c.el.style.transition = 'none'; c.el.style.left = start + 'px';
  c.el.classList.remove('enter'); c.el.classList.add('walking');
  if (fromLeft) c.el.classList.add('faceRight');
  void c.el.offsetWidth;
  const dist = Math.abs(SLOTS[c.slot] - 140 - start);
  c.el.style.transition = `left ${(dist / 900).toFixed(2)}s linear`;
  c.el.style.left = (SLOTS[c.slot] - 140) + 'px';
  setTimeout(() => { if (c.el) c.el.classList.remove('walking', 'faceRight'); }, dist / 0.9);
}
function walkOut(c, done) {
  const toLeft = c.slot < 2, end = toLeft ? -340 : 1660, dist = Math.abs(SLOTS[c.slot] - 140 - end);
  c.bubble.style.display = 'none';
  c.el.classList.add('walking'); if (!toLeft) c.el.classList.add('faceRight');
  c.el.style.transition = `left ${(dist / 1000).toFixed(2)}s linear`; c.el.style.left = end + 'px';
  setTimeout(done, dist / 1.0);
}

/* =====================================================================
   PRIVACY AND CONSENT
   The game keeps progress only on the player's device. Nothing is sent anywhere unless the
   player turns on an online feature (Google save, online leaderboard) and agrees first.
   ===================================================================== */
const PRIVACY_TEXT = [
  '<b>What the game stores:</b> your progress (days, money, upgrades, settings) in this browser on this device only. No cookies, no ads, no tracking, no analytics.',
  '<b>What leaves your device:</b> nothing, unless you choose an online feature:',
  '• <b>Online leaderboard</b>: your nickname and your Rush Hour score are sent to the game\'s leaderboard and shown to other players. Use a nickname, not your full name.',
  '• <b>Google save</b>: your progress file is saved in a hidden game folder in your own Google Drive. The game cannot see your other files.',
  '<b>Under 18?</b> Ask a parent or guardian before turning on online features.',
  '<b>Delete your data:</b> Settings > Reset progress deletes everything on this device. Clear your nickname to stop sending scores. To remove a leaderboard entry, contact the game owner.',
];
function privacyHtml() { return PRIVACY_TEXT.map(p => `<p class="note" style="text-align:left">${p}</p>`).join(''); }
function askConsent(then) {
  modal(`<h2>Online features</h2><div class="scroll">${privacyHtml()}</div>
    <div class="row"><button class="small" data-a="no">No thanks</button><button class="big" data-a="yes">I am 18+ or have a parent's permission</button></div>`,
    { no: () => { S().playerName = ''; persist(); openSettings(); }, yes: () => { save.consent = { at: Date.now() }; persist(); if (then) then(); else openSettings(); } }, true);
}
function showPrivacy(back) {
  modal(`<h2>🔒 Privacy</h2><div class="scroll">${privacyHtml()}</div>
    <div class="row">${save.consent ? '<button class="small" data-a="withdraw">Turn off online features</button>' : ''}<button class="big" data-a="ok">OK</button></div>`,
    { ok: back || openTitle, withdraw: () => { delete save.consent; S().playerName = ''; S().google = false; CLOUD.token = null; persist(); toast('Online features turned off'); (back || openTitle)(); } }, true);
}
function firstRunNotice() {
  if (save.privacySeen) return false;
  modal(`<h2>Welcome to Mama Put! 🍛</h2>
    <p class="note">Your progress is saved on this device only. No cookies, no ads, no tracking.</p>
    <p class="note">Online extras (Google save and the Rush Hour leaderboard) are off until you choose to turn them on in Settings.</p>
    <div class="row"><button class="small" data-a="more">Read the privacy notice</button><button class="big" data-a="ok">Let's cook!</button></div>`,
    { ok: () => { save.privacySeen = true; persist(); showScreen('scrTitle'); dailyCheck(); }, more: () => { save.privacySeen = true; persist(); showPrivacy(() => { showScreen('scrTitle'); dailyCheck(); }); } }, true);
  return true;
}

/* =====================================================================
   SETTINGS
   ===================================================================== */
let setReturn = openTitle;
function openSettings(back) {
  if (back) setReturn = back;
  if ((window.MAMAPUT_CONFIG || {}).googleClientId && location.protocol !== 'file:') gScript(() => {});   // load early so the sign-in pop-up is not blocked
  renderSettings(); showScreen('scrSettings');
}
function renderSettings() {
  const b = $('#setBody'); b.innerHTML = '';
  const st = S();
  const row = (lab, sub) => { const r = mk('div', 'setRow', b); const l = mk('div', '', r); mk('div', 'lab', l).textContent = lab; if (sub) mk('div', 'sub', l).textContent = sub; return r; };
  const seg = (r, opts, cur, fn) => { const s = mk('div', 'seg', r); opts.forEach(([v, t]) => { const x = mk('button', v === cur ? 'on' : '', s); x.textContent = t; onTap(x, () => { fn(v); persist(); renderSettings(); }); }); };
  const slider = (r, v, fn) => { const i = mk('input', '', r); i.type = 'range'; i.min = 0; i.max = 1; i.step = 0.05; i.value = v; i.addEventListener('input', () => { fn(+i.value); persist(); }); };
  const btns = (r, list) => { const s = mk('div', 'seg', r); list.forEach(([t, fn]) => { const x = mk('button', '', s); x.textContent = t; onTap(x, fn); }); };
  const head = t => { mk('div', 'setH', b).textContent = t; };

  head('🔊 Sound');
  slider(row('Sound effects', 'Taps, sizzles, the till'), st.sfx, v => { st.sfx = v; });
  slider(row('Background music', 'Slide to the left to switch it off'), st.music, v => { st.music = v; musicVolume(); });
  slider(row('Street and buka sounds', 'Traffic, horns, okada, conductor, crowd'), st.amb === undefined ? 0.5 : st.amb, v => { st.amb = v; });
  seg(row('Conductor voice', 'Uses your phone\'s voice when there is no recording'), [[true, 'On'], [false, 'Off']], st.conductor !== false, v => { st.conductor = v; });
  seg(row('Vibrate on tap', 'Phones only'), [[true, 'On'], [false, 'Off']], st.vibrate, v => { st.vibrate = v; });
  head('🏅 Leaderboard');
  { const r = row('Player name', 'Shown on the Rush Hour leaderboard (2 to 20 letters)'); const i = mk('input', 'txt', r); i.maxLength = 20; i.value = st.playerName || ''; i.placeholder = 'e.g. Chiamaka'; i.addEventListener('change', () => { st.playerName = cleanName(i.value); i.value = st.playerName; persist(); if (st.playerName && !save.consent) askConsent(() => renderSettings()); }); }

  head('🎮 Gameplay');
  seg(row('Difficulty', 'Relaxed: customers wait longer, lower goals'), [['relaxed', 'Relaxed'], ['normal', 'Normal'], ['hard', 'Hard']], st.difficulty, v => { st.difficulty = v; });
  seg(row("Mama's hints", 'Auto = always on the first days, then only when you get stuck'), [['auto', 'Auto'], ['always', 'Always'], ['stuck', 'When stuck'], ['off', 'Off']], st.hints, v => { st.hints = v; });
  seg(row('Collect money automatically', 'Naira notes go into the till by themselves'), [[true, 'On'], [false, 'Off']], st.autoCash, v => { st.autoCash = v; });
  seg(row('Show prices on orders'), [[true, 'On'], [false, 'Off']], st.showPrices, v => { st.showPrices = v; });
  seg(row('Market credit when money is short', 'Ask = Mama asks first. Auto = buy on credit without asking.'), [[false, 'Ask'], [true, 'Auto']], st.autoCredit === true, v => { st.autoCredit = v; });

  head('💾 Save your progress');
  mk('div', 'setNote', b).textContent = `Progress saves automatically in this browser on this device. Last saved: ${save.savedAt ? new Date(save.savedAt).toLocaleString() : 'not yet'}.`;
  const cfg = (window.MAMAPUT_CONFIG || {}).googleClientId;
  const gr = row('Google account', !cfg ? 'Not set up for this copy of the game yet (see README, "Google sign-in").' : CLOUD.token ? '✅ Signed in. Your save is kept in your own Google Drive (hidden game folder).' : 'Sign in to keep your progress in your Google Drive and continue on any device.');
  if (CLOUD.token) btns(gr, [['☁ Save to Google', () => cloud('save')], ['☁ Load from Google', () => cloud('load')], ['Sign out', () => { CLOUD.token = null; st.google = false; persist(); renderSettings(); }]]);
  else btns(gr, [['Sign in with Google', () => cloud('signin')]]);
  btns(row('Save code', 'Copy a code and paste it on another phone or browser'), [['📋 Copy save code', copySaveCode], ['⌨ Enter save code', enterSaveCode]]);
  btns(row('Save file', 'Download a backup file, or load one'), [['⬇ Download', downloadSave], ['⬆ Load file', () => $('#fileIn').click()]]);
  btns(row('Start again', 'Deletes all progress on this device'), [['🗑 Reset progress', confirmReset]]);

  head('🔒 Privacy');
  btns(row('Privacy notice', save.consent ? 'Online features: allowed' : 'Online features: off'), [['Read', () => showPrivacy(() => openSettings())]]);
  head('ℹ About');
  mk('div', 'setNote', b).innerHTML = `Mama Put: Buka Rush · version 3.0 · ${LEVELS.length} days.<br>Days played: ${save.stats.days} · Customers served: ${save.stats.served}`;
}
onTap($('#setBack'), () => { SFX.tap(); setReturn(); });

/* ---------------- save codes and files ---------------- */
const CODE_PREFIX = 'MAMAPUT1:';
const b64e = s => btoa(unescape(encodeURIComponent(s)));
const b64d = s => decodeURIComponent(escape(atob(s)));
function saveCode() { persist(); return CODE_PREFIX + b64e(JSON.stringify(save)); }
const MAX_SAVE_BYTES = 300000;   // a real save is a few KB; refuse anything huge
function parseSave(text) {
  try {
    text = String(text).trim();
    if (!text || text.length > MAX_SAVE_BYTES) return null;
    const o = text.startsWith(CODE_PREFIX) ? JSON.parse(b64d(text.slice(CODE_PREFIX.length))) : JSON.parse(text);
    if (!o || typeof o !== 'object' || Array.isArray(o) || typeof o.unlocked !== 'number') return null;
    if (!(o.unlocked >= 1 && o.unlocked <= 1000) || (o.wallet !== undefined && !Number.isFinite(o.wallet))) return null;
    return o;
  } catch (e) { return null; }
}
function askReplace(o, back) {
  modal(`<h2>Load this save?</h2>
    <p>This save: Day ${o.unlocked} unlocked · 🏦 ${naira(o.wallet || 0)}</p>
    <p>On this device now: Day ${save.unlocked} unlocked · 🏦 ${naira(save.wallet)}</p>
    <p class="note">Loading replaces the progress on this device.</p>
    <div class="row"><button class="small" data-a="no">Cancel</button><button class="big" data-a="yes">Load it</button></div>`,
    { no: () => openSettings(back), yes: () => { save = normalise(o); persist(); musicVolume(); toast('✅ Progress loaded'); openSettings(back); } });
}
function copySaveCode() {
  const code = saveCode();
  const done = () => toast('📋 Save code copied');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, () => showCode(code));
  else showCode(code);
}
function showCode(code) {
  modal(`<h2>Your save code</h2><p class="note">Select all and copy it somewhere safe (WhatsApp to yourself, notes…).</p>
    <textarea class="code" readonly>${esc(code)}</textarea><div class="row"><button class="big" data-a="ok">Done</button></div>`, { ok: () => openSettings() }, true);
  const t = $('#modalBox textarea'); t.focus(); t.select();
}
function enterSaveCode() {
  modal(`<h2>Enter a save code</h2><textarea class="code" placeholder="MAMAPUT1:…"></textarea>
    <div class="row"><button class="small" data-a="no">Cancel</button><button class="big" data-a="yes">Load</button></div>`,
    { no: () => openSettings(), yes: () => { const o = parseSave($('#modalBox textarea').value); if (!o) { SFX.bad(); toast('That code is not valid'); return; } askReplace(o); } }, true);
}
function downloadSave() {
  persist();
  const blob = new Blob([JSON.stringify(save, null, 1)], { type: 'application/json' });
  const a = mk('a', '', document.body); a.href = URL.createObjectURL(blob); a.download = 'mama-put-save.json'; a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
$('#fileIn').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  if (f.size > MAX_SAVE_BYTES) { e.target.value = ''; SFX.bad(); toast('That file is too big to be a Mama Put save'); return; }
  const r = new FileReader();
  r.onload = () => { const o = parseSave(r.result); e.target.value = ''; if (!o) { SFX.bad(); toast('That file is not a Mama Put save'); return; } askReplace(o); };
  r.readAsText(f);
});
function confirmReset() {
  modal(`<h2>Reset all progress?</h2><p>All days, stars, money and upgrades on this device will be deleted. Copy a save code first if you may want them back.</p>
    <div class="row"><button class="big" data-a="no">Keep my progress</button><button class="small" data-a="yes">Yes, delete</button></div>`,
    { no: () => openSettings(), yes: () => { const keep = save.settings; save = fresh(); save.settings = keep; persist(); toast('Progress reset'); openSettings(); } });
}

/* ---------------- Google Drive cloud save ----------------
   Uses Google Identity Services and the Drive "appDataFolder" (a hidden folder only this game can see).
   Needs googleClientId in js/config.js and the game served from https:// (GitHub Pages works). */
const CLOUD = { token: null, exp: 0, client: null, after: null };
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const SAVE_NAME = 'mamaput-save.json';
function gScript(cb) {
  if (window.google && google.accounts && google.accounts.oauth2) { cb(); return; }
  const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
  s.onload = cb; s.onerror = () => toast('Could not reach Google. Check your internet connection.');
  document.head.appendChild(s);
}
function gSignIn(then) {
  if (!save.consent) { askConsent(() => gSignIn(then)); return; }
  const id = (window.MAMAPUT_CONFIG || {}).googleClientId;
  if (!id) {
    modal(`<h2>Google sign-in is not set up yet</h2><p class="note">The owner of this game needs to add a free Google sign-in key in <b>js/config.js</b>. The steps are in README.md under "Google sign-in".</p>
      <p class="note">Until then, use <b>Copy save code</b> or <b>Download</b> to move your progress to another device.</p><div class="row"><button class="big" data-a="ok">OK</button></div>`, { ok: () => openSettings() }, true);
    return;
  }
  if (location.protocol === 'file:') { toast('Google sign-in works on the online version of the game (https), not from a file on your computer.'); return; }
  gScript(() => {
    if (!CLOUD.client) CLOUD.client = google.accounts.oauth2.initTokenClient({
      client_id: id, scope: DRIVE_SCOPE,
      callback: r => {
        if (r.error) { toast('Google sign-in was cancelled'); return; }
        CLOUD.token = r.access_token; CLOUD.exp = Date.now() + ((r.expires_in || 3600) - 60) * 1000;
        S().google = true; persist();
        const f = CLOUD.after; CLOUD.after = null; if (f) f();
        if ($('#scrSettings').classList.contains('show')) renderSettings();
      },
    });
    CLOUD.after = then || null;
    CLOUD.client.requestAccessToken({ prompt: S().google ? '' : 'consent' });
  });
}
const tokenOk = () => CLOUD.token && Date.now() < CLOUD.exp;
async function gFetch(url, opt = {}) {
  opt.headers = Object.assign({ Authorization: 'Bearer ' + CLOUD.token }, opt.headers || {});
  const r = await fetch(url, opt);
  if (!r.ok) throw new Error('Google Drive error ' + r.status);
  return r;
}
async function gFind() {
  const q = encodeURIComponent(`name='${SAVE_NAME}'`);
  const r = await gFetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)`);
  const j = await r.json(); return (j.files || [])[0] || null;
}
async function gSave() {
  persist();
  const body = JSON.stringify(save), f = await gFind();
  if (f) { await gFetch(`https://www.googleapis.com/upload/drive/v3/files/${f.id}?uploadType=media`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body }); return; }
  const bd = 'mamaput' + Date.now();
  const multipart = `--${bd}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name: SAVE_NAME, parents: ['appDataFolder'] })}\r\n--${bd}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${bd}--`;
  await gFetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + bd }, body: multipart });
}
async function gLoad() {
  const f = await gFind(); if (!f) return null;
  const r = await gFetch(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`);
  return r.json();
}
function cloud(op) {
  const run = async () => {
    try {
      if (op === 'save') { await gSave(); toast('☁ Saved to your Google Drive'); }
      if (op === 'load') { const o = await gLoad(); if (!o) toast('No Mama Put save found in this Google account yet'); else askReplace(normalise(o)); }
      if (op === 'signin') toast('✅ Signed in with Google');
      if ($('#scrSettings').classList.contains('show')) renderSettings();
    } catch (e) { toast('Google Drive: ' + e.message); }
  };
  if (tokenOk() && op !== 'signin') run(); else gSignIn(run);
}
function cloudAuto() { if (tokenOk()) gSave().catch(() => { /* try again next time */ }); }

/* =====================================================================
   BUTTONS AND MAIN LOOP
   ===================================================================== */
onTap($('#btnPlay'), () => { SFX.tap(); openMap(); if (!save.seenCh[1] && LEVELS[0] && LEVELS[0].chapter === 1) { /* chapter 1 plays when Day 1 opens */ } });
onTap($('#btnStory'), () => {
  SFX.tap();
  const lines = [];
  Object.keys(CHAPTERS).map(Number).sort((a, b) => a - b).filter(ch => save.seenCh[ch]).forEach(ch => { lines.push(['title', 'Chapter ' + ch, CHAPTERS[ch].title]); CHAPTERS[ch].lines.forEach(l => lines.push(l)); });
  if (save.ending) DATA.ENDING.forEach(l => lines.push(l));
  if (!lines.length) { toast('Play Day 1 to start the story'); return; }
  runDialog(lines, openTitle);
});
onTap($('#btnSettings'), () => { SFX.tap(); openSettings(openTitle); });
onTap($('#mapSettings'), () => { SFX.tap(); openSettings(openMap); });
onTap($('#btnRush'), () => { SFX.tap(); openRush(); });
onTap($('#btnRush2'), () => { SFX.tap(); openRush(); });
onTap($('#btnBank'), () => { SFX.tap(); openBank(openMap); });
onTap($('#btnDecor'), () => { SFX.tap(); openDecor(openMap); });
onTap($('#btnHelpers'), () => { SFX.tap(); openHelpers(openMap); });
onTap($('#btnAch'), () => { SFX.tap(); openAchievements(openMap); });
onTap($('#btnAch2'), () => { SFX.tap(); openAchievements(openTitle); });
onTap($('#btnBoard'), () => { SFX.tap(); openLeaderboard(openTitle); });
onTap($('#mapBack'), () => { SFX.tap(); openTitle(); });
onTap($('#btnShop'), () => { SFX.tap(); openShop(); });
onTap($('#shopBack'), () => { SFX.tap(); openMap(); });
onTap($('#dlgNext'), () => { SFX.tap(); if (dialogNext) dialogNext(); });
onTap($('#dlgSkip'), () => { SFX.tap(); if (dialogSkip) dialogSkip(); });
onTap($('#btnPause'), () => { SFX.tap(); pause(true); });
onTap($('#rotateOk'), () => { rotateOk = true; fit(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && G && G.running && !G.paused) pause(true); });
addEventListener('keydown', e => { if (e.key === 'Escape' && G && G.running) pause(!G.paused); });

let lastT = 0;
function loop(t) {
  const dt = Math.min(0.05, (t - lastT) / 1000 || 0); lastT = t;
  if (G && G.running && !G.paused) { update(dt); if (G && G.running) render(); }
  requestAnimationFrame(loop);
}
fit(); openTitle(); requestAnimationFrame(loop);

// Testing shortcuts: index.html?day=12  ?rush=1  ?kitchen=1  ?gen=1  ?wash=1
const q = new URLSearchParams(location.search);
if (q.get('day') && LEVELS[q.get('day') - 1]) { save.unlocked = Math.max(save.unlocked, +q.get('day')); openIntro(+q.get('day') - 1); }
if (q.get('rush')) { save.unlocked = Math.max(save.unlocked, RUSH.unlockAfterDay + 1); openRush(); }
if (q.get('kitchen')) { save.cookStory.jollof = true; startLevel(0); save.stock.jollof = { n: 0, q: 0.8 }; openKitchen('jollof'); }
if (q.get('gen')) { startLevel(4); triggerPower(); openSide('gen'); }
if (q.get('wash')) { startLevel(13); triggerWash(); openSide('wash'); }
if (q.get('gas')) { startLevel(10); triggerGas(); openSide('gas'); }
window.__mamaput = { get G() { return G; }, get save() { return save; }, startLevel, startDay, openSide, openDecor, openHelpers, openAchievements, openLeaderboard, checkAchievements, dailyCheck, renderDecor, openKitchen, endLevel, update, render, triggerPower, triggerWash, triggerGas, triggerOwe, kTap, sTap, runDialog, openIntro, openMap, openBank, openSettings };
})();
