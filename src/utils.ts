import { currentUser, initialSoundtracks } from "./data";
import type { Soundtrack, TrackMotif, TrackMotifAppearance } from "./types";

export const STORE_KEY = "soundtracker-local-v1";

function colorLuminance(color: string): number {
  const hex = color.trim().replace(/^#/, "");
  if (!/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) return 0.18;
  const expanded = hex.length === 3 ? [...hex].map((part) => part + part).join("") : hex;
  const [red, green, blue] = [0, 2, 4].map((offset) => {
    const channel = parseInt(expanded.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastingInk(color: string): string {
  return colorLuminance(color) > 0.179 ? "#111111" : "#ffffff";
}

export function getTrackMotifAppearances(
  connection: TrackMotif,
): TrackMotifAppearance[] {
  if (connection.appearances) return connection.appearances;
  if (!connection.appearanceInTrack && !connection.appearanceInStory) return [];
  return [
    {
      id: `legacy-${connection.leitmotifId}`,
      appearanceInTrack: connection.appearanceInTrack || "",
      appearanceInStory: connection.appearanceInStory || "",
    },
  ];
}

export const niceDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export function loadData(): Soundtrack[] {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    return saved ? (JSON.parse(saved) as Soundtrack[]) : initialSoundtracks;
  } catch {
    return initialSoundtracks;
  }
}

export function exportMarkdown(soundtrack: Soundtrack) {
  const display = [
    `# ${soundtrack.name}`,
    `**Composer(s):** ${soundtrack.composers.join(", ") || "—"}`,
    `**Visibility:** ${soundtrack.visibility}`,
    "",
    soundtrack.description || "",
    "",
    "## Story items",
    ...(soundtrack.storyItems.length
      ? soundtrack.storyItems.map(
          (item) =>
            `### ${item.name} · ${item.type}\n\n${item.description || ""}`,
        )
      : ["_No story items yet._"]),
    "",
    "## Leitmotifs",
    ...(soundtrack.leitmotifs.length
      ? soundtrack.leitmotifs.map(
          (item) => `### ${item.name}\n\n${item.description || ""}`,
        )
      : ["_No leitmotifs yet._"]),
    "",
    "## Tracklist",
    ...(soundtrack.tracks.length
      ? soundtrack.tracks.map(
          (item) =>
            `### ${item.trackNumber ? `${item.trackNumber}. ` : ""}${item.name}\n\n${item.description || ""}`,
        )
      : ["_No tracks yet._"]),
  ].join("\n");
  const content = `${display}\n\n<!-- soundtracker-data-v1\n${JSON.stringify(soundtrack, null, 2)}\n-->\n`;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${soundtrack.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "soundtrack"}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseMarkdown(text: string): Soundtrack {
  const match = text.match(/<!--\s*soundtracker-data-v1\s*([\s\S]*?)\s*-->/);
  if (!match) {
    throw new Error(
      "This file does not contain Soundtracker import data. Export a soundtrack from Soundtracker and try again.",
    );
  }
  const parsed = JSON.parse(match[1]) as Soundtrack;
  if (
    !parsed.name ||
    !Array.isArray(parsed.storyItems) ||
    !Array.isArray(parsed.leitmotifs) ||
    !Array.isArray(parsed.tracks)
  ) {
    throw new Error(
      "The soundtrack data is incomplete or has an unsupported format.",
    );
  }
  const now = new Date().toISOString();
  return {
    ...parsed,
    id: `st-${Math.random().toString(36).slice(2, 9)}`,
    ownerId: currentUser.id,
    ownerName: currentUser.name,
    visibility: "private",
    collaborators: {},
    createdAt: now,
    updatedAt: now,
  };
}
