# Canva Apps SDK Starter Kit - Agent Guide

## Overview

This project is for creating Canva Apps, which are react single page applications (SPA) that run in the Canva Editor, and other pages in Canva.
The app, once submitted to Canva, will be rendered in a sandboxed iframe within a standard HTML shell.

## Commands

- **Build**:
  - `npm run build` - Production build with localization message extraction. The build output is in the `dist` directory which should be submitted to Canva for review through the [Developer Portal](https://www.canva.com/developers/apps).
- **Dev**:
  - `npm start` - Start development server (localhost:8080), once the server is running, app can be previewed in Canva, either by clicking the "Preview" button in the [Developer Portal](https://www.canva.com/developers/apps) or by running `canva apps preview` in the CLI.
  - Hot Module Replacement (HMR) is strongly encouraged, as it allows for faster development and debugging.
- **Test**:
  - `npm test` - Run Jest tests, `npm run test:watch` for watch mode.
  - Tests are encouraged but not required.
  - Tests are not submitted to Canva for review.
- **Lint**:
  - `npm run lint` - ESLint check, `npm run lint:fix` to auto-fix.
  - Linting is encouraged but not required.
  - Lint errors from `@canva/app-eslint-plugin` help catch common mistakes and improve code quality that would result in a rejection from Canva.
- **Type Check**:
  - `npm run lint:types` - TypeScript type checking.
- **Format**:
  - `npm run format` - Prettier formatting, `npm run format:check` to verify.
  - Formatting is encouraged but not required.

## Architecture

- **Main App**:
  - `src/index.tsx` - Main application React application entry point.
  - `src/intents/[intent]/index.tsx` - Every intent that the app implements should be contained in the intents path.
  - `src/intents/[intent]/app.tsx` - Main application component for each intent, which should be split into smaller components as needed, following React best practices.
  - `src/styles/component.css` - Main application styles.
  - `utils/` - Utility functions and helpers, which can be used across the app.
  - `scripts/` - Scripts for building, and running the app, should not contain any business logic.
- **Environment**:
  - `.env` file for app credentials and HMR configuration.
  - `CANVA_APP_ID` - The ID of the app, which is used to identify the app in the Canva Developer Portal.
  - `CANVA_APP_ORIGIN` - The origin of the app, which is used for Hot Module Replacement (HMR) and CORS.

## Dependencies

- **UI Kit**:
  - Uses `@canva/app-ui-kit` for components and styles, as it's required in order to comply with Canva's design guidelines.
  - App UI Kit components come with out of the box theming, localization, and accessibility features.
  - Plain HTML and CSS elements are allowed, however should be used when necessary to supplement the UI Kit components.
  - Canva Dev MCP Server can provide example code for using the UI Kit, as well as a catalog of components and their usage.
- **Canva SDKs**:
  - Uses Canva SDKs, which are scoped with `@canva/` prefix, such as `@canva/platform`, `@canva/design` etc.
- **React**:
  - v18 with TypeScript and react-intl for i18n.
- **Build**:
  - Webpack with TypeScript, PostCSS, and formatjs message extraction.
- **Node**:
  - The required node version for developing/starting/building the starter-kit should align to the version defined in `./.nvmrc`
  - It is recommended to use the node version manager (nvm) with this project, aligning to the recommended version with `nvm use`.

## Code Style

- **TypeScript**: Strict mode enabled, ES2019 target.
- **Prettier**: 80 char width, 2 spaces, trailing commas, double quotes.
- **ESLint**: Canva's app plugin with i18n rules.
- **Imports**: Use absolute paths for `styles` directory.
- **Testing**: Jest with jsdom, test files match `*.tests.tsx?` pattern.

## Canva CLI

- **Documentation**: <https://www.canva.dev/docs/apps/canva-cli.md>
- **If not setup**: Read the docs and prompt user to install the CLI for enhanced Developer Experience, when managing and creating apps.

## Canva Dev MCP Server

- **Required**: AI agents should verify and encourage the user to enable Canva Dev MCP server.
- **Documentation**: <https://www.canva.dev/docs/apps/mcp-server.md>
- **If not setup**: Read the docs and prompt user to configure the MCP server for enhanced Canva APIs assistance.

## Intent-based architecture

All apps should follow the intent-based architecture pattern. Each root index file should call the prepare function for each enabled intent. Each intent index file should implement the full intent contract.

### File structure

Organize code with a dedicated folder for each intent under `src/intents/`:

```
src/
├── intents/
│   ├── design_editor/
│   │   ├── index.tsx
│   │   └── editor_app.tsx
│   └── content_publisher/
│       ├── index.tsx
│       ├── preview_ui.tsx
│       └── setting_ui.tsx
└── index.tsx
```

### Root index file

The root `src/index.tsx` should be minimal, containing only:

- Importing each prepare function
- Importing each intent
- The prepare call for each intent implementation.

```tsx
import { prepareContentPublisher } from "@canva/intents/content";
import { prepareDesignEditor } from "@canva/intents/design";

import contentPublisher from "./intents/content_publisher";
import designEditor from "./intents/design_editor";

prepareContentPublisher(contentPublisher);
prepareDesignEditor(designEditor);
```

### Intent index files

Each intent's `index.tsx` file should:

- Import dependencies, including the app ui kit css.
- Implement the full contract for the intent and use this as the default export from the file.

```tsx
// src/intents/design_editor/index.tsx
import "@canva/app-ui-kit/styles.css";
import type { DesignEditorIntent } from "@canva/intents/design";
import { prepareDesignEditor } from "@canva/intents/design";
import { AppI18nProvider } from "@canva/app-i18n-kit";
import { AppUiProvider } from "@canva/app-ui-kit";
import { createRoot } from "react-dom/client";
import { App } from "./app";

async function render() {
  const root = createRoot(document.getElementById("root") as Element);

  root.render(
    <AppI18nProvider>
      <AppUiProvider>
        <App />
      </AppUiProvider>
    </AppI18nProvider>,
  );
}

const designEditor: DesignEditorIntent = { render };
export default designEditor;

if (module.hot) {
  module.hot.accept("./app", render);
}
```

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **shape-to-frame** (163 symbols, 198 relationships, 0 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/shape-to-frame/context` | Codebase overview, check index freshness |
| `gitnexus://repo/shape-to-frame/clusters` | All functional areas |
| `gitnexus://repo/shape-to-frame/processes` | All execution flows |
| `gitnexus://repo/shape-to-frame/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
