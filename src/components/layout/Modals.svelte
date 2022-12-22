<script>
	import { activeModal } from '@lib/stores'

	import AssetSelect from '../modals/AssetSelect.svelte'
	import LeverageSelect from '../modals/LeverageSelect.svelte'
	import Connect from '../modals/Connect.svelte'
	import CustomizeColumns from '../modals/CustomizeColumns.svelte'
	import FeeDiscounts from '../modals/FeeDiscounts.svelte'
	import ClosePosition from '../modals/ClosePosition.svelte'
	import EditMargin from '../modals/EditMargin.svelte'
	import Deposit from '../modals/Deposit.svelte'
	import Withdraw from '../modals/Withdraw.svelte'
	import MarketInfo from '../modals/MarketInfo.svelte'
	import StakeCAP from '../modals/StakeCAP.svelte'
	import UnstakeCAP from '../modals/UnstakeCAP.svelte'
	import HistoryOrderStatus from '../modals/HistoryOrderStatus.svelte'
	import Settings from '../modals/Settings.svelte'
	import AdvancedTPSL from '../modals/AdvancedTPSL.svelte'

</script>

{#if $activeModal && $activeModal.name == 'Settings'}
<Settings />
{/if}

{#if $activeModal && $activeModal.name == 'AssetSelect'}
<AssetSelect />
{/if}

{#if $activeModal && $activeModal.name == 'LeverageSelect'}
<LeverageSelect />
{/if}

{#if $activeModal && $activeModal.name == 'Connect'}
<Connect />
{/if}

{#if $activeModal && $activeModal.name == 'FeeDiscounts'}
<FeeDiscounts />
{/if}

{#if $activeModal && $activeModal.name == 'CustomizeColumns'}
<CustomizeColumns data={$activeModal.data} />
{/if}

{#if $activeModal && $activeModal.name == 'ClosePosition'}
<ClosePosition data={$activeModal.data} />
{/if}

{#if $activeModal && $activeModal.name == 'EditMargin'}
<EditMargin data={$activeModal.data} />
{/if}

{#if $activeModal && $activeModal.name == 'Deposit'}
<Deposit />
{/if}

{#if $activeModal && $activeModal.name == 'Withdraw'}
<Withdraw />
{/if}

{#if $activeModal && $activeModal.name == 'StakeCAP'}
<StakeCAP />
{/if}

{#if $activeModal && $activeModal.name == 'UnstakeCAP'}
<UnstakeCAP />
{/if}

{#if $activeModal && $activeModal.name == 'HistoryOrderStatus'}
<HistoryOrderStatus />
{/if}

{#if $activeModal && $activeModal.name == 'MarketInfo'}
<MarketInfo data={$activeModal.data} />
{/if}

{#if $activeModal && $activeModal.name == 'AdvancedTPSL'}
<AdvancedTPSL />
{/if}