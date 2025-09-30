"use client";

import PaperPlane from "@/shared/components/icons/paperplane";

export default function ChatComposer({ value, onChange, onSend }) {
  return (
    <div className="mt-4 flex gap-3 border border-color-36 rounded-5 px-3 min-h-[62px] max-h-[62px] items-start py-2 bg-white">
      <textarea
        className="flex-1 outline-none placeholder-color-35 text-[16px] text-color-4 resize-none py-2 h-[50px] overflow-y-auto"
        placeholder="메시지를 입력하세요."
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (e.shiftKey) return;
            e.preventDefault();
            onSend?.();
          }
        }}
      />
      <button
        type="button"
        className="bg-color-20 text-white px-3 py-2 rounded-5 transition-colors mt-1"
        onClick={onSend}
        aria-label="Send message"
      >
        <PaperPlane />
      </button>
    </div>
  );
}
