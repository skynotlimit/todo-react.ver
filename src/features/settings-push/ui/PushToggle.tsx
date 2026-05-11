"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/shared/ui";

type State = "loading" | "unsupported" | "denied" | "subscribed" | "available";

export function PushToggle({ vapidPublicKey }: { vapidPublicKey: string }) {
  const t = useTranslations();
  const [state, setState] = React.useState<State>("loading");
  const [busy, setBusy] = React.useState(false);

  // Probe the browser's push subscription state on mount. This is a
  // legitimate effect — we're syncing React state with an external system
  // (the service worker registry), so the React 19 set-state-in-effect
  // warning doesn't apply.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "subscribed" : "available"))
      .catch(() => setState("available"));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function subscribe() {
    if (!vapidPublicKey) {
      alert(
        "VAPID 키가 설정되어 있지 않습니다. .env에 NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY 를 채워주세요. 생성: npx web-push generate-vapid-keys",
      );
      return;
    }
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "available");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent,
        }),
      });
      setState("subscribed");
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("available");
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading") {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }
  if (state === "unsupported") {
    return <p className="text-sm text-muted-foreground">{t("push.unsupported")}</p>;
  }
  if (state === "denied") {
    return <p className="text-sm text-muted-foreground">{t("push.blocked")}</p>;
  }

  return (
    <div className="space-y-2">
      {state === "subscribed" ? (
        <Button variant="outline" disabled={busy} onClick={unsubscribe}>
          <BellOff className="h-4 w-4" />
          {t("push.disable")}
        </Button>
      ) : (
        <Button disabled={busy} onClick={subscribe}>
          <Bell className="h-4 w-4" />
          {t("push.enable")}
        </Button>
      )}
      {state === "subscribed" && (
        <p className="text-xs text-muted-foreground">{t("push.enabled")}</p>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}
