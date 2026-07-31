import { theme } from '../theme/theme';
import type { Lesson, PacketVariant } from './lesson.schema';

// A lesson's accent colour is the most notable packet variant it actually
// contains, so colour keeps meaning exactly what DESIGN_SYSTEM.md says it means:
// a red lesson card is a lesson where something gets blocked, not decoration.
// Rarest-but-most-meaningful first — one malicious packet defines the firewall
// lesson even though most of its packets are ordinary requests.
const PRIORITY: PacketVariant[] = ['malicious', 'encrypted', 'control', 'data', 'response', 'request'];

export function lessonAccent(lesson: Lesson): string {
  const present = new Set<PacketVariant>();
  for (const step of lesson.steps) {
    for (const packet of step.packets) {
      present.add(packet.variant);
    }
  }
  const variant = PRIORITY.find((v) => present.has(v)) ?? 'request';
  return theme.light.packet[variant];
}

export function packetColor(variant: PacketVariant): string {
  return theme.light.packet[variant];
}
