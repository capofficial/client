// API for server-side drawings persistence
// Drawings are stored per-market on the server

const API_BASE = ''; // Uses same origin API

export async function getDrawings(market) {
	const response = await fetch(`${API_BASE}/api/drawings?market=${encodeURIComponent(market)}`);
	if (!response.ok) {
		console.error('Failed to fetch drawings', response.status);
		return [];
	}
	return response.json();
}

export async function saveDrawings(market, drawings) {
	const response = await fetch(`${API_BASE}/api/drawings`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ market, drawings })
	});
	if (!response.ok) {
		console.error('Failed to save drawings', response.status);
		return false;
	}
	return true;
}

export async function deleteDrawings(market) {
	const response = await fetch(`${API_BASE}/api/drawings?market=${encodeURIComponent(market)}`, {
		method: 'DELETE'
	});
	if (!response.ok) {
		console.error('Failed to delete drawings', response.status);
		return false;
	}
	return true;
}
