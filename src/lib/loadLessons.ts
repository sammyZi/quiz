import { validateLesson, type Lesson } from './lesson.schema';

// Metro bundles JSON via static import — one line per lesson file.
import matter001 from '../../lessons/matter-001-ice-water-steam.json';
import matter002 from '../../lessons/matter-002-mix-and-separate.json';
import matter003 from '../../lessons/matter-003-sink-or-float.json';
import cpu001 from '../../lessons/cpu-001-cpu-memory-storage.json';
import cpu002 from '../../lessons/cpu-002-binary-data.json';
import cpu003 from '../../lessons/cpu-003-fetch-decode-execute.json';
import cpu004 from '../../lessons/cpu-004-stack-vs-heap.json';
import ds001 from '../../lessons/ds-001-arrays.json';
import ds002 from '../../lessons/ds-002-linked-lists.json';
import ds003 from '../../lessons/ds-003-hash-maps.json';
import ds004 from '../../lessons/ds-004-trees.json';
import ds005 from '../../lessons/ds-005-graphs.json';
import algo001 from '../../lessons/algo-001-linear-vs-binary-search.json';
import algo002 from '../../lessons/algo-002-sorting.json';
import algo003 from '../../lessons/algo-003-recursion-call-stack.json';
import algo004 from '../../lessons/algo-004-big-o.json';
import os001 from '../../lessons/os-001-processes-vs-threads.json';
import os002 from '../../lessons/os-002-scheduling.json';
import os003 from '../../lessons/os-003-concurrency-race-conditions.json';
import os004 from '../../lessons/os-004-files-io.json';
import build001 from '../../lessons/build-001-compiled-vs-interpreted.json';
import net001 from '../../lessons/net-001-client-server.json';
import net002 from '../../lessons/net-002-ip-addresses.json';
import net003 from '../../lessons/net-003-dns.json';
import net004 from '../../lessons/net-004-tcp-handshake.json';
import net005 from '../../lessons/net-005-http.json';
import net006 from '../../lessons/net-006-firewall.json';
import net007 from '../../lessons/net-007-ports.json';
import net008 from '../../lessons/net-008-https-encryption.json';
import net009 from '../../lessons/net-009-load-balancers.json';
import net010 from '../../lessons/net-010-caching-cdns.json';
import net011 from '../../lessons/net-011-databases.json';
import net012 from '../../lessons/net-012-apis.json';
import net013 from '../../lessons/net-013-authentication.json';
import net014 from '../../lessons/net-014-rate-limiting.json';
import net015 from '../../lessons/net-015-scaling.json';

const rawLessons: unknown[] = [
  matter001,
  matter002,
  matter003,
  cpu001, cpu002, cpu003, cpu004,
  ds001, ds002, ds003, ds004, ds005,
  algo001, algo002, algo003, algo004,
  os001, os002, os003, os004,
  build001,
  net001, net002, net003, net004, net005, net006,
  net007, net008, net009, net010, net011, net012, net013, net014, net015,
];

export const lessons: Lesson[] = rawLessons.map((raw) =>
  validateLesson(raw, (raw as { id?: string }).id)
);

export const lessonsById: Record<string, Lesson> = Object.fromEntries(
  lessons.map((lesson) => [lesson.id, lesson])
);

export function getLesson(id: string): Lesson | undefined {
  return lessonsById[id];
}
