import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Lesson, LessonNode, Packet } from '../lib/lesson.schema';
import { theme } from '../theme/theme';
import { NodeShape } from './NodeShape';

const NODE_W = 96;
const NODE_H = 108;
const ROW_H = 132;
const PACKET = 18;

const PACKET_FILL: Record<Packet['variant'], string> = {
  request: theme.light.tint.lilac,
  response: theme.light.tint.mint,
  malicious: theme.light.tint.blush,
  encrypted: theme.light.tint.lilac,
  data: theme.light.tint.peach,
  control: theme.light.tint.sun,
};

type Point = { x: number; y: number };
type Placed = LessonNode & { col: number; row: number };

function placeNodes(nodes: LessonNode[]): { placed: Placed[]; rows: number; cols: number } {
  const perLane = new Map<number, number>();
  const placed = nodes.map((node) => {
    const col = perLane.get(node.lane) ?? 0;
    perLane.set(node.lane, col + 1);
    return { ...node, col, row: node.lane };
  });
  return {
    placed,
    rows: Math.max(...placed.map((n) => n.row)) + 1,
    cols: Math.max(...placed.map((n) => n.col)) + 1,
  };
}

function PacketDot({
  from,
  to,
  variant,
  blocked,
  delay,
  replayKey,
}: {
  from: Point;
  to: Point;
  variant: Packet['variant'];
  blocked: boolean;
  delay: number;
  replayKey: number;
}) {
  const travel = useRef(new Animated.Value(0)).current;

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
          duration: 900,
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
        { backgroundColor: PACKET_FILL[variant] },
        {
          transform: [
            { translateX: interpolate(from.x - PACKET / 2, to.x - PACKET / 2) },
            { translateY: interpolate(from.y - PACKET / 2, to.y - PACKET / 2) },
          ],
        },
      ]}
      pointerEvents="none"
    >
      {blocked ? <Text style={styles.packetX}>✕</Text> : null}
    </Animated.View>
  );
}

export function PacketFlow({ lesson, stepIndex }: { lesson: Lesson; stepIndex: number }) {
  const [width, setWidth] = useState(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [replayKey, setReplayKey] = useState(0);

  const step = lesson.steps[stepIndex];
  const { placed, rows, cols } = useMemo(() => placeNodes(lesson.nodes), [lesson.nodes]);

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

  const oneLine =
    step.packets[0]?.label ??
    `${labelOf(step.packets[0]?.from ?? '')} → ${labelOf(step.packets[0]?.to ?? '')}`;

  return (
    <View>
      <Text style={styles.story}>{story}</Text>

      <View
        style={[styles.stage, { height: rows * ROW_H }]}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {width > 0 &&
          Array.from({ length: rows }, (_, row) => {
            const inRow = placed.filter((n) => n.row === row);
            if (inRow.length < 2) return null;
            const left = colWidth * 0.5;
            const right = colWidth * (inRow.length - 0.5);
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
                    opacity: active || selectedNode === node.id ? 1 : 0.7,
                  },
                ]}
              >
                <NodeShape
                  kind={node.kind}
                  label={node.label}
                  nodeId={node.id}
                  selected={selectedNode === node.id}
                  active={active}
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
              />
            );
          })}
      </View>

      {!selectedNode ? <Text style={styles.oneLine}>{oneLine}</Text> : null}

      <Pressable onPress={() => setReplayKey((k) => k + 1)} hitSlop={8}>
        <Text style={styles.replay}>Replay move</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  story: {
    fontFamily: theme.font.body,
    fontSize: 18,
    color: theme.light.ink,
    lineHeight: 28,
    marginBottom: theme.spacing.lg,
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
  nodeWrap: {
    position: 'absolute',
    width: NODE_W,
    height: NODE_H,
  },
  packet: {
    position: 'absolute',
    width: PACKET,
    height: PACKET,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packetX: {
    fontFamily: theme.font.display,
    fontSize: 11,
    color: theme.light.ink,
  },
  oneLine: {
    fontFamily: theme.font.display,
    fontSize: 16,
    color: theme.light.ink,
    marginBottom: theme.spacing.sm,
  },
  replay: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
    textDecorationLine: 'underline',
  },
});
