# Adding real sounds to Mama Put

The game already plays built-in sounds, so it is never silent. To make it sound real:
1. Download recordings.
2. Rename each one to the name in the table below.
3. Put them in `assets/audio/`.

The game picks them up automatically the next time it loads. Both `.mp3` and `.ogg` work. Keep each file small (under about 500 KB) so the game loads fast on phones.

## Where to get free sounds you are allowed to use in a game

| Site | Licence to look for | Notes |
|---|---|---|
| https://pixabay.com/sound-effects and https://pixabay.com/music | Pixabay Content License (free for games, no credit needed) | Search the words in the table below. Good Afrobeats loops under Music. |
| https://freesound.org | **CC0** (no credit needed) or CC-BY (credit the author in the game or README) | Needs a free account. Filter by licence. |
| https://mixkit.co/free-sound-effects | Mixkit licence (free for games) | Kitchen and cash register sounds. |
| Record it yourself | Yours | A phone recording of a real Lagos bus stop or buka is the most authentic. Trim it in Audacity (https://www.audacityteam.org). |

Always check each sound's licence before you publish. Do not use songs by famous artists without permission.

## The sounds

| File name | What it should be | Search words | Length |
|---|---|---|---|
| `afrobeats-loop` | Background music that loops smoothly | afrobeat loop, amapiano loop, highlife instrumental | 30–90 s |
| `amb-traffic` | Busy roadside: cars, buses, people | busy street traffic Africa, Lagos traffic, market street | 30–60 s loop |
| `amb-restaurant` | Inside a busy eatery: chatter, plates | restaurant ambience, cafeteria crowd | 30–60 s loop |
| `amb-market` | Open market chatter | African market ambience | 30–60 s loop |
| `amb-rain` | Heavy rain on a roof | rain on tin roof | 30 s loop |
| `car-horn` | Short car horn | car horn short | under 1 s |
| `danfo-horn` | Bus horn, two beeps | bus horn, minibus horn | 1–2 s |
| `okada-pass` | A motorcycle passing by | motorcycle pass by, motorbike drive by | 2–3 s |
| `conductor-calls` | A bus conductor shouting routes (Oshodi! Obalende! Enter with your change!) | Record a friend or yourself. This one is best home-made. | 2–4 s |
| `sizzle` | Oil sizzling in a pan | frying sizzle | 1 s |
| `chop` | Knife chopping on a board | knife chop board | under 0.5 s |
| `scrub` | Scrubbing a plate with a sponge | sponge scrub dish | under 0.5 s |
| `water-splash` | Tap water / splash | water tap splash | 1 s |
| `cash-register` | Till drawer "ka-ching" | cash register cha-ching | 1 s |
| `ding` | Food ready bell | kitchen bell ding | under 1 s |
| `serve` | Happy short jingle when a customer is served | success jingle short | 1 s |
| `star` | Star earned sparkle | sparkle chime | 1 s |
| `wrong` | Mistake buzz | wrong buzzer soft | under 1 s |
| `grumble` | Impatient customer "hmm" | grumble, annoyed sigh | 1 s |
| `tap` | Soft button tap | ui tap click | under 0.3 s |
| `rush-hour` | Rush hour alarm / bus horn burst | alarm short, traffic horns | 1–2 s |
| `power-off` | Power cut "dun-dun" | power down | 1 s |
| `generator-sputter` | Generator failing to start | generator start fail | 1–2 s |
| `generator-start` | Generator starting and running | generator start engine | 2–3 s |

## Conductor voice without a recording

If there is no `conductor-calls` file, the game can read the conductor's lines aloud using the phone's built-in voice. Players can switch this off in Settings. A real recording sounds much better, so record one if you can.

## Volume

Players control three volumes in Settings: sound effects, background music, and street and buka sounds.
