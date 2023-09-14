import { writable, derived, get } from 'svelte/store'

import Home from '@components/home/Home.svelte'
import Trade from '@components/trade/Trade.svelte'
import Earn from '@components/earn/Earn.svelte'
import Leaderboard from '@components/leaderboard/Leaderboard.svelte'
import Pool from '@components/pool/Pool.svelte'
import Stake from '@components/stake/Stake.svelte'

import { formatUnits } from './formatters'
import { component, pageName, selectedMarket, selectedMarketInfo, leverage, countryDisallowed } from './stores'
import { setPageTitle } from './ui'
import { getUserSetting, saveUserSetting } from './utils'

const PAGES = {
	'Home': {
		component: Home,
		paths: ['']
	},
	'Trade': {
		component: Trade,
		paths: ['trade']
	},
	'Earn': {
		component: Earn,
		paths: ['earn']
	},
	'Leaderboard': {
		component: Leaderboard,
		paths: ['leaderboard']
	},
	'Pool': {
		component: Pool,
		paths: ['pool']
	},
	'Stake': {
		component: Stake,
		paths: ['stake']
	}
};

// sets market info and associated properties in store
async function setMarket(market) {

	// This is here because routing = market switching

	// secondaryPath is a market id, load it
	selectedMarket.set(market);
	saveUserSetting('selectedMarket', market);

}

export async function checkCountry() {

	try {
		const response = await fetch(`https://api.country.is/`);
		const result = await response.json() || {};
		console.log(result);
		if (result && ["US", "CH", "CA", "CI", "CU", "BY", "RU", "IR", "IQ", "LR", "KP", "SD", "SY"].includes(result.country)) {
			console.log('disallowed');
			countryDisallowed.set(true);
		}
	} catch(e) {
		console.error('api.country.is error', e);
	}

}

export function loadRoute(path) {

	if (!path) path = location.pathname;

	const pathParts = path.split('/');

	const primaryPath = pathParts[1];
	const secondaryPath = pathParts[2];
	
	for (const page in PAGES) {
		
		const pageDetails = PAGES[page];

		if (pageDetails.paths.includes(primaryPath)) {
			component.set(pageDetails.component);
			setPageTitle(page);
			pageName.set(page);

			if (primaryPath == 'trade') {
				if (secondaryPath) {
					// secondaryPath is a market id, load it
					setMarket(secondaryPath);
				} else {
					// set the current market id in the path
					const pid = get(selectedMarket);
					history.replaceState(null, null, `trade/${pid}`);
					setMarket(pid);
				}
				// TODO: setPriceTitle
			}

			return;
		}

	}

}

export function navigateTo(path) {
    history.pushState(null, null, path);
    loadRoute(path);
}

export function catchLinks(cb) {

	window.addEventListener('click', (ev) => {

		if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.defaultPrevented) return true;
		
		let anchor = null;
		for (let n = ev.target; n.parentNode; n = n.parentNode) {
			if (n.nodeName === 'A') {
				anchor = n;
				break;
			}
		}

		if (!anchor) return true;
		
		let href = anchor.getAttribute('href');
		
		if (!href || href && href.includes('http')) return true;
		
		ev.preventDefault();
		
		cb(href);

		return false;

	});

}