import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// better-auth tables (email/password + username plugin)
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    // better-auth 1.7 scopes account identity by issuer.
    issuer: text("issuer"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("account_user_id_idx").on(t.userId),
    index("account_issuer_account_id_idx").on(t.issuer, t.accountId),
  ],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Decks — one table for every game's content
// ---------------------------------------------------------------------------

export const tierEnum = pgEnum("tier", ["light", "medium", "spicy"]);

export const gameTypeEnum = pgEnum("game_type", [
  "charades",
  "truthordare",
  "mostlikelyto",
  "fiveseconds",
  "neverhaveiever",
  "boomit",
  "wouldyourather",
  "paranoia",
  "wordspy",
  "oddoneout",
  "fibber",
  "partymode",
  "doodlechain",
]);

/**
 * Content is a map of section key -> entries. Which sections a game uses is
 * defined in the game registry (src/lib/games.ts), e.g. charades stores
 * { items: [...] } while truthordare stores { truths: [...], dares: [...] }.
 */
export type DeckContent = Record<string, string[]>;

export const deck = pgTable(
  "deck",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    gameType: gameTypeEnum("game_type").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    language: text("language").notNull().default("en"),
    isPublic: boolean("is_public").notNull().default(false),
    tier: tierEnum("tier").default("light").notNull(),
    content: jsonb("content").$type<DeckContent>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("deck_user_game_name_idx").on(t.userId, t.gameType, t.name),
    index("deck_game_public_idx").on(t.gameType, t.isPublic),
    index("deck_user_id_idx").on(t.userId),
  ],
);

export type Deck = typeof deck.$inferSelect;
export type NewDeck = typeof deck.$inferInsert;

export const deckPlay = pgTable("deck_play", {
  id: uuid("id").defaultRandom().primaryKey(),
  deckId: text("deck_id")
    .references(() => deck.id, { onDelete: "cascade" })
    .notNull(),
  playedAt: timestamp("played_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
