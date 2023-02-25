export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

export const ALCHEMY_SETTINGS = {
	apiKey: "gDY8gANK8VJAg508BzJbdCpmZ4N43IZP",
	network: "arbitrum"
};

export const DEFAULT_LOCALE = 'en-GB';

export const DEFAULT_MARKET = 'ETH-USD';

export const DEFAULT_CURRENCY = 'ETH';

export const DEFAULT_LEVERAGE = 50;

export const BPS_DIVIDER = 10000;

export const DEFAULT_MARKETS_SORT_KEY = ['market', false];

export const DEFAULT_ORDERS_SORT_KEY = ['orderId', true];

export const DEFAULT_POSITIONS_SORT_KEY = ['timestamp', true];

export const DEFAULT_HISTORY_SORT_KEY = ['timestamp', true];

export const DEFAULT_HISTORY_COUNT = 50;

export const EXCLUDED_MARKETS = []; // ['HSI', 'KOSPI', 'USD-CNY', 'USD-JPY', 'USD-KRW', 'WTI-USD', 'XBR-USD', 'SPX500', 'DJI', 'NASDAQ', 'FTSE', 'DAX', 'NIKKEI', 'ASX200']; // dead and non chainlink markets, in private beta only

export const CURRENCY_DECIMALS = {
	ETH: 18,
	USDC: 6,
	CAP: 18
}

export const MAX_CAP_DISPLAY_DECIMALS = 6;

export const USD_CONVERSION_MARKETS = {
	ETH: 'ETH-USD',
	WBTC: 'BTC-USD'
};

export const DEFAULT_CHAIN_ID = 42161;

export const CHAINDATA = {
	31337: {
		label: 'localhost',
		explorer: 'http://localhost:8545',
		rpc: 'http://127.0.0.1:8545/',
		dataEndpoint: 'http://localhost:3000/api',
		dataStore: '0x19cEcCd6942ad38562Ee10bAfd44776ceB67e923',
		cap: '0x6F6f570F45833E249e27022648a26F4076F48f78',
		assets: {
			ETH: ADDRESS_ZERO,
			USDC: '0xCA8c8688914e0F7096c920146cd0Ad85cD7Ae8b9'
		}
	},
	42161: {
		label: 'arbitrum',
		explorer: 'https://arbiscan.io',
		rpc: 'https://arb1.arbitrum.io/rpc', // for walletconnect
		dataEndpoint: 'https://data.cap.io/api',
		dataStore: '0xa64694E51B22A081EA1e4051EF4EA1b715b47026',
		cap: '0x031d35296154279dc1984dcd93e392b1f946737b',
		assets: {
			ETH: ADDRESS_ZERO,
			USDC: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
		}
	},
	84531: {
		label: 'base-goerli',
		explorer: 'https://goerli.basescan.org',
		rpc: 'https://goerli.base.org', // for walletconnect
		dataEndpoint: 'https://data.cap.io/api',
		dataStore: '0x31B693DDa8e36edACBaef79A8094c33EfF72a151',
		cap: '0x031d35296154279dc1984dcd93e392b1f946737b',
		assets: {
			ETH: ADDRESS_ZERO
		}
	}
}