import { useCallback, useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import {
  requestNeededAndroidPermissions,
  StripeTerminalProvider,
  useStripeTerminal,
} from "@stripe/stripe-terminal-react-native";

const POS_URL =
  process.env.EXPO_PUBLIC_POS_URL?.trim() || "https://ca.bleequp.com/admin/pos";
const EAS_PROJECT_ID =
  (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ??
  "c3fc34ad-a7ab-4e42-8f9b-915b72cf2030";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function injectExpoToken(web: WebView | null, token: string) {
  const js = `window.__verveaceExpoPushToken=${JSON.stringify(token)};window.dispatchEvent(new Event("verveace-expo-push"));true;`;
  web?.injectJavaScript(js);
}

async function registerOrderNotifications(): Promise<string | null> {
  if (Platform.OS !== "android") return null;
  await Notifications.setNotificationChannelAsync("orders", {
    name: "Orders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    showBadge: true,
  });
  await Notifications.setNotificationChannelAsync("support", {
    name: "Support chat",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    showBadge: true,
  });
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    const asked = await Notifications.requestPermissionsAsync();
    status = asked.status;
  }
  if (status !== "granted") return null;
  const token = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
  return token.data;
}

const BRIDGE = `
(function () {
  document.documentElement.classList.add("pos-native");
  var pending = {};
  function send(msg) {
    window.ReactNativeWebView.postMessage(JSON.stringify(msg));
  }
  window.__verveaceTtpFinish = function (id, ok, error) {
    var p = pending[id];
    if (!p) return;
    delete pending[id];
    if (ok) p.resolve();
    else p.reject(new Error(error || "Tap to Pay failed"));
  };
  function call(type, extra) {
    var id = Math.random().toString(36).slice(2);
    return new Promise(function (resolve, reject) {
      pending[id] = { resolve: resolve, reject: reject };
      send(Object.assign({ type: type, id: id }, extra || {}));
    });
  }
  window.VerveaceTapToPay = {
    available: true,
    collect: function (input) { return call("collect", input); },
    cancel: function () { return call("cancel"); },
    warmup: function (input) { return call("warmup", input); },
  };
  window.dispatchEvent(new Event("verveace-ttp-ready"));
  true;
})();
`;

type BridgeMsg = {
  type?: string;
  id?: string;
  clientSecret?: string;
  connectionToken?: string;
  locationId?: string;
  simulated?: boolean;
};

function reply(web: WebView | null, id: string, ok: boolean, error?: string) {
  const payload = JSON.stringify(id);
  const err = JSON.stringify(error ?? "");
  web?.injectJavaScript(
    `window.__verveaceTtpFinish(${payload}, ${ok ? "true" : "false"}, ${err}); true;`,
  );
}

async function ensureAndroidPerms() {
  if (Platform.OS !== "android") return;
  const { error } = await requestNeededAndroidPermissions({
    accessFineLocation: {
      title: "Location",
      message: "Required to accept in-person card payments on this phone.",
      buttonPositive: "Allow",
    },
  });
  if (error?.["android.permission.ACCESS_FINE_LOCATION"]) {
    throw new Error("Location permission is required for Tap to Pay");
  }
}

function PosShell({
  tokenRef,
}: {
  tokenRef: { current: string };
}) {
  const webRef = useRef<WebView>(null);
  const locationRef = useRef("");
  const simulatedRef = useRef(false);
  const expoTokenRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void registerOrderNotifications().then((token) => {
      if (cancelled || !token) return;
      expoTokenRef.current = token;
      injectExpoToken(webRef.current, token);
    });
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === "string" && url.length > 0) {
        const dest = url.startsWith("http") ? url : `${POS_URL.replace(/\/admin\/pos\/?$/, "")}${url}`;
        webRef.current?.injectJavaScript(
          `window.location.assign(${JSON.stringify(dest)});true;`,
        );
      }
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);
  const {
    initialize,
    easyConnect,
    disconnectReader,
    connectedReader,
    retrievePaymentIntent,
    processPaymentIntent,
    cancelProcessPaymentIntent,
  } = useStripeTerminal();

  const ensureReader = useCallback(
    async (locationId: string, simulated: boolean) => {
      await ensureAndroidPerms();
      locationRef.current = locationId;
      const init = await initialize();
      if (init?.error) throw new Error(init.error.message);
      if (connectedReader && simulatedRef.current !== simulated) {
        await disconnectReader();
      } else if (connectedReader) {
        return;
      }
      simulatedRef.current = simulated;
      const { error } = await easyConnect({
        discoveryMethod: "tapToPay",
        locationId,
        simulated,
        merchantDisplayName: "Verveace",
        tosAcceptancePermitted: true,
        autoReconnectOnUnexpectedDisconnect: true,
      });
      if (error) throw new Error(error.message);
    },
    [connectedReader, disconnectReader, easyConnect, initialize],
  );

  const onMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      let msg: BridgeMsg;
      try {
        msg = JSON.parse(event.nativeEvent.data) as BridgeMsg;
      } catch {
        return;
      }
      const id = msg.id;
      if (!id || !msg.type) return;
      const web = webRef.current;
      const simulated = Boolean(msg.simulated);

      try {
        if (msg.connectionToken) tokenRef.current = msg.connectionToken;
        if (msg.locationId) locationRef.current = msg.locationId;

        switch (msg.type) {
          case "warmup": {
            if (!msg.locationId) throw new Error("Missing Terminal location");
            await ensureReader(msg.locationId, simulated);
            reply(web, id, true);
            return;
          }
          case "collect": {
            if (!msg.clientSecret || !msg.locationId) {
              throw new Error("Missing Tap to Pay payment");
            }
            await ensureReader(msg.locationId, simulated);
            const retrieved = await retrievePaymentIntent(msg.clientSecret);
            if (retrieved.error || !retrieved.paymentIntent) {
              throw new Error(retrieved.error?.message || "Could not load payment");
            }
            const processed = await processPaymentIntent({
              paymentIntent: retrieved.paymentIntent,
            });
            if (processed.error) {
              throw new Error(processed.error.message);
            }
            reply(web, id, true);
            return;
          }
          case "cancel": {
            await cancelProcessPaymentIntent();
            reply(web, id, true);
            return;
          }
          default: {
            throw new Error(`Unknown Tap to Pay message: ${msg.type}`);
          }
        }
      } catch (err) {
        reply(web, id, false, err instanceof Error ? err.message : "Tap to Pay failed");
      }
    },
    [cancelProcessPaymentIntent, ensureReader, processPaymentIntent, retrievePaymentIntent, tokenRef],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <WebView
        ref={webRef}
        source={{ uri: POS_URL }}
        style={styles.web}
        originWhitelist={["*"]}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        javaScriptEnabled
        domStorageEnabled
        injectedJavaScript={BRIDGE}
        injectedJavaScriptBeforeContentLoaded={BRIDGE}
        onLoadEnd={() => {
          webRef.current?.injectJavaScript(BRIDGE);
          if (expoTokenRef.current) injectExpoToken(webRef.current, expoTokenRef.current);
        }}
        onMessage={onMessage}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export default function App() {
  const tokenRef = useRef("");
  const tokenProvider = useMemo(
    () => async () => {
      if (!tokenRef.current) throw new Error("No Stripe connection token");
      return tokenRef.current;
    },
    [],
  );

  return (
    <StripeTerminalProvider logLevel="verbose" tokenProvider={tokenProvider}>
      <PosShell tokenRef={tokenRef} />
    </StripeTerminalProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  web: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
