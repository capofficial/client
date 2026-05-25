<script>
	import { onMount } from 'svelte'
	import { addMargin, removeMargin } from '../../lib/margin'
	import { walletBalance } from '../../lib/wallet'
	import { availableMarginToRemove } from '../../lib/positions'
	import { toFixed } from '../../lib/utils'
	import Modal from './Modal.svelte'

	export let position = {}

	let amount = ''
	let walletBalanceValue = 0
	let availableToRemove = 0

	$: isAdding = type === 'add'
	$: title = isAdding ? 'Add Margin' : 'Remove Margin'
	onMount(async () => {
		// Focus input
		document.getElementById('margin-amount')?.focus()
		
		// Get wallet balance for adding margin
		if (isAdding) {
			const unsubscribe = walletBalance.subscribe(value => {
				walletBalanceValue = value
			})
			return () => unsubscribe()
		} else {
			// Get available margin to remove
			availableToRemove = availableMarginToRemove(position)
		}
	})

	async function handleSubmit() {
		</div>
	</div>

	<div class='balance-info'>
		{#if isAdding}
			<span>Wallet Balance: {toFixed(walletBalanceValue, 6)}</span>
		{:else}
			<span>Available to Remove: {toFixed(availableToRemove, 6)}</span>
		{/if}
	</div>

	<div class='buttons'>
		<button type='button' class='primary' on:click={handleSubmit}>
			{title}
		font-size: 14px;
		color: var(--text-secondary);
	}
	.balance-info {
		margin-top: 12px;
		font-size: 13px;
		color: var(--text-secondary);
		text-align: right;
	}
	.buttons {
		margin-top: 20px;
	}