import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { NodeKind } from '../lib/lesson.schema';
import { nodeArt } from '../lib/nodeArt';
import { theme } from '../theme/theme';
import {
  ByteIcon,
  CodeIcon,
  CpuIcon,
  DecodeIcon,
  DiskIcon,
  ExecuteIcon,
  FetchIcon,
  HeapIcon,
  MemoryBoxIcon,
  NumberIcon,
  OpcodeIcon,
  RamIcon,
  StackIcon,
  TextIcon,
} from './HardwareIcons';
import { NodeFrameLoop } from './NodeFrameLoop';

type NodeShapeProps = {
  kind: NodeKind;
  label: string;
  nodeId?: string;
  selected?: boolean;
  active?: boolean;
  cardSize?: { width: number; height: number };
};

type IconKey =
  | 'cpu'
  | 'ram'
  | 'disk'
  | 'byte'
  | 'number'
  | 'text'
  | 'opcode'
  | 'mem'
  | 'fetch'
  | 'decode'
  | 'execute'
  | 'stack'
  | 'heap'
  | 'code'
  | 'ice'
  | 'water'
  | 'steam'
  | 'mix'
  | 'filter'
  | 'apart';

type ArtIconKey = 'ice' | 'water' | 'steam' | 'mix' | 'filter' | 'apart';

const ART_ICONS = new Set<IconKey>(['ice', 'water', 'steam', 'mix', 'filter', 'apart']);

/** Fallback art card size; PacketFlow overrides from stage width. */
export const ART_NODE_W = 120;
export const ART_NODE_H = 188;
export const ART_GAP = 10;

export function usesArtNode(nodeId?: string, label?: string): boolean {
  const id = (nodeId ?? '').toLowerCase();
  const key = `${id} ${label ?? ''}`.toLowerCase();
  return (
    id === 'ice' ||
    id === 'water' ||
    id === 'steam' ||
    id === 'mix' ||
    id === 'filter' ||
    id === 'apart' ||
    /\bice\b/.test(key) ||
    /\bwater\b/.test(key) ||
    /\bsteam\b/.test(key) ||
    /\bmix\b/.test(key) ||
    /\bfilter\b/.test(key) ||
    /\bapart\b/.test(key)
  );
}

const ICON_ROLE: Partial<Record<IconKey, string>> = {
  cpu: 'does work',
  ram: 'fast memory',
  disk: 'saved files',
  byte: '0 / 1',
  number: 'number code',
  text: 'letter code',
  opcode: 'command code',
  mem: 'holds commands',
  fetch: 'get next',
  decode: 'read it',
  execute: 'do it',
  stack: 'short notes',
  heap: 'longer storage',
  code: 'your program',
  ice: 'solid',
  water: 'liquid',
  steam: 'gas',
  mix: 'together',
  filter: 'sorts',
  apart: 'split',
};

const ICON_FILL: Partial<Record<IconKey, string>> = {
  mem: theme.light.tint.sky,
  fetch: theme.light.tint.sun,
  decode: theme.light.tint.lilac,
  execute: theme.light.tint.mint,
  byte: theme.light.tint.cream,
  number: theme.light.tint.mint,
  text: theme.light.tint.sky,
  opcode: theme.light.tint.lilac,
  cpu: theme.light.tint.sun,
  ram: theme.light.tint.mint,
  disk: theme.light.tint.peach,
  stack: theme.light.tint.sun,
  heap: theme.light.tint.peach,
  code: theme.light.tint.sky,
  ice: theme.light.tint.sky,
  water: theme.light.tint.mint,
  steam: theme.light.tint.cream,
  mix: theme.light.tint.peach,
  filter: theme.light.tint.sun,
  apart: theme.light.tint.lilac,
};

const KIND_FILL: Partial<Record<NodeKind, string>> = {
  client: theme.light.tint.sky,
  server: theme.light.tint.lilac,
  router: theme.light.tint.sun,
  firewall: theme.light.tint.blush,
  dns: theme.light.tint.mint,
  database: theme.light.tint.peach,
  loadbalancer: theme.light.tint.sky,
  cache: theme.light.tint.cream,
  gateway: theme.light.tint.lilac,
  generic: theme.light.tint.cream,
};

function resolveIcon(label: string, nodeId?: string): IconKey | null {
  const id = (nodeId ?? '').toLowerCase();
  const key = `${id} ${label}`.toLowerCase();

  // CPU cycle nodes first (before generic “memory” → RAM)
  if (id === 'mem' || id === 'memory') return 'mem';
  if (id === 'fetch' || /\bfetch\b/.test(key)) return 'fetch';
  if (id === 'decode' || /\bdecode\b/.test(key)) return 'decode';
  if (id === 'execute' || /\bexecute\b/.test(key)) return 'execute';
  if (id === 'stack' || /\bstack\b/.test(key)) return 'stack';
  if (id === 'heap' || /\bheap\b/.test(key)) return 'heap';
  if (id === 'code' || /\byour code\b/.test(key)) return 'code';
  if (id === 'ice' || /\bice\b/.test(key)) return 'ice';
  if (id === 'water' || /\bwater\b/.test(key)) return 'water';
  if (id === 'steam' || /\bsteam\b/.test(key)) return 'steam';
  if (id === 'mix' || /\bmix\b/.test(key)) return 'mix';
  if (id === 'filter' || /\bfilter\b/.test(key)) return 'filter';
  if (id === 'apart' || /\bapart\b/.test(key)) return 'apart';

  if (/\b(cpu|processor)\b/.test(key)) return 'cpu';
  if (/\b(ram)\b/.test(key)) return 'ram';
  if (/\b(disk|ssd|hdd|storage)\b/.test(key)) return 'disk';
  if (/\b(byte|bits?)\b/.test(key) || id === 'byte') return 'byte';
  if (/\b(number|num|integer)\b/.test(key) || id === 'as-num') return 'number';
  if (/\b(text|letter|ascii|char)\b/.test(key) || id === 'as-text') return 'text';
  if (/\b(opcode|op|instruction)\b/.test(key) || id === 'as-op') return 'opcode';
  return null;
}

function Device({ kind, label, nodeId }: { kind: NodeKind; label: string; nodeId?: string }) {
  const icon = resolveIcon(label, nodeId);
  if (icon === 'cpu') return <CpuIcon size={34} />;
  if (icon === 'ram') return <RamIcon size={34} />;
  if (icon === 'disk') return <DiskIcon size={34} />;
  if (icon === 'byte') return <ByteIcon size={34} />;
  if (icon === 'number') return <NumberIcon size={34} />;
  if (icon === 'text') return <TextIcon size={34} />;
  if (icon === 'opcode') return <OpcodeIcon size={34} />;
  if (icon === 'mem') return <MemoryBoxIcon size={34} />;
  if (icon === 'fetch') return <FetchIcon size={34} />;
  if (icon === 'decode') return <DecodeIcon size={34} />;
  if (icon === 'execute') return <ExecuteIcon size={34} />;
  if (icon === 'stack') return <StackIcon size={34} />;
  if (icon === 'heap') return <HeapIcon size={34} />;
  if (icon === 'code') return <CodeIcon size={34} />;
  if (kind === 'client') {
    return (
      <View style={device.phone}>
        <View style={device.phoneScreen} />
        <View style={device.phoneHome} />
      </View>
    );
  }
  if (kind === 'server' || kind === 'database' || kind === 'cache') {
    return (
      <View style={device.rack}>
        <View style={device.rackSlot}>
          <View style={device.led} />
          <View style={device.led} />
        </View>
        <View style={device.rackSlot}>
          <View style={[device.led, { backgroundColor: theme.light.packet.response }]} />
          <View style={device.led} />
        </View>
        <View style={device.rackSlot}>
          <View style={device.led} />
          <View style={[device.led, { backgroundColor: theme.light.packet.data }]} />
        </View>
      </View>
    );
  }
  if (kind === 'router' || kind === 'gateway' || kind === 'loadbalancer') {
    return (
      <View style={device.router}>
        <View style={device.antenna} />
        <View style={[device.antenna, { left: 22 }]} />
        <View style={device.routerBody}>
          <View style={[device.led, { backgroundColor: theme.light.packet.response }]} />
          <View style={[device.led, { backgroundColor: theme.light.tint.lilac }]} />
          <View style={[device.led, { backgroundColor: theme.light.packet.data }]} />
        </View>
      </View>
    );
  }
  if (kind === 'firewall') {
    return (
      <View style={device.shield}>
        <View style={device.shieldInner}>
          <View style={device.shieldBar} />
          <View style={device.shieldBar} />
        </View>
      </View>
    );
  }
  if (kind === 'dns') {
    return (
      <View style={device.globe}>
        <View style={device.globeRing} />
        <View style={device.globeEquator} />
        <Text style={device.globeText}>DNS</Text>
      </View>
    );
  }
  return <View style={device.generic} />;
}

function ArtNodeCard({
  icon,
  label,
  role,
  selected,
  active,
  cardSize,
}: {
  icon: ArtIconKey;
  label: string;
  role: string | null;
  selected?: boolean;
  active?: boolean;
  cardSize?: { width: number; height: number };
}) {
  const dimmed = !active && !selected;
  const bob = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const w = cardSize?.width ?? ART_NODE_W;
  const h = cardSize?.height ?? ART_NODE_H;

  useEffect(() => {
    if (!active && !selected) {
      bob.setValue(0);
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.spring(scale, {
      toValue: selected ? 1.03 : 1,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -4,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, selected, bob, scale]);

  return (
    <Animated.View
      style={[
        styles.artCard,
        { width: w, height: h },
        !dimmed && theme.clay.soft,
        dimmed ? styles.inactive : styles.active,
        selected && styles.selected,
        {
          transform: [{ translateY: bob }, { scale }],
          opacity: dimmed ? 0.72 : 1,
        },
      ]}
    >
      <View style={styles.artImageWrap}>
        <NodeFrameLoop
          frames={nodeArt[icon]?.frames ?? []}
          playing={!dimmed}
          fps={7}
          style={styles.artImage}
        />
      </View>
      <View style={[styles.artCaption, dimmed && styles.artCaptionDim]}>
        <Text style={styles.artLabel} numberOfLines={1}>
          {label}
        </Text>
        {role ? (
          <Text
            style={styles.artRole}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {role}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

export function NodeShape({
  kind,
  label,
  nodeId,
  selected,
  active,
  cardSize,
}: NodeShapeProps) {
  const icon = resolveIcon(label, nodeId);
  const role = icon ? (ICON_ROLE[icon] ?? null) : null;
  const dimmed = !active && !selected;

  if (icon && ART_ICONS.has(icon)) {
    return (
      <ArtNodeCard
        icon={icon as ArtIconKey}
        label={label}
        role={role}
        selected={selected}
        active={active}
        cardSize={cardSize}
      />
    );
  }

  const activeFill =
    (icon && ICON_FILL[icon]) || KIND_FILL[kind] || theme.light.tint.sun;
  // Inactive stays light so labels stay readable (no dark “empty” card).
  const fill = dimmed ? theme.light.surface : activeFill;

  return (
    <View
      style={[
        styles.card,
        !dimmed && theme.clay.soft,
        { backgroundColor: fill },
        dimmed ? styles.inactive : styles.active,
        selected && styles.selected,
      ]}
    >
      <View style={dimmed ? styles.dimIcon : null}>
        <Device kind={kind} label={label} nodeId={nodeId} />
      </View>
      <Text
        style={[styles.label, dimmed && styles.inactiveText]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {label}
      </Text>
      {role ? (
        <Text
          style={[styles.role, dimmed && styles.inactiveText]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {role}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 96,
    height: 100,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 6,
    gap: 2,
  },
  artCard: {
    borderRadius: 22,
    borderWidth: 2.5,
    overflow: 'hidden',
    backgroundColor: '#FFFCF5',
  },
  artImageWrap: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  artCaption: {
    flexShrink: 0,
    width: '100%',
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 5,
    backgroundColor: 'rgba(255,252,245,0.98)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(45,38,64,0.1)',
    alignItems: 'center',
    gap: 0,
  },
  artCaptionDim: {
    opacity: 0.9,
  },
  artLabel: {
    width: '100%',
    fontFamily: theme.font.display,
    fontSize: 14,
    color: theme.light.ink,
    textAlign: 'center',
  },
  artRole: {
    width: '100%',
    fontFamily: theme.font.mono,
    fontSize: 10,
    color: theme.light.muted,
    textAlign: 'center',
  },
  active: {
    borderColor: theme.light.ink,
  },
  inactive: {
    borderColor: 'rgba(45,38,64,0.35)',
  },
  selected: {
    borderColor: theme.light.ink,
    borderWidth: 2.5,
  },
  dimIcon: {
    opacity: 0.55,
  },
  inactiveText: {
    color: theme.light.ink,
    opacity: 0.7,
  },
  label: {
    width: '100%',
    fontFamily: theme.font.display,
    fontSize: 11,
    color: theme.light.ink,
    textAlign: 'center',
  },
  role: {
    width: '100%',
    fontFamily: theme.font.mono,
    fontSize: 9,
    color: theme.light.muted,
    textAlign: 'center',
  },
});

const device = StyleSheet.create({
  phone: {
    width: 28,
    height: 44,
    borderRadius: 6,
    backgroundColor: theme.light.ink,
    padding: 3,
    alignItems: 'center',
  },
  phoneScreen: {
    flex: 1,
    width: '100%',
    borderRadius: 3,
    backgroundColor: theme.light.tint.sky,
  },
  phoneHome: {
    width: 8,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.light.muted,
    marginTop: 2,
  },
  rack: {
    width: 40,
    height: 42,
    borderRadius: 6,
    backgroundColor: theme.light.ink,
    padding: 4,
    gap: 3,
    justifyContent: 'center',
  },
  rackSlot: {
    height: 10,
    borderRadius: 2,
    backgroundColor: '#3A3350',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 3,
  },
  led: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.light.packet.malicious,
  },
  router: {
    width: 44,
    height: 40,
    alignItems: 'center',
  },
  antenna: {
    position: 'absolute',
    top: 0,
    left: 10,
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: theme.light.ink,
  },
  routerBody: {
    marginTop: 12,
    width: 44,
    height: 22,
    borderRadius: 8,
    backgroundColor: theme.light.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  shield: {
    width: 36,
    height: 42,
    backgroundColor: theme.light.packet.malicious,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  shieldInner: {
    gap: 4,
    alignItems: 'center',
  },
  shieldBar: {
    width: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.light.ink,
  },
  globe: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.light.tint.lilac,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  globeRing: {
    position: 'absolute',
    width: 18,
    height: 40,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  globeEquator: {
    position: 'absolute',
    width: 40,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  globeText: {
    fontFamily: theme.font.mono,
    fontSize: 9,
    color: theme.light.ink,
    fontWeight: '700',
  },
  generic: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: theme.light.tint.lilac,
    borderWidth: 2,
    borderColor: theme.light.ink,
  },
});
