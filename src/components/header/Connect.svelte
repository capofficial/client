<script>
	import { onMount } from 'svelte'

	import { CHECKMARK_CIRCLE_ICON, GEAR_ICON } from '@lib/icons'
	import { connect, checkMetamaskSession, switchChains } from '@lib/connect'
	import { address, unsupportedNetwork } from '@lib/stores'
	import { showModal } from '@lib/ui'
	import { shortAddress } from '@lib/utils'

	onMount(async () => {
		await checkMetamaskSession();
	});

</script>

<style>

	.connect {
		display: flex;
		align-items: center;
	}

	.settings {
		margin-left: 20px;
		display: flex;
		align-items: center;
		color: var(--text0);
	}
	.settings:hover {
		color: var(--text100);
	}
	.settings :global(svg) {
		fill: currentColor;
		height: 20px;
	}

	.address {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		text-align: right;
		white-space: nowrap;
		padding: 8px 16px;
		font-weight: 500;
		border-radius: var(--base-radius);
		background-color: var(--layer1);
	}

	.address :global(svg) {
		fill:  var(--primary);
		height: 16px;
		margin-right: 8px;
	}

	.wrong-network {
		color: var(--secondary);
		padding-right: var(--base-padding);
		white-space: nowrap;
		cursor: pointer;
	}

	@media (max-width: 600px) {
		.wrong-network {
			display: none;
		}
	}

	a.connect {
		color: var(--primary-darkest);
		text-decoration: none;
		padding: 8px 16px;
		border-radius: var(--base-radius);
		transition: all 100ms ease-in-out;
		background-color: var(--primary);
		font-weight: 500;
	}

	@media all and (max-width: 600px) {
		.settings {
			display: none;
		}
		.address {
			padding: 6px 10px;
		}
		.address :global(svg) {
			margin-right: 0;
		}
		.address-body {
			display: none;
		}
		a.connect {
			padding: 8px;
			font-size: 90%;
		}
	}

</style>

<div class='connect'>

	{#if $address}
		<!-- {#if $unsupportedNetwork}
		<div class='address wrong-network' on:click={() => {switchChains()}}>
			Wrong Network
		</div>
		{:else}
		<div class='address'>
			{@html CHECKMARK_CIRCLE_ICON}
			<span class='address-body'>{shortAddress($address)}</span>
		</div>
		{/if} -->

	{:else}
		<a class='connect' on:click|stopPropagation={() => {connect()}}>Connect</a>
	{/if}

	<!-- <a class='settings' on:click|stopPropagation={() => {showModal('Settings')}}>{@html GEAR_ICON}</a> -->
</div>