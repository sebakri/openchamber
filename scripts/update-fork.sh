#!/usr/bin/env bash
# Rebase the fork on upstream, rebuild "OpenChamber Fork.app", install it into /Applications.
set -euo pipefail
cd "$(dirname "$0")/.."
git fetch upstream
git rebase upstream/main
bun install
(cd packages/electron && bun run package:fork)
git checkout -- bun.lock 2>/dev/null || true
osascript -e 'tell application "OpenChamber Fork" to quit' 2>/dev/null || true
rm -rf "/Applications/OpenChamber Fork.app"
cp -R "packages/electron/dist-fork/mac-arm64/OpenChamber Fork.app" /Applications/
xattr -cr "/Applications/OpenChamber Fork.app"
open "/Applications/OpenChamber Fork.app"
