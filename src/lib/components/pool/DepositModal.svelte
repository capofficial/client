<script>
	import { onMount } from 'svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { approve, deposit, getTokenBalance } from '$lib/web3/pool';
	import { wallet } from '$lib/stores/wallet';
	import { toast } from '$lib/stores/toast';
	import { formatUnits, parseUnits } from '$lib/utils/format';

	export let isOpen = false;
	export let onClose = () => {};
	export let pool = null;

	let amount = '';
	let walletBalance = 0n;
	let loadingBalance = false;
	let loading = false;
	let step = 'input'; // input, approving, depositing


	$: isValid = amount && parseFloat(amount) > 0;

	$: formattedWalletBalance = walletBalance ? formatUnits(walletBalance, pool?.tokenDecimals || 18) : '0';

	async function loadWalletBalance() {
		if (!$wallet.address || !pool) return;
		loadingBalance = true;
		try {
			walletBalance = await getTokenBalance(pool.tokenAddress, $wallet.address);
		} catch (e) {
			console.error('Failed to load wallet balance', e);
			walletBalance = 0n;
		} finally {
			loadingBalance = false;
		}
	}

	$: if (isOpen && $wallet.address && pool) {
		loadWalletBalance();
	}

	async function handleDeposit() {
		if (!isValid || !$wallet.address) return;
		loading = true;
			loading = false;
		}
	}

	function setMaxAmount() {
		if (!walletBalance) return;
		amount = formatUnits(walletBalance, pool?.tokenDecimals || 18);
	}
</script>

<Modal {isOpen} {onClose} title="Deposit {pool?.tokenSymbol || ''}">
		<div class="space-y-4">
			<div>
				<label class="mb-1 block text-sm font-medium text-gray-300">Amount</label>
				<div class="mb-2 flex items-center justify-between text-sm">
					<span class="text-gray-400">Wallet Balance:</span>
					<button
						type="button"
						class="font-medium text-blue-400 hover:text-blue-300 disabled:opacity-50"
						on:click={setMaxAmount}
						disabled={loadingBalance || walletBalance === 0n}
					>
						{loadingBalance ? 'Loading...' : `${formattedWalletBalance} ${pool?.tokenSymbol || ''}`}
					</button>
				</div>
				<input
					type="number"
					bind:value={amount}