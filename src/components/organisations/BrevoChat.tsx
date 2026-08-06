/**
 * Runtime injector for the Brevo Conversations chat widget on the organisations page.
 * Exports: BrevoChat. Mounted exclusively on the /for-organisations route.
 */
import { useEffect } from "react";

const BREVO_CONVERSATIONS_ID = "64d25eac4e092e659768e10a";
const SCRIPT_SRC = "https://conversations-widget.brevo.com/brevo-conversations.js";

declare global {
  interface Window {
    BrevoConversationsID?: string;
    BrevoConversations?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

/**
 * Loads the Brevo Conversations chat widget. Mounted only on the
 * "For organisations" page, so the script must be injected at runtime
 * (not in the root head) and torn down when the user navigates away.
 */
export function BrevoChat() {
  useEffect(() => {
    window.BrevoConversationsID = BREVO_CONVERSATIONS_ID;
    if (!window.BrevoConversations) {
      const queue: ((...args: unknown[]) => void) & { q?: unknown[] } = function (
        ...args: unknown[]
      ) {
        (queue.q = queue.q || []).push(args);
      };
      window.BrevoConversations = queue;
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.async = true;
      script.src = SCRIPT_SRC;
      document.head.appendChild(script);
    }

    return () => {
      // Hide the widget when leaving the page; the SDK has no full unload API.
      window.BrevoConversations?.("hide");
    };
  }, []);

  return null;
}
