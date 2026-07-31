import { getLesson, lessons } from './loadLessons';
import type { Lesson } from './lesson.schema';

// Full lesson map from CURRICULUM.md. Real JSON only exists for some rows —
// those are playable; the rest show as locked until content is written.

export type CatalogLesson = {
  id: string;
  title: string;
  beat: string;
  chapter: 1 | 2;
  moduleCode: string;
  moduleLabel: string;
  bridgesFrom?: string;
  awsService?: string;
};

export type CatalogModule = {
  key: string;
  chapter: 1 | 2;
  code: string;
  label: string;
  blurb: string;
  lessons: CatalogLesson[];
};

export type CatalogChapter = {
  chapter: 1 | 2;
  title: string;
  modules: CatalogModule[];
};

type Entry = {
  id: string;
  title: string;
  beat: string;
  bridgesFrom?: string;
  awsService?: string;
};

function moduleOf(
  chapter: 1 | 2,
  code: string,
  label: string,
  blurb: string,
  entries: Entry[]
): CatalogModule {
  return {
    key: `${chapter}-${code}`,
    chapter,
    code,
    label,
    blurb,
    lessons: entries.map((e) => ({
      id: e.id,
      title: e.title,
      beat: e.beat,
      chapter,
      moduleCode: code,
      moduleLabel: label,
      bridgesFrom: e.bridgesFrom,
      awsService: e.awsService,
    })),
  };
}

export const catalogModules: CatalogModule[] = [
  moduleOf(1, 'cpu', '1.1 · How a computer works', 'CPU, RAM, disk, registers — data moving between them.', [
    { id: 'cpu-001-cpu-memory-storage', title: 'CPU, memory, storage', beat: 'Same data, three places, each 100× slower than the last' },
    { id: 'cpu-002-binary-data', title: 'Binary & data representation', beat: 'One byte, read four different ways' },
    { id: 'cpu-003-fetch-decode-execute', title: 'Fetch–decode–execute', beat: 'One instruction walking the cycle, over and over' },
    { id: 'cpu-004-stack-vs-heap', title: 'Stack vs heap', beat: 'Two regions, allocation moving into each differently' },
  ]),
  moduleOf(1, 'ds', '1.2 · Data structures', 'Cells and pointers — best engine fit in the curriculum.', [
    { id: 'ds-001-arrays', title: 'Arrays & contiguous memory', beat: 'Index math jumps straight to a slot, no walking' },
    { id: 'ds-002-linked-lists', title: 'Linked lists', beat: 'Walk node to node — no jumping, that’s the trade' },
    { id: 'ds-003-hash-maps', title: 'Hash maps', beat: 'Key goes through a hash function, lands in one bucket' },
    { id: 'ds-004-trees', title: 'Trees', beat: 'One search halves the remaining nodes at every step' },
    { id: 'ds-005-graphs', title: 'Graphs', beat: 'Same nodes, but connections go any direction' },
  ]),
  moduleOf(1, 'algo', '1.3 · Algorithms & complexity', 'Array cells and call frames — pointers sweeping through.', [
    { id: 'algo-001-linear-vs-binary-search', title: 'Linear vs binary search', beat: 'Two pointers racing the same sorted array' },
    { id: 'algo-002-sorting', title: 'Sorting', beat: 'Elements physically swapping into place' },
    { id: 'algo-003-recursion-call-stack', title: 'Recursion & the call stack', beat: 'Frames stacking up, then unwinding' },
    { id: 'algo-004-big-o', title: 'Big O', beat: 'Same three algorithms, input grows, one falls off a cliff' },
  ]),
  moduleOf(1, 'os', '1.4 · Operating systems', 'Processes, threads, scheduler, shared memory.', [
    { id: 'os-001-processes-vs-threads', title: 'Processes vs threads', beat: 'Two processes isolated, two threads sharing one space' },
    { id: 'os-002-scheduling', title: 'Scheduling', beat: 'CPU switching between three processes, none finishing first' },
    { id: 'os-003-concurrency-race-conditions', title: 'Concurrency & race conditions', beat: 'Two threads hit the same value, result depends on timing' },
    { id: 'os-004-files-io', title: 'Files & I/O', beat: 'Program asks the OS, OS asks the disk, everyone waits' },
  ]),
  moduleOf(1, 'build', '1.5 · Code to machine', 'Pipeline stages — source transformed at each step.', [
    { id: 'build-001-compiled-vs-interpreted', title: 'Compiled vs interpreted', beat: 'Same source, two very different paths to running' },
  ]),
  moduleOf(1, 'net', '1.6 · How the internet works', 'Client, server, router, firewall — packets in motion.', [
    { id: 'net-001-client-server', title: 'Client & server', beat: 'Request goes out, response comes back' },
    { id: 'net-002-ip-addresses', title: 'IP addresses', beat: 'A packet finds its way via the router' },
    { id: 'net-003-dns', title: 'DNS', beat: 'Name becomes an address before the real request' },
    { id: 'net-004-tcp-handshake', title: 'TCP handshake', beat: 'SYN, SYN-ACK, ACK — three steps to connect' },
    { id: 'net-005-http', title: 'HTTP', beat: 'GET goes out, 200 OK comes back' },
    { id: 'net-006-firewall', title: 'Firewalls', beat: 'Allowed traffic passes; the rest stops at the gate' },
    { id: 'net-007-ports', title: 'Ports', beat: 'One address, many doors — 80 vs 443 vs 22' },
    { id: 'net-008-https-encryption', title: 'HTTPS & encryption', beat: 'Same request, wrapped so an eavesdropper can’t read it' },
    { id: 'net-009-load-balancers', title: 'Load balancers', beat: 'One request, distributed across three identical servers' },
    { id: 'net-010-caching-cdns', title: 'Caching & CDNs', beat: 'Second request short-circuits before the origin' },
    { id: 'net-011-databases', title: 'Databases', beat: 'Server asks a database — separate node, and it can be slow' },
    { id: 'net-012-apis', title: 'APIs', beat: 'Two apps talking machine-to-machine, no browser' },
    { id: 'net-013-authentication', title: 'Authentication', beat: 'Login → token → token on every later request' },
    { id: 'net-014-rate-limiting', title: 'Rate limiting', beat: 'Gate starts blocking after N requests in a window' },
    { id: 'net-015-scaling', title: 'Scaling', beat: 'One bigger server vs three identical smaller ones' },
  ]),
  moduleOf(2, 'aws', 'AWS bridge', 'Chapter 1 concepts, renamed to their AWS services.', [
    { id: 'aws-001-security-groups', title: 'Blocking traffic in the cloud', beat: 'Security Groups', bridgesFrom: 'net-006 firewall', awsService: 'Security Groups' },
    { id: 'aws-002-route-53', title: "Finding your app's address", beat: 'Route 53', bridgesFrom: 'net-003 DNS', awsService: 'Route 53' },
    { id: 'aws-003-elastic-load-balancer', title: 'Spreading the load', beat: 'Elastic Load Balancer', bridgesFrom: 'net-009 load balancers', awsService: 'ELB' },
    { id: 'aws-004-cloudfront', title: 'Serving pages instantly', beat: 'CloudFront', bridgesFrom: 'net-010 caching', awsService: 'CloudFront' },
    { id: 'aws-005-rds', title: "A database you don't manage", beat: 'RDS', bridgesFrom: 'net-011 databases', awsService: 'RDS' },
    { id: 'aws-006-api-gateway', title: 'Talking to AWS itself', beat: 'API Gateway', bridgesFrom: 'net-012 APIs', awsService: 'API Gateway' },
    { id: 'aws-007-ec2', title: 'Where your code actually runs', beat: 'EC2', bridgesFrom: 'net-001 client/server', awsService: 'EC2' },
    { id: 'aws-008-lambda', title: 'Running code without a server', beat: 'Lambda', bridgesFrom: 'aws-007 EC2', awsService: 'Lambda' },
    { id: 'aws-009-s3', title: 'Storing files at scale', beat: 'S3', bridgesFrom: 'os-004 files & I/O', awsService: 'S3' },
    { id: 'aws-010-iam', title: "Who's allowed to do what", beat: 'IAM', bridgesFrom: 'net-013 authentication', awsService: 'IAM' },
    { id: 'aws-011-vpc', title: 'Your own private network', beat: 'VPC & subnets', bridgesFrom: 'net-007 ports', awsService: 'VPC' },
    { id: 'aws-012-cloudwatch', title: "Watching what's happening", beat: 'CloudWatch', bridgesFrom: '(new)', awsService: 'CloudWatch' },
    { id: 'aws-013-auto-scaling', title: 'Sending it to real users', beat: 'Auto Scaling', bridgesFrom: 'net-015 scaling', awsService: 'Auto Scaling' },
    { id: 'aws-014-secrets-manager', title: 'Keeping secrets safe', beat: 'Secrets Manager', bridgesFrom: 'net-008 encryption', awsService: 'Secrets Manager' },
    { id: 'aws-015-full-request', title: 'Putting it all together', beat: 'A full request through a real AWS app', bridgesFrom: 'everything', awsService: 'Full stack' },
  ]),
];

export const catalogChapters: CatalogChapter[] = [
  { chapter: 1, title: 'CS fundamentals', modules: catalogModules.filter((m) => m.chapter === 1) },
  { chapter: 2, title: 'The same ideas, in AWS', modules: catalogModules.filter((m) => m.chapter === 2) },
];

export const catalogLessons: CatalogLesson[] = catalogModules.flatMap((m) => m.lessons);
export const CATALOG_TOTAL = catalogLessons.length;

export function isLessonAvailable(id: string): boolean {
  return getLesson(id) !== undefined;
}

export function availableCount(): number {
  return lessons.length;
}

/** Modules that currently have at least one playable lesson JSON. */
export function lessonSections(): { key: string; title: string; chapter: number; data: Lesson[] }[] {
  return catalogModules
    .map((mod) => ({
      key: mod.key,
      title: mod.label,
      chapter: mod.chapter,
      data: mod.lessons
        .map((entry) => getLesson(entry.id))
        .filter((lesson): lesson is Lesson => lesson !== undefined),
    }))
    .filter((section) => section.data.length > 0);
}
