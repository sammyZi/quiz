// Run over every /lessons file at build/CI time — same schema the app uses
// at load time (loadLessons.ts), so a bad file fails here, not on a device.
//
// Run: node --experimental-strip-types scripts/validate-lessons.ts

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateLesson } from '../src/lib/lesson.schema.ts';

const lessonsDir = join(import.meta.dirname, '..', 'lessons');
const files = readdirSync(lessonsDir).filter((f) => f.endsWith('.json'));

if (files.length === 0) {
  console.error(`No lesson files found in ${lessonsDir}`);
  process.exit(1);
}

let failures = 0;
const seenIds = new Set<string>();

for (const file of files) {
  const path = join(lessonsDir, file);
  try {
    const raw = JSON.parse(readFileSync(path, 'utf-8'));
    const lesson = validateLesson(raw, file);
    if (seenIds.has(lesson.id)) {
      throw new Error(`duplicate lesson id "${lesson.id}"`);
    }
    seenIds.add(lesson.id);
    console.log(`  ok  ${file}`);
  } catch (err) {
    failures += 1;
    console.error(`FAIL  ${file}\n${err instanceof Error ? err.message : err}`);
  }
}

console.log(`\n${files.length - failures}/${files.length} lessons valid`);
if (failures > 0) process.exit(1);
