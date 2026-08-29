import { get } from 'svelte/store'
import { parseError } from './errors'
import { generateTradeShareImage } from './utils.js';
import { activeModal, toasts, showMarkets, activeError, showMobileNav } from './stores'

export function setPageTitle(title) {
	document.title = `${title} | CAP`;
}

export function focusInput(id, select) {
	const elem = document.getElementById(id);
	if (elem) {
		elem.focus();
		if (select) elem.select();
	}
}

let toastId = 0;

// Toasts
export function showToast(message, type) {
	if (!message) return;
	if (!type) type = 0; // 0 = error, 1 = success, 2 = info
	toastId++;
	toasts.update((_toasts) => {
		_toasts.push({message, type, id: toastId});
		return _toasts;
	});
	let _toastId = toastId;
	setTimeout(() => {
		hideToast(_toastId);
	}, 7*1000);
}

export function hideToast(id) {
	toasts.update((_toasts) => {
		_toasts = _toasts.filter((t) => {
			return t.id != id;
		});
		return _toasts;
	});
}

// Error modal
export function showError(e) {

/**
 * Triggers native share or downloads the generated trade image.
 * @param {Object} trade - Trade/position data
 */
export async function shareTradeImage(trade) {
  try {
    const blob = await generateTradeShareImage(trade);
    const file = new File([blob], `cap-trade-${trade.id || Date.now()}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'CAP Trade',
        text: `${(trade.side || '').toUpperCase()} ${(trade.market || '').toUpperCase()} - PnL ${trade.pnl ?? trade.realizedPnl}`,
        files: [file]
      });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Trade image downloaded', 'success');
    }
  } catch (err) {
    console.error('[shareTradeImage]', err);
    showToast(err?.message || 'Failed to share trade', 'error');
  }
}
	const message = parseError(e);
	if (!message) return;
	if (typeof(e) == 'object') {
		try {
			e = JSON.stringify(e);
		} catch(_e) {
			e = e.toString();
		} finally {}
	}
	activeError.set({message, rawError: e});
}
export function hideError() {
	activeError.set({})
}

// Modals
export function showModal(name, data) {
	activeModal.set({name, data});
}
export function hideModal() {
	activeModal.set({});
}

function hidePopovers() {
	const ae = get(activeError);
	if (ae && ae.message) {
		hideError();
	} else {
		hideModal();
		showMarkets.set(false);
		showMobileNav.set(false);
	}
}

export function hidePopoversOnClick(ev) {
	if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.defaultPrevented) return true;
	hidePopovers();
}

export function hidePopoversOnKeydown(ev) {
	if (ev.key == 'Escape') hidePopovers();
}
