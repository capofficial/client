export const WELCOME_STORAGE_KEY = 'cap.welcome.dismissed.v1';

// Keep dismissal separate from trading preferences, and tolerate unavailable storage.
export function createWelcomeSession(getStorage = () => window.localStorage) {

	let offered = false;

	return {
		shouldOpen({ ready, page, modal }) {
			if (!ready || page != 'Trade' || modal || offered) return false;
			try {
				if (getStorage().getItem(WELCOME_STORAGE_KEY) == '1') return false;
			} catch (_) {
				// Still offer the guide once in this session when storage is blocked.
			}
			offered = true;
			return true;
		},
		dismiss() {
			offered = true;
			try {
				getStorage().setItem(WELCOME_STORAGE_KEY, '1');
			} catch (_) {
				// The in-memory flag prevents reopening during this session.
			}
		}
	};
}
