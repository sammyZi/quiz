/**
 * Writes every Chapter 1 lesson JSON under /lessons (skips files that already exist
 * unless --force). Run: node scripts/write-chapter1-lessons.mjs
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'lessons');
const force = process.argv.includes('--force');
mkdirSync(outDir, { recursive: true });

function lesson(partial) {
  return {
    chapter: 1,
    ...partial,
  };
}

function quiz(question, choices, correctIndex, explanation) {
  return { question, choices, correctIndex, explanation };
}

/** @type {Record<string, object>} */
const lessons = {
  'cpu-001-cpu-memory-storage': lesson({
    id: 'cpu-001-cpu-memory-storage',
    module: 'cpu',
    title: 'CPU, memory, storage',
    hook: 'The same piece of data can live in three places — and each place is about 100× slower than the one before it.',
    nodes: [
      { id: 'cpu', label: 'CPU', kind: 'generic', lane: 0 },
      { id: 'ram', label: 'RAM', kind: 'generic', lane: 0 },
      { id: 'disk', label: 'Disk', kind: 'database', lane: 0 },
    ],
    steps: [
      {
        caption: 'The CPU needs a value. If it’s already in a register or cache next to the chip, it’s almost free.',
        packets: [{ id: 'p1', from: 'cpu', to: 'ram', variant: 'request', outcome: 'pass', label: 'need X' }],
        nodeCaptions: {
          cpu: 'The CPU only works on data it can reach instantly. Everything else is a trip.',
          ram: 'RAM is working memory — fast, but it forgets when power is gone.',
        },
      },
      {
        caption: 'RAM doesn’t have it. The request goes to disk — same data, much slower trip.',
        packets: [{ id: 'p2', from: 'ram', to: 'disk', variant: 'request', outcome: 'pass', label: 'fetch X' }],
        nodeCaptions: {
          disk: 'Disk (or SSD) is long-term storage. Durable, and roughly 100× slower than RAM.',
        },
      },
      {
        caption: 'Disk sends the data back up the chain so the CPU can finally use it.',
        packets: [
          { id: 'p3', from: 'disk', to: 'ram', variant: 'data', outcome: 'pass', label: 'X' },
          { id: 'p4', from: 'ram', to: 'cpu', variant: 'data', outcome: 'pass', label: 'X' },
        ],
        nodeCaptions: {
          ram: 'RAM keeps a copy so the next ask might not need disk again.',
          cpu: 'Now the CPU can run. Waiting on storage is why “slow apps” feel slow.',
        },
      },
    ],
    takeaways: [
      'Speed isn’t one number — CPU, RAM, and disk are different timescales for the same data.',
      'Programs feel fast when the data they need is already close to the CPU.',
      'Moving data between layers is the tax you pay for having more storage than memory.',
    ],
    quiz: [
      quiz(
        'Why can the same file feel instant one moment and laggy the next?',
        [
          'The CPU randomly slows down',
          'Sometimes it’s already in RAM; sometimes it has to come from disk',
          'Disk is always faster than RAM',
          'Files only live on the network',
        ],
        1,
        'If the bytes are already in RAM (or cache), the CPU barely waits. A cold read from disk is a much longer trip.'
      ),
    ],
  }),

  'cpu-002-binary-data': lesson({
    id: 'cpu-002-binary-data',
    module: 'cpu',
    title: 'Binary & data representation',
    hook: 'A byte is just eight bits. What those bits mean depends entirely on who is reading them.',
    nodes: [
      { id: 'byte', label: '1 byte', kind: 'generic', lane: 0 },
      { id: 'as-num', label: 'Number', kind: 'generic', lane: 0 },
      { id: 'as-text', label: 'Text', kind: 'generic', lane: 1 },
      { id: 'as-op', label: 'Opcode', kind: 'generic', lane: 0 },
    ],
    steps: [
      {
        caption: 'Here’s one byte — the same eight bits, sitting still.',
        packets: [{ id: 'p1', from: 'byte', to: 'as-num', variant: 'data', outcome: 'pass', label: '01000001' }],
        nodeCaptions: {
          byte: 'Bits don’t come with a label. Meaning is assigned by the program.',
          'as-num': 'Read as an integer, this might be 65.',
        },
      },
      {
        caption: 'Read the same bits as text (ASCII/UTF-8) and you get the letter A.',
        packets: [{ id: 'p2', from: 'byte', to: 'as-text', variant: 'data', outcome: 'pass', label: '"A"' }],
        nodeCaptions: {
          'as-text': 'Encodings map bit patterns to characters. Same bits, different agreement.',
        },
      },
      {
        caption: 'Hand those bits to the CPU as an instruction and they become an operation to run.',
        packets: [{ id: 'p3', from: 'byte', to: 'as-op', variant: 'control', outcome: 'pass', label: 'op' }],
        nodeCaptions: {
          'as-op': 'Machine code is still just bits — the CPU’s decoder decides what they mean.',
        },
      },
    ],
    takeaways: [
      'Bits are raw. Types, encodings, and instruction sets are agreements about meaning.',
      'The same byte can be a number, a letter, or an instruction depending on context.',
      'Bugs often come from reading bits with the wrong agreement.',
    ],
    quiz: [
      quiz(
        'What decides whether a byte is a number or a letter?',
        [
          'The hardware permanently stamps it',
          'The program’s agreement about how to interpret those bits',
          'Bytes that look like letters can’t be numbers',
          'Only UTF-8 files contain letters',
        ],
        1,
        'Representation is interpretation. Nothing in the byte itself says “I am text.”'
      ),
    ],
  }),

  'cpu-003-fetch-decode-execute': lesson({
    id: 'cpu-003-fetch-decode-execute',
    module: 'cpu',
    title: 'Fetch–decode–execute',
    hook: 'A CPU doesn’t “run a program” in one gulp — it walks the same tiny loop, forever.',
    nodes: [
      { id: 'mem', label: 'Memory', kind: 'generic', lane: 0 },
      { id: 'fetch', label: 'Fetch', kind: 'generic', lane: 0 },
      { id: 'decode', label: 'Decode', kind: 'generic', lane: 0 },
      { id: 'execute', label: 'Execute', kind: 'generic', lane: 0 },
    ],
    steps: [
      {
        caption: 'Fetch: pull the next instruction from memory into the CPU.',
        packets: [{ id: 'p1', from: 'mem', to: 'fetch', variant: 'control', outcome: 'pass', label: 'instr' }],
        nodeCaptions: {
          mem: 'Instructions live in memory as ordinary bytes.',
          fetch: 'The program counter says which address to grab next.',
        },
      },
      {
        caption: 'Decode: figure out what that instruction means.',
        packets: [{ id: 'p2', from: 'fetch', to: 'decode', variant: 'control', outcome: 'pass', label: 'decode' }],
        nodeCaptions: {
          decode: 'The decoder maps the bit pattern to an operation and its operands.',
        },
      },
      {
        caption: 'Execute: do the work, then go fetch the next instruction.',
        packets: [
          { id: 'p3', from: 'decode', to: 'execute', variant: 'control', outcome: 'pass', label: 'run' },
          { id: 'p4', from: 'execute', to: 'mem', variant: 'request', outcome: 'pass', label: 'next' },
        ],
        nodeCaptions: {
          execute: 'ALU, registers, memory writes — this is where the effect happens.',
          mem: 'Then the cycle repeats. Billions of times per second.',
        },
      },
    ],
    takeaways: [
      'Programs are streams of instructions the CPU fetches one (or a few) at a time.',
      'Fetch → decode → execute is the loop underneath every language you write.',
      '“Running code” is mostly this cycle, over and over.',
    ],
    quiz: [
      quiz(
        'What does the CPU do after it executes an instruction?',
        [
          'Shut down until you press a key',
          'Fetch the next instruction and keep going',
          'Delete the program from memory',
          'Wait for the disk to approve it',
        ],
        1,
        'The cycle continues until the program ends, blocks, or the machine stops.'
      ),
    ],
  }),

  'cpu-004-stack-vs-heap': lesson({
    id: 'cpu-004-stack-vs-heap',
    module: 'cpu',
    title: 'Stack vs heap',
    hook: 'Your program’s memory isn’t one big pile — stack and heap grow for different reasons.',
    nodes: [
      { id: 'code', label: 'Your code', kind: 'client', lane: 0 },
      { id: 'stack', label: 'Stack', kind: 'generic', lane: 0 },
      { id: 'heap', label: 'Heap', kind: 'generic', lane: 1 },
    ],
    steps: [
      {
        caption: 'Call a function: a new stack frame appears with locals and the return address.',
        packets: [{ id: 'p1', from: 'code', to: 'stack', variant: 'control', outcome: 'pass', label: 'frame' }],
        nodeCaptions: {
          stack: 'Stack frames are LIFO — last call in, first cleaned up when it returns.',
          code: 'Each call pushes; each return pops. Fast and automatic.',
        },
      },
      {
        caption: 'Ask for a chunk that outlives the function — allocation goes to the heap.',
        packets: [{ id: 'p2', from: 'code', to: 'heap', variant: 'data', outcome: 'pass', label: 'alloc' }],
        nodeCaptions: {
          heap: 'Heap memory sticks around until you free it (or a GC does). Order is flexible, bookkeeping costs more.',
        },
      },
      {
        caption: 'Function returns: the stack frame vanishes. The heap object can still be there.',
        packets: [{ id: 'p3', from: 'stack', to: 'code', variant: 'response', outcome: 'pass', label: 'return' }],
        nodeCaptions: {
          stack: 'Popping the frame reclaims those locals immediately.',
          heap: 'If nothing points at a heap object anymore, it’s garbage — reclaimable later.',
        },
      },
    ],
    takeaways: [
      'Stack is for short-lived, nested call data. Heap is for data with flexible lifetime.',
      'Stack allocation is cheap and automatic; heap allocation needs management.',
      'Use-after-free and leaks are almost always heap lifetime mistakes.',
    ],
    quiz: [
      quiz(
        'Where do a function’s local variables usually live?',
        ['Only on disk', 'On the stack frame for that call', 'Only in the GPU', 'In DNS'],
        1,
        'Locals are part of the stack frame and disappear when the function returns.'
      ),
    ],
  }),

  'ds-001-arrays': lesson({
    id: 'ds-001-arrays',
    module: 'ds',
    title: 'Arrays & contiguous memory',
    hook: 'An array is just items laid out back-to-back — so index math can jump straight to a slot.',
    nodes: [
      { id: 'index', label: 'Index 2', kind: 'client', lane: 0 },
      { id: 's0', label: '[0]', kind: 'generic', lane: 0 },
      { id: 's1', label: '[1]', kind: 'generic', lane: 0 },
      { id: 's2', label: '[2]', kind: 'generic', lane: 0 },
    ],
    steps: [
      {
        caption: 'You ask for index 2. No walking — start address + 2 × item size lands on the slot.',
        packets: [{ id: 'p1', from: 'index', to: 's2', variant: 'request', outcome: 'pass', label: 'jump' }],
        nodeCaptions: {
          index: 'Random access: time doesn’t grow with how far the index is.',
          s2: 'Contiguous layout is what makes the jump possible.',
        },
      },
      {
        caption: 'The value comes straight back. Slots 0 and 1 weren’t visited.',
        packets: [{ id: 'p2', from: 's2', to: 'index', variant: 'response', outcome: 'pass', label: 'value' }],
        nodeCaptions: {
          s0: 'Still there — just not needed for this lookup.',
          s1: 'Arrays trade flexible insert/delete for O(1) reads by index.',
        },
      },
    ],
    takeaways: [
      'Contiguous memory + fixed item size ⇒ direct index addressing.',
      'Reading by index is fast; inserting in the middle usually means shifting neighbors.',
      'Cache-friendly layouts matter because CPUs love sequential memory.',
    ],
    quiz: [
      quiz(
        'Why can an array jump to index 100 without visiting 0–99?',
        [
          'It stores a pointer to every index in a hash map',
          'Items sit in contiguous memory, so address = start + index × size',
          'Arrays are stored on disk only',
          'The CPU guesses',
        ],
        1,
        'That’s the whole point of contiguous layout.'
      ),
    ],
  }),

  'ds-002-linked-lists': lesson({
    id: 'ds-002-linked-lists',
    module: 'ds',
    title: 'Linked lists',
    hook: 'A linked list doesn’t jump by index — it walks node to node. That’s the trade.',
    nodes: [
      { id: 'head', label: 'Head', kind: 'generic', lane: 0 },
      { id: 'n1', label: 'Node A', kind: 'generic', lane: 0 },
      { id: 'n2', label: 'Node B', kind: 'generic', lane: 0 },
      { id: 'n3', label: 'Node C', kind: 'generic', lane: 0 },
    ],
    steps: [
      {
        caption: 'Start at the head. Each node only knows the next one.',
        packets: [{ id: 'p1', from: 'head', to: 'n1', variant: 'control', outcome: 'pass', label: 'next' }],
        nodeCaptions: {
          head: 'The head is just a pointer to the first node.',
          n1: 'Payload + pointer to the next node. No “slot 2” math.',
        },
      },
      {
        caption: 'To reach C you must walk A → B → C. No skipping.',
        packets: [
          { id: 'p2', from: 'n1', to: 'n2', variant: 'control', outcome: 'pass', label: 'next' },
          { id: 'p3', from: 'n2', to: 'n3', variant: 'control', outcome: 'pass', label: 'next' },
        ],
        nodeCaptions: {
          n2: 'Inserting after a node is easy: rewire one pointer.',
          n3: 'Finding the k-th item costs k steps — that’s the downside.',
        },
      },
    ],
    takeaways: [
      'Linked lists trade random access for cheap inserts/deletes at a known node.',
      'You follow pointers; you don’t compute addresses from an index.',
      'Poor cache locality is why lists often lose to arrays in practice.',
    ],
    quiz: [
      quiz(
        'What’s the cost of reaching the 50th node in a singly linked list?',
        [
          'Always one jump, like an array',
          'About 50 pointer hops from the head',
          'It lives at a fixed disk sector',
          'Lists don’t have an order',
        ],
        1,
        'No index math — you walk.'
      ),
    ],
  }),

  'ds-003-hash-maps': lesson({
    id: 'ds-003-hash-maps',
    module: 'ds',
    title: 'Hash maps',
    hook: 'A hash map turns a key into a bucket number so you don’t have to scan everything.',
    nodes: [
      { id: 'key', label: 'Key', kind: 'client', lane: 0 },
      { id: 'hash', label: 'Hash', kind: 'generic', lane: 0 },
      { id: 'b0', label: 'Bucket 0', kind: 'generic', lane: 1 },
      { id: 'b1', label: 'Bucket 1', kind: 'generic', lane: 0 },
      { id: 'b2', label: 'Bucket 2', kind: 'generic', lane: 1 },
    ],
    steps: [
      {
        caption: 'The key runs through a hash function and becomes a number.',
        packets: [{ id: 'p1', from: 'key', to: 'hash', variant: 'data', outcome: 'pass', label: 'hash()' }],
        nodeCaptions: {
          key: 'Keys can be strings, numbers, whatever the map supports.',
          hash: 'A good hash spreads keys around so buckets stay short.',
        },
      },
      {
        caption: 'That number picks a bucket. Lookup only searches inside that bucket.',
        packets: [{ id: 'p2', from: 'hash', to: 'b1', variant: 'request', outcome: 'pass', label: 'bucket' }],
        nodeCaptions: {
          b1: 'If two keys collide, they share a bucket — still better than scanning all keys.',
          b0: 'Other buckets aren’t touched for this lookup.',
        },
      },
      {
        caption: 'The value comes back from the bucket.',
        packets: [{ id: 'p3', from: 'b1', to: 'key', variant: 'response', outcome: 'pass', label: 'value' }],
        nodeCaptions: {
          key: 'Average case feels like O(1). Worst case, everything collided.',
        },
      },
    ],
    takeaways: [
      'Hash maps trade a bit of compute (hashing) for fast average-case lookup.',
      'Collisions are normal; bucket strategy is how you handle them.',
      '“O(1)” is a promise about averages, not a hard guarantee.',
    ],
    quiz: [
      quiz(
        'What does the hash function do in a hash map?',
        [
          'Sorts the keys alphabetically',
          'Turns a key into a bucket index',
          'Encrypts the value',
          'Deletes duplicate keys',
        ],
        1,
        'Hash → bucket. That’s the jump from “scan all keys” to “check one bucket.”'
      ),
    ],
  }),

  'ds-004-trees': lesson({
    id: 'ds-004-trees',
    module: 'ds',
    title: 'Trees',
    hook: 'In a balanced tree, each comparison throws away about half of what’s left.',
    nodes: [
      { id: 'root', label: 'Root 50', kind: 'generic', lane: 0 },
      { id: 'left', label: '20', kind: 'generic', lane: 0 },
      { id: 'right', label: '80', kind: 'generic', lane: 0 },
      { id: 'target', label: 'Want 20', kind: 'client', lane: 1 },
    ],
    steps: [
      {
        caption: 'Start at the root. 20 is less than 50, so go left — the whole right side is irrelevant.',
        packets: [{ id: 'p1', from: 'target', to: 'root', variant: 'request', outcome: 'pass', label: '20?' }],
        nodeCaptions: {
          root: 'BST rule: left subtree smaller, right subtree larger.',
          right: 'Ignored this step — that’s the halving.',
        },
      },
      {
        caption: 'At 20 you find the value. One more comparison, search over.',
        packets: [
          { id: 'p2', from: 'root', to: 'left', variant: 'control', outcome: 'pass', label: 'left' },
          { id: 'p3', from: 'left', to: 'target', variant: 'response', outcome: 'pass', label: 'found' },
        ],
        nodeCaptions: {
          left: 'Depth is roughly log₂(n) in a balanced tree.',
          target: 'That’s why tree maps and sets feel fast on big data.',
        },
      },
    ],
    takeaways: [
      'Trees turn “scan everything” into “eliminate half” when balanced.',
      'Structure (ordering invariants) is what makes the halving legal.',
      'A skewed tree degrades toward a linked list — balance matters.',
    ],
    quiz: [
      quiz(
        'In a balanced binary search tree, why is lookup fast?',
        [
          'Every node stores every other node’s address',
          'Each comparison discards about half the remaining nodes',
          'Trees live in CPU registers only',
          'Lookup always takes exactly two steps',
        ],
        1,
        'Halving each step is the log n story.'
      ),
    ],
  }),

  'ds-005-graphs': lesson({
    id: 'ds-005-graphs',
    module: 'ds',
    title: 'Graphs',
    hook: 'Graphs are nodes plus edges that can go any direction — not just parent/child.',
    nodes: [
      { id: 'a', label: 'A', kind: 'generic', lane: 0 },
      { id: 'b', label: 'B', kind: 'generic', lane: 0 },
      { id: 'c', label: 'C', kind: 'generic', lane: 1 },
      { id: 'd', label: 'D', kind: 'generic', lane: 0 },
    ],
    steps: [
      {
        caption: 'From A you can reach B and C — edges define the legal moves.',
        packets: [
          { id: 'p1', from: 'a', to: 'b', variant: 'control', outcome: 'pass', label: 'edge' },
          { id: 'p2', from: 'a', to: 'c', variant: 'control', outcome: 'pass', label: 'edge' },
        ],
        nodeCaptions: {
          a: 'A node’s neighbors are whoever its edges point to.',
          b: 'Unlike a tree, B might also link back or sideways.',
        },
      },
      {
        caption: 'B connects to D. Cycles are allowed — you can return to a node you’ve seen.',
        packets: [
          { id: 'p3', from: 'b', to: 'd', variant: 'control', outcome: 'pass', label: 'edge' },
          { id: 'p4', from: 'd', to: 'a', variant: 'control', outcome: 'pass', label: 'back' },
        ],
        nodeCaptions: {
          d: 'Traversal algorithms mark visited nodes so cycles don’t loop forever.',
          c: 'Social nets, maps, dependencies — graphs show up everywhere.',
        },
      },
    ],
    takeaways: [
      'Graphs generalize trees: edges aren’t limited to a single parent.',
      'Traversal needs a visited set when cycles exist.',
      'Many real systems are graphs: networks, deps, recommendations.',
    ],
    quiz: [
      quiz(
        'What makes a graph different from a tree?',
        [
          'Graphs can’t store numbers',
          'Edges can form cycles and aren’t limited to parent/child',
          'Graphs only have two nodes',
          'Trees allow cycles; graphs don’t',
        ],
        1,
        'Trees are a restricted kind of graph. General graphs allow richer connectivity.'
      ),
    ],
  }),

  'algo-001-linear-vs-binary-search': lesson({
    id: 'algo-001-linear-vs-binary-search',
    module: 'algo',
    title: 'Linear vs binary search',
    hook: 'Same sorted list, two strategies: check one-by-one, or keep cutting the range in half.',
    nodes: [
      { id: 'linear', label: 'Linear', kind: 'client', lane: 0 },
      { id: 'binary', label: 'Binary', kind: 'client', lane: 1 },
      { id: 'arr', label: 'Sorted[]', kind: 'generic', lane: 0 },
      { id: 'hit', label: 'Target', kind: 'server', lane: 0 },
    ],
    steps: [
      {
        caption: 'Linear search starts at the left and walks until it hits the target.',
        packets: [{ id: 'p1', from: 'linear', to: 'arr', variant: 'request', outcome: 'pass', label: 'scan' }],
        nodeCaptions: {
          linear: 'Simple. On average checks about half the items. Worst case: all of them.',
          arr: 'Works even if the array isn’t sorted — binary search won’t.',
        },
      },
      {
        caption: 'Binary search jumps to the middle, then only keeps the half that can still hold the target.',
        packets: [{ id: 'p2', from: 'binary', to: 'arr', variant: 'control', outcome: 'pass', label: 'mid' }],
        nodeCaptions: {
          binary: 'Needs sorted order. Each step halves the remaining search space.',
        },
      },
      {
        caption: 'Both can find it — binary just asks far fewer questions on a big list.',
        packets: [
          { id: 'p3', from: 'arr', to: 'hit', variant: 'response', outcome: 'pass', label: 'found' },
          { id: 'p4', from: 'hit', to: 'binary', variant: 'response', outcome: 'pass', label: 'index' },
        ],
        nodeCaptions: {
          hit: 'log₂(n) steps vs up to n steps is why sorting once can pay off.',
        },
      },
    ],
    takeaways: [
      'Linear search is simple and works on unsorted data.',
      'Binary search needs order and rewards you with logarithmic steps.',
      'Pick based on whether you can afford sorting and how often you search.',
    ],
    quiz: [
      quiz(
        'What must be true before binary search is correct?',
        [
          'The list must fit in one CPU cache line',
          'The list must be sorted (by the same order you compare)',
          'The list must contain only even numbers',
          'The list must be a linked list',
        ],
        1,
        'Binary search’s “discard half” move assumes the remaining half still contains the answer.'
      ),
    ],
  }),

  'algo-002-sorting': lesson({
    id: 'algo-002-sorting',
    module: 'algo',
    title: 'Sorting',
    hook: 'Sorting is elements physically finding their place — comparisons decide who swaps.',
    nodes: [
      { id: 'a', label: '7', kind: 'generic', lane: 0 },
      { id: 'b', label: '2', kind: 'generic', lane: 0 },
      { id: 'c', label: '5', kind: 'generic', lane: 0 },
      { id: 'cursor', label: 'Compare', kind: 'client', lane: 1 },
    ],
    steps: [
      {
        caption: 'Compare neighbors. 7 and 2 are out of order, so they swap.',
        packets: [
          { id: 'p1', from: 'cursor', to: 'a', variant: 'control', outcome: 'pass', label: '?' },
          { id: 'p2', from: 'a', to: 'b', variant: 'data', outcome: 'pass', label: 'swap' },
        ],
        nodeCaptions: {
          cursor: 'Different sorts pick different pairs, but the idea is compare → maybe swap/move.',
          a: 'After the swap this slot holds the smaller value.',
        },
      },
      {
        caption: 'Keep comparing until every element is in order.',
        packets: [
          { id: 'p3', from: 'b', to: 'c', variant: 'data', outcome: 'pass', label: 'swap?' },
          { id: 'p4', from: 'c', to: 'cursor', variant: 'response', outcome: 'pass', label: 'done' },
        ],
        nodeCaptions: {
          c: 'When no more swaps are needed, the array is sorted.',
          b: 'Faster algorithms avoid obvious wasted comparisons — same goal, less work.',
        },
      },
    ],
    takeaways: [
      'Sorting rearranges by comparisons (or by counting/radix tricks).',
      'Naive sorts are easy to see; better sorts reduce how many swaps you need.',
      'Sorted data unlocks binary search and many other algorithms.',
    ],
    quiz: [
      quiz(
        'What is sorting doing, in one sentence?',
        [
          'Deleting duplicates from memory',
          'Rearranging elements into an agreed order',
          'Compressing the array',
          'Moving the array to the GPU',
        ],
        1,
        'Order is the product — algorithms differ in how they get there.'
      ),
    ],
  }),

  'algo-003-recursion-call-stack': lesson({
    id: 'algo-003-recursion-call-stack',
    module: 'algo',
    title: 'Recursion & the call stack',
    hook: 'Recursion isn’t magic — it’s the same function calling itself, stacking frames, then unwinding.',
    nodes: [
      { id: 'f1', label: 'fact(3)', kind: 'generic', lane: 0 },
      { id: 'f2', label: 'fact(2)', kind: 'generic', lane: 0 },
      { id: 'f3', label: 'fact(1)', kind: 'generic', lane: 0 },
      { id: 'base', label: 'Base 1', kind: 'server', lane: 0 },
    ],
    steps: [
      {
        caption: 'fact(3) needs fact(2), so a new frame stacks on top.',
        packets: [{ id: 'p1', from: 'f1', to: 'f2', variant: 'control', outcome: 'pass', label: 'call' }],
        nodeCaptions: {
          f1: 'Waiting on the result of the inner call.',
          f2: 'Each call gets its own locals on the stack.',
        },
      },
      {
        caption: 'Keep stacking until you hit the base case.',
        packets: [
          { id: 'p2', from: 'f2', to: 'f3', variant: 'control', outcome: 'pass', label: 'call' },
          { id: 'p3', from: 'f3', to: 'base', variant: 'request', outcome: 'pass', label: 'stop' },
        ],
        nodeCaptions: {
          base: 'Base case returns without calling again — otherwise you’d recurse forever.',
        },
      },
      {
        caption: 'Answers bubble back as frames pop: 1 → 2 → 6.',
        packets: [
          { id: 'p4', from: 'base', to: 'f3', variant: 'response', outcome: 'pass', label: '1' },
          { id: 'p5', from: 'f3', to: 'f2', variant: 'response', outcome: 'pass', label: '2' },
          { id: 'p6', from: 'f2', to: 'f1', variant: 'response', outcome: 'pass', label: '6' },
        ],
        nodeCaptions: {
          f1: 'Unwind is just returns. Deep recursion ⇒ deep stack.',
        },
      },
    ],
    takeaways: [
      'Recursion = call stack frames stacking, then returning.',
      'Every recursive function needs a base case that stops the chain.',
      'Too much depth overflows the stack — same memory region as normal calls.',
    ],
    quiz: [
      quiz(
        'What happens if a recursive function never hits a base case?',
        [
          'It sorts the input instead',
          'Calls keep stacking until the stack overflows',
          'The heap deletes older frames automatically',
          'Nothing — recursion can’t fail',
        ],
        1,
        'No base case means infinite (or until crash) recursion.'
      ),
    ],
  }),

  'algo-004-big-o': lesson({
    id: 'algo-004-big-o',
    module: 'algo',
    title: 'Big O',
    hook: 'Big O asks: when the input grows, which algorithm falls off a cliff first?',
    nodes: [
      { id: 'input', label: 'Input n', kind: 'client', lane: 0 },
      { id: 'log', label: 'O(log n)', kind: 'generic', lane: 0 },
      { id: 'linear', label: 'O(n)', kind: 'generic', lane: 0 },
      { id: 'quad', label: 'O(n²)', kind: 'generic', lane: 1 },
    ],
    steps: [
      {
        caption: 'Feed a small n. All three strategies finish — differences are hard to feel.',
        packets: [
          { id: 'p1', from: 'input', to: 'log', variant: 'data', outcome: 'pass', label: 'n=10' },
          { id: 'p2', from: 'input', to: 'linear', variant: 'data', outcome: 'pass', label: 'n=10' },
        ],
        nodeCaptions: {
          log: 'Binary search style — steps grow slowly.',
          linear: 'One pass over the input.',
        },
      },
      {
        caption: 'Grow n a lot. O(n²) does wildly more work than the others.',
        packets: [
          { id: 'p3', from: 'input', to: 'quad', variant: 'data', outcome: 'pass', label: 'n=1000' },
          { id: 'p4', from: 'quad', to: 'input', variant: 'malicious', outcome: 'blocked', stopsAt: 'quad', label: 'too slow' },
        ],
        nodeCaptions: {
          quad: 'Nested loops over n: work scales with n×n. That’s the cliff.',
          linear: 'Still proportional to n — painful later, but not quadratic painful.',
        },
      },
    ],
    takeaways: [
      'Big O ignores constants to highlight how work scales with n.',
      'log n ≪ n ≪ n² for large n — the ranking matters more than the labels.',
      'Pick algorithms for the n you actually expect in production.',
    ],
    quiz: [
      quiz(
        'If n grows from 100 to 10,000, which grows worst?',
        ['O(log n)', 'O(n)', 'O(n²)', 'They all grow the same'],
        2,
        'Quadratic work explodes fastest as n increases.'
      ),
    ],
  }),

  'os-001-processes-vs-threads': lesson({
    id: 'os-001-processes-vs-threads',
    module: 'os',
    title: 'Processes vs threads',
    hook: 'Processes are isolated programs. Threads are workers that share one process’s memory.',
    nodes: [
      { id: 'p1', label: 'Process A', kind: 'generic', lane: 0 },
      { id: 'p2', label: 'Process B', kind: 'generic', lane: 1 },
      { id: 't1', label: 'Thread 1', kind: 'generic', lane: 0 },
      { id: 't2', label: 'Thread 2', kind: 'generic', lane: 0 },
    ],
    steps: [
      {
        caption: 'Process A and Process B don’t share memory — a bad pointer in A shouldn’t trash B.',
        packets: [{ id: 'p1a', from: 'p1', to: 'p2', variant: 'malicious', outcome: 'blocked', stopsAt: 'p1', label: 'isolated' }],
        nodeCaptions: {
          p1: 'Own address space, own resources (mostly).',
          p2: 'Talking across processes needs explicit IPC — pipes, sockets, etc.',
        },
      },
      {
        caption: 'Inside Process A, two threads share the same heap. They can both touch the same data.',
        packets: [
          { id: 'p2a', from: 't1', to: 't2', variant: 'data', outcome: 'pass', label: 'shared' },
          { id: 'p2b', from: 't2', to: 't1', variant: 'data', outcome: 'pass', label: 'shared' },
        ],
        nodeCaptions: {
          t1: 'Lightweight: same process, separate call stack.',
          t2: 'Sharing is power and danger — races live here.',
        },
      },
    ],
    takeaways: [
      'Processes isolate; threads share an address space.',
      'Threads are cheaper to create/switch, but need synchronization.',
      'Pick process boundaries for safety, threads for shared-memory parallelism.',
    ],
    quiz: [
      quiz(
        'Why can two threads corrupt the same variable more easily than two processes?',
        [
          'Threads are always slower',
          'Threads share memory by default; processes don’t',
          'Processes can’t run at the same time',
          'Threads don’t have stacks',
        ],
        1,
        'Shared heap = concurrent access unless you coordinate.'
      ),
    ],
  }),

  'os-002-scheduling': lesson({
    id: 'os-002-scheduling',
    module: 'os',
    title: 'Scheduling',
    hook: 'One CPU core runs one thing at a time — the scheduler rapidly switches so everyone gets a turn.',
    nodes: [
      { id: 'cpu', label: 'CPU', kind: 'generic', lane: 0 },
      { id: 'a', label: 'Proc A', kind: 'generic', lane: 0 },
      { id: 'b', label: 'Proc B', kind: 'generic', lane: 1 },
      { id: 'c', label: 'Proc C', kind: 'generic', lane: 0 },
    ],
    steps: [
      {
        caption: 'A runs for a time slice, then the scheduler pauses it.',
        packets: [{ id: 'p1', from: 'cpu', to: 'a', variant: 'control', outcome: 'pass', label: 'run' }],
        nodeCaptions: {
          cpu: 'Hardware executes whoever is currently scheduled.',
          a: 'State is saved so A can resume later.',
        },
      },
      {
        caption: 'B gets the core next — A isn’t finished, just waiting its turn.',
        packets: [{ id: 'p2', from: 'cpu', to: 'b', variant: 'control', outcome: 'pass', label: 'run' }],
        nodeCaptions: {
          b: 'Fairness vs throughput vs latency — policies differ.',
        },
      },
      {
        caption: 'C runs, then maybe A again. Nobody needs to finish first for others to make progress.',
        packets: [
          { id: 'p3', from: 'cpu', to: 'c', variant: 'control', outcome: 'pass', label: 'run' },
          { id: 'p4', from: 'cpu', to: 'a', variant: 'control', outcome: 'pass', label: 'resume' },
        ],
        nodeCaptions: {
          c: 'Preemption is why your UI can stay responsive while something compiles.',
        },
      },
    ],
    takeaways: [
      'Scheduling multiplexes one core across many runnable tasks.',
      'Time slices + saved state create the illusion of simultaneity.',
      'Policy choices change what feels “fair” or “laggy.”',
    ],
    quiz: [
      quiz(
        'If three processes are runnable on one core, what does the scheduler do?',
        [
          'Runs all three machine instructions in true parallel on that core',
          'Switches the core between them over time',
          'Deletes two of them',
          'Moves them all to disk',
        ],
        1,
        'One core, one thread of execution at a time — switching creates concurrency.'
      ),
    ],
  }),

  'os-003-concurrency-race-conditions': lesson({
    id: 'os-003-concurrency-race-conditions',
    module: 'os',
    title: 'Concurrency & race conditions',
    hook: 'Two threads can both read a value, both add one, and both write — and you lose an update.',
    nodes: [
      { id: 'mem', label: 'count=0', kind: 'generic', lane: 0 },
      { id: 't1', label: 'Thread A', kind: 'generic', lane: 0 },
      { id: 't2', label: 'Thread B', kind: 'generic', lane: 1 },
    ],
    steps: [
      {
        caption: 'Both threads read count as 0 before either writes back.',
        packets: [
          { id: 'p1', from: 'mem', to: 't1', variant: 'data', outcome: 'pass', label: 'read 0' },
          { id: 'p2', from: 'mem', to: 't2', variant: 'data', outcome: 'pass', label: 'read 0' },
        ],
        nodeCaptions: {
          mem: 'Shared variable. No lock yet.',
          t1: 'Thinks “I’ll write 1.”',
          t2: 'Also thinks “I’ll write 1.”',
        },
      },
      {
        caption: 'A writes 1, then B writes 1 — second write wins. One increment vanished.',
        packets: [
          { id: 'p3', from: 't1', to: 'mem', variant: 'data', outcome: 'pass', label: 'write 1' },
          { id: 'p4', from: 't2', to: 'mem', variant: 'data', outcome: 'pass', label: 'write 1' },
        ],
        nodeCaptions: {
          mem: 'Final value 1, not 2. Timing decided correctness.',
          t2: 'Locks, atomics, or queues prevent this interleaving.',
        },
      },
    ],
    takeaways: [
      'A race is when result depends on unpredictable timing of shared access.',
      'Read-modify-write without synchronization is a classic bug pattern.',
      'Fix with mutual exclusion or lock-free atomics designed for the job.',
    ],
    quiz: [
      quiz(
        'In the lost-update race, why did count stay 1 after two increments?',
        [
          'Addition is illegal on shared memory',
          'Both threads based their write on the same old read',
          'The CPU rejects the second write always',
          'Threads can’t write memory',
        ],
        1,
        'Both computed 0+1; the later write overwrote the earlier one.'
      ),
    ],
  }),

  'os-004-files-io': lesson({
    id: 'os-004-files-io',
    module: 'os',
    title: 'Files & I/O',
    hook: 'Your code rarely talks to the disk itself — it asks the OS, and then everyone waits.',
    nodes: [
      { id: 'app', label: 'App', kind: 'client', lane: 0 },
      { id: 'os', label: 'OS', kind: 'gateway', lane: 0 },
      { id: 'disk', label: 'Disk', kind: 'database', lane: 0 },
    ],
    steps: [
      {
        caption: 'The app calls read/write. That becomes a system call into the OS.',
        packets: [{ id: 'p1', from: 'app', to: 'os', variant: 'request', outcome: 'pass', label: 'read()' }],
        nodeCaptions: {
          app: 'User code isn’t allowed to poke device registers directly (on modern OSes).',
          os: 'The kernel enforces permissions and manages the device.',
        },
      },
      {
        caption: 'The OS talks to the disk. This can take ages compared to RAM.',
        packets: [{ id: 'p2', from: 'os', to: 'disk', variant: 'request', outcome: 'pass', label: 'I/O' }],
        nodeCaptions: {
          disk: 'Hardware delay dominates. The CPU may run something else meanwhile.',
        },
      },
      {
        caption: 'Data returns through the OS to the app.',
        packets: [
          { id: 'p3', from: 'disk', to: 'os', variant: 'data', outcome: 'pass', label: 'bytes' },
          { id: 'p4', from: 'os', to: 'app', variant: 'response', outcome: 'pass', label: 'buffer' },
        ],
        nodeCaptions: {
          app: 'From the app’s view it was one read() — the wait was real either way.',
        },
      },
    ],
    takeaways: [
      'File I/O is mediated by the OS for safety and abstraction.',
      'Disk latency is why I/O-bound programs feel different from CPU-bound ones.',
      'Async I/O and caching exist to hide some of that wait.',
    ],
    quiz: [
      quiz(
        'Who usually performs the actual disk operation when your app reads a file?',
        [
          'The JavaScript engine alone',
          'The operating system (kernel), on the app’s behalf',
          'The monitor',
          'DNS',
        ],
        1,
        'System calls hand the request to the kernel, which drives the device.'
      ),
    ],
  }),

  'build-001-compiled-vs-interpreted': lesson({
    id: 'build-001-compiled-vs-interpreted',
    module: 'build',
    title: 'Compiled vs interpreted',
    hook: 'Same source file, two paths to running: translate ahead of time, or translate while it runs.',
    nodes: [
      { id: 'src', label: 'Source', kind: 'generic', lane: 0 },
      { id: 'compiler', label: 'Compiler', kind: 'generic', lane: 0 },
      { id: 'binary', label: 'Binary', kind: 'server', lane: 0 },
      { id: 'interp', label: 'Interpreter', kind: 'generic', lane: 1 },
    ],
    steps: [
      {
        caption: 'Compiled path: source goes through a compiler once and becomes a binary.',
        packets: [
          { id: 'p1', from: 'src', to: 'compiler', variant: 'data', outcome: 'pass', label: 'compile' },
          { id: 'p2', from: 'compiler', to: 'binary', variant: 'response', outcome: 'pass', label: 'exe' },
        ],
        nodeCaptions: {
          compiler: 'Heavy work happens before the user runs the program.',
          binary: 'The CPU runs machine code directly (or via a small loader).',
        },
      },
      {
        caption: 'Interpreted path: an interpreter reads the source (or bytecode) as it executes.',
        packets: [
          { id: 'p3', from: 'src', to: 'interp', variant: 'data', outcome: 'pass', label: 'run' },
          { id: 'p4', from: 'interp', to: 'src', variant: 'control', outcome: 'pass', label: 'next line' },
        ],
        nodeCaptions: {
          interp: 'Translation cost is paid at runtime, often line by line or via a VM.',
          src: 'Many modern languages mix both: compile to bytecode, then JIT.',
        },
      },
    ],
    takeaways: [
      'Compilation shifts translation cost earlier; interpretation pays as you go.',
      'Real engines are hybrids — VMs, bytecode, JIT — not pure textbook extremes.',
      '“Compiled vs interpreted” is about when and how source becomes machine work.',
    ],
    quiz: [
      quiz(
        'What’s the key timing difference?',
        [
          'Interpreters never touch the source',
          'Compilers translate before run; interpreters translate during run',
          'Compiled programs can’t use RAM',
          'Only interpreters can use loops',
        ],
        1,
        'When translation happens is the core distinction.'
      ),
    ],
  }),

  // net-001..006 already on disk — only write 007-015 here
  'net-007-ports': lesson({
    id: 'net-007-ports',
    module: 'net',
    title: 'Ports',
    hook: 'One IP address is a building. Ports are the doors — 80, 443, 22 lead to different services.',
    nodes: [
      { id: 'client', label: 'You', kind: 'client', lane: 0 },
      { id: 'p80', label: ':80 Web', kind: 'server', lane: 0 },
      { id: 'p443', label: ':443 TLS', kind: 'server', lane: 1 },
      { id: 'p22', label: ':22 SSH', kind: 'server', lane: 0 },
    ],
    steps: [
      {
        caption: 'Same server IP, but your browser knocks on port 443 for HTTPS.',
        packets: [{ id: 'p1', from: 'client', to: 'p443', variant: 'request', outcome: 'pass', label: ':443' }],
        nodeCaptions: {
          client: 'The destination is IP + port, not IP alone.',
          p443: 'A process is listening on 443. Other ports are other programs.',
        },
      },
      {
        caption: 'SSH uses 22 on that same machine. Different door, different service.',
        packets: [{ id: 'p2', from: 'client', to: 'p22', variant: 'control', outcome: 'pass', label: ':22' }],
        nodeCaptions: {
          p22: 'Firewalls often allow 443 but block 22 from the public internet.',
          p80: 'Port 80 is the classic unencrypted HTTP door.',
        },
      },
    ],
    takeaways: [
      'IP finds the host; port finds the service on that host.',
      'Well-known ports are conventions — the OS maps them to listening processes.',
      'Security often means choosing which doors are open.',
    ],
    quiz: [
      quiz(
        'Two services on one server — how does traffic reach the right one?',
        [
          'They take turns each minute',
          'Different port numbers on the same IP',
          'They must use different IP addresses always',
          'DNS picks the service name only',
        ],
        1,
        'Sockets are addressed by IP + port (+ protocol).'
      ),
    ],
  }),

  'net-008-https-encryption': lesson({
    id: 'net-008-https-encryption',
    module: 'net',
    title: 'HTTPS & encryption',
    hook: 'HTTPS is the same request/response — wrapped so a snoop on the wire can’t read it.',
    nodes: [
      { id: 'client', label: 'You', kind: 'client', lane: 0 },
      { id: 'snoop', label: 'Snoop', kind: 'firewall', lane: 1 },
      { id: 'server', label: 'Server', kind: 'server', lane: 0 },
    ],
    steps: [
      {
        caption: 'Your browser and the server set up an encrypted session (TLS).',
        packets: [{ id: 'p1', from: 'client', to: 'server', variant: 'encrypted', outcome: 'pass', label: 'TLS' }],
        nodeCaptions: {
          client: 'Certificates help you know you’re talking to the real server.',
          server: 'After handshake, application data is encrypted.',
        },
      },
      {
        caption: 'The HTTP request travels encrypted. A snoop sees ciphertext, not your password.',
        packets: [
          { id: 'p2', from: 'client', to: 'server', variant: 'encrypted', outcome: 'pass', label: 'GET' },
          { id: 'p3', from: 'client', to: 'snoop', variant: 'encrypted', outcome: 'blocked', stopsAt: 'snoop', label: '??? ' },
        ],
        nodeCaptions: {
          snoop: 'Can still see that you’re talking to an IP — not the contents.',
          server: 'Decrypts with the session keys and handles normal HTTP.',
        },
      },
    ],
    takeaways: [
      'HTTPS = HTTP plus TLS encryption and authentication of the server.',
      'Encryption hides contents from on-path observers, not from the server itself.',
      'Metadata (that you connected) can still leak.',
    ],
    quiz: [
      quiz(
        'What does HTTPS protect from a network snoop?',
        [
          'The fact that you connected to a server',
          'The readable contents of your request and response',
          'Bugs in server application logic',
          'A stolen laptop unlocked on your desk',
        ],
        1,
        'TLS encrypts the payload. Endpoint compromise is a different problem.'
      ),
    ],
  }),

  'net-009-load-balancers': lesson({
    id: 'net-009-load-balancers',
    module: 'net',
    title: 'Load balancers',
    hook: 'One public door, many identical servers behind it — the balancer picks who answers.',
    nodes: [
      { id: 'client', label: 'You', kind: 'client', lane: 0 },
      { id: 'lb', label: 'Load balancer', kind: 'loadbalancer', lane: 0 },
      { id: 's1', label: 'Server 1', kind: 'server', lane: 0 },
      { id: 's2', label: 'Server 2', kind: 'server', lane: 1 },
      { id: 's3', label: 'Server 3', kind: 'server', lane: 0 },
    ],
    steps: [
      {
        caption: 'Your request hits the load balancer, not a single app server.',
        packets: [{ id: 'p1', from: 'client', to: 'lb', variant: 'request', outcome: 'pass', label: 'req' }],
        nodeCaptions: {
          lb: 'Health checks and algorithms (round-robin, least connections…) choose a backend.',
        },
      },
      {
        caption: 'It forwards to one healthy server — today, Server 2.',
        packets: [
          { id: 'p2', from: 'lb', to: 's2', variant: 'request', outcome: 'pass', label: 'fwd' },
          { id: 'p3', from: 's2', to: 'lb', variant: 'response', outcome: 'pass', label: 'ok' },
          { id: 'p4', from: 'lb', to: 'client', variant: 'response', outcome: 'pass', label: 'ok' },
        ],
        nodeCaptions: {
          s2: 'You didn’t pick Server 2 — the balancer did.',
          s1: 'Idle this request; ready for the next.',
        },
      },
    ],
    takeaways: [
      'Load balancers spread traffic so no single server is the only path.',
      'Clients usually talk to a virtual address in front of many backends.',
      'Health checks keep broken servers out of rotation.',
    ],
    quiz: [
      quiz(
        'What problem does a load balancer mainly solve?',
        [
          'Encrypting passwords on disk',
          'Spreading requests across multiple servers',
          'Assigning IP addresses on your LAN',
          'Compiling your source code',
        ],
        1,
        'Distribution and failover — not application business logic.'
      ),
    ],
  }),

  'net-010-caching-cdns': lesson({
    id: 'net-010-caching-cdns',
    module: 'net',
    title: 'Caching & CDNs',
    hook: 'The second request shouldn’t always travel all the way to the origin.',
    nodes: [
      { id: 'client', label: 'You', kind: 'client', lane: 0 },
      { id: 'cdn', label: 'CDN edge', kind: 'cache', lane: 0 },
      { id: 'origin', label: 'Origin', kind: 'server', lane: 0 },
    ],
    steps: [
      {
        caption: 'First visit: edge doesn’t have the file, so it fetches from origin.',
        packets: [
          { id: 'p1', from: 'client', to: 'cdn', variant: 'request', outcome: 'pass', label: 'GET' },
          { id: 'p2', from: 'cdn', to: 'origin', variant: 'request', outcome: 'pass', label: 'miss' },
          { id: 'p3', from: 'origin', to: 'cdn', variant: 'data', outcome: 'pass', label: 'file' },
        ],
        nodeCaptions: {
          cdn: 'Caches a copy near users for the next hit.',
          origin: 'Source of truth — protected from every repeat download.',
        },
      },
      {
        caption: 'Second visit: edge answers from cache. Origin never hears about it.',
        packets: [
          { id: 'p4', from: 'client', to: 'cdn', variant: 'request', outcome: 'pass', label: 'GET' },
          { id: 'p5', from: 'cdn', to: 'client', variant: 'response', outcome: 'pass', label: 'hit' },
        ],
        nodeCaptions: {
          cdn: 'That’s the short-circuit. Faster for you, cheaper for origin.',
          origin: 'Idle — the whole point of a CDN for static assets.',
        },
      },
    ],
    takeaways: [
      'Caches store recent responses to avoid repeating expensive work.',
      'CDNs put caches geographically closer to users.',
      'Cache invalidation — knowing when a copy is stale — is the hard part.',
    ],
    quiz: [
      quiz(
        'On a CDN cache hit, who usually serves the file?',
        [
          'Always the origin database',
          'The edge cache, without asking origin',
          'Your ISP’s email server',
          'A random user’s phone',
        ],
        1,
        'Hit = answered from cache. Miss = fetch (then often store).'
      ),
    ],
  }),

  'net-011-databases': lesson({
    id: 'net-011-databases',
    module: 'net',
    title: 'Databases',
    hook: 'The web server often isn’t the source of truth — it asks a database, and that can be slow.',
    nodes: [
      { id: 'client', label: 'You', kind: 'client', lane: 0 },
      { id: 'app', label: 'App server', kind: 'server', lane: 0 },
      { id: 'db', label: 'Database', kind: 'database', lane: 0 },
    ],
    steps: [
      {
        caption: 'Your request hits the app server first.',
        packets: [{ id: 'p1', from: 'client', to: 'app', variant: 'request', outcome: 'pass', label: 'GET /user' }],
        nodeCaptions: {
          app: 'Application logic lives here — auth, formatting, business rules.',
        },
      },
      {
        caption: 'The app queries the database for the actual row.',
        packets: [
          { id: 'p2', from: 'app', to: 'db', variant: 'request', outcome: 'pass', label: 'SQL' },
          { id: 'p3', from: 'db', to: 'app', variant: 'data', outcome: 'pass', label: 'row' },
        ],
        nodeCaptions: {
          db: 'Specialized for durable, queryable state. Often the bottleneck.',
        },
      },
      {
        caption: 'App shapes a response and sends it back to you.',
        packets: [{ id: 'p4', from: 'app', to: 'client', variant: 'response', outcome: 'pass', label: 'JSON' }],
        nodeCaptions: {
          client: 'You never spoke to the DB directly — and usually shouldn’t.',
        },
      },
    ],
    takeaways: [
      'App servers and databases are different roles with different jobs.',
      'Many “slow API” problems are really slow queries.',
      'Keep databases behind the app — don’t expose them to the public internet.',
    ],
    quiz: [
      quiz(
        'Why doesn’t your browser usually query the database directly?',
        [
          'Databases can’t speak TCP',
          'Security and logic belong in the app tier; DB holds the data',
          'Browsers forbid all networking',
          'Databases only store images',
        ],
        1,
        'Separation of concerns plus access control.'
      ),
    ],
  }),

  'net-012-apis': lesson({
    id: 'net-012-apis',
    module: 'net',
    title: 'APIs',
    hook: 'Apps talk to apps without a human clicking — that’s an API call.',
    nodes: [
      { id: 'appA', label: 'App A', kind: 'client', lane: 0 },
      { id: 'api', label: 'API', kind: 'gateway', lane: 0 },
      { id: 'appB', label: 'App B', kind: 'server', lane: 0 },
    ],
    steps: [
      {
        caption: 'App A sends a structured request to App B’s API — no browser UI required.',
        packets: [{ id: 'p1', from: 'appA', to: 'api', variant: 'request', outcome: 'pass', label: 'POST /pay' }],
        nodeCaptions: {
          appA: 'Could be your backend, a mobile app, or a cron job.',
          api: 'Contract: URLs, methods, auth, JSON shapes.',
        },
      },
      {
        caption: 'App B handles it and returns a machine-readable response.',
        packets: [
          { id: 'p2', from: 'api', to: 'appB', variant: 'request', outcome: 'pass', label: 'handle' },
          { id: 'p3', from: 'appB', to: 'api', variant: 'response', outcome: 'pass', label: '200' },
          { id: 'p4', from: 'api', to: 'appA', variant: 'response', outcome: 'pass', label: 'JSON' },
        ],
        nodeCaptions: {
          appB: 'Same request/response idea as the web — consumers are programs.',
        },
      },
    ],
    takeaways: [
      'APIs are contracts for machine-to-machine requests.',
      'HTTP JSON APIs are common; the pattern isn’t limited to HTTP.',
      'Versioning and auth matter because other programs depend on you.',
    ],
    quiz: [
      quiz(
        'What is an API primarily for?',
        [
          'Drawing CSS animations',
          'Letting programs request work/data from other programs',
          'Cooling the CPU',
          'Assigning MAC addresses',
        ],
        1,
        'Human UIs are optional — the interface is for software.'
      ),
    ],
  }),

  'net-013-authentication': lesson({
    id: 'net-013-authentication',
    module: 'net',
    title: 'Authentication',
    hook: 'Login once, then prove who you are on later requests with a token — not your password every time.',
    nodes: [
      { id: 'client', label: 'You', kind: 'client', lane: 0 },
      { id: 'auth', label: 'Auth', kind: 'gateway', lane: 0 },
      { id: 'api', label: 'API', kind: 'server', lane: 0 },
    ],
    steps: [
      {
        caption: 'You send credentials. Auth checks them and issues a token.',
        packets: [
          { id: 'p1', from: 'client', to: 'auth', variant: 'request', outcome: 'pass', label: 'login' },
          { id: 'p2', from: 'auth', to: 'client', variant: 'encrypted', outcome: 'pass', label: 'token' },
        ],
        nodeCaptions: {
          auth: 'Password verified here (hopefully hashed at rest).',
          client: 'Stores the token securely for later calls.',
        },
      },
      {
        caption: 'Later API calls carry the token. The API trusts auth’s earlier decision.',
        packets: [
          { id: 'p3', from: 'client', to: 'api', variant: 'encrypted', outcome: 'pass', label: 'Bearer …' },
          { id: 'p4', from: 'api', to: 'client', variant: 'response', outcome: 'pass', label: 'ok' },
        ],
        nodeCaptions: {
          api: 'Validates the token (signature/expiry) without seeing your password again.',
        },
      },
    ],
    takeaways: [
      'Authentication answers “who are you?” — usually once, then via tokens.',
      'Tokens beat sending passwords on every request.',
      'Protect tokens like passwords; expire and revoke them.',
    ],
    quiz: [
      quiz(
        'After login, why do APIs often use tokens?',
        [
          'Tokens are longer than passwords so they’re stronger automatically',
          'So later requests can prove identity without resending the password',
          'Tokens disable HTTPS',
          'Databases only accept tokens',
        ],
        1,
        'Separation of login from ongoing API access.'
      ),
    ],
  }),

  'net-014-rate-limiting': lesson({
    id: 'net-014-rate-limiting',
    module: 'net',
    title: 'Rate limiting',
    hook: 'A gate that allows N requests per window — then starts saying no.',
    nodes: [
      { id: 'client', label: 'Client', kind: 'client', lane: 0 },
      { id: 'gate', label: 'Rate limit', kind: 'firewall', lane: 0 },
      { id: 'api', label: 'API', kind: 'server', lane: 0 },
    ],
    steps: [
      {
        caption: 'Under the limit, requests pass through to the API.',
        packets: [
          { id: 'p1', from: 'client', to: 'gate', variant: 'request', outcome: 'pass', label: '1/N' },
          { id: 'p2', from: 'gate', to: 'api', variant: 'request', outcome: 'pass', label: 'ok' },
        ],
        nodeCaptions: {
          gate: 'Counters per IP, user, or API key — policy choice.',
        },
      },
      {
        caption: 'Too many too fast: the gate blocks. The API never sees the flood.',
        packets: [
          { id: 'p3', from: 'client', to: 'api', variant: 'malicious', outcome: 'blocked', stopsAt: 'gate', label: '429' },
        ],
        nodeCaptions: {
          gate: 'Protects capacity and blunt abuse. Clients should back off.',
          api: 'Still healthy for everyone else.',
        },
      },
    ],
    takeaways: [
      'Rate limits cap how often a client may call you.',
      'Blocking at the edge protects backends from stampedes.',
      'Good APIs return clear “try later” signals (e.g. 429).',
    ],
    quiz: [
      quiz(
        'What is rate limiting mainly for?',
        [
          'Making JSON prettier',
          'Stopping one client from overwhelming a service',
          'Assigning domain names',
          'Encrypting disks',
        ],
        1,
        'Fairness and survival under load/abuse.'
      ),
    ],
  }),

  'net-015-scaling': lesson({
    id: 'net-015-scaling',
    module: 'net',
    title: 'Scaling',
    hook: 'When load grows you can buy a bigger machine — or more identical smaller ones.',
    nodes: [
      { id: 'client', label: 'Users', kind: 'client', lane: 0 },
      { id: 'big', label: 'One big server', kind: 'server', lane: 0 },
      { id: 's1', label: 'Small 1', kind: 'server', lane: 1 },
      { id: 's2', label: 'Small 2', kind: 'server', lane: 1 },
      { id: 's3', label: 'Small 3', kind: 'server', lane: 1 },
    ],
    steps: [
      {
        caption: 'Vertical scaling: send everything to one increasingly powerful box.',
        packets: [{ id: 'p1', from: 'client', to: 'big', variant: 'request', outcome: 'pass', label: 'all load' }],
        nodeCaptions: {
          big: 'Simple mentally. Ceiling: the biggest machine you can rent, and a single point of failure.',
        },
      },
      {
        caption: 'Horizontal scaling: split load across many smaller servers (usually with a balancer).',
        packets: [
          { id: 'p2', from: 'client', to: 's1', variant: 'request', outcome: 'pass', label: 'share' },
          { id: 'p3', from: 'client', to: 's2', variant: 'request', outcome: 'pass', label: 'share' },
          { id: 'p4', from: 'client', to: 's3', variant: 'request', outcome: 'pass', label: 'share' },
        ],
        nodeCaptions: {
          s1: 'Add/remove boxes as traffic changes.',
          s2: 'Needs the app to handle being one of many (shared nothing / careful state).',
        },
      },
    ],
    takeaways: [
      'Vertical = bigger machine. Horizontal = more machines.',
      'Horizontal scaling pairs naturally with load balancers.',
      'State (sessions, uploads) is what makes horizontal hard.',
    ],
    quiz: [
      quiz(
        'Adding more identical servers behind a balancer is…',
        [
          'Vertical scaling',
          'Horizontal scaling',
          'DNS poisoning',
          'Compiling',
        ],
        1,
        'Scale out = horizontal. Scale up = vertical.'
      ),
    ],
  }),
};

// Fix net-008 packet label with trailing space
lessons['net-008-https-encryption'].steps[1].packets[1].label = '???';

let written = 0;
let skipped = 0;

for (const [id, data] of Object.entries(lessons)) {
  // Cap packets per step at 3 (schema max)
  for (const step of data.steps) {
    if (step.packets.length > 3) {
      step.packets = step.packets.slice(0, 3);
    }
  }
  const path = join(outDir, `${id}.json`);
  if (existsSync(path) && !force) {
    skipped += 1;
    continue;
  }
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  written += 1;
  console.log('wrote', id);
}

console.log(`\n${written} written, ${skipped} skipped (use --force to overwrite)`);
