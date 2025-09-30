"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRealTime } from "@/providers/realtimeProvider";
import Circle from "@/shared/components/icons/circle";
import MagnifyingGlass from "@/shared/components/icons/magnifyingGlass";

export default function UserSearchBox({ onPick }) {
  const t = useTranslations();
  const { socket } = useRealTime();

  const anchorRef = useRef(null);
  const itemRefs = useRef([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debouncer = useRef(null);

  useEffect(() => {
    return () => {
      if (debouncer.current) clearTimeout(debouncer.current);
    };
  }, []);

  const runSearch = (text) => {
    if (!socket) return;
    if (!text.trim()) {
      setResults([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }
    socket.emit("searchUsers", text, (res) => {
      const list = res || [];
      setResults(list);
      setIsOpen(list.length > 0);
      setHighlightedIndex(list.length ? 0 : -1);
    });
  };

  const onChange = (val) => {
    setQuery(val);
    if (debouncer.current) clearTimeout(debouncer.current);
    debouncer.current = setTimeout(() => runSearch(val), 150);
  };

  // Close on outside click / ESC
  useEffect(() => {
    const onClick = (e) => {
      if (!isOpen) return;
      const el = anchorRef.current;
      if (el && !el.contains(e.target)) setIsOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // Keep highlighted item in view
  useEffect(() => {
    if (!isOpen) return;
    const el = itemRefs.current[highlightedIndex];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, isOpen]);

  const pick = (u) => {
    // Reset local UI
    setQuery("");
    setIsOpen(false);
    setResults([]);
    setHighlightedIndex(-1);
    // Notify parent
    onPick?.(u);
  };

  return (
    <div ref={anchorRef} className="relative">
      <div className="h-[60px] bg-color-74 rounded-5 flex items-center p-4 gap-3">
        <MagnifyingGlass />
        <input
          type="text"
          className="px-4 outline-none text-color-4 text-[18px] font-normal w-full"
          placeholder={t("placeholder.chat-search")}
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (!isOpen && e.key === "ArrowDown" && results.length > 0) {
              setIsOpen(true);
              setHighlightedIndex(0);
              e.preventDefault();
              return;
            }
            if (!isOpen) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightedIndex((prev) =>
                Math.min(prev + 1, results.length - 1)
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const idx = highlightedIndex >= 0 ? highlightedIndex : 0;
              const item = results[idx];
              if (item) pick(item);
            } else if (e.key === "Escape") {
              setIsOpen(false);
              setHighlightedIndex(-1);
            }
          }}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[72px] z-20 bg-white rounded-0 border border-color-36 shadow-lg max-h-72 overflow-auto">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-color-41">
              {t("no-results")}
            </div>
          ) : (
            results.map((u, idx) => (
              <button
                key={u.userId}
                type="button"
                ref={(el) => (itemRefs.current[idx] = el)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-color-80 ${
                  idx === highlightedIndex ? "bg-color-80" : ""
                }`}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => pick(u)}
              >
                <div className="relative w-[40px] h-[40px] flex-shrink-0">
                  {u?.profileImageUrl ? (
                    <Image
                      src={u.profileImageUrl}
                      alt={u.displayName || "user"}
                      fill
                      sizes="40px"
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <Circle width={40} height={40} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-[16px] text-black font-medium">
                    {u.displayName}
                  </div>
                  {u.lastMessage && (
                    <div className="text-[14px] text-color-41 truncate">
                      {u.lastMessage}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
