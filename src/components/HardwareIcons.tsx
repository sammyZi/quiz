import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import { theme } from '../theme/theme';

const ink = theme.light.ink;

type IconProps = { size?: number };

/** Squared silicon die with pin legs — reads as a CPU at a glance. */
export function CpuIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      <Rect x={4} y={11} width={4} height={3} rx={1} fill={ink} />
      <Rect x={4} y={18} width={4} height={3} rx={1} fill={ink} />
      <Rect x={4} y={25} width={4} height={3} rx={1} fill={ink} />
      <Rect x={32} y={11} width={4} height={3} rx={1} fill={ink} />
      <Rect x={32} y={18} width={4} height={3} rx={1} fill={ink} />
      <Rect x={32} y={25} width={4} height={3} rx={1} fill={ink} />
      <Rect x={11} y={4} width={3} height={4} rx={1} fill={ink} />
      <Rect x={18} y={4} width={3} height={4} rx={1} fill={ink} />
      <Rect x={25} y={4} width={3} height={4} rx={1} fill={ink} />
      <Rect x={11} y={32} width={3} height={4} rx={1} fill={ink} />
      <Rect x={18} y={32} width={3} height={4} rx={1} fill={ink} />
      <Rect x={25} y={32} width={3} height={4} rx={1} fill={ink} />
      <Rect x={8} y={8} width={24} height={24} rx={5} fill={ink} />
      <Rect x={12} y={12} width={16} height={16} rx={3} fill={theme.light.tint.sun} />
      <Rect x={16} y={16} width={8} height={8} rx={1.5} fill={ink} />
    </Svg>
  );
}

/** DIMM stick — PCB + memory chips. */
export function RamIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      <Rect x={3} y={11} width={34} height={18} rx={3} fill={ink} />
      <Rect x={5} y={13} width={30} height={11} rx={2} fill={theme.light.tint.mint} />
      <Rect x={8} y={15} width={5} height={7} rx={1} fill={ink} />
      <Rect x={15} y={15} width={5} height={7} rx={1} fill={ink} />
      <Rect x={22} y={15} width={5} height={7} rx={1} fill={ink} />
      <Rect x={29} y={15} width={5} height={7} rx={1} fill={ink} />
      <Rect x={7} y={26} width={2} height={3} rx={0.5} fill={theme.light.tint.mint} />
      <Rect x={11} y={26} width={2} height={3} rx={0.5} fill={theme.light.tint.mint} />
      <Rect x={18} y={27} width={4} height={2} rx={0.5} fill={theme.light.tint.mint} />
      <Rect x={27} y={26} width={2} height={3} rx={0.5} fill={theme.light.tint.mint} />
      <Rect x={31} y={26} width={2} height={3} rx={0.5} fill={theme.light.tint.mint} />
    </Svg>
  );
}

/**
 * External hard-drive silhouette: solid case + clear platter window.
 * No peach fill that blends into the card background.
 */
export function DiskIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      {/* drive body */}
      <Rect x={4} y={8} width={32} height={24} rx={5} fill={ink} />
      {/* front face */}
      <Rect x={6} y={10} width={28} height={16} rx={3} fill="#4A4260" />
      {/* platter window */}
      <Circle cx={16} cy={18} r={6.5} fill="#2A2438" />
      <Circle cx={16} cy={18} r={6.5} stroke={theme.light.tint.peach} strokeWidth={1.5} fill="none" />
      <Circle cx={16} cy={18} r={4} stroke={theme.light.tint.peach} strokeWidth={1} fill="none" opacity={0.7} />
      <Circle cx={16} cy={18} r={1.6} fill={theme.light.tint.peach} />
      {/* head arm */}
      <Path d="M16 18 L22 13" stroke={theme.light.tint.peach} strokeWidth={1.8} strokeLinecap="round" />
      {/* activity LED + label stripe */}
      <Rect x={25} y={13} width={7} height={3} rx={1.5} fill={theme.light.tint.mint} />
      <Rect x={25} y={18} width={7} height={2} rx={1} fill="#6B6280" />
      <Rect x={25} y={22} width={5} height={2} rx={1} fill="#6B6280" />
      {/* connector edge */}
      <Rect x={10} y={28} width={20} height={2.5} rx={1} fill="#6B6280" />
    </Svg>
  );
}

/** Eight bit cells — one byte at a glance. */
export function ByteIcon({ size = 40 }: IconProps) {
  const s = size;
  const bits = [1, 0, 1, 0, 0, 0, 0, 1];
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      <Rect x={3} y={12} width={34} height={16} rx={4} fill={ink} />
      {bits.map((bit, i) => (
        <Rect
          key={i}
          x={5.5 + i * 4}
          y={15}
          width={3.2}
          height={10}
          rx={1}
          fill={bit ? theme.light.tint.sun : '#4A4260'}
        />
      ))}
    </Svg>
  );
}

/** Hash / digits — “read as a number”. */
export function NumberIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={15} fill={theme.light.tint.mint} stroke={ink} strokeWidth={2} />
      <SvgText
        x={20}
        y={26}
        fontSize={16}
        fontWeight="700"
        fill={ink}
        textAnchor="middle"
      >
        65
      </SvgText>
    </Svg>
  );
}

/** Letter tile — “read as text”. */
export function TextIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      <Rect x={8} y={6} width={24} height={28} rx={4} fill={theme.light.tint.sky} stroke={ink} strokeWidth={2} />
      <SvgText
        x={20}
        y={28}
        fontSize={20}
        fontWeight="700"
        fill={ink}
        textAnchor="middle"
      >
        A
      </SvgText>
    </Svg>
  );
}

/** Instruction chip — “read as opcode”. */
export function OpcodeIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      <Rect x={6} y={10} width={28} height={20} rx={5} fill={ink} />
      <Rect x={10} y={14} width={20} height={12} rx={3} fill={theme.light.tint.lilac} />
      <Path d="M17 17 L26 20 L17 23 Z" fill={ink} />
    </Svg>
  );
}

/** Instruction memory — rows of stored commands. */
export function MemoryBoxIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      <Rect x={6} y={6} width={28} height={28} rx={5} fill={ink} />
      <Rect x={9} y={10} width={22} height={5} rx={1.5} fill={theme.light.tint.sky} />
      <Rect x={9} y={17.5} width={22} height={5} rx={1.5} fill={theme.light.tint.mint} />
      <Rect x={9} y={25} width={22} height={5} rx={1.5} fill={theme.light.tint.sun} />
    </Svg>
  );
}

/** Fetch — pull the next command. */
export function FetchIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={15} fill={theme.light.tint.sky} stroke={ink} strokeWidth={2} />
      <Path
        d="M12 20h12M20 13l7 7-7 7"
        stroke={ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

/** Decode — figure out the meaning. */
export function DecodeIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      <Circle cx={18} cy={18} r={9} fill={theme.light.tint.lilac} stroke={ink} strokeWidth={2} />
      <Path d="M24 24l7 7" stroke={ink} strokeWidth={3} strokeLinecap="round" />
      <Path d="M14 18h8M18 14v8" stroke={ink} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

/** Execute — do the work. */
export function ExecuteIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={15} fill={theme.light.tint.mint} stroke={ink} strokeWidth={2} />
      <Path d="M16 14 L28 20 L16 26 Z" fill={ink} />
    </Svg>
  );
}

/** Stack — neat pile of sticky notes (LIFO frames). */
export function StackIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      {/* base plate */}
      <Rect x={6} y={30} width={28} height={4} rx={1.5} fill={ink} />
      {/* stacked frames — bottom to top */}
      <Rect x={9} y={24} width={22} height={6} rx={1.5} fill={theme.light.tint.sky} stroke={ink} strokeWidth={1.5} />
      <Rect x={9} y={17} width={22} height={6} rx={1.5} fill={theme.light.tint.mint} stroke={ink} strokeWidth={1.5} />
      <Rect x={9} y={10} width={22} height={6} rx={1.5} fill={theme.light.tint.sun} stroke={ink} strokeWidth={1.5} />
      {/* top “active” note fold */}
      <Path d="M27 10 L31 10 L27 14 Z" fill={ink} />
      <Rect x={12} y={12} width={10} height={1.5} rx={0.75} fill={ink} opacity={0.35} />
      <Rect x={12} y={19} width={12} height={1.5} rx={0.75} fill={ink} opacity={0.35} />
      <Rect x={12} y={26} width={8} height={1.5} rx={0.75} fill={ink} opacity={0.35} />
    </Svg>
  );
}

/** Heap — storage room with loose boxes (flexible lifetime). */
export function HeapIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      {/* room */}
      <Rect x={4} y={6} width={32} height={28} rx={5} fill={ink} />
      <Rect x={6} y={8} width={28} height={24} rx={3} fill="#4A4260" />
      {/* scattered boxes */}
      <Rect x={9} y={22} width={10} height={8} rx={1.5} fill={theme.light.tint.peach} stroke={ink} strokeWidth={1.2} />
      <Rect x={21} y={20} width={12} height={10} rx={1.5} fill={theme.light.tint.lilac} stroke={ink} strokeWidth={1.2} />
      <Rect x={14} y={11} width={11} height={8} rx={1.5} fill={theme.light.tint.sun} stroke={ink} strokeWidth={1.2} />
      {/* box lids / tape */}
      <Path d="M9 25 H19" stroke={ink} strokeWidth={1.2} opacity={0.5} />
      <Path d="M21 24 H33" stroke={ink} strokeWidth={1.2} opacity={0.5} />
      <Path d="M14 14 H25" stroke={ink} strokeWidth={1.2} opacity={0.5} />
    </Svg>
  );
}

/** Your code — little script / play card. */
export function CodeIcon({ size = 40 }: IconProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 40 40">
      <Rect x={7} y={5} width={26} height={30} rx={4} fill={ink} />
      <Rect x={10} y={8} width={20} height={24} rx={2} fill={theme.light.tint.cream} />
      <Path
        d="M15 14 L12 18 L15 22"
        stroke={ink}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M25 14 L28 18 L25 22"
        stroke={ink}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Rect x={17} y={25} width={6} height={2.5} rx={1} fill={ink} />
    </Svg>
  );
}
