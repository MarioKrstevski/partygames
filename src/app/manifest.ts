import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Party Games",
    short_name: "Party Games",
    description:
      "Every classic party game in one place. Charades, Truth or Dare, Word Spy and more — one phone, no app install.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#12101c",
    theme_color: "#12101c",
    categories: ["games", "entertainment", "social"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
