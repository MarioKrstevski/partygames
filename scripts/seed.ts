/**
 * Seed script: creates a system "Party Games" user and the built-in public
 * decks for every game. Idempotent — existing seed decks are replaced.
 *
 * Run with: npm run db:seed
 *
 * Tier system:
 *   🟢 Light  — fun, everyday, totally sober-friendly. No personal attacks.
 *   🟡 Medium — more personal, crushes, group dynamics, mild embarrassment.
 *   🔴 Spicy  — adult party content. Sexual topics, desire, drinking territory.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { deck, user, type DeckContent } from "../src/lib/schema";

// ---------------------------------------------------------------------------
// Env loading (dotenv is not installed — parse .env by hand if needed)
// ---------------------------------------------------------------------------

function loadDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const envPath = resolve(__dirname, "..", ".env");
  let raw: string;
  try {
    raw = readFileSync(envPath, "utf8");
  } catch {
    throw new Error(`DATABASE_URL is not set and ${envPath} could not be read`);
  }

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (key !== "DATABASE_URL") continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value;
  }

  throw new Error(`DATABASE_URL not found in environment or ${envPath}`);
}

// ---------------------------------------------------------------------------
// Seed user
// ---------------------------------------------------------------------------

const SEED_USER_ID = "seed-user-party-games";

// ---------------------------------------------------------------------------
// Deck content
// ---------------------------------------------------------------------------

type SeedDeck = {
  gameType: (typeof deck.gameType.enumValues)[number];
  name: string;
  description: string;
  tier: "light" | "medium" | "spicy";
  content: DeckContent;
};

// ============================================================
// CHARADES
// ============================================================

const charadesLight: string[] = [
  // Animals
  "Penguin",
  "Kangaroo",
  "Octopus",
  "Flamingo",
  "Sloth",
  "Giraffe",
  "Crab",
  "Woodpecker",
  "Peacock",
  "Hamster",
  // Everyday objects / actions
  "Brushing your teeth",
  "Making a sandwich",
  "Untangling headphones",
  "Riding a bicycle",
  "Walking a stubborn dog",
  "Blowing out birthday candles",
  "Wrapping a present",
  "Pouring cereal",
  "Watering a plant",
  "Texting with one thumb",
  // Movies / characters
  "The Lion King",
  "Frozen",
  "Harry Potter",
  "Pinocchio",
  "Peter Pan",
  "Cinderella",
  "Aladdin",
  "The Jungle Book",
  "Toy Story",
  "Finding Nemo",
];

const charadesmedium: string[] = [
  // Emotions & social situations
  "Trying not to laugh",
  "Receiving bad news",
  "Pretending to listen",
  "Being the third wheel",
  "Sending a risky text",
  "Waiting for a reply",
  "Awkward elevator silence",
  "Running into your ex",
  "Faking enthusiasm",
  "Ghosting someone",
  // Social scenarios
  "Forgetting someone's name",
  "Being caught taking a selfie",
  "Explaining a bad haircut",
  "Trying to parallel park",
  "Making eye contact by accident",
  "Overhearing gossip",
  "Checking your phone under the table",
  "Leaving a voicemail",
  "Sneaking in late",
  "Pretending to be busy",
  // Relatable feelings
  "Having a crush",
  "Jealousy",
  "Embarrassment",
  "Awkward silence",
  "Flirting badly",
  "Regret",
  "Getting caught lying",
  "Playing it cool",
  "First date nerves",
  "Being put on the spot",
];

const charadesSpicy: string[] = [
  // Romantic scenarios (act them out)
  "Making the first move",
  "A very bad first kiss",
  "Sliding into DMs",
  "The morning after",
  "Speed dating",
  "Catching feelings",
  "A one-night stand",
  "Sending a flirty voice note",
  "Being stood up",
  "Drunk texting an ex",
  // Adult movie genres (act the vibe, not explicit acts)
  "Slow-burn romance",
  "Friends with benefits",
  "Forbidden attraction",
  "Jealous lover",
  "Secret affair",
  // Adult actions / euphemisms
  "Netflix and chill",
  "Benefits of a long-distance relationship",
  "Waking up next to a stranger",
  "The walk of shame",
  "Sneaking someone out at 6am",
  "A very successful pickup line",
  "Lap dance",
  "Skinny-dipping",
  "Truth or dare gone too far",
  "The talk the morning after",
  "Second base",
  "Third base",
  "Hooking up in a car",
  "Strip poker",
  "Sending thirst traps",
];

// ============================================================
// TRUTH OR DARE
// ============================================================

const truthOrDareLight: DeckContent = {
  truths: [
    "What is the most embarrassing song on your playlist right now?",
    "What was the worst haircut you ever had?",
    "What is a food combination you love that everyone else finds gross?",
    "What is the most childish thing you still do?",
    "What did you want to be when you were five years old?",
    "What is the weirdest thing you have ever googled?",
    "What was your first email address or username?",
    "What TV show have you rewatched more than twice from start to finish?",
    "What is the pettiest reason you have ever disliked someone?",
    "What is the strangest dream you can remember?",
    "Have you ever laughed at completely the wrong moment?",
    "What is the most useless talent you have?",
    "What childhood fear do you still kind of have?",
    "What is one thing on your bucket list that might surprise people?",
    "What is the last thing you searched on your phone?",
    "What is your go-to excuse when you want to skip plans?",
    "Have you ever pretended to know a celebrity's work just to fit in?",
  ],
  dares: [
    "Speak in an accent of the group's choosing until your next turn.",
    "Do your best runway walk across the room.",
    "Impersonate another player until someone guesses who it is.",
    "Do 15 jumping jacks while singing 'Happy Birthday'.",
    "Show the group the last photo in your camera roll and explain it.",
    "Dance with no music for 30 seconds.",
    "Say the alphabet backwards — start over each time you mess up (max 3 tries).",
    "Do your best impression of a baby learning to walk.",
    "Text a friend just the word 'soup' and nothing else.",
    "Make up a 15-second commercial for the nearest random object.",
    "Sing everything you say until your next turn.",
    "Draw a self-portrait in 30 seconds with your non-dominant hand.",
    "Hold a plank while the next player asks their question.",
    "Balance a spoon on your nose for 10 seconds.",
    "Do your most dramatic soap-opera gasp and hold the pose for 10 seconds.",
    "Narrate everything you do in a sports commentator voice until your next turn.",
  ],
};

const truthOrDareMedium: DeckContent = {
  truths: [
    "Who in this room would you call at 3am if you had an actual emergency?",
    "What is the most embarrassing thing that has happened to you on a date?",
    "Have you ever had a crush on a friend's partner?",
    "What is the worst way you have ended a relationship or been broken up with?",
    "What is your most embarrassing texted-the-wrong-person story?",
    "Have you ever ghosted someone? Be honest about why.",
    "Who in this room do you think has a secret you have not heard?",
    "What is the most awkward compliment you have ever received?",
    "Have you ever liked someone in this room — past or present?",
    "What is a red flag you knowingly ignored because you were attracted to someone?",
    "What is the boldest thing you have done to get someone's attention?",
    "Have you ever pretended to be busy to avoid a date?",
    "What is the most embarrassing thing in your notes app right now?",
    "What is your most cringe teenage memory?",
    "What is one thing about yourself that you project really confidently but secretly doubt?",
    "What is the most trouble you ever got into as a teenager?",
    "Have you ever snooped through someone else's phone?",
  ],
  dares: [
    "Give your best flirty wink to every player, one by one.",
    "Read the last five messages from a chat of the group's choosing (one veto allowed).",
    "Serenade the player across from you for 20 seconds.",
    "Let the group scroll your camera roll for 30 seconds.",
    "Whisper something dramatic and cryptic into the ear of the player to your right.",
    "Recreate your most-used selfie pose and hold it for 15 seconds.",
    "Call a friend and tell them completely seriously that you are 'finally ready to join the circus'.",
    "Give a 30-second foot massage to the player the group picks.",
    "Do your best impression of the player to your left trying to flirt.",
    "Post a story with a completely unposed selfie taken right now — no retakes.",
    "Compliment every player in a way that sounds almost too intense.",
    "Reenact your last awkward goodbye hug using a pillow.",
    "Let the group rename one contact in your phone (nothing hurtful, keep it silly).",
    "Share the last voice note or audio message you sent — play it out loud.",
    "Show your most embarrassing saved meme to the group.",
    "Slow-dance with an imaginary partner for 20 seconds.",
  ],
};

const truthOrDareSpicy: DeckContent = {
  truths: [
    "Who in this room would you sleep with if you had to pick right now — be honest.",
    "What is the most adventurous place you have ever had sex?",
    "Have you ever had a one-night stand? Tell us how it started.",
    "What is the biggest lie you have told someone you were dating?",
    "Have you ever sent or received nudes? How did that go?",
    "What is your most embarrassing sexual memory?",
    "Have you ever hooked up with someone in this room?",
    "What is something you have always wanted to try in bed but never said out loud?",
    "What is the fastest you have ever moved from meeting someone to sleeping with them?",
    "Have you ever faked it? Be specific.",
    "What is the wildest place you have made out with someone?",
    "Who were you most attracted to the first time you met everyone in this room?",
    "Have you ever been caught in the act?",
    "What is your hottest physical feature — in your own opinion?",
    "What is something you find incredibly attractive that most people would not expect?",
    "Have you ever sexted? Did it go as planned?",
    "What would be on your sexual bucket list that you have not checked off yet?",
  ],
  dares: [
    "Give a 60-second lap dance to the player of your choice.",
    "Kiss the player to your left — on the cheek at minimum, mouth if both agree.",
    "Send a flirty text to the last person you had a crush on right now.",
    "Let the group read your most recent flirtatious conversation.",
    "Give a 60-second back or shoulder massage to the player the group picks.",
    "Do your sexiest dance move for 30 seconds in front of everyone.",
    "Take a body shot off the player of your choice (or simulate if sober).",
    "Describe in detail the most attractive person you have ever been with — no names.",
    "Whisper something you have never told anyone into the ear of the player to your right.",
    "Remove one item of clothing — put it back on after your next turn.",
    "Give your best impression of a movie sex scene using only sound effects.",
    "Text your most recent ex just the three dots '...' and wait for them to reply.",
    "Tell the group your top three physical preferences in a partner — in detail.",
    "Sit in the lap of the player to your right for the rest of this round.",
    "Rate everyone in the room from 1 to 10 — out loud.",
    "Describe your most recent sexual dream — as much as you remember.",
  ],
};

// ============================================================
// MOST LIKELY TO
// ============================================================

const mostLikelyToLight: string[] = [
  "forget their own birthday",
  "become famous for something completely ridiculous",
  "sleep through five alarms and still be surprised they are late",
  "cry during a commercial",
  "get lost even with GPS turned on",
  "accidentally adopt too many animals",
  "eat food that fell on the floor without hesitating",
  "laugh at the worst possible moment",
  "survive a zombie apocalypse on snacks and stubbornness",
  "get kicked out of a library for being too loud",
  "trip over absolutely nothing in public",
  "still be talking after everyone else has fallen asleep",
  "show up two hours late with iced coffee and no apology",
  "have 40,000 unread emails and be at peace with it",
  "quote a movie in every single conversation",
  "get a tattoo they cannot explain five years later",
  "become everyone's unofficial therapist at a party",
  "lock themselves out of the house twice in one week",
  "cancel plans to stay home with snacks and feel no regret",
  "go viral completely by accident",
  "become the president of a very niche club",
  "move to another country on a spontaneous whim",
  "spend an entire weekend rewatching the same show again",
  "befriend every single animal they encounter",
  "forget where they parked and spend 20 minutes in the lot",
  "still be using the same password they made up in 2012",
  "bring a book to a party and actually read it",
  "make friends with a stranger in a queue in under five minutes",
  "start crying at the end of a video game",
  "name all their houseplants and talk to them daily",
];

const mostLikelyToMedium: string[] = [
  "have a crush on someone in this room right now",
  "text back three days later and act like nothing happened",
  "be the one everyone calls with a dramatic life crisis at midnight",
  "have the messiest text history with someone in this room",
  "accidentally confess feelings because they are bad at lying",
  "stay friends with every single ex",
  "have read someone's horoscope as a genuine reason to stop dating them",
  "get way too emotionally invested in a TV couple",
  "send a long voice note explaining their feelings instead of just calling",
  "catch feelings for someone who was very clearly not available",
  "subtly compete with a friend's new partner without admitting it",
  "be the most awkward person in a room and have no idea",
  "fall for someone purely based on their music taste",
  "write a long heartfelt message and then not send it",
  "still be thinking about someone from two years ago",
  "say 'we need to talk' and then say something completely harmless",
  "overshare on a first date and not even realize it",
  "have googled someone they just met before they even got home",
  "develop feelings for a friend and spend months pretending they have not",
  "get attached after one really good conversation",
  "know exactly who likes whom in this room before anyone says anything",
  "replay a conversation from last week trying to figure out what it meant",
  "flirt completely by accident and confuse everyone including themselves",
  "have brought someone home to meet the family way too soon",
  "be the one who makes up after a fight first every single time",
  "read every possible meaning into a one-word reply",
  "still have their ex's hoodie and have a very plausible excuse",
  "give the best advice about love but make terrible decisions for themselves",
  "say 'I never do this' while clearly doing exactly this",
  "end up with someone they originally said they would never date",
];

const mostLikelyToSpicy: string[] = [
  "send a risky photo to the wrong person",
  "have a one-night stand and then run into them at brunch the next day",
  "sleep with someone they just met at a party tonight",
  "still be texting three people they hooked up with this month",
  "make the first move after pretending they were not interested",
  "hook up with someone in this room before the end of the year",
  "have the most detailed and creative sexting game in this group",
  "accidentally fall in love with a friends-with-benefits arrangement",
  "flirt their way out of any situation — and succeed",
  "have the wildest hookup story in the room by a mile",
  "suggest skinny-dipping and actually go through with it",
  "slide into someone's DMs at 2am and not even be embarrassed",
  "get caught in the act in a semi-public place",
  "have the most controversial opinion about what is appropriate on a first date",
  "turn any situation into something sexual and think it is hilarious",
  "be the one to suggest a game of strip poker without prompting",
  "have actually had sex in every room of a house",
  "be in a friends-with-benefits situation with someone in this room",
  "leave a party early with someone they just met",
  "have an ex who still asks them to hook up regularly",
  "be the most adventurous person in bed by unanimous group vote",
  "have the most embarrassing 'wrong person in bed' story",
  "suggest an open relationship and mean it",
  "have the highest body count in this room — not that we are judging",
  "have hooked up in a car and found it extremely inconvenient",
  "be the one who texts 'you up?' at 1am without any shame",
  "have a secret they would only share after several drinks",
  "have thought about someone in this room in an explicitly inappropriate way",
  "be dating two people at once right now and we would never guess",
  "have the most explicit and chaotic story about a vacation hookup",
];

// ============================================================
// FIVE SECONDS
// ============================================================

const fiveSecondsLight: string[] = [
  "Name 3 pizza toppings",
  "Name 3 Disney movies",
  "Name 3 things you do every single morning",
  "Name 3 animals with four legs",
  "Name 3 countries in Europe",
  "Name 3 things inside a fridge",
  "Name 3 superheroes",
  "Name 3 ice cream flavors",
  "Name 3 things that fly",
  "Name 3 board games",
  "Name 3 famous duos",
  "Name 3 things you take to the beach",
  "Name 3 sports played with a ball",
  "Name 3 things that are yellow",
  "Name 3 kitchen appliances",
  "Name 3 cartoon characters",
  "Name 3 fruits with seeds inside",
  "Name 3 things at a birthday party",
  "Name 3 dog breeds",
  "Name 3 ways to cook an egg",
  "Name 3 musical instruments",
  "Name 3 things you need to make a sandwich",
  "Name 3 things that make a loud noise",
  "Name 3 things you find at a swimming pool",
  "Name 3 jobs that start with the letter T",
  "Name 3 vegetables kids refuse to eat",
  "Name 3 things you do when you are bored",
  "Name 3 reasons a cat would ignore you",
  "Name 3 things you put in a backpack",
  "Name 3 words that rhyme with 'day'",
];

const fiveSecondsMedium: string[] = [
  "Name 3 reasons someone would ghost you",
  "Name 3 things you do on a first date",
  "Name 3 things you check before leaving the house",
  "Name 3 red flags you would ignore if someone was attractive enough",
  "Name 3 things you lie about on your dating profile",
  "Name 3 signs someone is not over their ex",
  "Name 3 things you overshare with people you just met",
  "Name 3 reasons people say 'we should hang out' and never follow up",
  "Name 3 things that make an awkward silence worse",
  "Name 3 things a friend does that secretly annoy you",
  "Name 3 things you would absolutely not tell your parents",
  "Name 3 excuses to cancel plans last minute",
  "Name 3 things you do when you are jealous but will not admit it",
  "Name 3 signs someone has a crush on you",
  "Name 3 things you regret posting on social media",
  "Name 3 topics that always start arguments at dinner",
  "Name 3 things you do when you are procrastinating",
  "Name 3 lies people tell on a first date",
  "Name 3 things you judge people for at parties",
  "Name 3 things that are immediately unattractive in a person",
  "Name 3 things you have borrowed from a friend and never returned",
  "Name 3 situations where you pretend to be someone you are not",
  "Name 3 apps on your phone you would be embarrassed to show",
  "Name 3 reasons you have unfollowed someone",
  "Name 3 things that instantly make you suspicious of someone",
  "Name 3 things you have said to get out of an awkward situation",
  "Name 3 compliments that are actually backhanded",
  "Name 3 things you always do drunk but deny sober",
  "Name 3 topics you avoid bringing up with certain friends",
  "Name 3 reasons you have kept reading a conversation but not replied",
];

const fiveSecondsSpicy: string[] = [
  "Name 3 things you find physically attractive in someone",
  "Name 3 places you would never have sex but someone in this room might",
  "Name 3 things that are sexier than they have any right to be",
  "Name 3 things a person can do in bed that instantly impress you",
  "Name 3 celebrity names you would not have to think twice about",
  "Name 3 things you would do if you woke up as the opposite gender",
  "Name 3 things people say in bed that make you cringe",
  "Name 3 signs someone is good in bed before you find out for yourself",
  "Name 3 things you have done that you would only admit after a few drinks",
  "Name 3 body parts that are underrated",
  "Name 3 things that kill the mood instantly",
  "Name 3 places you have made out that you probably should not have",
  "Name 3 phrases you would never use during sex",
  "Name 3 things you find hot that most people consider weird",
  "Name 3 situations that lead to a hookup every single time",
  "Name 3 places you have thought about hooking up with someone in this room",
  "Name 3 things that make for a terrible one-night stand",
  "Name 3 things that make for a perfect one-night stand",
  "Name 3 people in celebrity world you have had an explicit dream about",
  "Name 3 songs that belong on a bedroom playlist",
  "Name 3 things someone should never do on a hookup without asking first",
  "Name 3 items in any room that could be used to flirt with someone",
  "Name 3 things you are willing to try at least once",
  "Name 3 things about your sex life that would surprise people here",
  "Name 3 deal-breakers you have in bed",
  "Name 3 things you have done that your parents must never know about",
  "Name 3 compliments that work better than 'you are hot'",
  "Name 3 things someone said during sex that you still think about",
  "Name 3 things you would put on your personal 'do not disturb' sign",
  "Name 3 ways to signal interest without saying a single word",
];

// ============================================================
// NEVER HAVE I EVER
// ============================================================

const neverHaveIEverLight: string[] = [
  "pretended to laugh at a joke I did not understand",
  "eaten dessert for breakfast and felt no guilt",
  "waved back at someone who was not actually waving at me",
  "talked to myself in the mirror",
  "faked being sick to skip school or work",
  "sung loudly in the car at a red light with my windows down",
  "rehearsed an entire phone call before making it",
  "pretended not to see someone I know in public",
  "walked into a room and completely forgotten why",
  "clapped when the plane landed",
  "stayed in my pyjamas all day and told people I was very busy",
  "made a wish at 11:11",
  "talked to a pet about a genuinely complicated personal problem",
  "kept a gift I said I loved but have never once used",
  "laughed so hard I either snorted or nearly cried",
  "practiced an argument in the shower and won convincingly",
  "googled myself to see what comes up",
  "been on TV or in a newspaper",
  "eaten an entire bag of something in one sitting and immediately regretted it",
  "fallen asleep in class or during a meeting",
  "cried at a movie I had already seen and knew was coming",
  "spent more time choosing what to watch than actually watching anything",
  "bought something I never used just because it looked good in the shop",
  "started a task and immediately been distracted for 45 minutes",
  "looked up a recipe and then ordered takeaway anyway",
  "saved a song as a voice note so I would not forget it and never opened it again",
  "checked whether someone read my message approximately 47 times",
  "taken a nap that was supposed to be 20 minutes and woke up three hours later",
  "written a shopping list and then left it at home",
  "convinced myself I heard my name in a crowd when no one called me",
];

const neverHaveIEverMedium: string[] = [
  "had a crush on someone in this room at some point",
  "talked about someone behind their back and then immediately felt awful",
  "sent a risky text and then stared at the screen with my heart racing",
  "stayed friends with an ex and honestly wished I had not",
  "told a friend I liked their partner when I absolutely did not",
  "deleted an entire message draft because it was too honest",
  "liked someone who was already with someone else and felt terrible about it",
  "pretended to be asleep to avoid a difficult conversation",
  "cried over someone who definitely did not cry over me",
  "ghosted someone I actually liked because I panicked",
  "checked an ex's social media this week — at least once",
  "shown up somewhere hoping a specific person would be there",
  "rehearsed a confession I never actually made",
  "had feelings for my best friend that I never admitted",
  "ended a friendship over someone I was dating",
  "told someone I was fine when I was genuinely not fine at all",
  "made a decision entirely based on what someone I liked might think",
  "looked through someone's tagged photos for longer than was reasonable",
  "been the reason a friendship in this group got awkward for a while",
  "said 'I love you' and not meant it the way the other person thought",
  "stayed in a situation longer than I should have because I was scared of being alone",
  "accidentally sent a message to the person it was about",
  "had a dream about someone in this room and refused to say who",
  "overthought a single text reply for longer than it took to compose the entire conversation",
  "broken someone's heart and thought about it long after",
  "let a friendship fade out because I did not know how to fix it",
  "been jealous of a friend's relationship and felt guilty about it",
  "started a conversation just to see if they would show up for me",
  "lied about being okay with something in a relationship when I was not",
  "fallen for someone's potential instead of who they actually were",
];

const neverHaveIEverSpicy: string[] = [
  "had a one-night stand and honestly it was exactly what I needed",
  "hooked up with someone in this room",
  "kissed more than one person in the same night",
  "slept with someone whose last name I never knew",
  "sent or received a photo I would absolutely deny if asked",
  "had sex somewhere that, in hindsight, was genuinely risky",
  "hooked up with someone significantly older or younger than me",
  "had feelings for someone during a friends-with-benefits situation and said nothing",
  "ended up in bed with someone I originally hated",
  "had a sexual dream about someone in this room",
  "done something in bed that surprised even myself",
  "told someone they were the best I ever had — and meant it",
  "faked it convincingly enough that they had no idea",
  "been walked in on",
  "done something explicitly sexual in a semi-public place",
  "gone home with someone from a party I had never met before that night",
  "used someone's attraction to me to get something I wanted",
  "made out with a friend and then pretended it never happened",
  "been involved in a situation that could genuinely be described as a love triangle",
  "had sex with an ex after the breakup — more than once",
  "thought about someone else during sex",
  "had the most interesting sex of my life with someone I never saw again",
  "skinny-dipped with at least one person in this room",
  "said something during sex that I immediately regretted",
  "been attracted to someone I absolutely should not have been attracted to",
  "had a hookup that started as a totally innocent situation",
  "turned down someone in this room at some point — and they might know it",
  "had a secret ongoing situation with someone no one in my life knows about",
  "done something intimate that I would never admit to my family",
  "fantasized about someone in this room tonight",
];

// ============================================================
// BOOM IT
// ============================================================

const boomItLight: DeckContent = {
  statements: [
    "Name a country in Europe",
    "Name a pizza topping",
    "Name a superhero",
    "Name something you find in a bathroom",
    "Name a word that rhymes with 'light'",
    "Name something you plug into the wall",
    "Name a fruit that is not round",
    "Name a movie with a number in the title",
    "Name a job that starts with 'D'",
    "Name a song everyone knows the chorus to",
    "Name a board game",
    "Name an animal that can swim",
    "Name something you would find at a wedding",
    "Name a car brand",
    "Name a body part with exactly three letters",
    "Name a food you eat with your hands",
    "Name a city that starts with 'B'",
    "Name a cartoon character",
    "Name a sport without a ball",
    "Name a famous landmark",
    "Name something that melts in the sun",
    "Name a type of weather",
    "Name a musical instrument",
    "Name something you do before going to bed",
    "Name a public holiday",
    "Name something you find at an airport",
    "Name a candy or chocolate bar",
    "Name something with wheels",
    "Name an animal that lays eggs",
    "Name something you would take on a camping trip",
    "Name a type of pasta",
    "Name something that is always in a kitchen drawer",
    "Name a dance style",
    "Name a job at a hospital",
    "Name something you wear in winter",
  ],
  punishments: [
    "Do 10 squats while counting in a silly voice",
    "Speak in a whisper until your next turn",
    "Let the group choose your nickname for the rest of the game",
    "Do your best chicken dance for 20 seconds",
    "Hold your arms above your head for the next round",
    "Give a dramatic apology speech to the whole group",
    "Do an impression of another player until someone laughs",
    "Balance on one leg while the next question is asked",
    "Sing your next answer instead of saying it",
    "Talk like a robot until your next turn",
    "Do 15 jumping jacks while naming animals",
    "Narrate everything you do in a nature documentary voice for 2 minutes",
  ],
};

const boomItMedium: DeckContent = {
  statements: [
    "Name a reason someone would cancel plans last minute",
    "Name something you pretend to be interested in on a date",
    "Name a thing you do when you are avoiding someone",
    "Name a reason you have unfollowed someone on social media",
    "Name something people lie about on their first date",
    "Name a sign someone has a crush on you",
    "Name a type of person you have definitely dated",
    "Name something you find in someone's search history that would be concerning",
    "Name a topic that always starts an argument",
    "Name something you fake-laugh at",
    "Name a reason you would leave a party early",
    "Name something embarrassing you have done in public",
    "Name a compliment that is actually an insult",
    "Name a reason someone would read a message but not reply",
    "Name an awkward situation you have been in recently",
    "Name something you have borrowed and never returned",
    "Name a lie you tell to seem more interesting",
    "Name a red flag you ignored because someone was attractive",
    "Name something you have done that you blamed on being tired",
    "Name a thing you judge people for at a party",
    "Name something you have googled that you would be embarrassed to show",
    "Name a reason a friendship gets weird",
    "Name something that makes an awkward silence worse",
    "Name an app on your phone you would hide from a date",
    "Name a thing you do that you would deny if asked",
    "Name a reason you have said 'we should hang out' and not followed through",
    "Name something you know about a friend that they do not know you know",
    "Name a topic you avoid in group chats",
    "Name a reason you have muted someone without unfollowing them",
    "Name something you have confessed only to yourself",
    "Name an item you have purchased that you would not explain to your family",
    "Name a phrase that is a red flag in a text",
    "Name something you have done while pretending to listen",
    "Name a scenario in which you have played dumb on purpose",
    "Name a feeling you have described as 'being fine'",
  ],
  punishments: [
    "Read the last message you sent out loud in a dramatic voice",
    "Let the group pick a contact and you must send them a weird GIF",
    "Give an unsolicited compliment to every player right now",
    "Do your most embarrassing impression while everyone rates it",
    "Show the group your camera roll from exactly one year ago",
    "Tell the group your most recent irrational fear",
    "Speak only in questions until your next turn",
    "Let the group write your next Instagram caption",
    "Give a roast of the player to your left in exactly 30 seconds",
    "Admit something you thought in the last 10 minutes that you were not going to say",
    "Impersonate the player to your right replying to a bad text",
    "Let the group rank your last five stories from best to worst",
  ],
};

const boomItSpicy: DeckContent = {
  statements: [
    "Name something you find irresistibly attractive",
    "Name a place you have kissed someone that was not entirely appropriate",
    "Name something a person does in bed that instantly impresses you",
    "Name a sign someone is good in bed without proof",
    "Name a celebrity you would not hesitate for",
    "Name something that kills the mood instantly",
    "Name a body part that is underrated",
    "Name something people say during sex that is a red flag",
    "Name a situation that always ends in a hookup",
    "Name something that is sexier than it has any right to be",
    "Name a place you have thought about having sex",
    "Name something a person can do that would make you swipe right immediately",
    "Name a thing someone should ask before doing in bed",
    "Name a phrase that is the worst possible thing to say mid-hookup",
    "Name something people fake more than they admit",
    "Name a thing you find hot that most people would not expect",
    "Name a reason a one-night stand becomes two nights",
    "Name a song that belongs on a bedroom playlist",
    "Name something you would only do on a third date or later",
    "Name a deal-breaker you have discovered mid-hookup",
    "Name a place you have made out in that was technically public",
    "Name something you do that signals interest without using words",
    "Name an activity that sounds innocent but always leads somewhere else",
    "Name something you would put on a list of bedroom rules",
    "Name a type of person you have a weakness for that is probably not good for you",
    "Name something you have done under the cover of 'just being friendly'",
    "Name a compliment that works better than 'you are attractive'",
    "Name something that happens at every party that leads to drama",
    "Name a reason a hookup becomes complicated",
    "Name something you would never do sober but have definitely done otherwise",
    "Name a thing your friends do not know you find attractive",
    "Name a scenario where flirting is technically not appropriate but happens anyway",
    "Name something that turns a normal evening into an interesting one",
    "Name something a partner has done that surprised you in a good way",
    "Name a thing that is always more fun after a few drinks",
  ],
  punishments: [
    "Rate everyone in the room 1–10 for attractiveness — out loud",
    "Tell the group the last explicitly romantic or sexual dream you remember",
    "Give a 30-second shoulder massage to the player of the group's choice",
    "Sit in the lap of the player to your right for the next two turns",
    "Describe your ideal night in — in as much detail as the group demands",
    "Send a flirty text to the last person in your recent calls",
    "Let the group ask you one yes/no question and you must answer honestly",
    "Do your most convincing flirt on the player to your left — 30 seconds",
    "Tell the group one thing you find attractive about each person here",
    "Remove one item of clothing — put it back on after your next turn",
    "Whisper something you have been thinking tonight into the ear of someone you choose",
    "Show the most suggestive item in your camera roll without explanation",
  ],
};

// ============================================================
// Assembled deck list
// ============================================================

const SEED_DECKS: SeedDeck[] = [
  // --- Charades ---
  {
    gameType: "charades",
    name: "Light Charades",
    tier: "light",
    description:
      "Animals, everyday objects, classic movies — clean fun for any crowd. Perfect as a warm-up.",
    content: { items: charadesLight },
  },
  {
    gameType: "charades",
    name: "Medium Charades",
    tier: "medium",
    description:
      "Emotions, awkward social situations, and relatable feelings. Expect a little more creative acting.",
    content: { items: charadesmedium },
  },
  {
    gameType: "charades",
    name: "Spicy Charades",
    tier: "spicy",
    description:
      "Romantic scenarios, adult themes, and situations that will have the room howling. Adults only.",
    content: { items: charadesSpicy },
  },
  // --- Truth or Dare ---
  {
    gameType: "truthordare",
    name: "Light Truth or Dare",
    tier: "light",
    description:
      "Totally sober-friendly truths and dares. Great for getting to know people without going too far.",
    content: truthOrDareLight,
  },
  {
    gameType: "truthordare",
    name: "Medium Truth or Dare",
    tier: "medium",
    description:
      "More personal questions — crushes, embarrassing stories, group dynamics. Pushes comfort without crossing into explicit territory.",
    content: truthOrDareMedium,
  },
  {
    gameType: "truthordare",
    name: "Spicy Truth or Dare",
    tier: "spicy",
    description:
      "Adult confessions, bold dares, and questions about attraction and desire. For a crowd that can handle the heat.",
    content: truthOrDareSpicy,
  },
  // --- Most Likely To ---
  {
    gameType: "mostlikelyto",
    name: "Light Most Likely To",
    tier: "light",
    description:
      "Point at the friend most likely to adopt too many pets, laugh at a funeral, or still be talking when everyone is asleep.",
    content: { items: mostLikelyToLight },
  },
  {
    gameType: "mostlikelyto",
    name: "Medium Most Likely To",
    tier: "medium",
    description:
      "Crushes, unreturned feelings, and group dynamics. Who catches feelings the fastest? Who keeps quiet about it longest?",
    content: { items: mostLikelyToMedium },
  },
  {
    gameType: "mostlikelyto",
    name: "Spicy Most Likely To",
    tier: "spicy",
    description:
      "Hookups, desire, and the wilder side of everyone in the room. Adults only — no one is safe.",
    content: { items: mostLikelyToSpicy },
  },
  // --- Five Seconds ---
  {
    gameType: "fiveseconds",
    name: "Light Five Seconds",
    tier: "light",
    description:
      "Classic categories — pizza toppings, Disney movies, dog breeds. Sounds easy until the clock starts.",
    content: { items: fiveSecondsLight },
  },
  {
    gameType: "fiveseconds",
    name: "Medium Five Seconds",
    tier: "medium",
    description:
      "Categories about relationships, dating, and social life. Name 3 red flags you would ignore for the right person — go.",
    content: { items: fiveSecondsMedium },
  },
  {
    gameType: "fiveseconds",
    name: "Spicy Five Seconds",
    tier: "spicy",
    description:
      "Name 3 things you find irresistibly attractive. Name 3 places you would never. For adults who are past being embarrassed.",
    content: { items: fiveSecondsSpicy },
  },
  // --- Never Have I Ever ---
  {
    gameType: "neverhaveiever",
    name: "Light Never Have I Ever",
    tier: "light",
    description:
      "Everyday confessions — eaten dessert for breakfast, googled yourself, waved at the wrong person. Fingers up!",
    content: { items: neverHaveIEverLight },
  },
  {
    gameType: "neverhaveiever",
    name: "Medium Never Have I Ever",
    tier: "medium",
    description:
      "Crushes, feelings, and the things we do when we like someone. Mild embarrassment guaranteed.",
    content: { items: neverHaveIEverMedium },
  },
  {
    gameType: "neverhaveiever",
    name: "Spicy Never Have I Ever",
    tier: "spicy",
    description:
      "One-night stands, hookups, and confessions you would only admit after a few drinks. Adults only.",
    content: { items: neverHaveIEverSpicy },
  },
  // --- Boom It ---
  {
    gameType: "boomit",
    name: "Light Boom It",
    tier: "light",
    description:
      "Fast category prompts — answer before the boom or face a harmless punishment. Perfect for all ages.",
    content: boomItLight,
  },
  {
    gameType: "boomit",
    name: "Medium Boom It",
    tier: "medium",
    description:
      "Categories about dating, social life, and group dynamics. Punishments get a little more personal.",
    content: boomItMedium,
  },
  {
    gameType: "boomit",
    name: "Spicy Boom It",
    tier: "spicy",
    description:
      "Adult categories about attraction, desire, and hookup culture. Punishments to match. Not for the faint-hearted.",
    content: boomItSpicy,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const client = postgres(loadDatabaseUrl(), { max: 1 });
  const db = drizzle(client);

  await db
    .insert(user)
    .values({
      id: SEED_USER_ID,
      name: "Party Games",
      email: "decks@partygames.local",
      emailVerified: true,
      username: "partygames",
      displayUsername: "Party Games",
    })
    .onConflictDoNothing({ target: user.id });

  await db.delete(deck).where(eq(deck.userId, SEED_USER_ID));

  await db.insert(deck).values(
    SEED_DECKS.map((d) => ({
      userId: SEED_USER_ID,
      gameType: d.gameType,
      name: d.name,
      description: d.description,
      tier: d.tier,
      language: "en",
      isPublic: true,
      content: d.content,
    })),
  );

  const byGame = new Map<string, string[]>();
  for (const d of SEED_DECKS) {
    const itemCount = Object.values(d.content).reduce(
      (sum, entries) => sum + entries.length,
      0,
    );
    const label = `"${d.name}" (${itemCount} entries)`;
    byGame.set(d.gameType, [...(byGame.get(d.gameType) ?? []), label]);
  }

  console.log("Seeded public decks:");
  byGame.forEach((labels, gameType) => {
    console.log(`  ${gameType}: ${labels.join(", ")}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
