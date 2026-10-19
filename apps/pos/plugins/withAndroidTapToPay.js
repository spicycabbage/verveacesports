const fs = require("fs");
const {
  AndroidConfig,
  withAndroidManifest,
  withFinalizedMod,
} = require("expo/config-plugins");

const GUARD = "    if (TapToPay.isInTapToPayProcess()) { return }";

function applyGuard(contents) {
  if (!contents.includes("import com.stripeterminalreactnative.TapToPay")) {
    contents = contents.replace(
      "import com.facebook.react.ReactApplication",
      "import com.facebook.react.ReactApplication\nimport com.stripeterminalreactnative.TapToPay",
    );
  }
  contents = contents.replace(
    /\r?\n[ \t]*if \(TapToPay\.isInTapToPayProcess\(\)\) \{ return \}/g,
    "",
  );
  if (!contents.includes("super.onCreate()")) {
    console.warn("[withAndroidTapToPay] super.onCreate() not found");
    return contents;
  }
  return contents.replace("super.onCreate()", `super.onCreate()\n${GUARD}`);
}

/**
 * NFC required + TapToPay second-process early-return immediately after super.onCreate().
 * Stripe's plugin uses withDangerousMod for the guard; Expo runs those first, so
 * TerminalApplicationDelegate.onCreate gets inserted above it. Finalize after all mods.
 */
module.exports = function withAndroidTapToPay(config) {
  config = withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    manifest["uses-feature"] ??= [];
    const hasNfc = manifest["uses-feature"].some(
      (item) => item.$?.["android:name"] === "android.hardware.nfc",
    );
    if (!hasNfc) {
      manifest["uses-feature"].push({
        $: {
          "android:name": "android.hardware.nfc",
          "android:required": "true",
        },
      });
    }
    return mod;
  });

  return withFinalizedMod(config, [
    "android",
    async (mod) => {
      const { path: mainAppPath } = await AndroidConfig.Paths.getMainApplicationAsync(
        mod.modRequest.projectRoot,
      );
      const contents = await fs.promises.readFile(mainAppPath, "utf-8");
      await fs.promises.writeFile(mainAppPath, applyGuard(contents), "utf-8");
      return mod;
    },
  ]);
};
