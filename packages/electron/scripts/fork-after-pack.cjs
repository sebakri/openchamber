// afterPack for the personal fork build. Same as after-pack.cjs, except it
// keeps the fork's .icns icon instead of copying the release Assets.car.
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { Arch } = require('electron-builder');
const { setExecutableUuid } = require('./macos-executable-uuid.cjs');
const { verifyPackagedAppContents } = require('./packaged-app-contents.cjs');

module.exports = (context) => {
  const { appInfo } = context.packager;
  const contentsPath = path.join(context.appOutDir, `${appInfo.productFilename}.app`, 'Contents');
  verifyPackagedAppContents(path.join(contentsPath, 'Resources'), { platform: 'darwin', arch: Arch[context.arch] });
  const executablePath = path.join(contentsPath, 'MacOS', appInfo.productFilename);
  setExecutableUuid(executablePath, appInfo.id);
  if (context.arch === Arch.arm64) {
    execFileSync('codesign', ['--force', '--sign', '-', executablePath], { stdio: 'inherit' });
  }
};
