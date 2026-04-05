# LifeTracker Chrome Extension

[![LifeTracker Demo on YouTube](https://img.youtube.com/vi/MZS_73k0_tI/0.jpg)](https://youtu.be/MZS_73k0_tI)

👉 **Watch the full demo on YouTube here: [https://youtu.be/MZS_73k0_tI](https://youtu.be/MZS_73k0_tI)** 👈

**LifeTracker** is a minimalist, gorgeous Chrome Extension that serves as a powerful, constant reminder of the fleeting nature of time. It injects a sleek widget into your active browser tabs, tracking 7 distinct time scales: **Lifetime, Year, Month, Week, Day, Hour, and Minute**.

---

## 🎯 The Philosophy: Why is it useful?
In the modern world, it's incredibly easy to lose hours endlessly scrolling on YouTube, Reddit, or Twitter. LifeTracker breaks this cycle by providing a visual, real-time reality check. 

By placing extremely clean, unobtrusive progress "pie charts" in the corner of your screen, you are forced to consciously acknowledge the passing of time without feeling overwhelmed. 

### 🌟 Core Features
- **Macro to Micro Tracking:** Ranges from your entire lifetime down to the very minute.
- **PM-Grade Design:** We designed the UI holding true to strict product management standards: high-contrast, perfect legibility, realistic shadows, and distraction-free Apple-like aesthetics.
- **Non-Intrusive:** The translucent widget floats elegantly in your browser without breaking the flow of standard websites.
- **Privacy First:** 100% of your data (birth date, lifespan) is stored strictly in your local Chrome `sync` storage. No external servers or telemetry.
- **Smart Rendering:** Only injects itself once per tab and gracefully handles responsive layout changes.

---

## 🛠️ Technology Stack
LifeTracker is beautifully simple and relies entirely on native browser features with zero external libraries or dependencies:
- **Vanilla JavaScript (ES6+):** For logic, time parsing, and DOM injection.
- **Vanilla CSS3:** Utilizing cutting-edge `conic-gradient`, `mask-image`, and glassmorphism styling (`backdrop-filter`) for premium aesthetics.
- **Chrome Extension Manifest V3:** Fully compliant with Google's latest secure extension standards.

---

## 🚀 Installation (Developer Mode)

1. **Clone or download** this repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/life_tracker.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (the toggle switch in the top right corner).
4. Click **Load unpacked** in the top left corner.
5. Select your cloned `life_tracker` directory.
6. The extension is now installed! **Pin it** to your browser toolbar to get started.

---

## 🖥️ Usage Guide

1. **Initial Setup:** Click the LifeTracker extension icon in your Chrome toolbar.
2. **Enter Dates:** Enter your birth date and your expected lifespan (global average is ~73 years).
3. **Launch:** Click **"See your time"**.
4. **Daily Browsing:** Navigate to any standard website to see your live time widget resting in the top right corner. 
5. **Tooltips:** Hover over any circular dot to view detailed tooltip information (exact percentages and time left).
6. **Watch it Tick:** Watch the **MIN** dot smoothly fill up and pulse to gracefully remind you to stay focused in the present!

---

## 📁 File Structure Reference
If you're a developer exploring the code, here's how things are laid out:
- `manifest.json`: The V3 extension manifest declaring permissions and scripts.
- `popup.html` & `popup.js`: Controls the UI you see when you click the extension icon initially.
- `content.js`: The core script that injects the floating widget onto the websites you visit.
- `shared.js`: Holds all the beautiful mathematical logic formatting progress from lifetimes to minutes.
- `popup.css` & `content.css`: The styling rules ensuring the extension looks gorgeous and strictly PM-grade.

## 🔧 Troubleshooting
- **Widget not appearing?** Try refreshing the web page (F5). Chrome disables content scripts on special pages like `chrome://newtab` or the Web Store.
- **Dots look full/empty incorrectly?** Open the extension popup, click "Edit", and ensure your birth date is correct.
