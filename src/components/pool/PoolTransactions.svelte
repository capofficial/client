<script>
	import { onDestroy, onMount } from 'svelte'
	import { get } from 'svelte/store'
	
	import { formatForDisplay, numberWithCommas } from '@lib/formatters'
	import { getAssets, getLabelForAsset, getChainData } from '@lib/utils'
	import { address } from '@lib/stores'
	
	let transactions = []
	let isLoading = false
	let hasMore = true
	let limit = 20
	let skip = 0
	
	let containerRef
	
	const assets = getAssets()
	
	async function fetchPoolTransactions() {
		if (isLoading || !hasMore) return
		
		isLoading = true
		
		try {
			const dataEndpoint = getChainData('dataEndpoint')
			const _address = get(address)
			
			// Fetch pool transactions from data endpoint
			const response = await fetch(
				`${dataEndpoint}/pool-transactions?chain=arbitrum&limit=${limit}&skip=${skip}`
			)
			
			if (!response.ok) {
				// Fallback: try alternative endpoint format
				const fallbackResponse = await fetch(
					`${dataEndpoint}/pool/transactions?chain=arbitrum&limit=${limit}&skip=${skip}`
				)
				if (!fallbackResponse.ok) throw new Error('Failed to fetch')
				const data = await fallbackResponse.json()
				processTransactions(data)
			} else {
				const data = await response.json()
				processTransactions(data)
			}
		} catch (e) {
			console.error('Error fetching pool transactions:', e)
			// Use empty array if endpoint doesn't exist yet
			hasMore = false
		} finally {
			isLoading = false
		}
	}
	
	function processTransactions(data) {
		const newTransactions = data.transactions || data || []
		
		if (newTransactions.length < limit) {
			hasMore = false
		}
		
		transactions = [...transactions, ...newTransactions]
		skip += newTransactions.length
	}
	
	// Infinite scroll handler
	function handleScroll() {
		if (!containerRef) return
		
		const { scrollTop, scrollHeight, clientHeight } = containerRef
		
		// Load more when user scrolls to bottom (with 100px buffer)
		if (scrollTop + clientHeight >= scrollHeight - 100) {
			fetchPoolTransactions()
		}
	}
	
	function formatTimestamp(timestamp) {
		if (!timestamp) return '-'
		const date = new Date(timestamp * 1000)
		return date.toLocaleString()
	}
	
	function getTransactionIcon(type) {
		switch (type?.toLowerCase()) {
			case 'deposit': return '↓'
			case 'withdrawal': return '↑'
			case 'payin': return '→'
			case 'payout': return '←'
			default: return '•'
		}
	}
	
	function getTransactionClass(type) {
		switch (type?.toLowerCase()) {
			case 'deposit':
			case 'payin': return 'positive'
			case 'withdrawal':
			case 'payout': return 'negative'
			default: return ''
		}
	}
	
	onMount(() => {
		fetchPoolTransactions()
	})
</script>

<style>
	.transactions-container {
		margin-top: 32px;
	}
	
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}
	
	.title {
		font-weight: 600;
		font-size: 20px;
	}
	
	.table-wrapper {
		border: 1px solid var(--layer100);
		border-radius: 6px;
		max-height: 400px;
		overflow-y: auto;
	}
	
	.table {
		width: 100%;
		--grid-template: 120px 100px 1fr 120px 100px 150px;
	}
	
	.table-header {
		display: grid;
		align-items: center;
		height: 40px;
		border-bottom: 1px solid var(--layer100);
		grid-template-columns: var(--grid-template);
		color: var(--text300);
		font-size: 85%;
		font-weight: 600;
		position: sticky;
		top: 0;
		background-color: var(--layer0);
		z-index: 1;
	}
	
	.row {
		display: grid;
		align-items: center;
		grid-template-columns: var(--grid-template);
		border-bottom: 1px solid var(--layer0-hover);
		min-height: 48px;
		padding: 8px 0;
	}
	
	.row:last-child {
		border-bottom: none;
	}
	
	.row:hover {
		background-color: var(--layer0-hover);
	}
	
	.cell {
		display: flex;
		align-items: center;
		padding: 0 16px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.cell.type {
		font-weight: 600;
		text-transform: capitalize;
	}
	
	.cell.type .icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		margin-right: 8px;
		font-size: 12px;
	}
	
	.cell.type.positive .icon {
		background-color: rgba(0, 200, 83, 0.2);
		color: #00c853;
	}
	
	.cell.type.negative .icon {
		background-color: rgba(255, 82, 82, 0.2);
		color: #ff5252;
	}
	
	.cell.amount {
		font-weight: 600;
		font-family: monospace;
	}
	
	.cell.tx-hash a {
		color: var(--primary);
		text-decoration: none;
	}
	
	.cell.tx-hash a:hover {
		text-decoration: underline;
	}
	
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		color: var(--text300);
	}
	
	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 32px;
		color: var(--text300);
		font-style: italic;
	}
	
	@media (max-width: 800px) {
		.table {
			--grid-template: 100px 80px 1fr 100px;
		}
		
		.cell.user,
		.cell.tx-hash {
			display: none;
		}
	}
</style>

<div class='transactions-container'>
	<div class='header'>
		<div class='title'>Pool Transactions</div>
	</div>
	
	<div 
		class='table-wrapper' 
		bind:this={containerRef}
		on:scroll={handleScroll}
	>
		<div class='table'>
			<div class='table-header'>
				<div class='cell'>Type</div>
				<div class='cell'>Asset</div>
				<div class='cell'>Amount</div>
				<div class='cell'>User</div>
				<div class='cell'>Pool</div>
				<div class='cell'>Time</div>
			</div>
			
			{#if transactions.length === 0 && !isLoading}
				<div class='empty'>
					No transactions found
				</div>
			{:else}
				{#each transactions as tx}
					<div class='row'>
						<div class='cell type {getTransactionClass(tx.type)}'>
							<span class='icon'>{getTransactionIcon(tx.type)}</span>
							{tx.type || 'Unknown'}
						</div>
						<div class='cell'>
							{tx.asset || '-'}
						</div>
						<div class='cell amount'>
							{tx.amount ? numberWithCommas(formatForDisplay(tx.amount)) : '-'} {tx.asset || ''}
						</div>
						<div class='cell user'>
							{tx.user ? `${tx.user.slice(0, 6)}...${tx.user.slice(-4)}` : '-'}
						</div>
						<div class='cell'>
							{tx.pool || 'ETH/USDC'}
						</div>
						<div class='cell'>
							{formatTimestamp(tx.timestamp)}
						</div>
					</div>
				{/each}
				
				{#if isLoading}
					<div class='loading'>
						Loading more...
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
