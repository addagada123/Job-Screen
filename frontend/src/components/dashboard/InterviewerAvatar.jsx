import React from "react";

/**
 * Animated SVG interviewer avatar.
 * Props:
 *   isTalking   – true while TTS is reading (mouth animates)
 *   isListening – true while user's mic is active (head nods)
 *   size        – pixel size of the avatar
 */
const InterviewerAvatar = ({ isTalking = false, isListening = false, size = 120 }) => {
  const styles = `
    @keyframes mouthTalk {
      0%, 100% { ry: 2; rx: 6; }
      30% { ry: 7; rx: 8; }
      60% { ry: 4; rx: 7; }
    }
    @keyframes headNod {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(4deg); }
      50% { transform: rotate(-3deg); }
      75% { transform: rotate(2deg); }
    }
    @keyframes blink {
      0%, 92%, 100% { ry: 5; }
      95% { ry: 0.5; }
    }
    @keyframes breathe {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-1.5px); }
    }
  `;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <style>{styles}</style>
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        style={{ animation: "breathe 3s ease-in-out infinite" }}
      >
        {/* Head Group */}
        <g style={{ transformOrigin: "60px 70px", animation: isListening ? "headNod 0.9s ease-in-out infinite" : "none" }}>
          <ellipse cx="60" cy="38" rx="36" ry="28" fill="#3b2f2f" /> {/* Hair */}
          <ellipse cx="60" cy="52" rx="32" ry="30" fill="#fdd7a0" /> {/* Face */}
          
          {/* Eyes & Blinking */}
          <ellipse cx="46" cy="48" rx="5" ry="5" fill="white" />
          <ellipse cx="46" cy="48" rx="2.5" ry="2.5" fill="#1e293b" />
          <ellipse cx="46" cy="48" rx="5" ry="5" fill="#fdd7a0" style={{ animation: "blink 4s ease-in-out infinite" }} />
          
          <ellipse cx="74" cy="48" rx="5" ry="5" fill="white" />
          <ellipse cx="74" cy="48" rx="2.5" ry="2.5" fill="#1e293b" />
          <ellipse cx="74" cy="48" rx="5" ry="5" fill="#fdd7a0" style={{ animation: "blink 4s ease-in-out infinite" }} />

          {/* Glasses */}
          <circle cx="46" cy="48" r="9" stroke="#6366f1" strokeWidth="1.5" fill="none" />
          <circle cx="74" cy="48" r="9" stroke="#6366f1" strokeWidth="1.5" fill="none" />
          <line x1="55" y1="48" x2="65" y2="48" stroke="#6366f1" strokeWidth="1.2" />

          {/* Mouth */}
          {isTalking ? (
            <ellipse cx="60" cy="67" rx="6" ry="2" fill="#c0392b" style={{ animation: "mouthTalk 0.35s ease-in-out infinite" }} />
          ) : (
            <path d="M52 66 Q60 72 68 66" stroke="#c0392b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          )}
        </g>
        {/* Shirt & Tie */}
        <path d="M35 82 Q60 95 85 82 L92 110 Q60 115 28 110 Z" fill="#6366f1" />
        <polygon points="57,84 63,84 62,100 58,100" fill="#4338ca" />
      </svg>
      {/* Status Label */}
      <div style={{ fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>
        {isTalking ? "🗣️ Asking..." : isListening ? "👂 Listening..." : "😊 Ready"}
      </div>
    </div>
  );
};

export default InterviewerAvatar;
