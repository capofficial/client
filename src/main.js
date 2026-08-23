// Issue #13: welcome/onboarding modal with bridge guide (self-initializes on DOM ready)
import './lib/welcome.js';

import App from './App.svelte';

const app = new App({
	target: document.body
});

export default app;