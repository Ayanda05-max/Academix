type ToastKind = "success" | "error" | "warning" | "info";

const ICONS: Record<ToastKind, string> = {
  success: "✓",
  error: "!",
  warning: "!",
  info: "i",
};

const css = `
#academix-toasts {
  position: fixed;
  top: 88px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(380px, calc(100vw - 32px));
  pointer-events: none;
}
.academix-toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 14px 14px 16px;
  background: #ffffff;
  color: #172033;
  border: 1px solid #dde5ee;
  border-left: 5px solid var(--toast-color);
  border-radius: 12px;
  box-shadow: 0 14px 34px rgba(15, 42, 75, 0.18);
  font-family: "Inter", "Segoe UI", system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.45;
  text-align: left;
  animation: academix-toast-in 0.3s ease both;
}
.academix-toast.academix-toast-leaving {
  animation: academix-toast-out 0.25s ease both;
}
.academix-toast-success { --toast-color: #067647; }
.academix-toast-error { --toast-color: #b42318; }
.academix-toast-warning { --toast-color: #dc6803; }
.academix-toast-info { --toast-color: #2b6dad; }
.academix-toast-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--toast-color);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
}
.academix-toast-text {
  flex: 1;
  min-width: 0;
  word-break: break-word;
  white-space: pre-line;
}
.academix-toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #667085;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}
.academix-toast-close:hover {
  color: #172033;
}
@keyframes academix-toast-in {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes academix-toast-out {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(24px); }
}
@media (prefers-reduced-motion: reduce) {
  .academix-toast, .academix-toast.academix-toast-leaving { animation: none; }
}
`;

function classify(message: string): ToastKind {
  const text = message.toLowerCase();

  if (
    text.startsWith("error") ||
    text.includes("could not") ||
    text.includes("failed") ||
    text.includes("denied") ||
    text.includes("invalid")
  ) {
    return "error";
  }

  if (
    text.includes("please") ||
    text.includes("must") ||
    text.includes("already") ||
    text.includes("between")
  ) {
    return "warning";
  }

  if (
    text.includes("success") ||
    text.includes("created") ||
    text.includes("copied") ||
    text.includes("saved") ||
    text.includes("uploaded") ||
    text.includes("deleted") ||
    text.includes("graded") ||
    text.includes("enrolled") ||
    text.includes("updated")
  ) {
    return "success";
  }

  return "info";
}

function getContainer(): HTMLElement {
  let container = document.getElementById("academix-toasts");

  if (!container) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    container = document.createElement("div");
    container.id = "academix-toasts";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  return container;
}

export function showToast(message: string, kind?: ToastKind, duration = 5000): void {
  const container = getContainer();
  const type = kind ?? classify(message);

  while (container.children.length >= 4) {
    container.firstElementChild?.remove();
  }

  const toast = document.createElement("div");
  toast.className = `academix-toast academix-toast-${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");

  const icon = document.createElement("span");
  icon.className = "academix-toast-icon";
  icon.textContent = ICONS[type];

  const text = document.createElement("span");
  text.className = "academix-toast-text";
  text.textContent = message;

  const close = document.createElement("button");
  close.type = "button";
  close.className = "academix-toast-close";
  close.setAttribute("aria-label", "Dismiss");
  close.textContent = "×";

  let timer = 0;

  function dismiss() {
    window.clearTimeout(timer);
    toast.classList.add("academix-toast-leaving");
    window.setTimeout(() => toast.remove(), 250);
  }

  close.addEventListener("click", dismiss);

  toast.append(icon, text, close);
  container.appendChild(toast);

  timer = window.setTimeout(dismiss, duration);
}

window.alert = (message?: unknown): void => {
  showToast(String(message ?? ""));
};