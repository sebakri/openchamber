// Builds the personal fork as a separate macOS app: own appId, name, icon and
// data folder, no notarization, no auto-update feed. Output: dist-fork/.
// Usage: bun run package:fork (after build:web-assets, prepare:*, bundle:main, rebuild:native)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')).build;
const config = structuredClone(base);
config.appId = 'dev.openchamber.desktop.fork';
config.productName = 'OpenChamber Fork';
config.directories = { ...config.directories, output: 'dist-fork' };
config.afterPack = 'scripts/fork-after-pack.cjs';
config.publish = null;
config.mac = {
  ...config.mac,
  icon: 'resources/icons-fork/icon.icns',
  identity: null,
  notarize: false,
  hardenedRuntime: false,
  target: ['dir'],
  extendInfo: { ...config.mac.extendInfo, CFBundleIconName: undefined },
};
const configPath = path.join(packageDir, '.cache', 'fork-builder-config.json');
fs.mkdirSync(path.dirname(configPath), { recursive: true });
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

const child = spawn('bun', ['x', 'electron-builder', '--mac', '--dir', '--config', configPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: 'false' },
});
child.on('exit', (code) => process.exit(code ?? 1));
