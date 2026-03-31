<script>
	import { onMount, onDestroy } from 'svelte'
	import { getDrawings, saveDrawings } from '@api/drawings'
	import { selectedMarket, prices, chartResolution } from '@lib/stores'
	import { get } from 'svelte/store'
	import { formatPriceForDisplay, formatMarketName } from '@lib/formatters'
	import { getUserSetting } from '@lib/utils'

	let tvWidget = null;
	let chartContainer;
	let isLoading = true;
	let loadError = null;
	let saveTimeout = null;

	// TradingView Charting Library widget configuration
	const widgetOptions = {
		symbol: 'CAP', // Default, will be updated
		interval: '15', // Default interval
		theme: 'dark',
		style: '1', // Candlesticks
		locale: 'en',
		toolbar_bg: '#1c1d1c',
		enable_publishing: false,
		allow_symbol_change: false,
		container_id: 'tradingview_chart',
		autosize: true,
		hide_side_toolbar: false,
		studies: [
			'MAExp@tv-basicstudies',
			'RSI@tv-basicstudies',
			'MACD@tv-basicstudies',
			'Volume@tv-basicstudies',
			'BB@tv-basicstudies',
			'Stochastic@tv-basicstudies',
			'ATR@tv-basicstudies',
			'CCI@tv-basicstudies',
			'OBV@tv-basicstudies'
		],
		drawings_access: {
			type: 'all',
			tools: [
				{ name: 'Trend Line', grayed: true },
				{ name: 'Trend Angle', grayed: true },
				{ name: 'Fibonacci Retracement', grayed: true },
				{ name: 'Horizontal Ray', grayed: true },
				{ name: 'Arrow Mark', grayed: true },
				{ name: 'Ray', grayed: true },
				{ name: 'Extended', grayed: true },
				{ name: 'Parallel Channel', grayed: true },
				{ name: 'Price Range', grayed: true },
				{ name: 'Rectangle', grayed: true },
				{ name: 'Circle', grayed: true }
			]
		},
		overrides: {
			'mainSeriesProperties.candleStyle.upColor': '#40D643',
			'mainSeriesProperties.candleStyle.downColor': '#FF5324',
			'mainSeriesProperties.candleStyle.wickUpColor': '#40D643',
			'mainSeriesProperties.candleStyle.wickDownColor': '#FF5324',
			'paneProperties.background': '#1c1d1c',
			'paneProperties.vertGridProperties.color': '#2d2e2d',
			'paneProperties.horzGridProperties.color': '#2d2e2d',
			'scalesProperties.textColor': '#b3b3b3',
			'scalesProperties.lineColor': '#2d2e2d',
			'mainSeriesProperties.borderUpColor': '#40D643',
			'mainSeriesProperties.borderDownColor': '#FF5324',
			'mainSeriesProperties.borderVisible': false,
			'watermark.color': 'rgba(44,44,46,0.5)'
		},
		locale: getUserSetting('language') || 'en',
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
	};

	function getResolutionString(res) {
		// Convert numeric resolution to TV format
		const map = {
			60: '1',
			300: '5',
			900: '15',
			3600: '60',
			14400: '240',
			86400: '1D'
		};
		return map[res] || '15';
	}

	function updateSymbol() {
		if (tvWidget && !isLoading) {
			const market = get(selectedMarket);
			const resolution = get(chartResolution);
			tvWidget.setSymbol(market, getResolutionString(resolution), () => {
				loadDrawingsForMarket(market);
			});
		}
	}

	async function loadDrawingsForMarket(market) {
		if (!tvWidget) return;
		try {
			const drawings = await getDrawings(market);
			if (drawings && drawings.length > 0 && tvWidget.chart()) {
				// Apply saved drawings to chart
				const chart = tvWidget.chart();
				for (const drawing of drawings) {
					try {
						chart.createDrawing(drawing.type, drawing.properties);
					} catch (e) {
						console.warn('Failed to load drawing', drawing, e);
					}
				}
			}
		} catch (e) {
			console.warn('Failed to load drawings', e);
		}
	}

	function scheduleSaveDrawings() {
		// Debounce save to avoid too many API calls
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(async () => {
			const market = get(selectedMarket);
			if (tvWidget && tvWidget.chart()) {
				try {
					const chart = tvWidget.chart();
					const drawings = chart.getAllDrawingObjects ? chart.getAllDrawingObjects() : [];
					const serializableDrawings = drawings.map(d => ({
						type: d.name || 'unknown',
						properties: d.properties || {}
					}));
					await saveDrawings(market, serializableDrawings);
				} catch (e) {
					console.warn('Failed to save drawings', e);
				}
			}
		}, 2000);
	}

	onMount(async () => {
		// Wait for DOM to be ready
		await new Promise(resolve => setTimeout(resolve, 100));

		// Check if TradingView library is loaded
		if (typeof TradingView === 'undefined') {
			// Try to load the TradingView library dynamically
			const script = document.createElement('script');
			script.src = '/charting_library/charting_library.min.js';
			script.onload = initWidget;
			script.onerror = () => {
				loadError = 'TradingView library not found. Please ensure charting_library is installed.';
				isLoading = false;
			};
			document.head.appendChild(script);
		} else {
			initWidget();
		}
	});

	function initWidget() {
		if (typeof TradingView === 'undefined') {
			loadError = 'TradingView library failed to load';
			isLoading = false;
			return;
		}

		try {
			const market = get(selectedMarket);
			const resolution = get(chartResolution);

			const options = {
				...widgetOptions,
				symbol: market,
				interval: getResolutionString(resolution)
			};

			tvWidget = new TradingView.widget(options);

			tvWidget.onChartReady(() => {
				isLoading = false;

				// Load saved drawings
				loadDrawingsForMarket(market);

				// Subscribe to chart changes for saving drawings
				const chart = tvWidget.chart();
				if (chart) {
					chart.onSymbolChanged().subscribe(null, scheduleSaveDrawings);
					chart.onIntervalChanged().subscribe(null, scheduleSaveDrawings);
					chart.onDrawingsChanged().subscribe(null, scheduleSaveDrawings);
				}

				// Update page title with current price
				const mainSeries = chart.getSeries();
				if (mainSeries) {
					mainSeries.subscribeData().subscribe(null, (price) => {
						if (price && price.price) {
							document.title = `${formatPriceForDisplay(price.price)} ${formatMarketName(market)}`;
						}
					});
				}
			});

		} catch (e) {
			console.error('Failed to initialize TradingView widget', e);
			loadError = 'Failed to initialize chart: ' + e.message;
			isLoading = false;
		}
	}

	// React to market changes
	$: if ($selectedMarket && tvWidget) {
		updateSymbol();
	}

	// React to resolution changes
	$: if ($chartResolution && tvWidget) {
		updateSymbol();
	}

	onDestroy(() => {
		if (saveTimeout) clearTimeout(saveTimeout);
		if (tvWidget) {
			try {
				tvWidget.remove();
			} catch (e) {
				console.warn('Error removing TV widget', e);
			}
		}
	});
</script>

<style>
	.wrapper {
		position: relative;
		height: 100%;
		width: 100%;
	}
	.container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}
	#tradingview_chart {
		width: 100%;
		height: 100%;
	}
	.loading {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: var(--text400);
		font-size: 14px;
		z-index: 10;
	}
	.loading-spinner {
		display: inline-block;
		width: 24px;
		height: 24px;
		border: 2px solid var(--layer300);
		border-radius: 50%;
		border-top-color: var(--primary);
		animation: spin 1s linear infinite;
		margin-right: 8px;
		vertical-align: middle;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	.error {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: var(--text500);
		font-size: 14px;
		text-align: center;
		max-width: 400px;
		padding: 20px;
		background: var(--layer100);
		border-radius: var(--base-radius);
	}
	.error-icon {
		font-size: 32px;
		margin-bottom: 8px;
	}
</style>

<div class='wrapper'>
	{#if isLoading}
		<div class='loading'>
			<span class='loading-spinner'></span>
			Loading TradingView Chart...
		</div>
	{/if}
	{#if loadError}
		<div class='error'>
			<div class='error-icon'>⚠️</div>
			<div>{loadError}</div>
		</div>
	{/if}
	<div class='container' bind:this={chartContainer}>
		<div id='tradingview_chart'></div>
	</div>
</div>
