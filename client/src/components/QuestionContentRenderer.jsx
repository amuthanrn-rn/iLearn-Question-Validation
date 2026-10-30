import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

function normalizeMath(text = "") {
  if (!text) return "";
  let t = String(text);
  // Handle escaped delimiters
  t = t.replace(/\\\(/g, "$").replace(/\\\)/g, "$");
  t = t.replace(/\\\[/g, "$$").replace(/\\\]/g, "$$");
  // Fix broken \ce with newlines/spaces like \ce\nCHCl3 or \ce \n C H Cl 3
  t = t.replace(/\\ce\s*\n?\s*([A-Za-z0-9\s\+\-\(\)\[\]]{2,})/g, (m, p1) => {
    const clean = p1.replace(/\s+/g, "");
    return `\\ce{${clean}}`;
  });
  t = t.replace(/\\ce([A-Za-z0-9+\-\(\)\[\]]+)/g, (m, p1) => `\\ce{${p1}}`);
  t = t.replace(/\\ce\s+([A-Z][A-Za-z0-9]+)/g, (m, p1) => `\\ce{${p1}}`);
  // Handle cases where \ce appears multiple times
  return t;
}

function extractImages(text = "") {
  if (!text) return { text: "", images: [] };
  const images = [];
  let t = String(text);
  t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    images.push({ url: url.trim(), alt: alt || "" });
    return "";
  });
  t = t.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (match, url) => {
    images.push({ url: url.trim(), alt: "" });
    return "";
  });
  return { text: t.trim(), images };
}

function renderMathToHtml(math, displayMode) {
  try {
    return katex.renderToString(math, { throwOnError: false, displayMode, trust: true, strict: false });
  } catch (e) {
    try {
      return katex.renderToString(math, { throwOnError: false, displayMode });
    } catch (e2) {
      return math.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }
}

function renderWithMath(text = "") {
  if (!text) return text;
  let result = String(text);
  // Block math $$
  result = result.replace(/\$\$([\s\S]+?)\$\$/g, (m, math) => renderMathToHtml(math, true));
  // Inline math $ (avoid $$)
  result = result.replace(/(?<!\$)\$([^\$\n]+?)\$(?!\$)/g, (m, math) => renderMathToHtml(math, false));
  // \[ \]
  result = result.replace(/\\\[([\s\S]+?)\\\]/g, (m, math) => renderMathToHtml(math, true));
  // \( \)
  result = result.replace(/\\\(([^\)]+?)\\\)/g, (m, math) => renderMathToHtml(math, false));
  return result;
}

const QuestionContentRenderer = ({ content = "", showImages = true, className = "" }) => {
  if (content === null || content === undefined || content === "") return <span className={className}>Not available</span>;
  try {
    const normalized = normalizeMath(content);
    const { text, images } = extractImages(normalized);
    const rendered = renderWithMath(text);
    return (
      <div className={className}>
        <div dangerouslySetInnerHTML={{ __html: rendered.replace(/\n/g, "<br/>") }} />
        {showImages && images.map((img, idx) => (
          <img
            key={idx}
            src={img.url}
            alt={img.alt}
            className="mt-2 max-w-full h-auto object-contain rounded border border-gray-200"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ))}
      </div>
    );
  } catch (e) {
    return <span className={className}>{String(content)}</span>;
  }
};

export default QuestionContentRenderer;
