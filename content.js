(() => {
  if (document.getElementById("life-dots-host")) return;

  const { DOTS, getDotSnapshot } = window.LifeDotsShared;
  let birthDate = null;
  let lifespan = 80;
  let host = null;
  let shadow = null;
  let animId = null;
  let lastUpdate = 0;
  let dotEls = {};

  const CSS = `
    * { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes minutePulse {
      0%, 100% {
        transform: scale(1);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.08),
          0 4px 12px rgba(0, 0, 0, 0.3);
      }
      50% {
        transform: scale(1.04);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.12),
          0 6px 16px rgba(10, 132, 255, 0.2);
      }
    }

    .pill {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 16px 18px 12px;
      background:
        linear-gradient(180deg, rgba(18, 23, 31, 0.94) 0%, rgba(9, 12, 17, 0.96) 100%);
      backdrop-filter: blur(26px) saturate(1.35);
      -webkit-backdrop-filter: blur(26px) saturate(1.35);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      box-shadow:
        0 18px 40px rgba(0, 0, 0, 0.36),
        0 4px 12px rgba(0, 0, 0, 0.24),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
      user-select: none;
      -webkit-user-select: none;
      animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      opacity: 0;
    }

    .col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
    }

    .dot {
      position: relative;
      width: var(--s);
      height: var(--s);
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.12);
      background-image: conic-gradient(
        #0A84FF 0%, 
        #0A56B1 calc(var(--f) * 1%),
        transparent calc(var(--f) * 1%)
      );
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.1),
        0 8px 16px rgba(0, 0, 0, 0.25);
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                  border-color 0.2s ease,
                  box-shadow 0.2s ease;
    }

    .col:hover .dot {
      transform: translateY(-1px) scale(1.08);
      border-color: rgba(10, 132, 255, 0.4);
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.12),
        0 10px 24px rgba(10, 132, 255, 0.2),
        0 6px 12px rgba(0, 0, 0, 0.3);
    }

    .col.is-min .dot {
      animation: minutePulse 2.8s ease-in-out infinite;
    }

    .lbl {
      font-family: "SF Pro Text", "Inter", "Segoe UI", sans-serif;
      font-size: 10px;
      font-weight: 700;
      color: rgba(229, 237, 248, 0.85);
      letter-spacing: 0.5px;
      line-height: 1;
      transition: color 0.15s ease;
      text-transform: uppercase;
    }

    .col:hover .lbl {
      color: rgba(247, 251, 255, 0.78);
    }

    .tip {
      position: absolute;
      top: calc(100% + 12px);
      left: 50%;
      transform: translateX(-50%) translateY(-3px);
      background: rgba(18, 22, 28, 0.98);
      color: #ffffff;
      padding: 10px 14px;
      border-radius: 8px;
      font-family: "SF Pro Text", "Inter", "Segoe UI", sans-serif;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease, transform 0.15s ease;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
      z-index: 10;
      letter-spacing: 0.2px;
    }

    .tip::before {
      content: "";
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 5px solid transparent;
      border-bottom-color: rgba(18, 22, 28, 0.98);
    }

    .col:hover .tip {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    .tip-pct {
      color: rgba(224, 235, 248, 0.7);
      font-size: 11px;
      font-weight: 700;
      margin-left: 8px;
      font-variant-numeric: tabular-nums;
    }
  `;

  function createWidget() {
    if (host || !document.body) return;

    host = document.createElement("div");
    host.id = "life-dots-host";
    document.body.appendChild(host);

    shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = CSS;
    shadow.appendChild(style);

    const pill = document.createElement("div");
    pill.className = "pill";

    DOTS.forEach(({ key, label, widgetSize }) => {
      const col = document.createElement("div");
      col.className = "col" + (key === "minute" ? " is-min" : "");

      const dot = document.createElement("div");
      dot.className = "dot";
      dot.style.setProperty("--s", widgetSize + "px");
      dot.style.setProperty("--w", Math.max(3, Math.round(widgetSize * 0.18)) + "px");
      dot.style.setProperty("--f", "0");

      const lbl = document.createElement("div");
      lbl.className = "lbl";
      lbl.textContent = label;

      const tip = document.createElement("div");
      tip.className = "tip";
      tip.innerHTML = '<span class="tip-rem">--</span><span class="tip-pct">0%</span>';

      col.appendChild(dot);
      col.appendChild(lbl);
      col.appendChild(tip);
      pill.appendChild(col);

      dotEls[key] = { dot, tip };
    });

    shadow.appendChild(pill);
    startLoop();
  }

  function updateDots() {
    const dots = getDotSnapshot({ birthDate, lifespan });

    dots.forEach((item) => {
      const el = dotEls[item.key];
      if (!el) return;

      el.dot.style.setProperty("--f", item.percentage.toFixed(1));
      if (item.percentage <= 0) {
        el.dot.style.backgroundImage = 'none';
      } else {
        el.dot.style.backgroundImage = '';
      }

      const rem = el.tip.querySelector(".tip-rem");
      const pctEl = el.tip.querySelector(".tip-pct");
      if (rem) rem.textContent = item.remaining;
      if (pctEl) pctEl.textContent = item.percentage.toFixed(1) + "%";
    });
  }

  function tick(ts) {
    if (ts - lastUpdate >= 1000) {
      updateDots();
      lastUpdate = ts;
    }
    animId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (animId) return;
    updateDots();
    animId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function showWidget() {
    if (!host) return;
    host.style.display = "block";
    updateDots();
    startLoop();
  }

  function hideWidget() {
    if (!host) return;
    host.style.display = "none";
    stopLoop();
  }

  const obs = new MutationObserver(() => {
    if (host && !document.body.contains(host)) {
      stopLoop();
      host = null;
      shadow = null;
      dotEls = {};
      chrome.storage.sync.get(["setupComplete", "widgetVisible"], (data) => {
        if (data.setupComplete && data.widgetVisible !== false) createWidget();
      });
    }
  });

  if (document.body) {
    obs.observe(document.body, { childList: true });
  }

  chrome.storage.sync.get(
    ["birthDate", "expectedLifespan", "widgetVisible", "setupComplete"],
    (data) => {
      if (!data.setupComplete) return;
      birthDate = data.birthDate;
      lifespan = data.expectedLifespan || 80;
      if (data.widgetVisible !== false) createWidget();
    }
  );

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;

    if (changes.birthDate) birthDate = changes.birthDate.newValue;
    if (changes.expectedLifespan) lifespan = changes.expectedLifespan.newValue || 80;
    if (host) updateDots();

    if (changes.widgetVisible) {
      changes.widgetVisible.newValue ? (host ? showWidget() : createWidget()) : hideWidget();
    }

    if (changes.setupComplete && changes.setupComplete.newValue && !host) {
      chrome.storage.sync.get(["birthDate", "expectedLifespan"], (data) => {
        birthDate = data.birthDate;
        lifespan = data.expectedLifespan || 80;
        createWidget();
      });
    }
  });
})();
