import { StyleSheet, Text, View } from 'react-native';
import type { NodeKind } from '../lib/lesson.schema';
import { theme } from '../theme/theme';
import {
  ByteIcon,
  CpuIcon,
  DiskIcon,
  NumberIcon,
  OpcodeIcon,
  RamIcon,
  TextIcon,
} from './HardwareIcons';

type NodeShapeProps = {
  kind: NodeKind;
  label: string;
  nodeId?: string;
  selected?: boolean;
  active?: boolean;
};

type IconKey = 'cpu' | 'ram' | 'disk' | 'byte' | 'number' | 'text' | 'opcode';

const ICON_ROLE: Partial<Record<IconKey, string>> = {
  cpu: 'does work',
  ram: 'fast memory',
  disk: 'saved files',
  byte: 'raw bits',
  number: 'as number',
  text: 'as letter',
  opcode: 'as instruction',
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
  const key = `${nodeId ?? ''} ${label}`.toLowerCase();
  if (/\b(cpu|processor)\b/.test(key)) return 'cpu';
  if (/\b(ram|memory)\b/.test(key) && !/\b(binary|byte)\b/.test(key)) return 'ram';
  if (/\b(disk|ssd|hdd|storage)\b/.test(key)) return 'disk';
  if (/\b(byte|bits?)\b/.test(key) || nodeId === 'byte') return 'byte';
  if (/\b(number|num|integer)\b/.test(key) || nodeId === 'as-num') return 'number';
  if (/\b(text|letter|ascii|char)\b/.test(key) || nodeId === 'as-text') return 'text';
  if (/\b(opcode|op|instruction)\b/.test(key) || nodeId === 'as-op') return 'opcode';
  return null;
}

function Device({ kind, label, nodeId }: { kind: NodeKind; label: string; nodeId?: string }) {
  const icon = resolveIcon(label, nodeId);
  if (icon === 'cpu') return <CpuIcon size={40} />;
  if (icon === 'ram') return <RamIcon size={40} />;
  if (icon === 'disk') return <DiskIcon size={40} />;
  if (icon === 'byte') return <ByteIcon size={40} />;
  if (icon === 'number') return <NumberIcon size={40} />;
  if (icon === 'text') return <TextIcon size={40} />;
  if (icon === 'opcode') return <OpcodeIcon size={40} />;

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

export function NodeShape({ kind, label, nodeId, selected, active }: NodeShapeProps) {
  const icon = resolveIcon(label, nodeId);
  const fill = icon ? theme.light.surface : (KIND_FILL[kind] ?? theme.light.tint.cream);
  const role = icon ? (ICON_ROLE[icon] ?? null) : null;

  return (
    <View
      style={[
        styles.card,
        theme.clay.soft,
        { backgroundColor: fill },
        selected && styles.selected,
        active && styles.active,
      ]}
    >
      <Device kind={kind} label={label} nodeId={nodeId} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {role ? (
        <Text style={styles.role} numberOfLines={1}>
          {role}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 96,
    height: 108,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    paddingBottom: 6,
    gap: 2,
  },
  selected: {
    borderColor: theme.light.ink,
    borderWidth: 2.5,
  },
  active: {
    borderColor: theme.light.tint.sun,
    borderWidth: 2.5,
  },
  label: {
    fontFamily: theme.font.display,
    fontSize: 13,
    color: theme.light.ink,
    paddingHorizontal: 4,
  },
  role: {
    fontFamily: theme.font.mono,
    fontSize: 10,
    color: theme.light.muted,
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
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.light.ink,
  },
});
