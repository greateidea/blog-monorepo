# AGENTS.md - Agent Coding Guidelines

This document provides guidelines for agentic coding agents working in this repository.

## Project Overview

This is a Turborepo monorepo containing:

- `apps/blog-index` - Vite + React frontend (Next.js alternative)
- `apps/blog-ssr` - Vite + React SSR application
- `packages/ui-lib` - Shared UI component library
- `packages/utils` - Shared utility functions
- `packages/eslint-config` - Shared ESLint configuration
- `packages/ts-config` - Shared TypeScript configuration
- `packages/test-config` - Shared Vitest configuration

## Build, Lint, and Test Commands

### Root Commands (Turborepo)

```bash
# Build all packages/apps
pnpm build:prod

# Build specific app/package
pnpm build:blog        # Build blog-ssr
pnpm build:index        # Build blog-index
pnpm build:uilib       # Build ui-lib
pnpm build:utils       # Build utils

# Development
pnpm dev               # Dev all apps
pnpm dev:blog          # Dev blog-ssr
pnpm dev:index         # Dev blog-index

# Preview production build
pnpm preview:blog
pnpm preview:index

# Lint and Format
pnpm lint              # Lint all packages (via Turbo)
pnpm format            # Format with Prettier

# Testing
pnpm test              # Test changed packages
pnpm test:changed      # Test packages changed from main
```

### Individual Package Commands

**blog-index (apps/blog-index):**

```bash
cd apps/blog-index
pnpm dev               # Start dev server
pnpm build:prod        # Production build
pnpm test              # Run tests
pnpm test -- -t "test name"     # Run single test
pnpm lint              # Lint source
```

**blog-ssr (apps/blog-ssr):**

```bash
cd apps/blog-ssr
pnpm dev               # Start dev server
pnpm build:prod        # Full SSG build
pnpm test              # Run tests
pnpm test -- -t "test name"     # Run single test
pnpm lint              # Lint source
```

**utils (packages/utils):**

```bash
cd packages/utils
pnpm build:prod        # Build package
pnpm test              # Run tests
pnpm test -- -t "test name"     # Run single test
pnpm lint              # Lint source
pnpm lint:fix          # Lint and fix
```

### Running Single Tests

Use Vitest's `-t` flag to run a single test:

```bash
# In a package directory
pnpm test -- -t "test name pattern"

# Example: run specific test
pnpm test -- -t "Counter should"
```

## Code Style Guidelines

### TypeScript Configuration

- Target: ES2022
- Module: ESNext
- JSX: react-jsx (React 17+ automatic JSX transform)
- ModuleResolution: bundler

### Prettier Configuration (`.prettierrc.cjs`)

- Print width: 100
- Tab width: 2 (spaces, no tabs)
- Semicolons: enabled
- Trailing commas: ES5 style
- Bracket spacing: enabled
- End of line: LF
- Arrow function parens: always

### ESLint Configuration

Uses `@blog/eslint-config` which extends:

- `eslint:recommended`
- `plugin:react/recommended`
- `plugin:react-hooks/recommended`
- `plugin:@typescript-eslint/recommended`
- `plugin:turbo/recommended`
- `prettier` (must be last)

Key rules:

- React 17+，不需要显式 `import React`
- 允许 `any` 类型（但有警告）
- 未使用的变量必须以下划线 `_` 开头才能忽略
- 环境变量需在 Turbo repo 中声明

### Naming Conventions

**Components:**

- PascalCase for component files: `Counter.tsx`, `Navbar.tsx`
- Default export for components: `export default Counter`
- Co-located test files: `Counter/index.tsx`, `Counter/Counter.test.tsx`

**Functions and Variables:**

- camelCase for functions and variables
- PascalCase for component names and types/interfaces
- UPPER_SNAKE_CASE for constants

**Directories:**

- Lowercase with hyphens: `components/`, `utils/`, `hooks/`

### Import Patterns

**Relative imports for local modules:**

```typescript
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import Counter from "./components/Counter";
```

**Workspace imports for shared packages:**

```typescript
import { Button } from "@blog/ui-lib";
import { capitalize } from "@blog/utils";
```

**React imports (React 17+):**

```typescript
// No need to import React for JSX
import { useState, useEffect } from "react";
```

### File Organization

```
src/
├── components/
│   ├── ComponentName/
│   │   ├── index.tsx        # Main component
│   │   ├── ComponentName.test.tsx
│   │   └── styles.css
│   └── OtherComponent.tsx
├── hooks/
├── utils/
├── pages/ (if applicable)
└── App.tsx
```

### Testing Guidelines

- Use Vitest with jsdom environment
- Test files: `*.test.ts` or `*.test.tsx`
- Use `@testing-library/react` for component testing
- Use `@testing-library/user-event` for user interactions
- Follow the pattern:

  ```typescript
  import { render, screen } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import ComponentName from './index';

  describe('ComponentName', () => {
    it('should do something', async () => {
      render(<ComponentName />);
      // Act
      await userEvent.click(screen.getByRole('button'));
      // Assert
      expect(screen.getByText('result')).toBeInTheDocument();
    });
  });
  ```

### Error Handling

- Use try-catch for async operations
- Prefer TypeScript types over PropTypes
- Use explicit error boundaries for React components
- Log errors appropriately (Sentry is integrated)

### CSS and Styling

- Use Tailwind CSS v4 with `@tailwindcss/vite`
- Dark mode support (zinc color palette commonly used)
- Use utility classes over custom CSS when possible

### Git Workflow

- Use Changesets for versioning: `pnpm changeset`
- Commit messages should be descriptive
- Pre-commit hooks via Husky and lint-staged are enabled
