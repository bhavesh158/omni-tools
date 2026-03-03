import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:memeGenerator.title',
    description: 'image:memeGenerator.description',
    shortDescription: 'image:memeGenerator.shortDescription',
    longDescription: 'image:memeGenerator.longDescription'
  },
  path: 'meme-generator',
  icon: 'material-symbols:sentiment-satisfied-rounded',
  keywords: ['meme', 'generator', 'funny', 'image', 'text'],
  component: lazy(() => import('./index'))
});
