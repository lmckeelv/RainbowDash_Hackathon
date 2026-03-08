import React from "react";

export default function EmailPreview({ html }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Preview</h3>
      <iframe
        title="email-preview"
        srcDoc={html}
        style={{
          width: "100%",
          height: "400px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          background: "white"
        }}
      />
    </div>
  );
}