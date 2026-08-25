import { useState } from "react";
import Head from "next/head";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGem,
  faPhone,
  faMicrophone
} from "@fortawesome/free-solid-svg-icons";
import VoiceAgentModal from "../components/VoiceAgentModal";

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Head>
        <title>Hare Krishna Group — B2B Diamond AI Voice Agent</title>
        <meta name="description" content="AI Voice Assistant for Hare Krishna Group B2B Diamond Trading Platform. Instant account verification, live diamond inventory search, and automated quotation emails." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        
        {/* Navigation Bar */}
        <header
          style={{
            padding: "20px 0",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(8, 12, 20, 0.8)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 100
          }}
        >
          <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#080c14",
                    fontSize: "22px",
                    boxShadow: "0 4px 20px rgba(212, 175, 55, 0.4)"
                  }}
                >
                  <FontAwesomeIcon icon={faGem} />
                </div>
                <div>
                  <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", letterSpacing: "1px", margin: 0 }}>
                    HARE KRISHNA GROUP
                  </h1>
                  <p style={{ fontSize: "12px", color: "var(--accent-gold)", margin: 0, fontWeight: 600 }}>
                    B2B Diamond AI Voice Agent
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <button
                  onClick={() => setShowModal(true)}
                  className="gold-gradient-btn"
                  style={{ padding: "12px 26px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <FontAwesomeIcon icon={faPhone} /> Start Voice Call
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{ padding: "100px 0 100px 0", flex: 1, display: "flex", alignItems: "center" }}>
          <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", width: "100%" }}>
            <div style={{ textAlign: "center", maxWidth: "860px", margin: "0 auto" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(212, 175, 55, 0.12)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  padding: "8px 20px",
                  borderRadius: "24px",
                  color: "var(--accent-gold)",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "24px"
                }}
              >
                <FontAwesomeIcon icon={faMicrophone} /> REALTIME VOICE AI FOR DIAMOND TRADERS
              </div>

              <h2
                style={{
                  fontSize: "48px",
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.2,
                  marginBottom: "24px",
                  letterSpacing: "-0.5px"
                }}
              >
                Experience the <span className="gold-gradient-text">Hare Krishna Group</span> B2B Voice Assistant
              </h2>

              <p
                style={{
                  fontSize: "18px",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                  marginBottom: "42px"
                }}
              >
                Verify your account by email and 4-digit OTP, search our live certified diamond inventory, and receive complete quotation specs directly to your email via natural voice conversation.
              </p>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => setShowModal(true)}
                  className="gold-gradient-btn"
                  style={{ padding: "18px 44px", fontSize: "18px", display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <FontAwesomeIcon icon={faPhone} /> Launch Voice Agent Call
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: "30px 0",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(8, 12, 20, 0.95)",
            textAlign: "center",
            fontSize: "13px",
            color: "var(--text-subtle)"
          }}
        >
          <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
            <p style={{ margin: "0 0 6px 0", color: "#ffffff", fontWeight: 600 }}>
              HARE KRISHNA GROUP &bull; B2B Diamond Manufacturers & Exporters
            </p>
            <p style={{ margin: 0 }}>
              Surat Vaults &bull; Mumbai Bharat Diamond Bourse &bull; Hong Kong &bull; Antwerp &bull; New York
            </p>
          </div>
        </footer>

        {/* Active Voice Call Modal */}
        {showModal && (
          <VoiceAgentModal
            onClose={() => setShowModal(false)}
          />
        )}

      </div>
    </>
  );
}
