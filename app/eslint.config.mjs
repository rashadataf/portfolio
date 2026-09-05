import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      '@typescript-eslint/no-deprecated': 'error',

      // ── Unused code detection ──────────────────────────────────────
      // Catch unused variables, imports, function args, and caught errors.
      // Prefix with _ to intentionally suppress (e.g. `_unused`).
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      // Flag expressions with no side effects (e.g. `a && b();` → `a && b;`)
      '@typescript-eslint/no-unused-expressions': 'warn',
      // Constructors that only delegate to the parent (no-op constructors)
      '@typescript-eslint/no-useless-constructor': 'warn',
      // Empty `export {}` that adds nothing
      '@typescript-eslint/no-useless-empty-export': 'warn',
      // Unnecessary type assertions (`x as string` when already string)
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      // Unnecessary type constraints (`extends any`, `extends unknown`)
      '@typescript-eslint/no-unnecessary-type-constraint': 'warn',
      // Prefer `as const` over explicit annotation when literal is obvious
      '@typescript-eslint/prefer-as-const': 'warn',
      // Consistent `import type` for type-only imports
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
    files: ['src/**/*.{ts,tsx}'],
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),
]);

