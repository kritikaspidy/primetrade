import { useEffect } from "react";

export default function MessageBox({ type, message, onClose }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const toneClasses =
    type === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : "border-red-200 bg-red-50 text-red-800";

  return (
    <div
      className={`fixed right-4 top-4 z-50 w-[22rem] rounded-xl border p-4 shadow-lg ${toneClasses}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white font-bold">
          {type === "success" ? "✓" : "!"}
        </span>
          <span className="text-sm">{message}</span>
        </div>
        <button className="text-lg leading-none" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}