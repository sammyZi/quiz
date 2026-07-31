# Curriculum — full lesson map

Two chapters. Chapter 1 is CS fundamentals, split into modules. Chapter 2 is
the cloud/AWS bridge, which reuses Chapter 1's diagrams with the `awsBridge`
field populated.

Lesson IDs are **module-prefixed, not globally numbered** (`ds-003-hash-maps`),
so adding or cutting a lesson never renumbers anything downstream.

Six networking lessons are already written by hand as the quality bar: see
`module-1-lessons.json`.

## The engine constraint

Everything below has to render as **nodes with things moving between them** —
that's the whole PacketFlowEngine. A topic that can't be drawn that way doesn't
belong in this curriculum, however fundamental it is. Each module lists its
node/motion mapping for exactly this reason. Check it before writing a lesson.

---

# Chapter 1 — CS fundamentals

## Module 1.1 — How a computer works (`cpu-`)

*Nodes: CPU, RAM, disk, registers. Motion: instructions and data moving between them.*

| ID | Lesson | Core diagram beat |
|---|---|---|
| cpu-001 | CPU, memory, storage | Same data, three places, each 100× slower than the last |
| cpu-002 | Binary & data representation | One byte, read four different ways |
| cpu-003 | Fetch–decode–execute | One instruction walking the cycle, over and over |
| cpu-004 | Stack vs heap | Two regions, allocation moving into each differently |

## Module 1.2 — Data structures (`ds-`)

*Nodes: the structure's own cells/nodes. Motion: the traversal or lookup. Best engine fit in the whole curriculum — linked lists and trees are literally nodes and edges.*

| ID | Lesson | Core diagram beat |
|---|---|---|
| ds-001 | Arrays & contiguous memory | Index math jumps straight to a slot, no walking |
| ds-002 | Linked lists | Walk node to node — no jumping, that's the trade |
| ds-003 | Hash maps | Key goes through a hash function, lands in one bucket |
| ds-004 | Trees | One search halves the remaining nodes at every step |
| ds-005 | Graphs | Same nodes, but connections go any direction |

## Module 1.3 — Algorithms & complexity (`algo-`)

*Nodes: array cells / call frames. Motion: the pointer or comparison sweeping through.*

| ID | Lesson | Core diagram beat |
|---|---|---|
| algo-001 | Linear vs binary search | Two pointers racing the same sorted array |
| algo-002 | Sorting | Elements physically swapping into place |
| algo-003 | Recursion & the call stack | Frames stacking up, then unwinding |
| algo-004 | Big O | Same three algorithms, input grows, one falls off a cliff |

## Module 1.4 — Operating systems (`os-`)

*Nodes: processes, threads, the scheduler, shared memory. Motion: control and data moving between them.*

| ID | Lesson | Core diagram beat |
|---|---|---|
| os-001 | Processes vs threads | Two processes isolated, two threads sharing one space |
| os-002 | Scheduling | CPU switching between three processes, none finishing first |
| os-003 | Concurrency & race conditions | Two threads hit the same value, result depends on timing |
| os-004 | Files & I/O | Program asks the OS, OS asks the disk, everyone waits |

## Module 1.5 — Code to machine (`build-`)

*Nodes: pipeline stages. Motion: source moving through them, transformed at each.*

| ID | Lesson | Core diagram beat |
|---|---|---|
| build-001 | Compiled vs interpreted | Same source, two very different paths to running |

## Module 1.6 — How the internet works (`net-`)

*Nodes: client, server, router, firewall. Motion: packets. This is the original Module 1 — content already written for 001–006.*

Already written by hand (001–006): client/server, IP addresses, DNS, TCP
handshake, HTTP, firewall.

| ID | Lesson | Core diagram beat |
|---|---|---|
| net-007 | Ports | One address, many doors — 80 vs 443 vs 22, same server |
| net-008 | HTTPS & encryption | Same request, wrapped so an eavesdropper can't read it |
| net-009 | Load balancers | One request, distributed across three identical servers |
| net-010 | Caching & CDNs | Second request short-circuits before reaching the origin |
| net-011 | Databases | Server asks a database — separate node, and it can be slow |
| net-012 | APIs | Two apps talking machine-to-machine, no browser involved |
| net-013 | Authentication | Login → token issued → token presented on every later request |
| net-014 | Rate limiting | Gate node starts blocking after N requests in a window |
| net-015 | Scaling | One bigger server vs three identical smaller ones |

---

# Chapter 2 — The same ideas, in AWS (`aws-`)

Each lesson explicitly says "remember [Chapter 1 lesson]? This is what it's
called in AWS" before introducing anything new. Budget roughly 30% of the time
a Chapter 1 lesson took — the diagram work is already done.

| ID | Lesson | Bridges from | AWS service |
|---|---|---|---|
| aws-001 | Blocking traffic in the cloud | net-006 firewall | Security Groups |
| aws-002 | Finding your app's address | net-003 DNS | Route 53 |
| aws-003 | Spreading the load | net-009 load balancers | Elastic Load Balancer |
| aws-004 | Serving pages instantly | net-010 caching | CloudFront |
| aws-005 | A database you don't manage | net-011 databases | RDS |
| aws-006 | Talking to AWS itself | net-012 APIs | API Gateway |
| aws-007 | Where your code actually runs | net-001 client/server | EC2 |
| aws-008 | Running code without a server | aws-007 EC2 | Lambda |
| aws-009 | Storing files at scale | os-004 files & I/O | S3 |
| aws-010 | Who's allowed to do what | net-013 authentication | IAM |
| aws-011 | Your own private network | net-007 ports | VPC & subnets |
| aws-012 | Watching what's happening | (new) | CloudWatch |
| aws-013 | Sending it to real users | net-015 scaling | Auto Scaling |
| aws-014 | Keeping secrets safe | net-008 encryption | Secrets Manager |
| aws-015 | Putting it all together | everything | A full request through a real AWS app |

`aws-015` is the closer — reuse every node type introduced so far in one longer
flow (client → CloudFront → API Gateway → Lambda → RDS). Best lesson for the
demo video: it's the moment everything clicks.

---

## Lesson count and the deadline

**Chapter 1: 33 lessons. Chapter 2: 15. Total 48**, against a PRD that scoped
30 and a Sep 30 ship date. This is the main scope risk in the project.

The PRD's own rule applies: *20 lessons that animate beautifully beat 30 that
are rushed.* If time compresses, cut whole modules rather than thinning every
module — a complete Module 1.2 plus a complete 1.6 reads as finished; six
half-modules read as abandoned.

Suggested cut order if needed, least painful first:
1. Module 1.5 (`build-`, 1 lesson) — weakest engine fit
2. Module 1.4 (`os-`) down to os-001 and os-003
3. Module 1.1 down to cpu-001 and cpu-004
4. Chapter 2 down to the 8 services that appear in `aws-015`

Do **not** cut Module 1.2 (data structures) — it's the best engine showcase in
the app and the strongest material for the demo video.

## Content generation order

1. Get `net-006` (firewall) rendering perfectly in the engine — most complex
   existing lesson (`blocked`, `stopsAt`).
2. Hand-write `ds-002` (linked lists) as the second quality anchor. Picked over
   ports because it proves the engine works for non-networking content, which
   is the whole bet of this curriculum restructure.
3. Batch-generate Module 1.2, then 1.3 — best engine fit, validate the approach
   on the easy ones first.
4. Batch-generate 1.1, 1.4, 1.5.
5. Batch-generate the rest of 1.6 (`net-007`–`015`).
6. Batch-generate Chapter 2, feeding each its paired Chapter 1 lesson.
7. Hand-write `aws-015`. It's the closer — don't delegate it.

## Accuracy checkpoints

Verify by hand against primary docs, not from memory — yours or the model's:
- `aws-006` API Gateway — mechanism only, no pricing or quota numbers
- `aws-010` IAM — policy evaluation order is easy to state backwards
- `aws-011` VPC — public vs private subnet distinction
- `os-003` race conditions — the interleaving shown must actually be possible
- `algo-004` Big O — growth curves must be drawn to scale, not vibes

Module 1.6 (networking) and 1.2 (data structures) are stable, well-established
CS — much lower risk.
