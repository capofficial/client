<script>
	import { createEventDispatcher } from 'svelte'
	
	import { saveUserSetting, getUserSetting } from '@lib/utils'
	
	const dispatch = createEventDispatcher()
	
	// Indicator states
	let indicators = {
		ma20: getUserSetting('indicator_ma20') || false,
		ma50: getUserSetting('indicator_ma50') || false,
		ema12: getUserSetting('indicator_ema12') || false,
		ema26: getUserSetting('indicator_ema26') || false,
		rsi: getUserSetting('indicator_rsi') || false,
		macd: getUserSetting('indicator_macd') || false,
		bb: getUserSetting('indicator_bb') || false
	}
	
	function toggleIndicator(key) {
		indicators[key] = !indicators[key]
		saveUserSetting(`indicator_${key}`, indicators[key])
		dispatch('toggle', { indicator: key, enabled: indicators[key] })
	}
	
	function showAll() {
		Object.keys(indicators).forEach(key => {
			indicators[key] = true
			saveUserSetting(`indicator_${key}`, true)
		})
		dispatch('toggleAll', indicators)
	}
	
	function hideAll() {
		Object.keys(indicators).forEach(key => {
			indicators[key] = false
			saveUserSetting(`indicator_${key}`, false)
		})
		dispatch('toggleAll', indicators)
	}
</script>

<style>
	.indicator-controls {
		position: absolute;
		top: 60px;
		right: 20px;
		z-index: 100;
		background-color: var(--layer25);
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		padding: 12px;
		min-width: 150px;
	}
	
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--layer100);
	}
	
	.title {
		font-weight: 600;
		font-size: 14px;
	}
	
	.indicators-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	
	.indicator-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 4px;
		transition: background-color 0.2s;
	}
	
	.indicator-item:hover {
		background-color: var(--layer50);
	}
	
	.indicator-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
	}
	
	.color-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}
	
	.color-dot.ma20 { background-color: #ff6b6b; }
	.color-dot.ma50 { background-color: #4ecdc4; }
	.color-dot.ema12 { background-color: #ffe66d; }
	.color-dot.ema26 { background-color: #a8e6cf; }
	.color-dot.rsi { background-color: #ff8b94; }
	.color-dot.macd { background-color: #c7ceea; }
	.color-dot.bb { background-color: #ffd93d; }
	
	.toggle {
		width: 36px;
		height: 20px;
		background-color: var(--layer200);
		border-radius: 10px;
		position: relative;
		transition: background-color 0.2s;
	}
	
	.toggle.active {
		background-color: var(--primary);
	}
	
	.toggle-dot {
		width: 16px;
		height: 16px;
		background-color: white;
		border-radius: 50%;
		position: absolute;
		top: 2px;
		left: 2px;
		transition: transform 0.2s;
	}
	
	.toggle.active .toggle-dot {
		transform: translateX(16px);
	}
	
	.actions {
		display: flex;
		gap: 8px;
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid var(--layer100);
	}
	
	.action-btn {
		flex: 1;
		padding: 6px 12px;
		background-color: var(--layer100);
		border: none;
		border-radius: 4px;
		color: var(--text200);
		font-size: 12px;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	.action-btn:hover {
		background-color: var(--layer200);
	}
</style>

<div class='indicator-controls'>
	<div class='header'>
		<span class='title'>Indicators</span>
	</div>
	
	<div class='indicators-list'>
		<div class='indicator-item' on:click={() => toggleIndicator('ma20')}>
			<span class='indicator-label'>
				<span class='color-dot ma20'></span>
				MA (20)
			</span>
			<div class='toggle' class:active={indicators.ma20}>
				<div class='toggle-dot'></div>
			</div>
		</div>
		
		<div class='indicator-item' on:click={() => toggleIndicator('ma50')}>
			<span class='indicator-label'>
				<span class='color-dot ma50'></span>
				MA (50)
			</span>
			<div class='toggle' class:active={indicators.ma50}>
				<div class='toggle-dot'></div>
			</div>
		</div>
		
		<div class='indicator-item' on:click={() => toggleIndicator('ema12')}>
			<span class='indicator-label'>
				<span class='color-dot ema12'></span>
				EMA (12)
			</span>
			<div class='toggle' class:active={indicators.ema12}>
				<div class='toggle-dot'></div>
			</div>
		</div>
		
		<div class='indicator-item' on:click={() => toggleIndicator('ema26')}>
			<span class='indicator-label'>
				<span class='color-dot ema26'></span>
				EMA (26)
			</span>
			<div class='toggle' class:active={indicators.ema26}>
				<div class='toggle-dot'></div>
			</div>
		</div>
		
		<div class='indicator-item' on:click={() => toggleIndicator('rsi')}>
			<span class='indicator-label'>
				<span class='color-dot rsi'></span>
				RSI (14)
			</span>
			<div class='toggle' class:active={indicators.rsi}>
				<div class='toggle-dot'></div>
			</div>
		</div>
		
		<div class='indicator-item' on:click={() => toggleIndicator('macd')}>
			<span class='indicator-label'>
				<span class='color-dot macd'></span>
				MACD
			</span>
			<div class='toggle' class:active={indicators.macd}>
				<div class='toggle-dot'></div>
			</div>
		</div>
		
		<div class='indicator-item' on:click={() => toggleIndicator('bb')}>
			<span class='indicator-label'>
				<span class='color-dot bb'></span>
				Bollinger Bands
			</span>
			<div class='toggle' class:active={indicators.bb}>
				<div class='toggle-dot'></div>
			</div>
		</div>
	</div>
	
	<div class='actions'>
		<button class='action-btn' on:click={showAll}>Show All</button>
		<button class='action-btn' on:click={hideAll}>Hide All</button>
	</div>
</div>
