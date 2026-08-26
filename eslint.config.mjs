import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextCoreWebVitals,
  {
    // The game components deliberately set state from effects: decks are
    // shuffled after hydration (shuffling during SSR mismatches the server
    // render), and the countdown games advance phase when a timer hits zero.
    // Both predate Next 16's react-hooks rules. Kept visible as warnings so
    // they can be reworked as real game logic changes, not as part of a
    // stack migration.
    // usePlayers and the night planner additionally hydrate state from
    // localStorage in a mount effect — the standard SSR-safe pattern for
    // storage-backed state.
    files: [
      "src/components/games/**",
      "src/components/players/**",
      "src/components/night/**",
      "src/components/DeckFreshness.tsx",
    ],
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  { ignores: [".next/**", "node_modules/**", "drizzle/**"] },
];

export default config;
