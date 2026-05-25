export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'perf', 'ci', 'build', 'style', 'demo'],
    ],
    'scope-empty': [0],
    'subject-case': [0],
    'body-max-line-length': [0],
  },
};
