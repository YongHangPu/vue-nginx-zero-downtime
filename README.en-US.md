# vue-nginx-zero-downtime

A practical `Nginx zero-downtime deployment` solution repository for Vue static apps, with a ready-to-use starter example, release scripts, Nginx cache templates, and in-app version update prompting.

## Is This A Good Fit?

If this is your first time looking at a repository like this, the main questions are usually not about theory first, but about practical fit:

- Can I copy one complete starter instead of assembling scripts by hand?
- What is the difference between commands in the repository root and commands in `examples/basic-vite-app`?
- If my local machine is Windows or macOS but my server is Linux, where does each part of the workflow run?
- Can this still work when I only have a regular `nginx` static hosting directory?

This repository is usually a good fit when:

- Your frontend is a Vue / Vite static app rather than SSR
- You want hashed assets so old pages can stay usable during release instead of turning into a white screen
- You can update the `nginx` caching rules, either directly or with help from ops
- You are comfortable with a "detect new version, then prompt the user to refresh" workflow instead of forcing an immediate switch
- You want a practical release flow before investing in a larger DevOps setup

If you want to get a full working flow running first, start directly from `examples/basic-vite-app`.
For a first integration, it is better to copy the full example first rather than assembling files from `templates/`.

## Quick Start Note

- If this is your first time integrating this workflow, start with `examples/basic-vite-app`
- It is better to copy the full example first and run `pnpm install`, `pnpm dev`, and `pnpm build:release`
- Use `templates/` later when you already have an existing project, or after you have run through the full example once

This repository now works best as a solution-focused starter that you can run directly, copy in parts, and gradually split into your own project. It includes:

- A full starter project: begin with `examples/basic-vite-app` to run through the full release flow first
- A single-page demo site that explains the deployment model, release SOP, and caching strategy
- In-app version update prompting: including the notification component and `useVersionUpdate()` composable
- Reusable templates: including `deploy-static-ui.sh`, `prepare-release.mjs`, and Nginx config snippets
- Examples for both root-path and subpath deployment modes

## Where To Start

If this is your first time using this workflow, this order tends to work well:

1. Copy `examples/basic-vite-app` as your starter project
2. Go into that directory, then run `pnpm install`, `pnpm dev`, and `pnpm build:release`
3. Confirm that you get a `release/<target-path>-<timestamp>-<git-hash>` directory locally
4. Replace `VITE_APP_CONTEXT_PATH`, page content, and decide whether to use the default path mode or `--live-root`
5. Visit `templates/` later if you already have an existing project, or after you have run through the full example once

For a first pass, it is usually easier to run these commands directly instead of guessing from the repository root:

```bash
cd examples/basic-vite-app
pnpm install
pnpm dev
pnpm build:release
```

`examples/basic-vite-app` is now a full starter template, not just a minimal structure example, and it is the default recommended entry point in this repository. It already includes:

- The update notification component
- The `useVersionUpdate()` composable
- `public/version.json`
- `vite.config.ts`
- `.env.development` and `.env.production`
- `scripts/prepare-release.mjs`
- `build:release` in `package.json`
- `deploy-static-ui.sh`

## Local Demo Site

If you only want to land the release workflow, start with `examples/basic-vite-app` above.
The commands below are for the repository root demo site, which mainly exists to explain the workflow and showcase the templates.

### Local Development

```bash
pnpm install
pnpm dev
```

### Build

```bash
pnpm build
```

One point that can be easy to miss:

- `pnpm dev` and `pnpm build` in the repository root start and build the demo site
- `build:release` is defined in `examples/basic-vite-app`, not in the repository root
- If you want to try the release package flow, work from `examples/basic-vite-app`

## Local Vs Server Responsibilities

- Your local machine can be Windows, macOS, or Linux for `pnpm install`, `pnpm dev`, and `pnpm build`
- `deploy-static-ui.sh` is intended for a Linux + `nginx` server rather than a local Windows environment
- If the server does not have `rsync`, the script can fall back to a `tar`-based copy flow
- The version detection logic runs in the browser and depends on an accessible `version.json`

## Included Templates

- `templates/deploy-static-ui.sh`
- `templates/prepare-release.mjs`
- `templates/useVersionUpdate.ts`
- `templates/nginx-subpath.conf`
- `templates/nginx-root.conf`

## Deployment Path Modes

`deploy-static-ui.sh` supports two path modes. A simple way to choose is to look at your server directory layout first, and then pick the matching mode.

### How To Choose

- Use `project-name + target-path` when your server directories follow one shared convention
- Use `--live-root` when you only know the final live directory or your paths are irregular
- If your production path can be written as `/home/app/<project-name>/ui/<target-path>`, prefer the default mode
- If different servers use very different directory layouts, use `--live-root`

### Mode 1: `project-name + target-path`

Best for:

- Projects stored as `/home/app/<project-name>/ui/<target-path>`
- Environments where only `project-name` and `target-path` change between projects
- Teams that want one consistent command shape on the server

Example:

```bash
/home/app/deploy-static-ui.sh demo-project basic-vite-app /home/app/demo-project/ui/releases/basic-vite-app-20260527120000-a1b2c3
```

### Mode 2: `--live-root`

Best for:

- Production directories that do not follow `/home/app/<project-name>/ui/<target-path>`
- Fixed absolute paths such as `/mnt/data/app/dist`
- Cases where you do not want the script to infer project names or subpaths

Example:

```bash
/home/app/deploy-static-ui.sh --live-root /mnt/data/app/dist /mnt/data/app/releases/app-20260527120000-a1b2c3
```

If you upload a standard release directory generated by `prepare-release.mjs` and it contains only one build subdirectory, the script will auto-detect it, so you do not need the fourth argument.

If the uploaded directory contains multiple candidate subdirectories, or you want to select one explicitly, pass it as the fourth argument:

```bash
/home/app/deploy-static-ui.sh --live-root /mnt/data/app/dist /mnt/data/app/releases/app-20260527120000-a1b2c3 app
```

You can think of `--live-root` as "the absolute path of the live production directory".
When you pass it, the script stops inferring the target path from your project name and subpath, and uses the exact directory you provide as the final release destination.

## How To Integrate

If you do not want to copy the full starter project and only need to integrate these parts into an existing app, this section is a good place to start.

1. Copy `src/components/VersionUpdateNotification.vue` into your project
2. Copy `src/composables/useVersionUpdate.ts` into your project
3. Mount the component in your root layout or `App.vue`
4. Make sure your build output exposes `${BASE_URL}version.json`
5. Inject the current build version, for example with `define` in `vite.config.ts` as `__APP_VERSION__`
6. Apply the proper Nginx caching strategy:
   - `index.html` and `version.json`: no cache
   - `assets/*` with hashed file names: strong cache

## Variables To Replace

For `deploy-static-ui.sh`, you will usually update these values when you use the default path mode:

- `project-name`
- `target-path`
- `/home/app/<project-name>/ui`
- `/home/app/<project-name>/ui/releases`

If your server layout does not follow that convention, you can use:

```bash
--live-root <absolute-live-root> <uploaded-release-dir> [source-subdir]
```

## FAQ

### Why is there no `build:release` in the repository root?

Because the repository root mainly serves as the demo site and template showcase. The root-level `pnpm build` only builds that documentation-oriented site. The example that demonstrates how an actual app prepares a release package lives in `examples/basic-vite-app`, so `build:release` is defined there.

### Why should I avoid deleting old `assets` immediately after a release?

Because users may still have old tabs open, and those pages still reference the previous hashed assets. If you delete them during the release, an old page can hit `404` errors on refresh, route changes, or lazy-loaded chunks. It is safer to keep them for a while and clean them up later.

### When should I use `--live-root`?

Use it when your production directory does not follow `/home/app/<project-name>/ui/<target-path>`, or when you simply want to pass the final live directory directly. In other words, `--live-root` tells the script to stop inferring paths and use the exact absolute directory you provide.

### Why do I still need `version.json`?

The version polling logic needs a lightweight, no-cache file to detect whether the server already has a newer frontend version. Compared with checking `index.html` directly, `version.json` is a more stable and explicit polling target.

### Why do users not always see the new version immediately after deployment?

That is expected. The goal of zero-downtime deployment is not to interrupt users, but to keep the old page working and prompt for a refresh after a new version is detected. The browser only switches to the new `index.html` and new asset entry points when the user refreshes.

## Requirements

- Static frontend build with hashed asset names
- `nginx` as the static hosting layer
- A deployment flow that can sync new assets before replacing the HTML entry
- A `version.json` file that can be requested by the browser

## Not Suitable For

- SSR applications
- Builds without hashed assets
- Dynamic server-rendered applications
- Workflows that require deleting all old assets during the release

## License

MIT
