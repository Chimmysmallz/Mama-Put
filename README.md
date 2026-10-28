# Mama Put: Buka Rush

A cooking time-management game (in the style of Cooking Fever) set in Nigeria. Help Mama grow her roadside food stall into the best Big Buka in town, while paying the rent, Tobi's university fees and the market woman.

Plain HTML, CSS and JavaScript. No engine, no installs, no build step. Works on phones and computers.

Prepared by Chiamaka Nwabulue.

---

## What is in the game

- **100 story days** in three places: the roadside stall (Days 1–12), Mama Put Buka with tables (Days 13–40) and the Big Buka (Days 41–100).
- **28 story chapters with choices**. The choices change the money and come back in later chapters:
  - Chapter 5: landlord wahala.
  - Chapter 10: Tobi's university admission and school fees.
  - Also: the levy man, Mama's back pain, hiring Ngozi, the flood, money missing from the till, a rival buka, fuel scarcity, Oga Critic, Mama's birthday, a big catering order and the grand finale.
- **A growing menu**:
  - jollof, beef and zobo
  - then dodo, akara and egg
  - white rice and stew (Day 13)
  - amala and ewedu (Day 21)
  - fried fish (Day 31) and ponmo (Day 45)
- **Big pots that last for days**: jollof, white rice, stew, amala and ewedu are cooked in big pots (80–160 portions). Leftovers carry over, so you cook roughly every few days, when a pot runs empty. **The day clock pauses while you cook.**
- **Cooking side stories**, one for each pot food:
  - Jollof: chop onions, heat oil, fry, tomato paste, pepper, seasoning, stock, rice, cover, party jollof.
  - White rice: boil water, salt, rice, cover, open when soft.
  - Stew: onions, oil, pepper blend, tomato paste, fry, season, stock, simmer.
  - Amala: boil water, elubo, turn hard, steam, final turn.
  - Ewedu: chop leaves, boil, whisk with the ijabe, iru and seasoning.
  - Wrong ingredients (egusi in jollof, beans in stew…) lower the taste and the tips.
- **More side stories during the day**:
  - NEPA takes light: start the generator.
  - The gas finishes: change the cylinder and check for leaks.
  - The plates run out: wash them.
  - A customer begs to eat now and pay later: some pay back, some never come back.
- **Customers** (six characters plus Oga Critic) change face as they wait: happy, impatient, angry. Their names match their gender.
- **Rush hours** in the middle of busy days, and a separate **Rush Hour** mode (unlocks after Day 3).
- **Real naira money**:
  - Customers pay the exact menu price and leave a small tip ("dash"), shown separately.
  - Every ingredient, pot, litre of petrol, gas refill, bill and upgrade comes out of the buka account.
- **Market credit**: when money is short, Iya Bose sells on credit. You pay her back with 10% extra.
- **Menu prices**: raise prices at the Buka (+20%) and the Big Buka (+40%).
- **Upgrades**, from a ₦15,000 frying pan to a ₦1,200,000 inverter that ends power cuts.
- **Animated characters**: customers walk in from the street and walk out when they leave. Mama walks behind the counter to hand over each plate, then goes back to her spot.
- **Street and buka sounds**:
  - At the roadside stall: traffic, car and danfo horns, passing okadas and a bus conductor calling routes.
  - Inside the Buka and Big Buka: these become softer, with crowd chatter.
  - Real recordings can be dropped in (see `SOUNDS.md`). Until then the game uses built-in sounds, and the conductor speaks with the phone's voice.
- **Decorate the buka** (🎨 on the map) with a signboard (wooden or neon), plants, chairs (red plastic or wooden ankara), wall paint, tablecloths and party lights. Every decoration in use makes customers wait a little longer and tip a little more (up to +10%).
- **Helpers** (👩🏾‍🍳 on the map), each paid a daily wage and trainable up to level 3:
  - Ngozi washes dirty plates.
  - Kunle fills and serves zobo.
  - Mr Okafor collects money into the till.
  - Hiring Ngozi in the story makes her your washer for free.
- **Daily rewards and 21 achievements** (🏆): collect a reward each day you play, rising to ₦25,000 on day 7 of a streak. Achievements include "Serve 1,000 plates", "10 perfect pots of jollof", "Start the generator 10 times" and "Earn ₦10,000,000". Each pays cash into the buka account.
- **Rush Hour leaderboard** (🏅): all-time, this week and this device. The online board needs a free Supabase project (see below).
- **Detailed settings**: sound, music, vibration, difficulty, hints, auto-collect money, prices on orders and market credit, plus saving and loading progress.

## Prices used

| Selling price (roadside) | | Mama's cost | |
|---|---|---|---|
| Jollof rice, per portion | ₦500 | Jollof ingredients, per portion (a 120-portion pot = ₦30,000) | ₦250 |
| White rice, per portion | ₦500 | White rice, per portion | ₦150 |
| Stew, per ladle | ₦200 | Stew, per ladle | ₦100 |
| Amala, per wrap | ₦300 | Amala, per wrap | ₦120 |
| Ewedu, per portion | ₦200 | Ewedu, per portion | ₦80 |
| Beef, egg, fried fish, ponmo (each) | ₦500 | Beef ₦300 · egg ₦200 · fish ₦300 · ponmo ₦250 | |
| Dodo (plantain), per portion | ₦200 | Plantain, per portion | ₦100 |
| Akara, per portion | ₦300 | Akara batter, per portion | ₦150 |
| Zobo, per bottle | ₦700 | Zobo, per bottle | ₦300 |
| | | Petrol for the generator (3 litres at ₦1,300) | ₦3,900 |
| | | Cooking gas refill (12.5kg) | ₦16,000 |
| | | Dish soap | ₦500 |

Change them at the top of `js/game.js` (`FOOD`, `COST` and `POTS`). Ingredient costs rise by 20% from Chapter 14. During the fuel scarcity (Chapter 20, Days 57–65) petrol costs ₦1,800 a litre.

## How the money works

- **Customers pay the menu price**, shown on their order. A tip is shown separately on the naira notes. Tips come from:
  - fast service (up to 12%)
  - combos (up to 10%)
  - sweet pot food (5%)
  - rush hour (10%)
  - Oga Critic (40%)
  - a POS machine or better food from story choices (3% each)
- **Buying a whole pot of ingredients** comes out of the account when you cook it. For the day's profit, each portion counts as a cost only when you serve it, so a cooking day is not punished.
- Beef, eggs, fish, ponmo, plantain, akara batter and zobo are paid for when you use them.
- **Profit** = food sales + tips − cost of the food you served − petrol − soap. The day's goal and stars are based on profit.
- **Mama's evening sales**: Mama keeps selling after your shift and earns 50% of your profit per star.
- **Credit**: Iya Bose's limit is ₦60,000 at the stall, ₦120,000 at the Buka and ₦200,000 at the Big Buka. Half of each day's earnings repay her automatically.
- **Bills from the story** lock a day until they are paid:
  - Chief's rent ₦80,000 (before Day 13)
  - Tobi's school fees ₦250,000 (before Day 30)
  - flood repairs ₦30,000 (before Day 39)
  - hostel and books ₦120,000 (before Day 55)
  - second-year fees ₦180,000 (before Day 82)
  - plus any bills from your choices (hospital, levy…)

## Play it on your computer

Download the folder and double-click `index.html`.

## Put it online free with GitHub Pages

1. Sign in at https://github.com (free account).
2. Click **+** (top right) > **New repository**. Name it `mama-put`. Choose **Public**. Click **Create repository**.
3. Click **uploading an existing file**. Open the unzipped `mama-put-web` folder, select **everything inside it** (index.html, css, js, assets, README.md, LICENSE) and drag it into the browser window. Wait for the upload, then click **Commit changes**. `index.html` must sit at the top level, not inside another folder.
4. Go to **Settings > Pages**. Source: **Deploy from a branch**. Branch: **main**, folder **/ (root)**. Click **Save**.
5. After a minute or two your game is live at `https://YOUR-USERNAME.github.io/mama-put/`.

To update: open the file on GitHub, click the pencil icon, edit, and **Commit changes**. Or use **Add file > Upload files** to replace files. The live game updates within a couple of minutes.

## How to add more days (levels)

1. Open `js/levels.js`.
2. Copy any line inside `LEVELS`, for example the last one:
   ```js
   { name: "Best buka in town", venue: 'bigbuka', menu: M_ALL, goal: 38000, time: 120, max: 4, spawn: [2.3, 3.8], pat: 24, rush: true, critic: 'finale', chapter: 28 },
   ```
3. Paste it on a new line just before the closing `];` and change it. For example, Day 101:
   ```js
   { name: "Christmas Eve", venue: 'bigbuka', menu: M_ALL, goal: 39000, time: 120, max: 4, spawn: [2.3, 3.8], pat: 24, rush: true, events: ['power', 'gas', 'wash', 'owe'], critic: true },
   ```
4. Save and refresh. The new day appears on the map after Day 100.

Every field is explained at the top of `levels.js`:
- **name**: the day's title
- **venue**: `'stall'`, `'buka'` or `'bigbuka'`
- **menu**: one of `M_START`, `M_ZOBO`, `M_DODO`, `M_AKARA`, `M_EGG`, `M_BUKA`, `M_AMALA`, `M_FISH` or `M_ALL`, or your own list
- **goal**: the profit needed for 1 star
- **time**: the length of the day in seconds
- **max**: the most customers waiting at once
- **spawn**: seconds between customers
- **pat**: customer patience in seconds
- **rush**: a rush hour during the day
- **events**: any of `'power'`, `'gas'`, `'wash'`, `'owe'`
- **critic**: Oga Critic visits
- **chapter**: shows a story chapter before the day

**To add a story chapter**:
1. Add an entry to `CHAPTERS` in the same file.
2. Write its lines for `mama`, `tobi`, `landlord`, `critic`, `iyabose`, `bode`, `ada`, `officer`, `ngozi` or `chidi`.
3. Optionally add choices: `['choice', question, [ { t, money, bill, flag, reply } ]]`.
4. Optionally add lines that only appear after an earlier choice: `['if', flag, [...]]`.
5. Set `chapter: <number>` on the day it should appear.

The comments in `levels.js` explain each option.

## Saving progress

- **Automatic**: progress is saved in the browser on that device after every day.
- **Save code**: Settings > **Copy save code**. Paste it on another phone with **Enter save code**.
- **Save file**: Settings > **Download** and **Load file**.
- **Google account** (optional, free): players sign in with Google, and their save is kept in a hidden game folder in their own Google Drive. The game never sees their other files.

### Google sign-in (one-time setup, about 15 minutes, free)

Google sign-in only works on the online version (`https://…github.io/…`), not when opening the file from your computer.

1. Go to https://console.cloud.google.com and sign in. Create a new project called **Mama Put**.
2. **APIs & Services > Library**: search **Google Drive API** and click **Enable**.
3. **APIs & Services > OAuth consent screen** (called "Google Auth Platform" in newer versions):
   - Choose **External**.
   - Fill in the app name (Mama Put), a support email and a developer contact email.
   - Under **Scopes** (Data access), add `.../auth/drive.appdata` ("See, create and delete its own configuration data in your Google Drive").
   - While the app is in **Testing**, add the Google accounts that may sign in as **Test users** (up to 100). When you are ready for everyone, click **Publish app**. Google may ask you to verify the app.
4. **APIs & Services > Credentials > Create credentials > OAuth client ID**:
   - Application type: **Web application**.
   - Under **Authorized JavaScript origins**, add `https://YOUR-USERNAME.github.io` (no slash at the end, no repository name).
   - Click **Create** and copy the **Client ID** (it ends in `.apps.googleusercontent.com`).
5. Open `js/config.js` and paste it:
   ```js
   googleClientId: '1234567890-abc123.apps.googleusercontent.com',
   ```
6. Commit the change on GitHub, wait a minute, open the game, go to **Settings > Sign in with Google**, then **Save to Google**. On another device, sign in and tap **Load from Google**.

Google's screens change from time to time. If a button has moved, look for the same words (OAuth consent screen, Scopes, Credentials, Authorized JavaScript origins).

## Online leaderboard (optional, free, about 10 minutes)

Without this, the leaderboard shows scores from the player's own device. To share scores between all players:

1. Create a free account at https://supabase.com and click **New project**. Pick any name and password, and the region closest to your players.
2. In the project, open **SQL Editor > New query**, paste this and click **Run**:
   ```sql
   create table public.rush_scores (
     id bigint generated always as identity primary key,
     name text not null check (char_length(name) between 2 and 20 and name ~ '^[[:alnum:] ._''-]+$'),
     score integer not null check (score between 0 and 500000),
     venue text check (venue in ('stall', 'buka', 'bigbuka')),
     created_at timestamptz not null default now()
   );

   -- Row-level security: players may only read scores and add new ones. Nobody can edit or delete through the app.
   alter table public.rush_scores enable row level security;
   create policy "read scores" on public.rush_scores for select to anon using (true);
   create policy "add a score" on public.rush_scores for insert to anon with check (true);

   -- Players can only fill in name, score and venue (not the id or the date), and only see name, score and date.
   revoke all on public.rush_scores from anon;
   grant select (name, score, created_at) on public.rush_scores to anon;
   grant insert (name, score, venue) on public.rush_scores to anon;

   -- Slow down spam: one score per nickname every 30 seconds.
   create or replace function public.rush_rate_limit() returns trigger language plpgsql as $$
   begin
     if exists (select 1 from public.rush_scores where name = new.name and created_at > now() - interval '30 seconds') then
       raise exception 'Too many scores, slow down';
     end if;
     return new;
   end $$;
   create trigger rush_rate_limit before insert on public.rush_scores
     for each row execute function public.rush_rate_limit();
   ```
3. Go to **Project Settings > API**. Copy the **Project URL** and the **anon public** key.
4. Paste both into `js/config.js`:
   ```js
   supabaseUrl: 'https://abcdefgh.supabase.co',
   supabaseAnonKey: 'eyJhbGciOi...',
   ```
5. Commit the change on GitHub. Players set a **player name** in Settings, and their Rush Hour scores are sent automatically.

The anon key is meant to be public, like a shop's front-door key that only opens the scoreboard. Never put the **service_role** key in the game. The rules above only allow reading scores and adding new ones, with limits on names, scores and speed. A determined player could still send a believable fake score, so check the table now and then and delete anything suspicious in the Supabase Table Editor.

## Security and privacy

The game has no accounts or passwords, takes no payments and collects no personal data by default. Progress stays in the player's browser. The table below is how it measures up against common launch checklists.

| Check | Status in Mama Put |
|---|---|
| API keys hidden, no secrets in Git | ✅ No secret keys anywhere. `js/config.js` only ever holds public keys (Google client ID, Supabase anon key), which are designed to be public. Never put a Supabase **service_role** key in the game. |
| Public database key + row-level security | ✅ Uses only the Supabase anon key. RLS is on. Players can read scores and add scores, nothing else. |
| Lock record access / block field tampering | ✅ Column-level grants: players can only send name, score and venue (not id or date). Database checks limit name length and characters, score range and venue. |
| Parameterised queries | ✅ No SQL is built in the game. Supabase's REST API receives data as JSON, and query values are URL-encoded. |
| Validate all input | ✅ Player names are cleaned (letters, numbers, spaces and `. _ ' -`, max 20). Save codes and files are size-limited (300 KB) and shape-checked before loading. |
| Escape user content | ✅ Anything from players, save files or the leaderboard is escaped before it is shown. |
| Restrict file uploads | ✅ The only upload is loading your own save file: `.json` only, 300 KB max, never sent anywhere. |
| Trim API responses | ✅ The leaderboard only fetches name, score and date (top 20). |
| Rate limiting / bot protection | ⚠️ Partly. One score per nickname every 30 seconds. There is no captcha, so a determined cheater could still post fake scores. Keep an eye on the table. |
| Security headers | ⚠️ Partly. A Content Security Policy and a referrer policy are set in the page. GitHub Pages does not let you add other headers (for example X-Frame-Options). If you ever need them, put the site behind Cloudflare. |
| Force HTTPS | ✅ On GitHub Pages: Settings > Pages > tick **Enforce HTTPS**. Local Wi-Fi testing uses plain http, which is fine for testing at home. |
| Scan dependencies | ✅ No libraries or packages, so there is nothing to scan. The only outside code is Google's sign-in script, loaded only if you set up Google save and the player turns it on. |
| Server-side auth, session cookies, password hashing, login rate limits | Not applicable: no accounts, logins or cookies. Google sign-in is handled by Google. |
| Encrypt sensitive data | Not applicable: no sensitive data is stored. Progress lives in the player's own browser, and the Google save goes to the player's own Drive over HTTPS. |
| Age check | ✅ Online features stay off until the player confirms they are 18+ or have a parent's or guardian's permission. |
| Google Fonts leaking IP | ✅ Removed. The font is served from the game itself (see `assets/fonts`), or the phone's own font is used. |
| Analytics or recordings (e.g. Hotjar) | ✅ None. |
| Emails without unsubscribe | ✅ No emails are collected. |
| Payments without terms | ✅ No payments. If you add in-app purchases later, add clear price and renewal terms first. |
| Photos / biometric data | ✅ None. All characters are illustrations. |
| Cookie banner | ✅ No cookies are used. A first-launch notice explains that progress stays on the device, and a full privacy notice is in Settings > Privacy and `PRIVACY.md`. |

This is a practical checklist, not legal advice. Before charging money or running ads, check with someone who knows the Nigeria Data Protection Act (NDPA) and the NDPC's rules.

## Testing shortcuts

Add these to the end of the address:
- `?day=41`: jump to a day
- `?rush=1`: open Rush Hour
- `?kitchen=1`: Mama's jollof kitchen
- `?gen=1`: the generator
- `?wash=1`: washing the plates
- `?gas=1`: changing the gas cylinder

To reset your own progress, use Settings > Reset progress.

## Files

```
index.html          the page
css/style.css       look and layout
js/config.js        Google sign-in key and leaderboard settings (optional)
js/levels.js        the 100 days and the story: add new days here
js/game.js          game rules, prices, upgrades, side stories
assets/img/         backgrounds, food, characters, decorations, helpers
assets/audio/       your recorded sounds (see SOUNDS.md)
SOUNDS.md           which sounds to add and where to get them free
PRIVACY.md          the privacy notice
assets/fonts/       optional self-hosted game font
.nojekyll           tells GitHub Pages to serve the files as they are
```

## Licence

Code: MIT (see LICENSE). Art was generated for this project.
