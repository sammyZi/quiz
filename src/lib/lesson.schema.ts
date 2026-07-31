import { z } from 'zod';

// Every lesson JSON file is validated against this at build time
// (validate-lessons.ts) and again at load time (loadLessons.ts) — same
// schema, so a bad file can never reach the device.

export const nodeKindSchema = z.enum([
  'client',
  'server',
  'router',
  'firewall',
  'database',
  'dns',
  'loadbalancer',
  'cache',
  'gateway',
  'generic',
]);

export const packetVariantSchema = z.enum([
  'request',
  'response',
  'malicious',
  'encrypted',
  'data',
  'control',
]);

export const nodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: nodeKindSchema,
  lane: z.number().int().min(0).default(0),
});

export const packetSchema = z
  .object({
    id: z.string(),
    from: z.string(),
    to: z.string(),
    variant: packetVariantSchema,
    outcome: z.enum(['pass', 'blocked']).default('pass'),
    // node id where a blocked packet stops and bounces — required when outcome is "blocked"
    stopsAt: z.string().optional(),
    label: z.string().optional(),
  })
  .refine((packet) => packet.outcome !== 'blocked' || !!packet.stopsAt, {
    message: 'packet.stopsAt is required when outcome is "blocked"',
    path: ['stopsAt'],
  });

export const stepSchema = z.object({
  caption: z.string(),
  packets: z.array(packetSchema).min(1).max(3),
  // per-node tooltip text, shown when tapping a node while this step is settled
  nodeCaptions: z.record(z.string(), z.string()).default({}),
});

export const quizQuestionSchema = z.object({
  question: z.string(),
  choices: z.array(z.string()).min(2),
  correctIndex: z.number().int().min(0),
  explanation: z.string().optional(),
});

export const awsBridgeSchema = z.object({
  service: z.string(),
  note: z.string(),
});

export const lessonSchema = z
  .object({
    // module-prefixed, e.g. "net-006-firewall" — never a bare global number,
    // so cutting a lesson never renumbers the ones after it
    id: z.string().regex(/^[a-z]+-\d{3}-[a-z0-9-]+$/),
    chapter: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    module: z.string(),
    title: z.string(),
    hook: z.string(),
    /** tree = fan-out. morph = one image that changes form (no cards). omit = row / pipeline */
    diagram: z.enum(['tree', 'morph']).optional(),
    nodes: z.array(nodeSchema).min(2),
    steps: z.array(stepSchema).min(1),
    takeaways: z.array(z.string()).min(2).max(3),
    quiz: z.array(quizQuestionSchema).min(1).max(6),
    awsBridge: awsBridgeSchema.optional(),
  })
  .refine(
    (lesson) => {
      const nodeIds = new Set(lesson.nodes.map((n) => n.id));
      return lesson.steps.every((step) =>
        step.packets.every(
          (p) =>
            nodeIds.has(p.from) &&
            nodeIds.has(p.to) &&
            (!p.stopsAt || nodeIds.has(p.stopsAt))
        )
      );
    },
    { message: 'every packet from/to/stopsAt must reference a node id declared in nodes[]' }
  );

export type NodeKind = z.infer<typeof nodeKindSchema>;
export type PacketVariant = z.infer<typeof packetVariantSchema>;
export type LessonNode = z.infer<typeof nodeSchema>;
export type Packet = z.infer<typeof packetSchema>;
export type Step = z.infer<typeof stepSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type Lesson = z.infer<typeof lessonSchema>;

export function validateLesson(data: unknown, sourceFile?: string): Lesson {
  const result = lessonSchema.safeParse(data);
  if (!result.success) {
    const where = sourceFile ? ` in ${sourceFile}` : '';
    throw new Error(`Invalid lesson${where}:\n${result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`);
  }
  return result.data;
}
