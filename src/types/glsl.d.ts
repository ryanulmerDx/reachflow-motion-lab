/**
 * Type declarations for raw GLSL imports.
 *
 * Next.js webpack config in next.config.mjs registers `*.glsl|vs|fs|vert|frag`
 * as `asset/source`, so they import as plain strings.
 */

declare module '*.glsl' {
  const source: string;
  export default source;
}

declare module '*.vs' {
  const source: string;
  export default source;
}

declare module '*.fs' {
  const source: string;
  export default source;
}

declare module '*.vert' {
  const source: string;
  export default source;
}

declare module '*.frag' {
  const source: string;
  export default source;
}
