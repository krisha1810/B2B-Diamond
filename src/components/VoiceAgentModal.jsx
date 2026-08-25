import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPhone,
  faPhoneSlash,
  faMicrophone,
  faMicrophoneSlash,
  faVolumeHigh,
  faVolumeXmark,
  faGem,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";
import {
  startB2BVoiceAgent,
  stopB2BVoiceAgent,
  toggleMicMute,
  toggleSpeakerMute,
  isB2BVoiceAgentActive,
  getAudioLevels
} from "../lib/b2bVoiceAgent";

export default function VoiceAgentModal({ onClose, onDiamondsFound }) {
  const [mounted, setMounted] = useState(false);
  const [callStatus, setCallStatus] = useState("connecting"); // connecting, connected, ended, idle
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);

  const handleStartCall = async () => {
    try {
      setCallStatus("connecting");
      setErrorMsg("");
      await startB2BVoiceAgent({ debug: true });
    } catch (err) {
      setCallStatus("idle");
      setErrorMsg(err.message || "Failed to establish WebRTC connection.");
    }
  };

  useEffect(() => {
    setMounted(true);
    handleStartCall();

    const handleStarted = () => {
      setCallStatus("connected");
      setErrorMsg("");
    };

    const handleStopped = () => {
      setCallStatus("ended");
    };

    const handleError = (e) => {
      setCallStatus("idle");
      setErrorMsg(e?.detail?.message || "Connection failed.");
    };

    const handleDiamondsFound = (e) => {
      if (onDiamondsFound) onDiamondsFound(e.detail?.diamonds || []);
    };

    window.addEventListener("b2b-voice-agent-started", handleStarted);
    window.addEventListener("b2b-voice-agent-stopped", handleStopped);
    window.addEventListener("b2b-voice-agent-error", handleError);
    window.addEventListener("b2b-diamonds-found", handleDiamondsFound);

    return () => {
      window.removeEventListener("b2b-voice-agent-started", handleStarted);
      window.removeEventListener("b2b-voice-agent-stopped", handleStopped);
      window.removeEventListener("b2b-voice-agent-error", handleError);
      window.removeEventListener("b2b-diamonds-found", handleDiamondsFound);
    };
  }, []);

  // Call timer and volume level monitor
  useEffect(() => {
    let timerInterval;
    let audioInterval;

    if (callStatus === "connected") {
      timerInterval = setInterval(() => setCallTimer((prev) => prev + 1), 1000);
      audioInterval = setInterval(() => {
        const { localLevel, remoteLevel } = getAudioLevels();
        setAudioLevel(Math.max(localLevel, remoteLevel));
      }, 120);
    } else {
      setCallTimer(0);
      setAudioLevel(0);
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(audioInterval);
    };
  }, [callStatus]);

  const handleEndCall = () => {
    stopB2BVoiceAgent();
    setCallStatus("ended");
  };

  const handleClose = () => {
    if (isB2BVoiceAgentActive()) {
      stopB2BVoiceAgent();
    }
    onClose();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!mounted) return null;

  // Compute dynamic heights for equalizer visualizer bars based on live audio level
  const baseLevel = callStatus === "connected" ? Math.max(audioLevel, 12) : 0;
  const barHeights = [
    Math.min(36, Math.max(6, baseLevel * 0.6)),
    Math.min(48, Math.max(10, baseLevel * 1.1)),
    Math.min(60, Math.max(14, baseLevel * 1.5)),
    Math.min(48, Math.max(10, baseLevel * 1.0)),
    Math.min(36, Math.max(6, baseLevel * 0.7))
  ];

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(3, 7, 18, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
      onClick={handleClose}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "500px",
          minHeight: "550px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(212, 175, 55, 0.35)",
          boxShadow: "0 30px 100px rgba(0, 0, 0, 0.95), 0 0 60px rgba(212, 175, 55, 0.2)",
          borderRadius: "28px",
          background: "linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(8, 12, 20, 0.99) 100%)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(15, 23, 42, 0.5)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#080c14",
                fontSize: "18px",
                boxShadow: "0 4px 15px rgba(212, 175, 55, 0.35)"
              }}
            >
              <FontAwesomeIcon icon={faGem} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#ffffff", letterSpacing: "0.3px" }}>
                HARE KRISHNA
              </h3>
              <p style={{ fontSize: "11px", color: "var(--accent-gold)", margin: 0, fontWeight: 600, letterSpacing: "0.2px" }}>
                B2B AI Voice Assistant
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {callStatus === "connected" && (
              <div
                style={{
                  background: "rgba(74, 222, 128, 0.12)",
                  border: "1px solid rgba(74, 222, 128, 0.3)",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  color: "#4ade80",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "#4ade80",
                    boxShadow: "0 0 8px #4ade80"
                  }}
                />
                {formatTime(callTimer)}
              </div>
            )}
            <button
              onClick={handleClose}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#94a3b8",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div
          style={{
            padding: "54px 24px 44px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "32px"
          }}
        >
          {/* Voice Orb with Pulsing Ambient Ring */}
          <div style={{ position: "relative", width: "140px", height: "140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              className={`voice-orb ${callStatus === "connected" ? "active" : ""}`}
              style={{
                transform: `scale(${1 + Math.min(audioLevel / 40, 0.2)})`
              }}
            >
              <FontAwesomeIcon icon={faGem} style={{ fontSize: "44px", color: "#080c14" }} />
              {callStatus === "connected" && <div className="voice-orb-ring animating" />}
            </div>
          </div>

          {/* Equalizer Sound Wave Visualizer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              height: "40px"
            }}
          >
            {barHeights.map((h, idx) => (
              <div
                key={idx}
                style={{
                  width: "4px",
                  height: `${h}px`,
                  borderRadius: "3px",
                  background: callStatus === "connected"
                    ? "linear-gradient(180deg, #f3e5ab 0%, #d4af37 100%)"
                    : "rgba(255, 255, 255, 0.15)",
                  transition: "height 0.12s ease-out, background 0.3s ease",
                  boxShadow: callStatus === "connected" ? "0 0 10px rgba(212, 175, 55, 0.4)" : "none"
                }}
              />
            ))}
          </div>


        </div>

        {/* Footer & Call Controls */}
        <div
          style={{
            padding: "20px 24px",
            background: "rgba(15, 23, 42, 0.7)",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px"
          }}
        >
          {/* Mic Button (Left) */}
          <button
            onClick={() => setIsMuted(toggleMicMute())}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: isMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.06)",
              border: isMuted ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.12)",
              color: isMuted ? "#ef4444" : "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              transition: "all 0.2s ease",
              boxShadow: isMuted ? "0 0 15px rgba(239, 68, 68, 0.3)" : "none"
            }}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            <FontAwesomeIcon icon={isMuted ? faMicrophoneSlash : faMicrophone} />
          </button>

          {/* End Call / Reconnect Call Button (Center) */}
          <div>
            {callStatus === "connected" || callStatus === "connecting" ? (
              <button
                onClick={handleEndCall}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  boxShadow: "0 6px 25px rgba(239, 68, 68, 0.55)",
                  transition: "all 0.2s ease"
                }}
                title="End Voice Call"
              >
                <FontAwesomeIcon icon={faPhoneSlash} />
              </button>
            ) : (
              <button
                onClick={handleStartCall}
                className="gold-gradient-btn"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  padding: 0,
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Reconnect Call"
              >
                <FontAwesomeIcon icon={faPhone} />
              </button>
            )}
          </div>

          {/* Speaker Button (Right) */}
          <button
            onClick={() => setIsSpeakerMuted(toggleSpeakerMute())}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: isSpeakerMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.06)",
              border: isSpeakerMuted ? "1px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.12)",
              color: isSpeakerMuted ? "#ef4444" : "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              transition: "all 0.2s ease",
              boxShadow: isSpeakerMuted ? "0 0 15px rgba(239, 68, 68, 0.3)" : "none"
            }}
            title={isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}
          >
            <FontAwesomeIcon icon={isSpeakerMuted ? faVolumeXmark : faVolumeHigh} />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
