# CAP UI Web Client

This repository contains the CAP v4 web client which includes the trading dashboard, pool page, and CAP token staking page.

CAP v4 is currently in private beta. We're looking for talented devs to help us fix bugs, add some features, and bulletproof the product for public release. Please read on to see how you can get involved!

## Running on your local machine

```
npm i
npm run dev
```

## Contributing

You can submit an issue and associated pull request. Our main devs will review it and merge into the main branch for deployment.

## Welcome guide

The first visit to the trading dashboard opens a welcome guide after the country check finishes. It explains the dashboard and links to the official Arbitrum bridge instructions, including transfers from Arbitrum and the separate funding path to Arbitrum. It does not connect a wallet or initiate a transfer.

Closing the guide, pressing Escape, clicking its backdrop, or choosing **Explore the dashboard** remembers dismissal in this browser. Use the **?** button in the trading header to reopen it. Dismissal uses the separate `cap.welcome.dismissed.v1` local-storage key and leaves trading preferences unchanged. If storing dismissal fails, it remains dismissed for that session.

Run the onboarding policy tests with `npm test` (tested with Node.js24). For UI checks, open `/trade`, dismiss and reload, reopen with **?**, check keyboard focus and Escape, and check a narrow viewport. Existing country restrictions still take priority; onboarding is not displayed on other pages or over an existing modal.
