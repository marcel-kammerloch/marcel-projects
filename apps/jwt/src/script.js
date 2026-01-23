"use strict";

// Utility functions
const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

const extractJWT = (text) => {
  const jwtRegex = /(eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*)/;
  const match = text.match(jwtRegex);
  return match ? match[1] : null;
};

const base64UrlDecode = (str) => {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const decoded = atob(base64);
    return decodeURIComponent(
      decoded
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
  } catch (e) {
    return null;
  }
};

const parseJWT = (token) => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const header = base64UrlDecode(parts[0]);
    const payload = base64UrlDecode(parts[1]);

    if (!header || !payload) return null;

    return {
      header: JSON.parse(header),
      payload: JSON.parse(payload),
      signature: parts[2],
    };
  } catch (e) {
    return null;
  }
};

// DOM creation helpers
const createSpan = (className, text) => {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
};

const formatJSON = (obj) => {
  const container = document.createDocumentFragment();

  const openBrace = document.createTextNode("{\n");
  container.appendChild(openBrace);

  const entries = Object.entries(obj);
  entries.forEach(([key, value], index) => {
    const indent = document.createTextNode("  ");
    container.appendChild(indent);

    const keySpan = createSpan("json-key", `"${key}"`);
    container.appendChild(keySpan);

    const colon = document.createTextNode(": ");
    container.appendChild(colon);

    let valueSpan;
    if (typeof value === "string") {
      valueSpan = createSpan("json-string", `"${value}"`);
    } else if (typeof value === "number") {
      valueSpan = createSpan("json-number", String(value));
    } else if (typeof value === "boolean") {
      valueSpan = createSpan("json-boolean", String(value));
    } else if (value === null) {
      valueSpan = document.createTextNode("null");
    } else {
      valueSpan = document.createTextNode(JSON.stringify(value));
    }
    container.appendChild(valueSpan);

    if (index < entries.length - 1) {
      const comma = document.createTextNode(",");
      container.appendChild(comma);
    }

    const newline = document.createTextNode("\n");
    container.appendChild(newline);
  });

  const closeBrace = document.createTextNode("}");
  container.appendChild(closeBrace);

  return container;
};

const highlightEncodedText = (text) => {
  const jwt = extractJWT(text);
  const container = document.createDocumentFragment();

  if (!jwt) {
    const span = createSpan("dimmed", text);
    container.appendChild(span);
    return container;
  }

  const parts = jwt.split(".");
  const jwtIndex = text.indexOf(jwt);

  if (jwtIndex > 0) {
    const before = createSpan("dimmed", text.substring(0, jwtIndex));
    container.appendChild(before);
  }

  const header = createSpan("jwt-header", parts[0]);
  container.appendChild(header);

  const dot1 = document.createTextNode(".");
  container.appendChild(dot1);

  const payload = createSpan("jwt-payload", parts[1]);
  container.appendChild(payload);

  const dot2 = document.createTextNode(".");
  container.appendChild(dot2);

  const signature = createSpan("jwt-signature", parts[2]);
  container.appendChild(signature);

  if (jwtIndex + jwt.length < text.length) {
    const after = createSpan("dimmed", text.substring(jwtIndex + jwt.length));
    container.appendChild(after);
  }

  return container;
};

const updateDisplay = () => {
  const textarea = document.getElementById("encodedTextarea");
  const text = textarea.value;

  // Update syntax highlighting
  const highlightDiv = document.getElementById("encodedHighlight");
  highlightDiv.textContent = "";
  highlightDiv.appendChild(highlightEncodedText(text));

  // Parse JWT
  const jwt = extractJWT(text);
  const headerContent = document.getElementById("headerContent");
  const payloadContent = document.getElementById("payloadContent");

  headerContent.textContent = "";
  payloadContent.textContent = "";

  if (jwt) {
    const parsed = parseJWT(jwt);
    if (parsed) {
      headerContent.appendChild(formatJSON(parsed.header));
      payloadContent.appendChild(formatJSON(parsed.payload));
    } else {
      headerContent.textContent = "Invalid JWT";
      payloadContent.textContent = "Invalid JWT";
    }
  }
};

const syncScroll = () => {
  const textarea = document.getElementById("encodedTextarea");
  const highlight = document.getElementById("encodedHighlight");
  highlight.scrollTop = textarea.scrollTop;
  highlight.scrollLeft = textarea.scrollLeft;
};

const copyToClipboard = (elementId) => {
  const element = document.getElementById(elementId);
  const text = element.textContent;

  if (!navigator.clipboard) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      showCopySuccess(elementId);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
    document.body.removeChild(textArea);
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      showCopySuccess(elementId);
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
    });
};

const showCopySuccess = (elementId) => {
  const element = document.getElementById(elementId);
  const btn = element.parentElement.querySelector(".copy-btn");
  const originalText = btn.textContent;
  btn.textContent = "COPIED!";
  setTimeout(() => {
    btn.textContent = originalText;
  }, 2000);
};

// Initialize
const init = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const text = urlParams.get("t") || "";

  const textarea = document.getElementById("encodedTextarea");
  textarea.value = text;

  // Initial display
  updateDisplay();

  // Event listeners
  textarea.addEventListener("input", updateDisplay);
  textarea.addEventListener("scroll", syncScroll);

  const copyHeaderBtn = document.getElementById("copyHeaderBtn");
  copyHeaderBtn.addEventListener("click", () => {
    copyToClipboard("headerContent");
  });

  const copyPayloadBtn = document.getElementById("copyPayloadBtn");
  copyPayloadBtn.addEventListener("click", () => {
    copyToClipboard("payloadContent");
  });
};

// Start the application
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
