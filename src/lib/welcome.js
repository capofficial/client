/*
 * Welcome / onboarding modal for first-time users (issue #13).
 *
 * - Auto-opens the first time a user opens the dashboard (localStorage flag).
 * - Adds a floating '?' button that reopens the guide at any time.
 * - Explains what CAP is, how to use the dashboard and how to bridge USDC
 *   from Arbitrum. Pass initWelcome({ openBridge }) to wire the bridge
 *   button to an in-app bridge panel; otherwise the hosted bridge URL is
 *   opened in a new tab.
 *
 * Self-contained vanilla DOM implementation, no new dependencies. Importing
 * this module from src/main.js is the only integration needed: it
 * initializes itself once the DOM is ready.
 */

const STORAGE_KEY = 'cap_welcome_seen_v1';
const DEFAULT_BRIDGE_URL = 'https://app.cap.trade/bridge';
const DOCS_URL = 'https://docs.cap.trade';

let opts = { bridgeUrl: DEFAULT_BRIDGE_URL };
let styleEl = null;
let overlayEl = null;
let helpBtnEl = null;
let lastFocused = null;

function hasSeen() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch (e) {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch (e) {
    /* storage unavailable (private mode): modal will show again next visit */
  }
}

const CSS = `
.cw-overlay{position:fixed;inset:0;z-index:9998;display:flex;align-items:center;justify-content:center;
  padding:16px;background:rgba(5,8,12,.72);backdrop-filter:blur(3px);}
.cw-card{position:relative;width:min(640px,100%);max-height:min(84vh,760px);overflow:auto;
  padding:26px 28px 20px;border-radius:12px;border:1px solid #24334a;
  background:var(--cap-modal-bg,#0e1522);color:var(--cap-text,#e7edf5);
  box-shadow:0 24px 64px rgba(0,0,0,.5);
  font:14px/1.55 system-ui,-apple-system,'Segoe UI',sans-serif;}
.cw-card h2{margin:0 0 8px;font-size:20px;color:#fff;}
.cw-card h3{margin:20px 0 6px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#16c784;}
.cw-card p{margin:6px 0;color:#c3cfdd;}
.cw-lede{font-size:15px;}
.cw-steps{margin:6px 0 0;padding-left:20px;color:#c3cfdd;}
.cw-steps li{margin:4px 0;}
.cw-steps strong{color:#fff;}
.cw-close{position:absolute;top:10px;right:12px;border:0;background:none;color:#8fa1b8;
  font-size:22px;line-height:1;cursor:pointer;padding:4px 8px;}
.cw-close:hover{color:#fff;}
.cw-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px;}
.cw-btn{display:inline-flex;align-items:center;justify-content:center;padding:9px 16px;
  border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;cursor:pointer;
  border:1px solid transparent;}
.cw-btn-primary{background:#16c784;color:#04281b;}
.cw-btn-primary:hover{background:#12b478;}
.cw-btn-ghost{background:transparent;border-color:#2c3d57;color:#e7edf5;}
.cw-btn-ghost:hover{border-color:#16c784;color:#fff;}
.cw-hint{margin-top:18px;font-size:12px;color:#8fa1b8;}
.cw-help-btn{position:fixed;right:18px;bottom:18px;z-index:9997;width:42px;height:42px;
  border-radius:50%;border:1px solid #24334a;background:#0e1522;color:#16c784;
  font-size:19px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.4);}
.cw-help-btn:hover{border-color:#16c784;color:#fff;}
.cw-btn:focus-visible,.cw-close:focus-visible,.cw-help-btn:focus-visible{
  outline:2px solid #16c784;outline-offset:2px;}
`;

function ensureStyles() {
  if (styleEl || typeof document === 'undefined') return;
  styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);
}

function modalHtml() {
  return `
    <button class='cw-close' type='button' data-cw-close aria-label='Close welcome guide'>&times;</button>
    <h2 id='cw-title'>Welcome to CAP</h2>
    <p class='cw-lede'>CAP is a permissionless perpetuals exchange. Trade perps straight from your
    wallet with deep liquidity, low fees and no custody risk — your funds never leave your control.</p>

    <h3>Using the dashboard</h3>
    <ol class='cw-steps'>
      <li><strong>Connect your wallet</strong> in the top-right corner.</li>
      <li><strong>Pick a market</strong> from the markets list — prices stream in live.</li>
      <li><strong>Set size and leverage</strong>, choose long or short, and open the trade.</li>
      <li><strong>Track everything</strong> — open positions, PnL, orders and history update in real time.</li>
    </ol>

    <h3>Bridging funds from Arbitrum</h3>
    <p>Positions on CAP are collateralised with USDC. If your funds are still on Arbitrum, use the
    bridge — it takes only a few minutes:</p>
    <ol class='cw-steps'>
      <li>Click <strong>Open bridge</strong> below.</li>
      <li>Enter the amount of USDC to move and confirm the transaction in your wallet.</li>
      <li>Once the transfer settles, your balance shows up here automatically.</li>
    </ol>

    <div class='cw-actions'>
      <button class='cw-btn cw-btn-primary' type='button' data-cw-bridge>Open bridge</button>
      <button class='cw-btn cw-btn-ghost' type='button' data-cw-close>Start trading</button>
      <a class='cw-btn cw-btn-ghost' href='${DOCS_URL}' target='_blank' rel='noopener noreferrer'>Read the docs</a>
    </div>
    <p class='cw-hint'>You can reopen this guide at any time with the <strong>?</strong> button in the corner.</p>
  `;
}

function onKeydown(e) {
  if (e.key === 'Escape') closeWelcome();
}

export function openWelcome() {
  if (typeof document === 'undefined' || overlayEl) return;
  ensureStyles();
  lastFocused = document.activeElement;

  overlayEl = document.createElement('div');
  overlayEl.className = 'cw-overlay';
  overlayEl.innerHTML =
    "<div class='cw-card' role='dialog' aria-modal='true' aria-labelledby='cw-title'>" +
    modalHtml() +
    '</div>';
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeWelcome();
  });
  overlayEl.querySelectorAll('[data-cw-close]').forEach((btn) =>
    btn.addEventListener('click', closeWelcome)
  );
  const bridgeBtn = overlayEl.querySelector('[data-cw-bridge]');
  if (bridgeBtn) {
    bridgeBtn.addEventListener('click', () => {
      if (typeof opts.openBridge === 'function') {
        opts.openBridge();
        closeWelcome();
      } else {
        window.open(opts.bridgeUrl || DEFAULT_BRIDGE_URL, '_blank', 'noopener');
      }
    });
  }

  document.body.appendChild(overlayEl);
  document.addEventListener('keydown', onKeydown);
  if (bridgeBtn) bridgeBtn.focus();
}

export function closeWelcome() {
  if (!overlayEl) return;
  document.removeEventListener('keydown', onKeydown);
  overlayEl.remove();
  overlayEl = null;
  markSeen();
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  lastFocused = null;
}

function ensureHelpButton() {
  if (helpBtnEl || typeof document === 'undefined') return;
  ensureStyles();
  helpBtnEl = document.createElement('button');
  helpBtnEl.type = 'button';
  helpBtnEl.className = 'cw-help-btn';
  helpBtnEl.setAttribute('aria-label', 'Open the getting-started guide');
  helpBtnEl.title = 'Getting started';
  helpBtnEl.textContent = '?';
  helpBtnEl.addEventListener('click', () => openWelcome());
  document.body.appendChild(helpBtnEl);
}

export function initWelcome(userOpts = {}) {
  if (typeof document === 'undefined') return;
  Object.assign(opts, userOpts);
  ensureStyles();
  ensureHelpButton();
  if (!hasSeen()) openWelcome();
}

function boot() {
  initWelcome();
}

// Self-initialize on DOM ready so a single import in src/main.js is enough.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
}
