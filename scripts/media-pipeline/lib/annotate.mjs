/**
 * Professional-quality screenshot annotation system.
 * Injects styled DOM elements into Playwright pages for annotated captures.
 */

/** Inject the shared annotation stylesheet */
export async function initAnnotations(page) {
  await page.evaluate(() => {
    if (document.getElementById("shelf-annotations-style")) return;
    const style = document.createElement("style");
    style.id = "shelf-annotations-style";
    style.textContent = `
      .sa-overlay {
        position: fixed; inset: 0; z-index: 90000;
        background: rgba(0,0,0,0.35);
        pointer-events: none;
        transition: opacity 0.3s;
      }
      .sa-spotlight {
        position: fixed; z-index: 90001;
        border-radius: 10px;
        box-shadow: 0 0 0 4000px rgba(0,0,0,0.35);
        pointer-events: none;
      }
      .sa-callout {
        position: fixed; z-index: 90010;
        background: rgba(255,255,255,0.95);
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(0,0,0,0.08);
        border-radius: 10px;
        padding: 10px 16px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08);
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        max-width: 280px;
      }
      .sa-callout-label {
        font-size: 11px; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.8px; margin-bottom: 3px;
        color: #ea580c;
      }
      .sa-callout-text {
        font-size: 13.5px; font-weight: 500; line-height: 1.4;
        color: #1a1a1a;
      }
      .sa-step {
        position: fixed; z-index: 90012;
        width: 32px; height: 32px; border-radius: 50%;
        background: #ea580c; color: #fff;
        font-family: -apple-system, sans-serif;
        font-size: 15px; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 10px rgba(234,88,12,0.35), 0 0 0 3px rgba(255,255,255,0.9);
        pointer-events: none;
      }
      .sa-ring {
        position: fixed; z-index: 90002;
        border: 2.5px solid #ea580c;
        border-radius: 10px;
        box-shadow: 0 0 0 4px rgba(234,88,12,0.1);
        pointer-events: none;
      }
      .sa-arrow {
        position: fixed; z-index: 90011;
        pointer-events: none;
      }
      .sa-arrow line {
        stroke: #ea580c; stroke-width: 2;
        stroke-dasharray: 6 3;
      }
      .sa-arrow polygon {
        fill: #ea580c;
      }
      .sa-caption {
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 90015;
        background: rgba(15,15,15,0.85);
        backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        padding: 14px 28px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        font-size: 14px; font-weight: 500; color: #fff;
        letter-spacing: 0.1px;
        display: flex; align-items: center; gap: 10px;
        pointer-events: none;
        border-top: 1px solid rgba(255,255,255,0.08);
      }
      .sa-caption-icon {
        width: 20px; height: 20px; border-radius: 5px;
        background: #ea580c; color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 800; flex-shrink: 0;
      }
    `;
    document.head.appendChild(style);
  });
}

/**
 * Highlight an element with a ring and optional spotlight (dims the rest).
 */
export async function highlight(page, selector, options = {}) {
  await page.evaluate(
    ({ selector, spotlight, padding }) => {
      const el = selector.startsWith("text:")
        ? Array.from(document.querySelectorAll("*")).find(
            (e) =>
              e.textContent?.trim() === selector.slice(5) &&
              e.offsetParent !== null &&
              e.getBoundingClientRect().width > 0 &&
              e.getBoundingClientRect().width < 500
          )
        : document.querySelector(selector);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const pad = padding || 6;

      // Ring around element
      const ring = document.createElement("div");
      ring.className = "sa-ring sa-annotation";
      ring.style.top = `${rect.top - pad}px`;
      ring.style.left = `${rect.left - pad}px`;
      ring.style.width = `${rect.width + pad * 2}px`;
      ring.style.height = `${rect.height + pad * 2}px`;
      document.body.appendChild(ring);

      // Optional spotlight (dims everything else)
      if (spotlight) {
        const s = document.createElement("div");
        s.className = "sa-spotlight sa-annotation";
        s.style.top = `${rect.top - pad - 4}px`;
        s.style.left = `${rect.left - pad - 4}px`;
        s.style.width = `${rect.width + pad * 2 + 8}px`;
        s.style.height = `${rect.height + pad * 2 + 8}px`;
        document.body.appendChild(s);
      }
    },
    { selector, spotlight: options.spotlight || false, padding: options.padding }
  );
}

/**
 * Add a professional callout with optional label, arrow from callout to element.
 */
export async function callout(page, selector, text, options = {}) {
  await page.evaluate(
    ({ selector, text, label, side, color }) => {
      const el = selector.startsWith("text:")
        ? Array.from(document.querySelectorAll("*")).find(
            (e) =>
              e.textContent?.trim() === selector.slice(5) &&
              e.offsetParent !== null &&
              e.getBoundingClientRect().width > 0 &&
              e.getBoundingClientRect().width < 500
          )
        : document.querySelector(selector);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const s = side || "right";

      // Callout box
      const box = document.createElement("div");
      box.className = "sa-callout sa-annotation";

      let calloutTop, calloutLeft;
      const gap = 16;
      if (s === "right") {
        calloutTop = rect.top + rect.height / 2 - 24;
        calloutLeft = rect.right + gap;
      } else if (s === "left") {
        calloutTop = rect.top + rect.height / 2 - 24;
        calloutLeft = rect.left - gap - 260;
      } else if (s === "top") {
        calloutTop = rect.top - gap - 56;
        calloutLeft = rect.left + rect.width / 2 - 130;
      } else if (s === "bottom") {
        calloutTop = rect.bottom + gap;
        calloutLeft = rect.left + rect.width / 2 - 130;
      }

      // Clamp to viewport
      calloutLeft = Math.max(12, Math.min(calloutLeft, window.innerWidth - 292));
      calloutTop = Math.max(12, Math.min(calloutTop, window.innerHeight - 80));

      box.style.top = `${calloutTop}px`;
      box.style.left = `${calloutLeft}px`;

      let html = "";
      if (label) {
        html += `<div class="sa-callout-label" style="${color ? `color:${color}` : ""}">${label}</div>`;
      }
      html += `<div class="sa-callout-text">${text}</div>`;
      box.innerHTML = html;
      document.body.appendChild(box);

      // Draw dashed arrow from callout to element
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "sa-arrow sa-annotation");
      svg.style.top = "0";
      svg.style.left = "0";
      svg.style.width = window.innerWidth + "px";
      svg.style.height = window.innerHeight + "px";

      // Arrow start (from callout edge)
      let startX, startY, endX, endY;
      const calloutRect = { top: calloutTop, left: calloutLeft, width: 260, height: 50 };

      if (s === "right") {
        startX = calloutLeft - 2;
        startY = calloutTop + 24;
        endX = rect.right + 4;
        endY = rect.top + rect.height / 2;
      } else if (s === "left") {
        startX = calloutLeft + 260 + 2;
        startY = calloutTop + 24;
        endX = rect.left - 4;
        endY = rect.top + rect.height / 2;
      } else if (s === "top") {
        startX = calloutLeft + 130;
        startY = calloutTop + 56 + 2;
        endX = rect.left + rect.width / 2;
        endY = rect.top - 4;
      } else if (s === "bottom") {
        startX = calloutLeft + 130;
        startY = calloutTop - 2;
        endX = rect.left + rect.width / 2;
        endY = rect.bottom + 4;
      }

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", startX);
      line.setAttribute("y1", startY);
      line.setAttribute("x2", endX);
      line.setAttribute("y2", endY);
      if (color) line.setAttribute("stroke", color);
      svg.appendChild(line);

      // Arrowhead at end
      const angle = Math.atan2(endY - startY, endX - startX);
      const headLen = 8;
      const p1x = endX - headLen * Math.cos(angle - 0.4);
      const p1y = endY - headLen * Math.sin(angle - 0.4);
      const p2x = endX - headLen * Math.cos(angle + 0.4);
      const p2y = endY - headLen * Math.sin(angle + 0.4);
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      poly.setAttribute("points", `${endX},${endY} ${p1x},${p1y} ${p2x},${p2y}`);
      if (color) poly.setAttribute("fill", color);
      svg.appendChild(poly);

      document.body.appendChild(svg);
    },
    {
      selector,
      text,
      label: options.label,
      side: options.side || "right",
      color: options.color,
    }
  );
}

/**
 * Add a numbered step badge near an element.
 */
export async function step(page, selector, number, options = {}) {
  await page.evaluate(
    ({ selector, number, side }) => {
      const el = selector.startsWith("text:")
        ? Array.from(document.querySelectorAll("*")).find(
            (e) =>
              e.textContent?.trim() === selector.slice(5) &&
              e.offsetParent !== null &&
              e.getBoundingClientRect().width > 0 &&
              e.getBoundingClientRect().width < 500
          )
        : document.querySelector(selector);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const badge = document.createElement("div");
      badge.className = "sa-step sa-annotation";

      const s = side || "top-left";
      if (s === "top-left") {
        badge.style.top = `${rect.top - 14}px`;
        badge.style.left = `${rect.left - 14}px`;
      } else if (s === "top-right") {
        badge.style.top = `${rect.top - 14}px`;
        badge.style.left = `${rect.right - 18}px`;
      } else if (s === "left") {
        badge.style.top = `${rect.top + rect.height / 2 - 16}px`;
        badge.style.left = `${rect.left - 40}px`;
      }

      badge.textContent = number;
      document.body.appendChild(badge);
    },
    { selector, number, side: options.side }
  );
}

/**
 * Add a caption bar at the bottom with step indicator.
 */
export async function caption(page, text, stepNumber) {
  await page.evaluate(
    ({ text, stepNumber }) => {
      const bar = document.createElement("div");
      bar.className = "sa-caption sa-annotation";
      bar.innerHTML = `
        ${stepNumber ? `<div class="sa-caption-icon">${stepNumber}</div>` : ""}
        <span>${text}</span>
      `;
      document.body.appendChild(bar);
    },
    { text, stepNumber }
  );
}

/**
 * Show a full-screen chapter card (dark background, title, subtitle).
 * Used to separate sections in video recordings.
 */
export async function chapterCard(page, title, subtitle, duration = 3000) {
  await page.evaluate(
    ({ title, subtitle }) => {
      const card = document.createElement("div");
      card.className = "sa-annotation";
      card.style.cssText =
        "position:fixed;inset:0;z-index:99999;background:#0a0a0a;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.4s ease;";
      card.innerHTML = `
        <div style="text-align:center;opacity:0;transform:translateY(16px);transition:all 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s;">
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:#ea580c;margin-bottom:14px;">${title}</div>
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:36px;font-weight:700;color:#fff;letter-spacing:-1px;line-height:1.3;max-width:600px;">${subtitle}</div>
        </div>
      `;
      document.body.appendChild(card);
      requestAnimationFrame(() => {
        card.style.opacity = "1";
        card.querySelector("div > div").style.opacity = "1";
        card.querySelector("div > div").style.transform = "translateY(0)";
      });
    },
    { title, subtitle }
  );
  await page.waitForTimeout(duration);

  // Fade out
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.sa-annotation[style*="inset:0"]');
    cards.forEach((c) => (c.style.opacity = "0"));
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.sa-annotation[style*="inset:0"]');
    cards.forEach((c) => c.remove());
  });
}

/**
 * Remove all annotations from the page.
 */
export async function clearAll(page) {
  await page.evaluate(() => {
    document.querySelectorAll(".sa-annotation").forEach((el) => el.remove());
  });
}
