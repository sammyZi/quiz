import type { ImageSourcePropType } from 'react-native';

/**
 * Bundled node art — keep files tiny (≈384px WebP).
 * Do not ship full-res AI PNGs; resize before commit.
 * Later chapters: prefer reusing these keys, or load remote URIs.
 */
export const nodeArt: Record<string, ImageSourcePropType> = {
  ice: require('../../assets/nodes/node-ice.webp'),
  water: require('../../assets/nodes/node-water.webp'),
  steam: require('../../assets/nodes/node-steam.webp'),
  mix: require('../../assets/nodes/node-mix.webp'),
  filter: require('../../assets/nodes/node-filter.webp'),
  apart: require('../../assets/nodes/node-apart.webp'),
};
