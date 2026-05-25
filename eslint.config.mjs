import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      'react/no-unknown-property': [
        'error',
        {
          ignore: [
            'args',
            'attach',
            'position',
            'rotation',
            'scale',
            'intensity',
            'castShadow',
            'receiveShadow',
            'vertexShader',
            'fragmentShader',
            'uniforms',
            'transparent',
            'depthWrite',
            'depthTest',
            'side',
            'blending',
            'wireframe',
            'map',
            'envMap',
            'color',
            'roughness',
            'metalness',
          ],
        },
      ],
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**', '*.config.mjs'],
  },
];
