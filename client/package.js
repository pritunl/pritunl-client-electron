import * as packager from '@electron/packager';
import path from 'path';
import { fileURLToPath } from 'url';
import * as fuses from '@electron/fuses';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let entitlementsPath = path.resolve(__dirname, '..',
  'resources_macos', 'entitlements.plist');

async function packageApp() {
  try {
    const appPaths = await packager.packager({
      dir: './',
      name: 'Pritunl',
      platform: 'darwin',
      arch: 'universal',
      icon: './www/img/pritunl.icns',
      darwinDarkModeSupport: true,
      extraResource: [
        '../build/resources/pritunl-service',
        '../build/resources/pritunl-client',
        '../build/resources/pritunl-openvpn',
        '../build/resources/pritunl-openvpn10',
        '../build/resources/bash',
        '../build/resources/wg',
        '../build/resources/wg-quick',
        '../build/resources/wireguard-go',
        '../build/resources/Pritunl Device Authentication',
      ],
      osxUniversal: {
        x64ArchFiles: '*'
      },
      osxSign: {
        hardenedRuntime: true,
        // TODO
        // optionsForFile: (filePath) => {
        //   return {
        //     entitlements: entitlementsPath,
        //     hardenedRuntime: true,
        //   }
        // },
        identity: 'Developer ID Application: Pritunl, Inc. (U22BLATN63)'
      },
      osxNotarize: {
        keychainProfile: 'Pritunl',
        tool: 'notarytool'
      },
      asar: true,
      out: '../build/macos/Applications',
      gatekeeperAssess: false,
      afterCopyExtraResources: [
        async (buildPath, electronVersion, platform, arch, callback) => {
          console.log(`Packaging app for ${platform}-${arch} ` +
            `using Electron ${electronVersion} in ${buildPath}`);

          let electronPath = path.resolve(buildPath,
            'Pritunl.app/Contents/MacOS/Electron');

          console.log(`Flip fuses in ${electronPath}`);

          await fuses.flipFuses(electronPath, {
            version: fuses.FuseVersion.V1,
            [fuses.FuseV1Options.RunAsNode]: false,
            [fuses.FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [fuses.FuseV1Options.EnableNodeCliInspectArguments]: false,
            [fuses.FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [fuses.FuseV1Options.OnlyLoadAppFromAsar]: true,
          });

          callback();
        }
      ]
    });

    console.log(`Successfully packaged app at ${appPaths}`);
  } catch (err) {
    console.error('Error packaging app:', err);
  }
}

packageApp();
