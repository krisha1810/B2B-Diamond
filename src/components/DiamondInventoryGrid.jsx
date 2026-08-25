import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGem,
  faCertificate,
  faPaperPlane,
  faLocationDot,
  faCheck,
  faDownload
} from "@fortawesome/free-solid-svg-icons";

export default function DiamondInventoryGrid({ diamonds, onSendEmail }) {
  const [emailSending, setEmailSending] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const defaultDiamonds = [
    {
      id: "HKG-D-1051",
      lotNo: "HK-84920",
      shape: "Round",
      carat: 1.08,
      color: "D",
      clarity: "VVS1",
      cut: "Ideal",
      polish: "Excellent",
      symmetry: "Excellent",
      lab: "GIA",
      certNo: "24891024",
      totalPrice: 8424,
      discount: "-12%",
      availability: "Available",
      location: "Surat Vault A-14"
    },
    {
      id: "HKG-D-1152",
      lotNo: "HK-84925",
      shape: "Round",
      carat: 1.15,
      color: "D",
      clarity: "VVS2",
      cut: "Excellent",
      polish: "Excellent",
      symmetry: "Excellent",
      lab: "GIA",
      certNo: "51928401",
      totalPrice: 8625,
      discount: "-14%",
      availability: "Available",
      location: "Mumbai Trading Hub"
    },
    {
      id: "HKG-D-1223",
      lotNo: "HK-85104",
      shape: "Round",
      carat: 1.22,
      color: "D",
      clarity: "VVS1",
      cut: "Ideal",
      polish: "Excellent",
      symmetry: "Excellent",
      lab: "GIA",
      certNo: "63920194",
      totalPrice: 9882,
      discount: "-10%",
      availability: "Available",
      location: "Surat Vault B-02"
    },
    {
      id: "HKG-D-1284",
      lotNo: "HK-85210",
      shape: "Round",
      carat: 1.28,
      color: "D",
      clarity: "VVS2",
      cut: "Excellent",
      polish: "Excellent",
      symmetry: "Excellent",
      lab: "GIA",
      certNo: "74019284",
      totalPrice: 10112,
      discount: "-11%",
      availability: "Available",
      location: "Hong Kong Showroom"
    }
  ];

  const items = Array.isArray(diamonds) && diamonds.length > 0 ? diamonds : defaultDiamonds;

  const handleSendEmailClick = async () => {
    setEmailSending(true);
    try {
      if (onSendEmail) {
        await onSendEmail(items);
      } else {
        await fetch("/api/diamonds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "send_email", email: "alkesh@gmail.com", diamonds: items })
        });
      }
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (e) {
      console.error("Failed to email diamonds:", e);
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div style={{ marginTop: "32px" }}>
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
            Live Diamond Inventory
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0 0" }}>
            Round Shape &bull; D Color &bull; VVS Clarity &bull; 1.05 to 1.30 Carats
          </p>
        </div>

        <button
          onClick={handleSendEmailClick}
          disabled={emailSending}
          className="gold-gradient-btn"
          style={{
            padding: "10px 20px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <FontAwesomeIcon icon={emailSuccess ? faCheck : faPaperPlane} />
          {emailSending ? "Sending Email..." : emailSuccess ? "Sent to alkesh@gmail.com!" : "Email Complete Quotation"}
        </button>
      </div>

      {/* Grid of cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px"
        }}
      >
        {items.map((item) => (
          <div
            key={item.id || item.lotNo}
            className="glass-panel"
            style={{
              padding: "20px",
              border: "1px solid rgba(212, 175, 55, 0.2)",
              transition: "transform 0.3s ease, border-color 0.3s ease",
              position: "relative"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "var(--accent-gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.2)";
            }}
          >
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span
                style={{
                  background: "rgba(212, 175, 55, 0.15)",
                  color: "var(--accent-gold)",
                  border: "1px solid rgba(212, 175, 55, 0.3)",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "12px"
                }}
              >
                {item.lotNo}
              </span>
              <span style={{ fontSize: "11px", color: "var(--accent-green)", fontWeight: 600 }}>
                {item.discount} Rap
              </span>
            </div>

            {/* Diamond Shape & Weight */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "radial-gradient(circle, rgba(56, 189, 248, 0.2), rgba(15, 23, 42, 0.9))",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-cyan)",
                  fontSize: "22px"
                }}
              >
                <FontAwesomeIcon icon={faGem} />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  {item.carat.toFixed(2)} Carats
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                  {item.shape} &bull; {item.color} / {item.clarity}
                </p>
              </div>
            </div>

            {/* Spec Attributes */}
            <div
              style={{
                background: "rgba(8, 12, 20, 0.6)",
                borderRadius: "10px",
                padding: "10px 12px",
                fontSize: "12px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
                marginBottom: "16px",
                color: "#cbd5e1"
              }}
            >
              <div>Cut: <strong style={{ color: "#fff" }}>{item.cut}</strong></div>
              <div>Polish: <strong style={{ color: "#fff" }}>{item.polish}</strong></div>
              <div>Lab: <strong style={{ color: "var(--accent-cyan)" }}>{item.lab}</strong></div>
              <div>Cert #: <strong style={{ color: "#fff" }}>{item.certNo}</strong></div>
            </div>

            {/* Pricing & Vault location */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "var(--text-subtle)", textTransform: "uppercase" }}>Total Wholesale Price</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#4ade80" }}>
                  ${item.totalPrice.toLocaleString()}
                </div>
              </div>

              <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "right" }}>
                <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: "4px", color: "var(--accent-gold)" }} />
                {item.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
