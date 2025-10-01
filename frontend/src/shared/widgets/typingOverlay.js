"use client";

import React, { useState, useEffect, useRef } from "react";

const TypingOverlay = ({ text, onComplete }) => {
  const [userInput, setUserInput] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const inputRef = useRef(null);
  const isComplete = userInput === text;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!isComplete) {
      const interval = setInterval(() => {
        setCursorVisible((prev) => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setCursorVisible(false);
    }
  }, [isComplete]);

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length > text.length) return;

    setUserInput(value);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "600px",
        margin: "20px auto",
      }}
    >
      <div
        style={{
          fontSize: "1.2rem",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          padding: "12px",
          border: isComplete ? "2px solid #22c55e" : "2px solid #ccc",
          borderRadius: "8px",
          minHeight: "60px",
          height: "auto",
          backgroundColor: isComplete ? "#f0fdf4" : "#ffffff",
          lineHeight: "1.5",
          position: "relative",
          overflow: "visible",
        }}
      >
        {text.split("").map((char, idx) => {
          let style = {};
          if (idx < userInput.length) {
            if (userInput[idx] === char) {
              style.color = "#22c55e";
              style.fontWeight = "600";
            } else {
              style.color = "#ef4444";
              style.backgroundColor = "#fef2f2";
              style.fontWeight = "600";
            }
          } else if (idx === userInput.length) {
            style.color = "#374151";
            style.backgroundColor = "#f3f4f6";
          } else {
            style.color = "#9ca3af";
          }

          return (
            <React.Fragment key={idx}>
              <span style={style}>{char}</span>

              {idx === userInput.length - 1 && !isComplete && (
                <span
                  style={{
                    display: "inline-block",
                    width: "2px",
                    height: "1.2em",
                    backgroundColor: "#374151",
                    marginLeft: "1px",
                    opacity: cursorVisible ? 1 : 0,
                    transition: "opacity 0.1s",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}

        {userInput.length === 0 && !isComplete && (
          <span
            style={{
              display: "inline-block",
              width: "2px",
              height: "1.2em",
              backgroundColor: "#374151",
              marginLeft: "1px",
              opacity: cursorVisible ? 1 : 0,
              transition: "opacity 0.1s",
              position: "absolute",
              left: "12px",
              top: "12px",
            }}
          />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleChange}
        disabled={isComplete}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0,
          width: "100%",
          height: "100%",
          cursor: isComplete ? "default" : "text",
          pointerEvents: isComplete ? "none" : "auto",
        }}
      />
    </div>
  );
};

export default TypingOverlay;
