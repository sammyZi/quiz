import { validateLesson, type Lesson } from './lesson.schema';

// Metro bundles JSON via static import, not filesystem reads — there's no
// on-device `readdir`. Every lesson file gets one line here; validate-lessons.ts
// covers the same files at build/CI time so a bad file fails before this does.
import net001 from '../../lessons/net-001-client-server.json';
import net002 from '../../lessons/net-002-ip-addresses.json';
import net003 from '../../lessons/net-003-dns.json';
import net004 from '../../lessons/net-004-tcp-handshake.json';
import net005 from '../../lessons/net-005-http.json';
import net006 from '../../lessons/net-006-firewall.json';

const rawLessons: unknown[] = [net001, net002, net003, net004, net005, net006];

export const lessons: Lesson[] = rawLessons.map((raw) =>
  validateLesson(raw, (raw as { id?: string }).id)
);

export const lessonsById: Record<string, Lesson> = Object.fromEntries(
  lessons.map((lesson) => [lesson.id, lesson])
);

export function getLesson(id: string): Lesson | undefined {
  return lessonsById[id];
}
