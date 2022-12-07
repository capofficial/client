import ReconnectingWebSocket from 'reconnecting-websocket';
import { prices } from '@lib/stores'

let socket;

// TODO: since this is a firehose, only connect when on trade page. for the conversion rates, poll every 2min to http endpoint is fine
export function connectSocket() {

	socket = new ReconnectingWebSocket("wss://socket.cap.io");

	socket.onopen = function(e) {
		console.log("[open] Connection established");
	};

	socket.onmessage = function(event) {
		// console.log(`[message] Data received from server: ${event.data}`);
		try {
			let _prices = JSON.parse(event.data);
			for (const market in _prices) {
				prices.update((p) => {
					p[market] = _prices[market];
					return p;
				});
			}
		} catch(e) {
			console.error(e);
		}
	};

	socket.onclose = function(event) {
		if (event.wasClean) {
			console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
		} else {
			// e.g. server process killed or network down
			// event.code is usually 1006 in this case
			console.log('[close] Connection died');
		}
	};

	socket.onerror = function(error) {
		console.log(`[error]`);
	};

}

export function closeSocket() {
	socket.close(1000, "Socket Closed Gracefully.");
}