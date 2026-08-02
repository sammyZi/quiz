import type { ImageSourcePropType } from 'react-native';

export type NodeArtClip = {
  frames: ImageSourcePropType[];
};

/**
 * Bundled node art — stills or short frame loops (WebP, ≈384px).
 * Keep under ~40KB per node when possible.
 */
export const nodeArt: Record<string, NodeArtClip> = {
  ice: { frames: [require('../../assets/nodes/node-ice.webp')] },
  water: { frames: [require('../../assets/nodes/node-water.webp')] },
  steam: { frames: [require('../../assets/nodes/node-steam.webp')] },
  heat: { frames: [require('../../assets/nodes/node-heat.webp')] },
  cool: { frames: [require('../../assets/nodes/node-cool.webp')] },
  pour: { frames: [require('../../assets/nodes/node-pour.webp')] },
  sort: { frames: [require('../../assets/nodes/node-sort.webp')] },
  stir: { frames: [require('../../assets/nodes/node-stir.webp')] },
  mix: { frames: [require('../../assets/nodes/node-mix.webp')] },
  filter: { frames: [require('../../assets/nodes/node-filter.webp')] },
  apart: { frames: [require('../../assets/nodes/node-apart.webp')] },
};
