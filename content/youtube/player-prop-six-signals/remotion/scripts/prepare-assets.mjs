import {cp, mkdir, readFile, writeFile} from "node:fs/promises";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(here, "..");
const video = resolve(project, "..");
const pilot = resolve(video, "..", "confidence-score-pilot");
const site = resolve(video, "../../..");
const publicDir = join(project, "public", "assets");

await mkdir(publicDir, {recursive: true});

const files = {
  "narration.mp3": join(video, "audio", "voiceover-final.mp3"),
  "desktop-board.png": join(pilot, "captures", "app-props-board-viewport.png"),
  "desktop-detail.png": join(pilot, "captures", "app-real-prop-detail-clean.png"),
  "desktop-agents.png": join(pilot, "captures", "app-model-breakdown-clean.png"),
  "mobile-detail.png": join(pilot, "captures", "mobile-detail.png"),
  "mobile-model.png": join(pilot, "captures", "mobile-model-read.png"),
  "mobile-picks.png": join(pilot, "captures", "mobile-picks.png"),
  "familjen-grotesk.woff2": join(site, "assets", "fonts", "familjen-grotesk-latin.woff2"),
  "ibm-plex-sans.woff2": join(site, "assets", "fonts", "ibm-plex-sans-latin.woff2"),
  "ibm-plex-mono-500.woff2": join(site, "assets", "fonts", "ibm-plex-mono-500-latin.woff2"),
  "ibm-plex-mono-600.woff2": join(site, "assets", "fonts", "ibm-plex-mono-600-latin.woff2"),
};

for (const [name, source] of Object.entries(files)) {
  await cp(source, join(publicDir, name));
}

const alignment = JSON.parse(
  await readFile(join(video, "audio", "voiceover-alignment.json"), "utf8"),
);

const captions = alignment.words.map((word, index) => ({
  text: `${index === 0 ? "" : " "}${word.text}`,
  startMs: Math.round(word.start * 1000),
  endMs: Math.round(word.end * 1000),
  timestampMs: Math.round(word.start * 1000),
  confidence: word.probability ?? null,
}));

await writeFile(
  join(publicDir, "captions.json"),
  `${JSON.stringify(captions, null, 2)}\n`,
);

console.log(`Prepared ${Object.keys(files).length} assets and ${captions.length} caption tokens.`);
