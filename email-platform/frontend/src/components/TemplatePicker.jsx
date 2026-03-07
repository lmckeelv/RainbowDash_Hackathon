export default function TemplatePicker({ selectedTemplate, onSelect }) {
  const templates = ["promo", "newsletter", "announcement"];

  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
      {templates.map((template) => (
        <button
          key={template}
          onClick={() => onSelect(template)}
          style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: selectedTemplate === template ? "2px solid #2563eb" : "1px solid #ccc",
            background: selectedTemplate === template ? "#eff6ff" : "white",
            cursor: "pointer"
          }}
        >
          {template.charAt(0).toUpperCase() + template.slice(1)}
        </button>
      ))}
    </div>
  );
}