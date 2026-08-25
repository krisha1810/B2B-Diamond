// Client-side helper for Hare Krishna Group B2B Diamond Voice Agent via WebRTC

let activePc = null;
let activeStream = null;
let remoteAudioEl = null;
let monitorInterval = null;
let audioCtx = null;
let localAnalyser = null;
let remoteAnalyser = null;
let localSource = null;
let remoteSource = null;

export async function startB2BVoiceAgent(options = {}) {
  const {
    inactivityMs = 300000, // 5 min timeout
    debug = false,
  } = options || {};

  if (activePc) {
    console.warn("B2B Voice agent already active.");
    return;
  }

  // Ensure remote audio player element
  if (!remoteAudioEl) {
    remoteAudioEl = document.createElement("audio");
    remoteAudioEl.autoplay = true;
    remoteAudioEl.playsInline = true;
    remoteAudioEl.style.display = "none";
    document.body.appendChild(remoteAudioEl);
  }

  try {
    // 1. Get ephemeral session token from our server route
    const sessionResp = await fetch("/api/realtime-session", { method: "POST" });
    if (!sessionResp.ok) {
      const errText = await sessionResp.text();
      throw new Error(`Failed to create B2B realtime session: ${sessionResp.status} ${errText}`);
    }

    const session = await sessionResp.json();
    const ephemeralKey = session?.client_secret?.value;
    const instructions = session?.instructions || "";

    if (!ephemeralKey) throw new Error("Missing ephemeral client token");

    // 2. Request user microphone
    activeStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        channelCount: { ideal: 1 },
        sampleRate: { ideal: 24000 }
      }
    });

    // 3. WebRTC PeerConnection setup
    const pc = new RTCPeerConnection();
    activePc = pc;

    // Create Data Channel for Realtime events & function calls
    const dc = pc.createDataChannel("oai-events");

    dc.addEventListener("open", () => {
      if (debug) console.log("B2B Data Channel Opened");
      const sessionUpdate = {
        type: "session.update",
        session: {
          ...(instructions ? { instructions } : {}),
          turn_detection: {
            type: "server_vad",
            threshold: 0.65,
            prefix_padding_ms: 300,
            silence_duration_ms: 650,
          }
        }
      };
      dc.send(JSON.stringify(sessionUpdate));

      // Trigger immediate initial greeting response
      dc.send(JSON.stringify({ type: "response.create" }));
    });

    dc.addEventListener("message", async (e) => {
      try {
        const event = JSON.parse(e.data);
        if (debug) console.log("Realtime Event:", event);

        // Dispatch transcript updates to UI
        if (event.type === "response.audio_transcript.delta" || event.type === "response.audio_transcript.done") {
          window.dispatchEvent(new CustomEvent("b2b-transcript-delta", {
            detail: {
              speaker: "agent",
              delta: event.delta || "",
              transcript: event.transcript || ""
            }
          }));
        } else if (event.type === "conversation.item.input_audio_transcription.completed") {
          window.dispatchEvent(new CustomEvent("b2b-transcript-user", {
            detail: {
              speaker: "customer",
              transcript: event.transcript || ""
            }
          }));
        }

        // Handle tool function calls
        if (event.type === "response.done") {
          const outputItems = event.response?.output || [];
          for (const item of outputItems) {
            if (item.type === "function_call") {
              const { call_id, name: fnName } = item;
              const args = JSON.parse(item.arguments || "{}");
              if (debug) console.log(`Function Invoked: ${fnName}`, args);

              let fnResult = { success: true };

              try {
                if (fnName === "send_otp") {
                  const res = await fetch("/api/otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "send", email: args.email })
                  });
                  fnResult = await res.json();
                  window.dispatchEvent(new CustomEvent("b2b-otp-sent", { detail: { email: args.email } }));
                } else if (fnName === "verify_otp") {
                  const res = await fetch("/api/otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "verify", email: args.email, otpCode: args.otpCode })
                  });
                  fnResult = await res.json();
                  window.dispatchEvent(new CustomEvent("b2b-account-verified", { detail: { email: args.email, companyName: fnResult.companyName || "Shine Diamonds" } }));
                } else if (fnName === "search_diamonds") {
                  const res = await fetch("/api/diamonds", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "search", ...args })
                  });
                  fnResult = await res.json();
                  window.dispatchEvent(new CustomEvent("b2b-diamonds-found", { detail: fnResult }));
                } else if (fnName === "send_diamond_details_email") {
                  const res = await fetch("/api/diamonds", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "send_email", ...args })
                  });
                  fnResult = await res.json();
                  window.dispatchEvent(new CustomEvent("b2b-email-sent", { detail: { email: args.email } }));
                }

                // Send tool execution output back to model session
                if (dc.readyState === "open") {
                  dc.send(JSON.stringify({
                    type: "conversation.item.create",
                    item: {
                      type: "function_call_output",
                      call_id: call_id,
                      output: JSON.stringify(fnResult)
                    }
                  }));

                  // Request model to continue spoken response
                  dc.send(JSON.stringify({ type: "response.create" }));
                }
              } catch (err) {
                console.error(`Error executing tool ${fnName}:`, err);
                if (dc.readyState === "open") {
                  dc.send(JSON.stringify({
                    type: "conversation.item.create",
                    item: {
                      type: "function_call_output",
                      call_id: call_id,
                      output: JSON.stringify({ success: false, error: err.message })
                    }
                  }));
                  dc.send(JSON.stringify({ type: "response.create" }));
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Data channel parsing error:", err);
      }
    });

    // Add local audio track
    activeStream.getTracks().forEach((track) => pc.addTrack(track, activeStream));

    // Handle remote track
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteAudioEl) remoteAudioEl.srcObject = remoteStream;
      setupAudioMonitoring(activeStream, remoteStream, { inactivityMs });
    };

    // 4. Create offer & SDP exchange with OpenAI Realtime API
    const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
    await pc.setLocalDescription(offer);

    const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        "Content-Type": "application/sdp"
      },
      body: offer.sdp
    });

    if (!sdpResponse.ok) {
      const txt = await sdpResponse.text();
      throw new Error(`Realtime SDP exchange failed: ${sdpResponse.status} ${txt}`);
    }

    const answerSdp = await sdpResponse.text();
    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

    console.log("B2B Diamond Voice Agent Connected.");
    window.dispatchEvent(new CustomEvent("b2b-voice-agent-started"));
  } catch (err) {
    console.error("Failed to start B2B Voice Agent:", err);
    stopB2BVoiceAgent();
    window.dispatchEvent(new CustomEvent("b2b-voice-agent-error", { detail: { message: err?.message || String(err) } }));
    throw err;
  }
}

export function stopB2BVoiceAgent() {
  try {
    if (activePc) {
      activePc.getSenders?.().forEach((s) => s.track && s.track.stop());
      activePc.close?.();
    }
  } catch (_) {}
  try {
    if (activeStream) {
      activeStream.getTracks().forEach((t) => t.stop());
    }
  } catch (_) {}
  try {
    if (remoteAudioEl) {
      remoteAudioEl.srcObject = null;
    }
  } catch (_) {}
  try {
    if (monitorInterval) clearInterval(monitorInterval);
    if (audioCtx) audioCtx.close?.();
  } catch (_) {}

  audioCtx = null;
  localAnalyser = null;
  remoteAnalyser = null;
  localSource = null;
  remoteSource = null;
  activePc = null;
  activeStream = null;

  window.dispatchEvent(new CustomEvent("b2b-voice-agent-stopped"));
}

export function isB2BVoiceAgentActive() {
  return !!activePc;
}

export function toggleMicMute() {
  if (activeStream) {
    const track = activeStream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      return !track.enabled; // true if muted
    }
  }
  return false;
}

export function toggleSpeakerMute() {
  if (remoteAudioEl) {
    remoteAudioEl.muted = !remoteAudioEl.muted;
    return remoteAudioEl.muted; // true if muted
  }
  return false;
}

let localBuf = null;
let remoteBuf = null;

export function getAudioLevels() {
  if (!localAnalyser || !remoteAnalyser) return { localLevel: 0, remoteLevel: 0 };
  if (!localBuf) localBuf = new Uint8Array(localAnalyser.frequencyBinCount);
  if (!remoteBuf) remoteBuf = new Uint8Array(remoteAnalyser.frequencyBinCount);

  localAnalyser.getByteFrequencyData(localBuf);
  remoteAnalyser.getByteFrequencyData(remoteBuf);

  let sumL = 0;
  for (let i = 0; i < localBuf.length; i++) sumL += localBuf[i];
  let sumR = 0;
  for (let i = 0; i < remoteBuf.length; i++) sumR += remoteBuf[i];

  return {
    localLevel: sumL / localBuf.length,
    remoteLevel: sumR / remoteBuf.length
  };
}

function setupAudioMonitoring(localStream, remoteStream, { inactivityMs }) {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    localSource = audioCtx.createMediaStreamSource(localStream);
    remoteSource = audioCtx.createMediaStreamSource(remoteStream);
    localAnalyser = audioCtx.createAnalyser();
    remoteAnalyser = audioCtx.createAnalyser();
    localAnalyser.fftSize = 1024;
    remoteAnalyser.fftSize = 1024;
    localSource.connect(localAnalyser);
    remoteSource.connect(remoteAnalyser);
  } catch (e) {
    console.warn("Audio monitoring failed:", e);
  }
}
