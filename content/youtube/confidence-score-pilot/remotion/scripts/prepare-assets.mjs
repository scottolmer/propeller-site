import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(here, '..');
const pilot = resolve(project, '..');
const publicDir = join(project, 'public');

await mkdir(join(publicDir, 'assets'), {recursive: true});

const files = {
  'narration.mp3': join(pilot, 'audio', 'narration-v6.mp3'),
  'desktop-board.png': join(pilot, 'captures', 'app-props-board-viewport.png'),
  'desktop-detail.png': join(pilot, 'captures', 'app-real-prop-detail-clean.png'),
  'desktop-why.png': join(pilot, 'captures', 'app-why-this-lean-clean.png'),
  'desktop-agents.png': join(pilot, 'captures', 'app-model-breakdown-clean.png'),
  'mobile-detail.png': join(pilot, 'captures', 'mobile-detail.png'),
  'mobile-model.png': join(pilot, 'captures', 'mobile-model-read.png'),
  'mobile-picks.png': join(pilot, 'captures', 'mobile-picks.png'),
  'ipad-model.png': resolve(
    pilot,
    '../../../../nfl-betting-system/mobile/app-store-screenshots/raw/ipad-13/07-model-read.png',
  ),
};

for (const [name, source] of Object.entries(files)) {
  await cp(source, join(publicDir, 'assets', name));
}

const alignment = JSON.parse(
  await readFile(join(pilot, 'audio', 'walkthrough-alignment.json'), 'utf8'),
);

const captions = alignment.words.map((word, index) => ({
  text: `${index === 0 ? '' : ' '}${word.text}`,
  startMs: Math.round(word.start * 1000),
  endMs: Math.round(word.end * 1000),
  timestampMs: Math.round(word.start * 1000),
  confidence: word.probability ?? null,
}));

await writeFile(
  join(publicDir, 'assets', 'captions.json'),
  `${JSON.stringify(captions, null, 2)}\n`,
);

console.log(`Prepared ${Object.keys(files).length} media assets and ${captions.length} caption tokens.`);
