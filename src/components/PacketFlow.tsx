import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { Lesson, LessonNode, Packet } from '../lib/lesson.schema';
import { theme } from '../theme/theme';
import {
  ART_GAP,
  ART_NODE_H,
  ART_NODE_W,
  NodeShape,
  usesArtNode,
} from './NodeShape';

const NODE_W = 96;
const NODE_H = 100;
const ROW_H = 120;
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
  const text = label ?? '•';
  // mono 11 + padding/border — keep room so labels never ellipsize
  return Math.max(52, 28 + text.length * 8);
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

function isTreeLayout(placed: Placed[], rows: number, diagram?: Lesson['diagram']) {
  if (diagram !== 'tree' || rows !== 2) return false;
  const tops = placed.filter((n) => n.row === 0);
  const bottoms = placed.filter((n) => n.row === 1);
  return tops.length === 1 && bottoms.length >= 2;
}

/** Stem from lone top node down to the first bottom node (pipeline, not fan-out). */
function PipelineStem({
  root,
  firstLeaf,
  centreOf,
}: {
  root: Placed;
  firstLeaf: Placed;
  centreOf: (n: Placed) => Point;
}) {
  const a = centreOf(root);
  const b = centreOf(firstLeaf);
  const top = a.y + NODE_H / 2 + 2;
  const bottom = b.y - NODE_H / 2 - 2;
  const midY = (top + bottom) / 2;
  const left = Math.min(a.x, b.x);
  const right = Math.max(a.x, b.x);
  return (
    <>
      <View style={[styles.treeStem, { left: a.x - 1, top, height: Math.max(4, midY - top) }]} />
      {Math.abs(right - left) > 2 ? (
        <View style={[styles.treeBar, { left, top: midY - 1, width: right - left }]} />
      ) : null}
      <View
        style={[
          styles.treeStem,
          { left: b.x - 1, top: midY, height: Math.max(4, bottom - midY) },
        ]}
      />
    </>
  );
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
  const tag = label?.trim() || '•';
  const w = packetWidth(tag);

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
      <Text style={styles.packetText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
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
  const widthRef = useRef(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [replayKey, setReplayKey] = useState(0);
  const { height: windowH } = useWindowDimensions();

  const step = lesson.steps[stepIndex];
  const { placed, rows, cols } = useMemo(() => placeNodes(lesson.nodes), [lesson.nodes]);
  const artLayout = useMemo(
    () => lesson.nodes.some((n) => usesArtNode(n.id, n.label)),
    [lesson.nodes],
  );
  // Lock measured width so step changes never resize the cards.
  const layoutW = widthRef.current || width;
  const nodeW = artLayout
    ? layoutW > 0
      ? Math.max(88, Math.floor((layoutW - ART_GAP * (cols + 1)) / cols))
      : ART_NODE_W
    : NODE_W;
  const nodeH = artLayout ? Math.round(nodeW * 1.55) : NODE_H;
  const rowH = artLayout ? nodeH + 28 : ROW_H;
  // Fixed stage geometry — taller for art, but same on every step.
  const stageH = artLayout
    ? Math.max(rows * rowH + 24, Math.round(windowH * 0.36))
    : rows * rowH;
  const artOffsetY = artLayout ? 12 : 0;
  const tree = isTreeLayout(placed, rows, lesson.diagram);
  const pipeline =
    !tree &&
    rows === 2 &&
    placed.filter((n) => n.row === 0).length === 1 &&
    placed.filter((n) => n.row === 1).length >= 2;

  useEffect(() => {
    setSelectedNode(null);
    setReplayKey((k) => k + 1);
  }, [stepIndex]);

  const colWidth = layoutW / Math.max(cols, 1);
  const artSpan = cols * nodeW + (cols - 1) * ART_GAP;
  const artOriginX = (layoutW - artSpan) / 2;
  const centreOf = (node: Placed): Point =>
    artLayout
      ? {
          x: artOriginX + node.col * (nodeW + ART_GAP) + nodeW / 2,
          y: artOffsetY + rowH * (node.row + 0.5),
        }
      : {
          x: colWidth * (node.col + 0.5),
          y: rowH * (node.row + 0.5),
        };

  const edgePath = (from: Placed, to: Placed): { start: Point; end: Point } => {
    const a = centreOf(from);
    const b = centreOf(to);
    const gap = 4;
    const half = nodeW / 2;
    if (Math.abs(b.x - a.x) >= Math.abs(b.y - a.y)) {
      const rightward = b.x >= a.x;
      return {
        start: { x: a.x + (rightward ? half + gap : -(half + gap)), y: a.y },
        end: { x: b.x + (rightward ? -(half + gap) : half + gap), y: b.y },
      };
    }
    const downward = b.y >= a.y;
    const vHalf = nodeH / 2;
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
      <View style={styles.storySlot}>
        <Text style={styles.story} numberOfLines={3}>
          {story}
        </Text>
      </View>

      <View
        style={[styles.stage, { height: stageH }]}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && w !== widthRef.current) {
            widthRef.current = w;
            setWidth(w);
          }
        }}
      >
        {layoutW > 0 && tree && root ? (
          <TreeWires root={root} leaves={leaves} centreOf={centreOf} />
        ) : null}

        {layoutW > 0 && pipeline && root && leaves[0] ? (
          <PipelineStem root={root} firstLeaf={leaves[0]} centreOf={centreOf} />
        ) : null}

        {layoutW > 0 &&
          !tree &&
          Array.from({ length: rows }, (_, row) => {
            const inRow = placed.filter((n) => n.row === row);
            if (inRow.length < 2) return null;
            const leftN = inRow.reduce((a, b) => (a.col < b.col ? a : b));
            const rightN = inRow.reduce((a, b) => (a.col > b.col ? a : b));
            const left = centreOf(leftN).x;
            const right = centreOf(rightN).x;
            return (
              <View
                key={`wire-${row}`}
                style={[
                  styles.wire,
                  {
                    top: artOffsetY + rowH * (row + 0.5) - 1,
                    left,
                    width: right - left,
                  },
                ]}
              />
            );
          })}

        {layoutW > 0 &&
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
                    width: nodeW,
                    height: nodeH,
                    left: centre.x - nodeW / 2,
                    top: centre.y - nodeH / 2,
                  },
                ]}
              >
                <NodeShape
                  kind={node.kind}
                  label={node.label}
                  nodeId={node.id}
                  selected={selectedNode === node.id}
                  active={active || selectedNode === node.id}
                  cardSize={artLayout ? { width: nodeW, height: nodeH } : undefined}
                />
              </Pressable>
            );
          })}

        {layoutW > 0 &&
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
        <Text style={[styles.oneLine, selectedNode && styles.oneLineHidden]} numberOfLines={1}>
          {oneLine}
        </Text>
        <Pressable onPress={() => setReplayKey((k) => k + 1)} hitSlop={8}>
          <Text style={styles.replay}>Replay</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  storySlot: {
    minHeight: 26 * 3,
    marginBottom: theme.spacing.md,
    justifyContent: 'flex-start',
  },
  story: {
    fontFamily: theme.font.body,
    fontSize: 17,
    color: theme.light.ink,
    lineHeight: 26,
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
  oneLineHidden: {
    opacity: 0,
  },
  replay: {
    fontFamily: theme.font.body,
    fontSize: theme.fontSize.caption,
    color: theme.light.muted,
    textDecorationLine: 'underline',
  },
});
