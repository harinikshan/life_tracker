const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const reveal = document.getElementById("reveal");
const birthInput = document.getElementById("birth-date");
const lifespanInput = document.getElementById("lifespan");
const nextBtn = document.getElementById("next-btn");
const saveBtn = document.getElementById("save-btn");
const editBtn = document.getElementById("edit-btn");
const toggleBtn = document.getElementById("toggle-btn");
const error1 = document.getElementById("error1");
const error2 = document.getElementById("error2");
const lifePct = document.getElementById("life-pct");
const lifeRemaining = document.getElementById("life-remaining");
const dotsPreview = document.getElementById("dots-preview");
const { getDotSnapshot, getLifeSummary } = window.LifeDotsShared;

function renderDots(bd, ls) {
  dotsPreview.innerHTML = "";
  const dots = getDotSnapshot({ birthDate: bd, lifespan: ls });

  dots.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "preview-item" + (item.key === "minute" ? " is-minute" : "");

    const dot = document.createElement("div");
    dot.className = "preview-dot";
    dot.style.setProperty("--size", item.popupSize + "px");
    dot.style.setProperty("--ring-width", Math.max(2, Math.round(item.popupSize * 0.18)) + "px");
    dot.style.setProperty("--fill", item.percentage.toFixed(1));
    if (item.percentage <= 0) {
      dot.style.backgroundImage = 'none';
    } else {
      dot.style.backgroundImage = '';
    }

    const label = document.createElement("div");
    label.className = "preview-label";
    label.textContent = item.label;

    wrapper.appendChild(dot);
    wrapper.appendChild(label);
    dotsPreview.appendChild(wrapper);
  });
}

function showReveal(bd, ls, vis) {
  step1.style.display = "none";
  step2.style.display = "none";
  reveal.style.display = "block";

  const summary = getLifeSummary({ birthDate: bd, lifespan: ls });

  lifePct.textContent = summary.percentage.toFixed(2) + "%";
  lifeRemaining.textContent = summary.remainingDays.toLocaleString() + " days remaining";
  toggleBtn.textContent = vis ? "Hide" : "Show";
  renderDots(bd, ls);
}

// ── Init ──
chrome.storage.sync.get(
  ["birthDate", "expectedLifespan", "widgetVisible", "setupComplete"],
  (data) => {
    if (data.setupComplete && data.birthDate) {
      showReveal(data.birthDate, data.expectedLifespan || 80, data.widgetVisible !== false);
    }
  }
);

// ── Step 1 → Step 2 ──
nextBtn.addEventListener("click", () => {
  const bd = birthInput.value;
  if (!bd) { error1.textContent = "Pick a date."; return; }
  if (new Date(bd + "T00:00:00") > new Date()) { error1.textContent = "Not born yet?"; return; }
  error1.textContent = "";
  step1.style.display = "none";
  step2.style.display = "block";
});

// ── Step 2 → Save + Reveal ──
saveBtn.addEventListener("click", () => {
  const bd = birthInput.value;
  const ls = parseInt(lifespanInput.value, 10);
  if (!ls || ls < 1 || ls > 150) { error2.textContent = "1–150 years."; return; }
  error2.textContent = "";
  chrome.storage.sync.set({
    birthDate: bd, expectedLifespan: ls, setupComplete: true, widgetVisible: true
  }, () => showReveal(bd, ls, true));
});

// ── Edit ──
editBtn.addEventListener("click", () => {
  chrome.storage.sync.get(["birthDate", "expectedLifespan"], (data) => {
    reveal.style.display = "none";
    if (data.birthDate) birthInput.value = data.birthDate;
    if (data.expectedLifespan) lifespanInput.value = data.expectedLifespan;
    step1.style.display = "block";
  });
});

// ── Toggle ──
toggleBtn.addEventListener("click", () => {
  chrome.storage.sync.get(["widgetVisible"], (data) => {
    const v = data.widgetVisible === false;
    chrome.storage.sync.set({ widgetVisible: v }, () => {
      toggleBtn.textContent = v ? "Hide" : "Show";
    });
  });
});
