import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Lesson, LessonNode, Packet } from '../lib/lesson.schema';
import { theme } from '../theme/theme';
import { NodeShape } from './NodeShape';

const NODE_W = 88;
const NODE_H = 96;
const ROW_H = 118;
const PACKET_H = 28;

const PACKET_FILL: Record<Packet['variant'], string> = {
  request: theme.light.tint.lilac,
  response: theme.light.tint.mint,
  malicious: theme.light.tint.blush,
  encrypted: theme.light.tint.lilac,
  data: theme.light.tint.peach,
  control: theme.light.tint.sun,
};

function packetWidth(label?: string) {
  const len = Math.min(14, (label ?? '•').length);
  return Math.max(44, 18 + len * 8);
}

type Point = { x: number; y: number };
type Placed = LessonNode & { col: number; row: number };

/** Lane = row. Nodes in a short row are centred (tree root over children). */
function placeNodes(nodes: LessonNode[]): { placed: Placed[]; rows: number; cols: number } {
  const counts = new Map<number, number>();
  for (const node of nodes) {
    counts.set(node.lane, (counts.get(node.lane) ?? 0) + 1);
  }
  const cols = Math.max(1, ...counts.values());
  const seen = new Map<number, number>();
  const placed = nodes.map((node) => {
    const index = seen.get(node.lane) ?? 0;
    seen.set(node.lane, index + 1);
    const inLane = counts.get(node.lane) ?? 1;
    const offset = (cols - inLane) / 2;
    return { ...node, col: index + offset, row: node.lane };
  });
  return {
    placed,
    rows: Math.max(...placed.map((n) => n.row)) + 1,
    cols,
  };
}

function isTreeLayout(placed: Placed[], rows: number) {
  if (rows !== 2) return false;
  const tops = placed.filter((n) => n.row === 0);
  const bottoms = placed.filter((n) => n.row === 1);
  return tops.length === 1 && bottoms.length >= 2;
}

function PacketDot({
  from,
  to,
  variant,
  blocked,
  delay,
  replayKey,
  label,
}: {
  from: Point;
  to: Point;
  variant: Packet['variant'];
  blocked: boolean;
  delay: number;
  replayKey: number;
  label?: string;
}) {
  const travel = useRef(new Animated.Value(0)).current;
  const w = packetWidth(label);
  const tag =
    label && label.length <= 14 ? label : label ? `${label.slice(0, 12)}…` : '•';

  useEffect(() => {
    travel.setValue(0);
    const animation = blocked
      ? Animated.sequence([
          Animated.timing(travel, {
            toValue: 1,
            duration: 700,
            delay,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(travel, { toValue: 0.84, duration: 240, useNativeDriver: true }),
        ])
      : Animated.timing(travel, {
          toValue: 1,
          duration: 1000,
          delay,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        });

    animation.start();
    return () => animation.stop();
  }, [blocked, delay, travel, replayKey]);

  const interpolate = (start: number, end: number) =>
    travel.interpolate({ inputRange: [0, 1], outputRange: [start, end] });

  return (
    <Animated.View
      style={[
        styles.packet,
        {
          width: w,
          backgroundColor: PACKET_FILL[variant],
        },
        {
          transform: [
            { translateX: interpolate(from.x - w / 2, to.x - w / 2) },
            { translateY: interpolate(from.y - PACKET_H / 2, to.y - PACKET_H / 2) },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.packetText} numberOfLines={1}>
        {blocked ? '✕' : tag}
      </Text>
    </Animated.View>
  );
}

function TreeWires({
  root,
  leaves,
  centreOf,
}: {
  root: Placed;
  leaves: Placed[];
  centreOf: (n: Placed) => Point;
}) {
  const r = centreOf(root);
  const kids = leaves.map(centreOf);
  const barY = (r.y + NODE_H / 2 + kids[0].y - NODE_H / 2) / 2;
  const left = Math.min(...kids.map((k) => k.x));
  const right = Math.max(...kids.map((k) => k.x));
  const stemTop = r.y + NODE_H / 2 + 2;
  const stemH = Math.max(4, barY - stemTop);

  return (
    <>
      <View style={[styles.treeStem, { left: r.x - 1, top: stemTop, height: stemH }]} />
      <View style={[styles.treeBar, { left, top: barY - 1, width: Math.max(2, right - left) }]} />
      {kids.map((k, i) => (
        <View
          key={leaves[i].id}
          style={[
            styles.treeStem,
            {
              left: k.x - 1,
              top: barY,
              height: Math.max(4, k.y - NODE_H / 2 - barY),
            },
          ]}
        />
      ))}
    </>
  );
}

export function PacketFlow({ lesson, stepIndex }: { lesson: Lesson; stepIndex: number }) {
  const [width, setWidth] = useState(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [replayKey, setReplayKey] = useState(0);

  const step = lesson.steps[stepIndex];
  const { placed, rows, cols } = useMemo(() => placeNodes(lesson.nodes), [lesson.nodes]);
  const tree = isTreeLayout(placed, rows);

  useEffect(() => {
    setSelectedNode(null);
    setReplayKey((k) => k + 1);
  }, [stepIndex]);

  const colWidth = width / Math.max(cols, 1);
  const centreOf = (node: Placed): Point => ({
    x: colWidth * (node.col + 0.5),
    y: ROW_H * (node.row + 0.5),
  });

  const edgePath = (from: Placed, to: Placed): { start: Point; end: Point } => {
    const a = centreOf(from);
    const b = centreOf(to);
    const gap = 4;
    const half = NODE_W / 2;
    if (Math.abs(b.x - a.x) >= Math.abs(b.y - a.y)) {
      const rightward = b.x >= a.x;
      return {
        start: { x: a.x + (rightward ? half + gap : -(half + gap)), y: a.y },
        end: { x: b.x + (rightward ? -(half + gap) : half + gap), y: b.y },
      };
    }
    const downward = b.y >= a.y;
    const vHalf = NODE_H / 2;
    return {
      start: { x: a.x, y: a.y + (downward ? vHalf + gap : -(vHalf + gap)) },
      end: { x: b.x, y: b.y + (downward ? -(vHalf + gap) : vHalf + gap) },
    };
  };

  const byId = (id: string) => placed.find((n) => n.id === id);
  const labelOf = (id: string) => byId(id)?.label ?? id;

  const activeIds = new Set<string>();
  for (const packet of step.packets) {
    activeIds.add(packet.from);
    activeIds.add(packet.outcome === 'blocked' && packet.stopsAt ? packet.stopsAt : packet.to);
  }

  const story = selectedNode
    ? (step.nodeCaptions[selectedNode] ?? labelOf(selectedNode))
    : step.caption;

  const dest = step.packets[0]
    ? labelOf(
        step.packets[0].outcome === 'blocked' && step.packets[0].stopsAt
          ? step.packets[0].stopsAt
          : step.packets[0].to
      )
    : '';
  const oneLine = tree
    ? `${step.packets[0]?.label ?? 'pattern'} → ${dest}`
    : (step.packets[0]?.label ??
      `${labelOf(step.packets[0]?.from ?? '')} → ${labelOf(step.packets[0]?.to ?? '')}`);

  const root = placed.find((n) => n.row === 0);
  const leaves = placed.filter((n) => n.row === 1);

  return (
    <View>
      <Text style={styles.story}>{story}</Text>

      <View
        style={[styles.stage, { height: rows * ROW_H }]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {width > 0 && tree && root ? (
          <TreeWires root={root} leaves={leaves} centreOf={centreOf} />
        ) : null}

        {width > 0 &&
          !tree &&
          Array.from({ length: rows }, (_, row) => {
            const inRow = placed.filter((n) => n.row === row);
            if (inRow.length < 2) return null;
            const left = colWidth * (Math.min(...inRow.map((n) => n.col)) + 0.5);
            const right = colWidth * (Math.max(...inRow.map((n) => n.col)) + 0.5);
            return (
              <View
                key={`wire-${row}`}
                style={[styles.wire, { top: ROW_H * (row + 0.5) - 1, left, width: right - left }]}
              />
            );
          })}

        {width > 0 &&
          placed.map((node) => {
            const centre = centreOf(node);
            const active = activeIds.has(node.id);
            return (
              <Pressable
                key={node.id}
                onPress={() => setSelectedNode((prev) => (prev === node.id ? null : node.id))}
                accessibilityRole="button"
                accessibilityLabel={node.label}
                style={[
                  styles.nodeWrap,
                  {
                    left: centre.x - NODE_W / 2,
                    top: centre.y - NODE_H / 2,
                  },
                ]}
              >
                <NodeShape
                  kind={node.kind}
                  label={node.label}
                  nodeId={node.id}
                  selected={selectedNode === node.id}
                  active={active || selectedNode === node.id}
                />
              </Pressable>
            );
          })}

        {width > 0 &&
          step.packets.map((packet, index) => {
            const from = byId(packet.from);
            const target = byId(
              packet.outcome === 'blocked' && packet.stopsAt ? packet.stopsAt : packet.to
            );
            if (!from || !target) return null;
            const { start, end } = edgePath(from, target);
            return (
              <PacketDot
                key={`${stepIndex}-${packet.id}-${replayKey}`}
                from={start}
                to={end}
                variant={packet.variant}
                blocked={packet.outcome === 'blocked'}
                delay={index * 320}
                replayKey={replayKey}
                label={packet.label}
              />
            );
          })}
      </View>

      <View style={styles.footerRow}>
        {!selectedNode ? <Text style={styles.oneLine}>{oneLine}</Text> : <View />}
        <Pressable onPress={() => setReplayKey((k) => k + 1)} hitSlop={8}>
          <Text style={styles.replay}>Replay</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  story: {
    fontFamily: theme.font.body,
    fontSize: 17,
    color: theme.light.ink,
    lineHeight: 26,
    marginBottom: theme.spacing.md,
  },
  stage: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  wire: {
    position: 'absolute',
    height: 2,
    backgroundColor: theme.light.ink,
    opacity: 0.12,
    borderRadius: 2,
  },
  treeStem: {
    position: 'absolute',
    width: 2,
    backgroundColor: theme.light.ink,
    opacity: 0.28,
    borderRadius: 1,
  },
  treeBar: {
    position: 'absolute',
    height: 2,
    backgroundColor: theme.light.ink,
    opacity: 0.28,
    borderRadius: 1,
  },
  nodeWrap: {
    position: 'absolute',
    width: NODE_W,
    height: NODE_H,
  },
  packet: {
    position: 'absolute',
    height: PACKET_H,
    minWidth: 44,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: theme.light.ink,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packetText: {
    fontFamily: theme.font.mono,
    fontSize: 11,
    color: theme.light.ink,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  oneLine: {
    flex: 1,
    fontFamily: theme.font.display,
    fontSize: 15,
    color: theme.light.ink,
  },
  replay: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
    textDecorationLine: 'underline',
  },
});
