/* =====================================================================
   MAMA PUT: DAYS (LEVELS) AND STORY
   =====================================================================
   Every line in LEVELS is one playable day. The map shows them in order.

   HOW TO ADD MORE DAYS
   1. Copy any line in LEVELS (for example the last one).
   2. Paste it on a new line just before the closing  ];
   3. Change the name and numbers. Save the file and refresh the game.

   FIELDS
     name     title of the day
     venue    'stall' (roadside), 'buka' (tables), 'bigbuka' (big restaurant)
     menu     one of the menus below, or your own list, e.g. ['jollof', 'dodo', 'zobo']
              foods: jollof, whiterice, stew, amala, ewedu, meat, egg, fish, ponmo, dodo, akara, zobo
              (white rice needs stew, amala needs ewedu)
     goal     profit in naira needed for 1 star (2 stars = x1.35, 3 stars = x1.7)
     time     length of the day in seconds (the clock pauses while cooking)
     max      most customers waiting at the same time (1 to 4)
     spawn    [fastest, slowest] seconds between new customers
     pat      how many seconds a customer will wait before leaving
     rush     true = a rush hour happens in the middle of the day
     events   side stories during the day:
                'power' NEPA takes light, start the generator
                'gas'   the cooking gas finishes, change the cylinder
                'wash'  the clean plates finish, wash them
                'owe'   a customer begs to eat now and pay later
     critic   true = Oga Critic may visit and tip big; 'finale' = he comes for sure
     chapter  story chapter shown before the day (see CHAPTERS below)

   Prices of food and ingredients are at the top of js/game.js (FOOD, COST and POTS).
   ===================================================================== */
(() => {
const M_START = ['jollof', 'meat'];
const M_ZOBO  = [...M_START, 'zobo'];
const M_DODO  = [...M_ZOBO, 'dodo'];
const M_AKARA = [...M_DODO, 'akara'];
const M_EGG   = [...M_AKARA, 'egg'];
const M_BUKA  = [...M_EGG, 'whiterice', 'stew'];
const M_AMALA = [...M_BUKA, 'amala', 'ewedu'];
const M_FISH  = [...M_AMALA, 'fish'];
const M_ALL   = [...M_FISH, 'ponmo'];

const LEVELS = [
  { name: "Opening day",               venue: 'stall',   menu: M_START , goal:   4000, time:  90, max: 2, spawn: [5.0, 8.0], pat: 42, chapter: 1 },  // Day 1
  { name: "Second day",                venue: 'stall',   menu: M_START , goal:   4500, time:  90, max: 2, spawn: [5.0, 8.0], pat: 42 },  // Day 2
  { name: "Tobi's exam week",          venue: 'stall',   menu: M_ZOBO  , goal:   5000, time:  90, max: 3, spawn: [4.9, 7.9], pat: 42, rush: true, chapter: 2 },  // Day 3
  { name: "Hot afternoon",             venue: 'stall',   menu: M_ZOBO  , goal:   5500, time:  90, max: 3, spawn: [4.9, 7.9], pat: 41, rush: true },  // Day 4
  { name: "No light!",                 venue: 'stall',   menu: M_DODO  , goal:   6000, time:  90, max: 3, spawn: [4.9, 7.8], pat: 41, rush: true, events: ['power'], chapter: 3 },  // Day 5
  { name: "Dodo day",                  venue: 'stall',   menu: M_DODO  , goal:   6000, time:  90, max: 3, spawn: [4.8, 7.8], pat: 41, rush: true },  // Day 6
  { name: "Motor park rush",           venue: 'stall',   menu: M_AKARA , goal:   6500, time:  90, max: 3, spawn: [4.8, 7.7], pat: 41, rush: true, chapter: 4 },  // Day 7
  { name: "Egg day",                   venue: 'stall',   menu: M_EGG   , goal:   7000, time:  93, max: 3, spawn: [4.8, 7.7], pat: 41, rush: true },  // Day 8
  { name: "Landlord's visit",          venue: 'stall',   menu: M_EGG   , goal:   7500, time:  93, max: 4, spawn: [4.8, 7.6], pat: 41, rush: true, events: ['power'], chapter: 5 },  // Day 9
  { name: "Market day",                venue: 'stall',   menu: M_EGG   , goal:   8000, time:  93, max: 4, spawn: [4.7, 7.6], pat: 40, rush: true, events: ['owe'] },  // Day 10
  { name: "Bode's promise",            venue: 'stall',   menu: M_EGG   , goal:   8500, time:  93, max: 4, spawn: [4.7, 7.5], pat: 40, rush: true, events: ['gas'], chapter: 6 },  // Day 11
  { name: "Last day on the roadside",  venue: 'stall',   menu: M_EGG   , goal:   9000, time:  93, max: 4, spawn: [4.7, 7.5], pat: 40, rush: true },  // Day 12
  { name: "Grand opening",             venue: 'buka',    menu: M_BUKA  , goal:   9500, time:  93, max: 4, spawn: [4.6, 7.5], pat: 40, rush: true, events: ['power'], chapter: 7 },  // Day 13
  { name: "White rice Monday",         venue: 'buka',    menu: M_BUKA  , goal:  10000, time:  93, max: 4, spawn: [4.6, 7.4], pat: 40, rush: true },  // Day 14
  { name: "Lunch crowd",               venue: 'buka',    menu: M_BUKA  , goal:  10500, time:  93, max: 4, spawn: [4.6, 7.4], pat: 39, rush: true },  // Day 15
  { name: "The levy man",              venue: 'buka',    menu: M_BUKA  , goal:  11000, time:  96, max: 4, spawn: [4.5, 7.3], pat: 39, rush: true, chapter: 8 },  // Day 16
  { name: "Rainy evening",             venue: 'buka',    menu: M_BUKA  , goal:  11500, time:  96, max: 4, spawn: [4.5, 7.3], pat: 39, rush: true, events: ['power', 'owe'] },  // Day 17
  { name: "Mountain of plates",        venue: 'buka',    menu: M_BUKA  , goal:  12000, time:  96, max: 4, spawn: [4.5, 7.2], pat: 39, rush: true, events: ['wash'], chapter: 9 },  // Day 18
  { name: "Friday rush",               venue: 'buka',    menu: M_BUKA  , goal:  12500, time:  96, max: 4, spawn: [4.5, 7.2], pat: 39, rush: true },  // Day 19
  { name: "Payday",                    venue: 'buka',    menu: M_BUKA  , goal:  13000, time:  96, max: 4, spawn: [4.4, 7.1], pat: 39, rush: true, events: ['gas'] },  // Day 20
  { name: "Admission letter",          venue: 'buka',    menu: M_AMALA , goal:  13500, time:  96, max: 4, spawn: [4.4, 7.1], pat: 38, rush: true, events: ['power'], chapter: 10 },  // Day 21
  { name: "Amala Saturday",            venue: 'buka',    menu: M_AMALA , goal:  14000, time:  96, max: 4, spawn: [4.4, 7.1], pat: 38, rush: true },  // Day 22
  { name: "Sunday after church",       venue: 'buka',    menu: M_AMALA , goal:  14500, time:  96, max: 4, spawn: [4.3, 7.0], pat: 38, rush: true, events: ['wash'] },  // Day 23
  { name: "Mama's back",               venue: 'buka',    menu: M_AMALA , goal:  15000, time:  99, max: 4, spawn: [4.3, 7.0], pat: 38, rush: true, events: ['owe'], chapter: 11 },  // Day 24
  { name: "Danfo drivers",             venue: 'buka',    menu: M_AMALA , goal:  15000, time:  99, max: 4, spawn: [4.3, 6.9], pat: 38, rush: true, events: ['power'] },  // Day 25
  { name: "Office lunch",              venue: 'buka',    menu: M_AMALA , goal:  15500, time:  99, max: 4, spawn: [4.2, 6.9], pat: 38, rush: true },  // Day 26
  { name: "A helping hand",            venue: 'buka',    menu: M_AMALA , goal:  16000, time:  99, max: 4, spawn: [4.2, 6.8], pat: 37, rush: true, chapter: 12 },  // Day 27
  { name: "Football night",            venue: 'buka',    menu: M_AMALA , goal:  16500, time:  99, max: 4, spawn: [4.2, 6.8], pat: 37, rush: true, events: ['wash'] },  // Day 28
  { name: "School fees week",          venue: 'buka',    menu: M_AMALA , goal:  17000, time:  99, max: 4, spawn: [4.2, 6.7], pat: 37, rush: true, events: ['power', 'gas'] },  // Day 29
  { name: "Tobi leaves for school",    venue: 'buka',    menu: M_AMALA , goal:  17500, time:  99, max: 4, spawn: [4.1, 6.7], pat: 37, rush: true, chapter: 13 },  // Day 30
  { name: "Fish Friday",               venue: 'buka',    menu: M_FISH  , goal:  18000, time:  99, max: 4, spawn: [4.1, 6.7], pat: 37, rush: true, events: ['owe'] },  // Day 31
  { name: "Owambe Saturday",           venue: 'buka',    menu: M_FISH  , goal:  18500, time: 102, max: 4, spawn: [4.1, 6.6], pat: 36, rush: true },  // Day 32
  { name: "Market prices",             venue: 'buka',    menu: M_FISH  , goal:  19000, time: 102, max: 4, spawn: [4.0, 6.6], pat: 36, rush: true, events: ['power', 'wash'], chapter: 14 },  // Day 33
  { name: "Back to work",              venue: 'buka',    menu: M_FISH  , goal:  19500, time: 102, max: 4, spawn: [4.0, 6.5], pat: 36, rush: true },  // Day 34
  { name: "Harmattan morning",         venue: 'buka',    menu: M_FISH  , goal:  20000, time: 102, max: 4, spawn: [4.0, 6.5], pat: 36, rush: true },  // Day 35
  { name: "The flood",                 venue: 'buka',    menu: M_FISH  , goal:  20500, time: 102, max: 4, spawn: [4.0, 6.4], pat: 36, rush: true, chapter: 15 },  // Day 36
  { name: "Cleaning up",               venue: 'buka',    menu: M_FISH  , goal:  21000, time: 102, max: 4, spawn: [3.9, 6.4], pat: 36, rush: true, events: ['power'] },  // Day 37
  { name: "Christmas crowd",           venue: 'buka',    menu: M_FISH  , goal:  21500, time: 102, max: 4, spawn: [3.9, 6.3], pat: 35, rush: true, events: ['gas', 'wash', 'owe'] },  // Day 38
  { name: "New Year rush",             venue: 'buka',    menu: M_FISH  , goal:  22000, time: 102, max: 4, spawn: [3.9, 6.3], pat: 35, rush: true },  // Day 39
  { name: "The last day at the Buka",  venue: 'buka',    menu: M_FISH  , goal:  22500, time: 105, max: 4, spawn: [3.8, 6.2], pat: 35, rush: true },  // Day 40
  { name: "Big Buka opening",          venue: 'bigbuka', menu: M_FISH  , goal:  23000, time: 105, max: 4, spawn: [3.8, 6.2], pat: 35, rush: true, events: ['power'], critic: true, chapter: 16 },  // Day 41
  { name: "Busy Monday",               venue: 'bigbuka', menu: M_FISH  , goal:  23000, time: 105, max: 4, spawn: [3.8, 6.2], pat: 35, rush: true, critic: true },  // Day 42
  { name: "Students' night",           venue: 'bigbuka', menu: M_FISH  , goal:  23500, time: 105, max: 4, spawn: [3.7, 6.1], pat: 34, rush: true, events: ['wash'], critic: true },  // Day 43
  { name: "Missing money",             venue: 'bigbuka', menu: M_FISH  , goal:  23500, time: 105, max: 4, spawn: [3.7, 6.1], pat: 34, rush: true, critic: true, chapter: 17 },  // Day 44
  { name: "Ponmo arrives",             venue: 'bigbuka', menu: M_ALL   , goal:  24000, time: 105, max: 4, spawn: [3.7, 6.0], pat: 34, rush: true, events: ['power', 'owe'], critic: true },  // Day 45
  { name: "Festival week",             venue: 'bigbuka', menu: M_ALL   , goal:  24000, time: 105, max: 4, spawn: [3.7, 6.0], pat: 34, rush: true, critic: true },  // Day 46
  { name: "Hot weather",               venue: 'bigbuka', menu: M_ALL   , goal:  24500, time: 105, max: 4, spawn: [3.6, 5.9], pat: 34, rush: true, events: ['gas'], critic: true },  // Day 47
  { name: "Hostel fees",               venue: 'bigbuka', menu: M_ALL   , goal:  24500, time: 108, max: 4, spawn: [3.6, 5.9], pat: 34, rush: true, events: ['wash'], critic: true, chapter: 18 },  // Day 48
  { name: "Long weekend",              venue: 'bigbuka', menu: M_ALL   , goal:  25000, time: 108, max: 4, spawn: [3.6, 5.8], pat: 33, rush: true, events: ['power'], critic: true },  // Day 49
  { name: "Wedding guests",            venue: 'bigbuka', menu: M_ALL   , goal:  25000, time: 108, max: 4, spawn: [3.5, 5.8], pat: 33, rush: true, critic: true },  // Day 50
  { name: "Workers' strike",           venue: 'bigbuka', menu: M_ALL   , goal:  25500, time: 108, max: 4, spawn: [3.5, 5.8], pat: 33, rush: true, critic: true },  // Day 51
  { name: "The rival buka",            venue: 'bigbuka', menu: M_ALL   , goal:  25500, time: 108, max: 4, spawn: [3.5, 5.7], pat: 33, rush: true, events: ['owe'], critic: true, chapter: 19 },  // Day 52
  { name: "Price war",                 venue: 'bigbuka', menu: M_ALL   , goal:  26000, time: 108, max: 4, spawn: [3.4, 5.7], pat: 33, rush: true, events: ['power', 'wash'], critic: true },  // Day 53
  { name: "Loyal customers",           venue: 'bigbuka', menu: M_ALL   , goal:  26000, time: 108, max: 4, spawn: [3.4, 5.6], pat: 32, rush: true, critic: true },  // Day 54
  { name: "Rainy season",              venue: 'bigbuka', menu: M_ALL   , goal:  26500, time: 108, max: 4, spawn: [3.4, 5.6], pat: 32, rush: true, critic: true },  // Day 55
  { name: "Football final",            venue: 'bigbuka', menu: M_ALL   , goal:  26500, time: 111, max: 4, spawn: [3.4, 5.5], pat: 32, rush: true, events: ['gas'], critic: true },  // Day 56
  { name: "Fuel scarcity",             venue: 'bigbuka', menu: M_ALL   , goal:  27000, time: 111, max: 4, spawn: [3.3, 5.5], pat: 32, rush: true, events: ['power'], critic: true, chapter: 20 },  // Day 57
  { name: "Queues everywhere",         venue: 'bigbuka', menu: M_ALL   , goal:  27000, time: 111, max: 4, spawn: [3.3, 5.4], pat: 32, rush: true, events: ['wash'], critic: true },  // Day 58
  { name: "Generator day",             venue: 'bigbuka', menu: M_ALL   , goal:  27500, time: 111, max: 4, spawn: [3.3, 5.4], pat: 32, rush: true, events: ['owe'], critic: true },  // Day 59
  { name: "Back to normal",            venue: 'bigbuka', menu: M_ALL   , goal:  27500, time: 111, max: 4, spawn: [3.2, 5.3], pat: 31, rush: true, critic: true },  // Day 60
  { name: "Market madness",            venue: 'bigbuka', menu: M_ALL   , goal:  28000, time: 111, max: 4, spawn: [3.2, 5.3], pat: 31, rush: true, events: ['power'], critic: true },  // Day 61
  { name: "Oga Critic's visit",        venue: 'bigbuka', menu: M_ALL   , goal:  28000, time: 111, max: 4, spawn: [3.2, 5.3], pat: 31, rush: true, critic: 'finale', chapter: 21 },  // Day 62
  { name: "After the critic",          venue: 'bigbuka', menu: M_ALL   , goal:  28500, time: 111, max: 4, spawn: [3.1, 5.2], pat: 31, rush: true, events: ['wash'], critic: true },  // Day 63
  { name: "Everybody's talking",       venue: 'bigbuka', menu: M_ALL   , goal:  28500, time: 114, max: 4, spawn: [3.1, 5.2], pat: 31, rush: true, critic: true },  // Day 64
  { name: "Hungry Saturday",           venue: 'bigbuka', menu: M_ALL   , goal:  29000, time: 114, max: 4, spawn: [3.1, 5.1], pat: 30, rush: true, events: ['power', 'gas'], critic: true },  // Day 65
  { name: "Payday again",              venue: 'bigbuka', menu: M_ALL   , goal:  29500, time: 114, max: 4, spawn: [3.0, 5.1], pat: 30, rush: true, events: ['owe'], critic: true },  // Day 66
  { name: "Tobi calls home",           venue: 'bigbuka', menu: M_ALL   , goal:  29500, time: 114, max: 4, spawn: [3.0, 5.0], pat: 30, rush: true, critic: true },  // Day 67
  { name: "Mama's birthday",           venue: 'bigbuka', menu: M_ALL   , goal:  30000, time: 114, max: 4, spawn: [3.0, 5.0], pat: 30, rush: true, events: ['wash'], critic: true, chapter: 22 },  // Day 68
  { name: "Independence Day",          venue: 'bigbuka', menu: M_ALL   , goal:  30000, time: 114, max: 4, spawn: [3.0, 4.9], pat: 30, rush: true, events: ['power'], critic: true },  // Day 69
  { name: "Busy Tuesday",              venue: 'bigbuka', menu: M_ALL   , goal:  30500, time: 114, max: 4, spawn: [2.9, 4.9], pat: 30, rush: true, critic: true },  // Day 70
  { name: "Rain and more rain",        venue: 'bigbuka', menu: M_ALL   , goal:  30500, time: 114, max: 4, spawn: [2.9, 4.8], pat: 29, rush: true, critic: true },  // Day 71
  { name: "Owambe season",             venue: 'bigbuka', menu: M_ALL   , goal:  31000, time: 117, max: 4, spawn: [2.9, 4.8], pat: 29, rush: true, critic: true },  // Day 72
  { name: "Back to school",            venue: 'bigbuka', menu: M_ALL   , goal:  31000, time: 117, max: 4, spawn: [2.8, 4.8], pat: 29, rush: true, events: ['power', 'wash', 'owe'], critic: true },  // Day 73
  { name: "Second semester",           venue: 'bigbuka', menu: M_ALL   , goal:  31500, time: 117, max: 4, spawn: [2.8, 4.7], pat: 29, rush: true, events: ['gas'], critic: true, chapter: 23 },  // Day 74
  { name: "Danfo strike",              venue: 'bigbuka', menu: M_ALL   , goal:  31500, time: 117, max: 4, spawn: [2.8, 4.7], pat: 29, rush: true, critic: true },  // Day 75
  { name: "Big order",                 venue: 'bigbuka', menu: M_ALL   , goal:  32000, time: 117, max: 4, spawn: [2.8, 4.6], pat: 28, rush: true, critic: true },  // Day 76
  { name: "Christmas again",           venue: 'bigbuka', menu: M_ALL   , goal:  32000, time: 117, max: 4, spawn: [2.7, 4.6], pat: 28, rush: true, events: ['power'], critic: true },  // Day 77
  { name: "Cash scarcity",             venue: 'bigbuka', menu: M_ALL   , goal:  32500, time: 117, max: 4, spawn: [2.7, 4.5], pat: 28, rush: true, events: ['wash'], critic: true },  // Day 78
  { name: "Transfer only",             venue: 'bigbuka', menu: M_ALL   , goal:  32500, time: 117, max: 4, spawn: [2.7, 4.5], pat: 28, rush: true, critic: true },  // Day 79
  { name: "No cash, no wahala",        venue: 'bigbuka', menu: M_ALL   , goal:  33000, time: 120, max: 4, spawn: [2.6, 4.4], pat: 28, rush: true, events: ['owe'], critic: true, chapter: 24 },  // Day 80
  { name: "Market day rush",           venue: 'bigbuka', menu: M_ALL   , goal:  33000, time: 120, max: 4, spawn: [2.6, 4.4], pat: 28, rush: true, events: ['power'], critic: true },  // Day 81
  { name: "Long queue",                venue: 'bigbuka', menu: M_ALL   , goal:  33500, time: 120, max: 4, spawn: [2.6, 4.4], pat: 27, rush: true, critic: true },  // Day 82
  { name: "The catering order",        venue: 'bigbuka', menu: M_ALL   , goal:  33500, time: 120, max: 4, spawn: [2.5, 4.3], pat: 27, rush: true, events: ['gas', 'wash'], critic: true },  // Day 83
  { name: "Wedding day",               venue: 'bigbuka', menu: M_ALL   , goal:  34000, time: 120, max: 4, spawn: [2.5, 4.3], pat: 27, rush: true, critic: true },  // Day 84
  { name: "After the wedding",         venue: 'bigbuka', menu: M_ALL   , goal:  34000, time: 120, max: 4, spawn: [2.5, 4.2], pat: 27, rush: true, events: ['power'], critic: true },  // Day 85
  { name: "Harmattan again",           venue: 'bigbuka', menu: M_ALL   , goal:  34500, time: 120, max: 4, spawn: [2.5, 4.2], pat: 27, rush: true, critic: true, chapter: 25 },  // Day 86
  { name: "Hot afternoon again",       venue: 'bigbuka', menu: M_ALL   , goal:  34500, time: 120, max: 4, spawn: [2.4, 4.1], pat: 27, rush: true, events: ['owe'], critic: true },  // Day 87
  { name: "Students return",           venue: 'bigbuka', menu: M_ALL   , goal:  35000, time: 120, max: 4, spawn: [2.4, 4.1], pat: 26, rush: true, events: ['wash'], critic: true },  // Day 88
  { name: "Tobi's exams",              venue: 'bigbuka', menu: M_ALL   , goal:  35000, time: 120, max: 4, spawn: [2.4, 4.0], pat: 26, rush: true, events: ['power'], critic: true },  // Day 89
  { name: "Mama is tired",             venue: 'bigbuka', menu: M_ALL   , goal:  35500, time: 120, max: 4, spawn: [2.3, 4.0], pat: 26, rush: true, critic: true },  // Day 90
  { name: "Easter rush",               venue: 'bigbuka', menu: M_ALL   , goal:  36000, time: 120, max: 4, spawn: [2.3, 4.0], pat: 26, rush: true, critic: true },  // Day 91
  { name: "Football fever",            venue: 'bigbuka', menu: M_ALL   , goal:  36000, time: 120, max: 4, spawn: [2.3, 3.9], pat: 26, rush: true, events: ['gas'], critic: true, chapter: 26 },  // Day 92
  { name: "Rainy Monday",              venue: 'bigbuka', menu: M_ALL   , goal:  36500, time: 120, max: 4, spawn: [2.3, 3.9], pat: 25, rush: true, events: ['power', 'wash'], critic: true },  // Day 93
  { name: "Last stretch",              venue: 'bigbuka', menu: M_ALL   , goal:  36500, time: 120, max: 4, spawn: [2.3, 3.8], pat: 25, rush: true, events: ['owe'], critic: true },  // Day 94
  { name: "Oga Critic's warning",      venue: 'bigbuka', menu: M_ALL   , goal:  37000, time: 120, max: 4, spawn: [2.3, 3.8], pat: 25, rush: true, critic: true },  // Day 95
  { name: "Chief returns",             venue: 'bigbuka', menu: M_ALL   , goal:  37000, time: 120, max: 4, spawn: [2.3, 3.8], pat: 25, rush: true, critic: true },  // Day 96
  { name: "The night before",          venue: 'bigbuka', menu: M_ALL   , goal:  37500, time: 120, max: 4, spawn: [2.3, 3.8], pat: 25, rush: true, events: ['power'], critic: true, chapter: 27 },  // Day 97
  { name: "Final preparations",        venue: 'bigbuka', menu: M_ALL   , goal:  37500, time: 120, max: 4, spawn: [2.3, 3.8], pat: 25, rush: true, events: ['wash'], critic: true },  // Day 98
  { name: "Full house",                venue: 'bigbuka', menu: M_ALL   , goal:  38000, time: 120, max: 4, spawn: [2.3, 3.8], pat: 24, rush: true, critic: true },  // Day 99
  { name: "Best buka in town",         venue: 'bigbuka', menu: M_ALL   , goal:  38000, time: 120, max: 4, spawn: [2.3, 3.8], pat: 24, rush: true, critic: 'finale', chapter: 28 },  // Day 100
];

/* ---------------------------------------------------------------------
   STORY CHAPTERS
   Lines: [who, text]. who = mama, tobi, landlord, critic, iyabose, bode, ada, officer, ngozi, chidi
   ['choice', question, [ { t: button text, money: ±naira, bill: { n, amt, days }, flag, unflag, priceLvl, reply: [lines] } ]]
   ['if', flag, [lines]] / ['ifnot', flag, [lines]]  show lines only if an earlier choice set (or did not set) the flag
   Chapter options: bill (must be paid before day dueBefore), unlockPrice (1 or 2), costUp (ingredients get dearer),
   wipeStock (the pots are lost), flag (set a flag when the chapter is seen)
   --------------------------------------------------------------------- */
const CHAPTERS = {
  1: { title: "Mama’s roadside stall", lines: [
    ['mama', 'My pikin, you are welcome! For twenty years this small stall by the road has fed everybody on this street.'],
    ['mama', 'My back is no longer strong like before. My husband is gone, and my son Tobi is still in school. From today, you will help me.'],
    ['mama', 'Cook the food, fill the plates, serve the customers before they lose patience, and put the money in the till.'],
    ['mama', 'Every naira counts. Rice, beef and pepper cost money, so we must sell more than we spend.'],
    ['mama', 'I cooked a pot of jollof this morning. It will last us some days. When it finishes, we cook again.'],
    ['mama', 'If we save well, one day we will have a proper buka with tables and chairs. That is my dream.'],
  ] },
  2: { title: "Tobi’s big exam", lines: [
    ['tobi', 'Mama, I am writing my JAMB exam this month. I want to study Medicine.'],
    ['mama', 'My son, a doctor! Then you must read hard, and I must sell hard.'],
    ['tobi', 'When I become a doctor, you will rest, Mama. I promise.'],
    ['mama', 'Until then, we cook! Come, the customers are waiting.'],
  ] },
  3: { title: 'NEPA has taken light!', lines: [
    ['mama', 'The weather is hot and the light has been blinking since morning.'],
    ['mama', 'If NEPA takes light, the zobo fridge stops and the customers start to sweat and complain.'],
    ['mama', 'The generator is at the back. Fill the petrol, open the fuel tap, switch it on and pull the rope.'],
    ['mama', 'Petrol is now ₦1,300 per litre. Every time that light goes, our profit goes with it.'],
  ] },
  4: { title: 'Rush hour at the motor park', lines: [
    ['mama', 'The buses from the motor park arrive at lunchtime. Drivers, conductors, traders, everybody wants food at once.'],
    ['mama', 'When rush hour comes, do not panic. Serve fast, and the tips will be sweet.'],
  ] },
  5: { title: 'Landlord wahala', bill: { id: 'rent', n: "Chief’s rent", amt: 80000, dueBefore: 13 }, lines: [
    ['landlord', 'Mama Put! Good afternoon. I have come about this space you are using.'],
    ['landlord', 'From this month, the rent is ₦80,000. And I want all of it, soon.'],
    ['mama', 'Chief! ₦80,000? For a roadside space under an umbrella? Last year it was ₦30,000!'],
    ['landlord', 'Everything has gone up, Mama. Pay or pack. Plenty people want this spot.'],
    ['choice', 'Chief is waiting. What will Mama say?', [
      { t: 'Beg Chief for more time', flag: 'begged', reply: [
        ['mama', 'Chief, please. Business is slow. Give me small time, I beg you.'],
        ['landlord', 'Hmm. Because of your jollof, I will wait. You have until Day 13. Not one day more.'] ] },
      { t: 'Promise to pay on time', flag: 'proud', reply: [
        ['mama', 'Chief, you will get your money. Mama Put has never owed anybody.'],
        ['landlord', 'We shall see. Day 13. I will be here.'] ] },
    ]],
    ['mama', 'My pikin, you heard him. The rent comes out of our buka account. We must sell like never before.'],
  ] },
  6: { title: "Bode’s promise", lines: [
    ['bode', 'Mama, good afternoon. Abeg, I never eat since morning. My okada spoil and I spent all my money on the mechanic.'],
    ['bode', 'Give me jollof and beef today. I go pay you ₦2,000 by next week. I swear!'],
    ['choice', 'Bode looks very hungry. Will Mama give him food on credit?', [
      { t: 'Give Bode food. He will pay.', flag: 'trustBode', money: -900, label: "Bode’s plate of food", reply: [
        ['mama', 'Sit down, my son. Nobody goes hungry at Mama Put. But pay me o!'],
        ['bode', 'God bless you, Mama! I will not forget this.'] ] },
      { t: 'Say sorry. No money, no food.', reply: [
        ['mama', 'Bode, I am sorry. I also have rent to pay. I cannot give food for free.'],
        ['bode', 'I understand, Mama… I will manage.'] ] },
    ]],
    ['mama', 'And watch that gas cylinder. When the gas finishes, we change it ourselves. A refill is ₦16,000 now!'],
  ] },
  7: { title: 'Our own buka', unlockPrice: 1, lines: [
    ['mama', 'I paid Chief every last kobo. Then I said to myself: never again.'],
    ['mama', 'With our savings and my thrift contribution, I have rented a real shop. Tables, chairs and a ceiling fan!'],
    ['tobi', 'Mama, this place fine o! Customers will sit down and enjoy.'],
    ['mama', 'A real buka must sell white rice and stew. And bigger buka, bigger prices: you can raise our menu prices on the Account & market screen.'],
    ['mama', 'But do not chase our customers away. Their faces will tell you if the price is too high.'],
  ] },
  8: { title: 'The levy man', lines: [
    ['officer', 'Good morning, madam. I am from the local government revenue office.'],
    ['officer', 'Every food business must pay the ₦15,000 environmental and signage levy for this quarter.'],
    ['mama', 'Fifteen thousand naira? We just opened! Are you sure this is a real levy?'],
    ['choice', 'The officer is waiting. What will Mama do?', [
      { t: 'Pay the ₦15,000 now', money: -15000, label: 'Council levy', flag: 'paidLevy', reply: [
        ['officer', 'Thank you, madam. Here is your receipt. Keep it safe.'],
        ['mama', 'Fifteen thousand gone, just like that. Ehen. Let us work.'] ] },
      { t: 'Ask for his ID card and an official receipt first', bill: { n: 'Council levy (official receipt)', amt: 15000, days: 5 }, flag: 'askedID', reply: [
        ['officer', 'Very good, madam. Many fake collectors are going around. Here is my ID. Pay at the council office within 5 days.'],
        ['mama', 'At least I know where my money is going.'] ] },
      { t: 'Refuse to pay', bill: { n: 'Levy plus penalty', amt: 25000, days: 3 }, flag: 'refusedLevy', reply: [
        ['officer', 'Then it is ₦25,000 with the penalty, madam. Pay within 3 days or we seal this shop.'],
        ['mama', 'Ah! Me and my big mouth…'] ] },
    ]],
  ] },
  9: { title: 'Mountain of plates', lines: [
    ['mama', 'The rain is falling and everybody is coming inside to eat. The plates will pile up. When they finish, run to the sink.'],
    ['tobi', 'Mama! Mama! My JAMB result is out. I scored 298!'],
    ['mama', 'Two hundred and ninety-eight! My son is a genius! Now we wait for the admission list.'],
    ['if', 'trustBode', [
      ['bode', 'Mama! I am back. Here is your ₦2,000, and ₦500 extra for your kindness.'],
      ['mama', 'Bode! See? Not everybody is a cheat. God bless you.'],
      ['choice', 'Bode has paid. Take the money?', [ { t: 'Take the ₦2,500 with thanks', money: 2500, unflag: 'trustBode', reply: [['mama', 'Thank you, my son. Come and eat any time.']] } ]],
    ]],
  ] },
  10: { title: 'Admission letter', bill: { id: 'fees', n: "Tobi’s school fees", amt: 250000, dueBefore: 30 }, lines: [
    ['tobi', 'Mama… I got admission! Medicine and Surgery, at the university!'],
    ['mama', 'My son! A medical student! Let me dance! *dances*'],
    ['tobi', 'But Mama, the school fees, hostel and acceptance fee are ₦250,000. Payment closes before Day 30.'],
    ['mama', '*quietly* Two hundred and fifty thousand…'],
    ['mama', 'Do not worry, my son. Every plate we sell from today is for your school fees. We will find it.'],
    ['mama', 'And customers keep asking for amala and ewedu. If we add them to the menu, more money will come.'],
  ] },
  11: { title: "Mama’s back", lines: [
    ['mama', 'Ahh! My back! I cannot stand straight this morning.'],
    ['ngozi', 'Mama, you need to see a doctor. You stand in that kitchen from 5am.'],
    ['mama', 'Doctor means money. The hospital will ask for ₦35,000 for tests and drugs, and Tobi’s fees are not complete.'],
    ['choice', 'Mama is in pain. What should she do?', [
      { t: 'Go to the hospital (₦35,000)', bill: { n: 'Hospital bill', amt: 35000, days: 4 }, flag: 'treated', reply: [
        ['mama', 'The doctor said I must rest small and take my drugs. It is good I went.'] ] },
      { t: 'Buy pain relief and keep working (₦3,000)', money: -3000, label: 'Pain relief', flag: 'backpain', reply: [
        ['mama', 'I will manage. Tobi must go to school. My back can wait.'],
        ['ngozi', 'Mama… please do not wait too long.'] ] },
    ]],
  ] },
  12: { title: 'A helping hand', lines: [
    ['ngozi', 'Mama, my husband travelled and never came back. I have two children. Please, give me any work.'],
    ['mama', 'Ngozi, I know that pain. But a helper is ₦10,000 every week, and money is tight.'],
    ['choice', 'Will Mama hire Ngozi as her helper?', [
      { t: 'Hire Ngozi (₦10,000 now). Customers wait a bit longer.', money: -10000, label: "Ngozi’s first wages", flag: 'ngozi', reply: [
        ['ngozi', 'Thank you, Mama! I will wash, I will serve, I will do everything!'] ] },
      { t: 'Say you cannot afford it now', reply: [
        ['mama', 'Not now, my daughter. When things get better, come back.'],
        ['ngozi', 'Okay, Mama. Thank you anyway.'] ] },
    ]],
    ['iyabose', 'Mama Put! It is Iya Bose from the market. If money is ever short for ingredients, I can give you goods on credit. 10% extra when you pay back.'],
  ] },
  13: { title: 'Tobi leaves for school', lines: [
    ['tobi', 'Mama, my bags are packed. The bus leaves at 6.'],
    ['mama', 'Read your books. Do not follow bad friends. Eat well. Call me every Sunday.'],
    ['tobi', 'Mama… I need small money for food and transport in school.'],
    ['choice', 'How much pocket money will Mama give Tobi?', [
      { t: 'Give him ₦20,000', money: -20000, label: "Tobi’s pocket money", flag: 'generous', reply: [['tobi', 'Thank you, Mama! I will make you proud.']] },
      { t: 'Give him ₦10,000. Things are hard.', money: -10000, label: "Tobi’s pocket money", reply: [['tobi', 'Thank you, Mama. I will manage it well.']] },
    ]],
    ['mama', '*watching the bus leave* … Okay. Back to work. The pots will not cook themselves.'],
  ] },
  14: { title: 'Market prices go up', costUp: 0.2, lines: [
    ['iyabose', 'Mama Put, I am sorry o. A bag of rice has jumped again. Pepper, oil, onions, everything.'],
    ['mama', 'Iya Bose! How do you want us to survive?'],
    ['iyabose', 'It is not me, Mama. It is the dollar, the transport, the fuel. Everything costs 20% more from today.'],
    ['mama', 'Twenty percent… If I raise my prices, my customers will run. If I do not, I will run at a loss.'],
  ] },
  15: { title: 'The flood', wipeStock: true, bill: { id: 'flood', n: 'Flood repairs', amt: 30000, dueBefore: 39 }, lines: [
    ['mama', 'Yesterday it rained from evening until morning. The gutter overflowed.'],
    ['mama', 'Water entered the buka. Everything in the pots is spoilt. The chairs are floating.'],
    ['ngozi', 'Mama, the electrician says the wiring and the floor will cost ₦30,000 to fix.'],
    ['mama', '*sits down slowly* Twenty years I have been doing this. Every time I stand up, something pushes me down.'],
    ['mama', '… But we do not give up. Clean up. Cook fresh pots. We open today.'],
  ] },
  16: { title: 'The Big Buka', unlockPrice: 2, lines: [
    ['mama', 'Do you know what happened? The shop next door was empty for months. The owner came to eat our amala.'],
    ['mama', 'He said: "Mama, take my shop. Pay me small small." So now we have two shops joined together!'],
    ['mama', 'Welcome to Mama Put Big Buka! More tables, more customers, more money, more wahala.'],
    ['mama', 'Big buka, big buka prices. You can raise our prices again, but watch the faces.'],
  ] },
  17: { title: 'Missing money', lines: [
    ['mama', 'I counted the till last night. ₦12,000 is missing.'],
    ['if', 'ngozi', [['ngozi', 'Mama… why are you looking at me like that? I did not take your money!']]],
    ['choice', 'What will Mama do?', [
      { t: 'Shout at everybody until somebody confesses', money: -12000, label: 'Missing money', flag: 'shouted', reply: [
        ['mama', 'Somebody in this buka is a thief!'],
        ['if', 'ngozi', [['ngozi', '*crying* After everything… I will never steal from you, Mama.']]],
        ['mama', '*later, alone* The money is gone. And my heart is heavy.'] ] },
      { t: 'Calm down and count again carefully', reply: [
        ['mama', '*counting again* … Wait. The notes fell behind the fridge! All ₦12,000!'],
        ['mama', 'Thank God I did not accuse anybody.'] ] },
    ]],
  ] },
  18: { title: "Tobi’s hostel and books", bill: { id: 'hostel', n: "Tobi’s hostel and textbooks", amt: 120000, dueBefore: 55 }, lines: [
    ['tobi', 'Mama, first semester went well. I got As in Anatomy!'],
    ['mama', 'My doctor! Tell me, how is the food in school?'],
    ['tobi', 'Not like your own, Mama. … Mama, the hostel fee and medical textbooks are ₦120,000 before second semester.'],
    ['mama', 'Medicine is not cheap. But my son must finish. We will find it.'],
  ] },
  19: { title: 'The rival buka', lines: [
    ['chidi', 'Mama, have you seen? A new buka opened across the road. "Mama Cass Kitchen". Their jollof is ₦400.'],
    ['mama', 'Four hundred naira jollof! With what profit?'],
    ['choice', 'Customers are watching. How will Mama fight back?', [
      { t: 'Go back to roadside prices', priceLvl: 0, reply: [['mama', 'Fine. Our prices go down. Smaller profit, but our customers stay.']] },
      { t: 'Keep prices. Make the food sweeter than theirs.', flag: 'quality', reply: [['mama', 'Cheap food is not sweet food. Let them taste the difference.']] },
      { t: 'Give free zobo to loyal customers this week (₦8,000)', money: -8000, label: 'Free zobo for loyal customers', flag: 'loyal', reply: [['chidi', 'Mama, see love! I am not going anywhere.']] },
    ]],
    ['if', 'shouted', [
      ['mama', 'Oh! While moving the fridge for the new customers, look what I found. The ₦12,000 that went missing!'],
      ['if', 'ngozi', [['mama', 'Ngozi, my daughter, I am sorry. I accused you for nothing.'], ['ngozi', 'It is okay, Mama. I am just happy the truth came out.']]],
      ['choice', 'Mama found the missing money.', [ { t: 'Put the ₦12,000 back in the account', money: 12000, unflag: 'shouted', reply: [] } ]],
    ]],
  ] },
  20: { title: 'Fuel scarcity', flag: 'scarcity', lines: [
    ['mama', 'There is no petrol in town. The filling stations have queues from morning till night.'],
    ['bode', 'Mama, black market petrol is ₦1,800 per litre now! My okada is parked.'],
    ['mama', 'And NEPA chooses this week to disappear. Every time we start the generator, we are burning money.'],
  ] },
  21: { title: "Oga Critic’s visit", lines: [
    ['critic', 'Good afternoon. They tell me Mama Put has the sweetest jollof in this city. I have heard that one many times before.'],
    ['critic', 'I write the "Where to Eat" column in the newspaper. Today, I will judge for myself.'],
    ['mama', 'That is Oga Critic! When you see him, give him your best plate. Our name is on the line.'],
  ] },
  22: { title: "Mama’s birthday", lines: [
    ['tobi', 'SURPRISE! Happy birthday, Mama!'],
    ['mama', 'Tobi! You came all the way from school?'],
    ['chidi', 'Mama, all your customers contributed. You feed us every day. Today we say thank you.'],
    ['choice', 'The customers hand Mama an envelope.', [ { t: 'Open the envelope', money: 20000, reply: [['mama', '₦20,000… *wipes tears* You people want to make an old woman cry in her own buka.']] } ]],
  ] },
  23: { title: 'Second semester', bill: { id: 'sem2', n: "Tobi’s second-year fees", amt: 180000, dueBefore: 82 }, lines: [
    ['tobi', 'Mama, second year fees are out. ₦180,000 before Day 82.'],
    ['mama', 'Again? We just finished paying the last one!'],
    ['if', 'backpain', [
      ['mama', '*holding her back* Ahh… this pain has come back worse than before.'],
      ['ngozi', 'Mama, you cannot keep managing. The doctor says you need proper treatment now. ₦60,000.'],
      ['choice', 'The back pain is serious now.', [ { t: 'Go for treatment (₦60,000)', bill: { n: 'Back treatment', amt: 60000, days: 5 }, unflag: 'backpain', flag: 'treated', reply: [['mama', 'I should have gone the first time. Cheap became expensive.']] } ]],
    ]],
  ] },
  24: { title: 'No cash in town', lines: [
    ['mama', 'The banks have no cash. Customers want to pay by transfer, and POS agents are charging ₦200 for every ₦1,000.'],
    ['choice', 'How will Mama take payment?', [
      { t: 'Buy a POS machine (₦45,000). Customers love it.', money: -45000, label: 'POS machine', flag: 'pos', reply: [['mama', 'Now everybody can pay. Card, transfer, anything!']] },
      { t: 'Cash and transfer only. Save the money.', reply: [['mama', 'If you do not have cash, transfer. If you cannot transfer… wait patiently.']] },
    ]],
  ] },
  25: { title: 'The catering order', lines: [
    ['ada', 'Mama, I am getting married! I want Mama Put to cook for my 300 guests. Jollof, white rice, stew and amala.'],
    ['mama', '300 guests! My daughter, that is a big order.'],
    ['ada', 'I will pay ₦400,000. Half now.'],
    ['choice', 'A big catering order. Accept?', [
      { t: 'Accept! (+₦200,000 deposit, ₦120,000 of extra ingredients)', money: 80000, flag: 'catering', reply: [['mama', 'We will cook till our hands fall off. Ngozi, call your sisters!']] },
      { t: 'Decline. The buka is busy enough.', reply: [['ada', 'Okay, Mama. Maybe next time.']] },
    ]],
  ] },
  26: { title: 'Mama is tired', lines: [
    ['tobi', '*on the phone* Mama, exams start next week. Pray for me.'],
    ['mama', 'I pray for you every morning before I light the fire.'],
    ['ifnot', 'treated', [['tobi', 'Mama, your voice sounds weak. Are you resting at all?'], ['mama', 'I will rest when you become a doctor.']]],
    ['if', 'treated', [['tobi', 'Mama, you sound strong today!'], ['mama', 'Since that treatment, I am a new woman. Ha!']]],
  ] },
  27: { title: 'Chief returns', lines: [
    ['landlord', 'Mama Put… good evening. Everybody in this city is talking about your Big Buka.'],
    ['mama', 'Chief! The man who wanted ₦80,000 for an umbrella space!'],
    ['landlord', 'Ehen… about that. My new tenant ran away. Will you rent the roadside space again? I will take ₦20,000.'],
    ['mama', 'Chief, keep your space. I am busy.'],
    ['critic', 'Mama Put. Tomorrow I write my final review. The whole city will read it. Make it your best day.'],
  ] },
  28: { title: 'Best buka in town', lines: [
    ['mama', 'Today is our biggest day. The newspapers, the customers, even Oga Critic is coming back.'],
    ['tobi', 'Mama, I came from school to help you today. My exams are over!'],
    ['ngozi', 'All the pots are full, Mama. The plates are clean. We are ready.'],
    ['mama', 'From a roadside umbrella to this. Let us make this the best day Mama Put has ever seen.'],
  ] },
};

const ENDING = [
  ['critic', 'I have tasted jollof in every corner of this city. Today, I found the best.'],
  ['critic', 'Mama Put Big Buka is officially the best buka in town!'],
  ['tobi', 'Mama, I passed all my exams. Second year Medicine, and all the fees are paid.'],
  ['mama', 'Twenty years by the roadside. The rent, the flood, the light, the fuel, the fees… we survived all of it.'],
  ['mama', 'My pikin, we did it together. Come, let us dish one more plate. 🎉'],
];

window.MAMAPUT_LEVELS = { LEVELS, CHAPTERS, ENDING };
})();
