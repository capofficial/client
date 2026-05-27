<script>
	import { onMount } from 'svelte';
	import { deposit } from '../../lib/pool';
	import { balance } from '../../lib/wallet';
	import { toasts } from '../../lib/toasts';
	import Modal from './Modal.svelte';
	import Button from '../Button.svelte';
		}
	}

	function setMax() {
		amount = $balance;
	}

</script>

<style>
		margin-bottom: var(--base-padding);
	}

	.balance {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--base-padding);
	}

</style>

<Modal title='Deposit' on:close={closeModal}>
	<div class='description'>
		Deposit CAP into the pool to earn a share of trading fees.
	</div>
	
	<div class='balance'>
		<span>Wallet Balance: <a on:click={setMax}>{$balance ? $balance.toLocaleString() : 0} CAP</a></span>
	</div>

	<Input label='Amount' type='number' bind:value={amount} />

<script>
	import { onMount } from 'svelte';
	import { withdraw } from '../../lib/pool';
	import { poolBalance } from '../../lib/pool';
	import { toasts } from '../../lib/toasts';
	import Modal from './Modal.svelte';
	import Button from '../Button.svelte';
		}
	}

	function setMax() {
		amount = $poolBalance;
	}

</script>

<style>
		margin-bottom: var(--base-padding);
	}

	.balance {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--base-padding);
	}

</style>

<Modal title='Withdraw' on:close={closeModal}>
		Withdraw CAP from the pool.
	</div>

	<div class='balance'>
		<span>Available to Withdraw: <a on:click={setMax}>{$poolBalance ? $poolBalance.toLocaleString() : 0} CAP</a></span>
	</div>

	<Input label='Amount' type='number' bind:value={amount} />

	<Button on:click={submit} isLoading={isSubmitting}>Withdraw</Button>