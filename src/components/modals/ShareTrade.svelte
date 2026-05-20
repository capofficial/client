<script>
	import { onDestroy, onMount } from 'svelte'

	import Button from '@components/layout/Button.svelte'
	import Modal from './Modal.svelte'

	import { buildTradeShareData, buildTradeShareText, renderTradeShareCard } from '@lib/share'
	import { hideModal, showToast } from '@lib/ui'

	export let data

	let shareData
	let shareText = ''
	let imageBlob
	let previewUrl = ''
	let isRendering = true
	let isSharing = false

	async function renderCard() {
		shareData = buildTradeShareData(data.kind, data.trade, data.meta)
		shareText = buildTradeShareText(shareData)
		isRendering = true
		try {
			imageBlob = await renderTradeShareCard(shareData)
			previewUrl = URL.createObjectURL(imageBlob)
		} catch (e) {
			showToast('Unable to generate share card.', 0)
		} finally {
			isRendering = false
		}
	}

	onMount(() => {
		renderCard()
	})

	onDestroy(() => {
		if (previewUrl) URL.revokeObjectURL(previewUrl)
	})

	function downloadCard() {
		if (!imageBlob) return
		const link = document.createElement('a')
		link.href = previewUrl
		link.download = shareData.fileName
		link.click()
	}

	async function copySummary() {
		try {
			await navigator.clipboard.writeText(shareText)
			showToast('Trade summary copied.', 1)
		} catch (e) {
			showToast('Unable to copy trade summary.', 0)
		}
	}

	async function shareCard() {
		if (!imageBlob || !shareData) return
		isSharing = true
		try {
			const file = new File([imageBlob], shareData.fileName, { type: 'image/png' })
			if (navigator.share && navigator.canShare?.({ files: [file] })) {
				await navigator.share({
					title: `CAP ${shareData.market}`,
					text: shareText,
					files: [file]
				})
			} else {
				downloadCard()
				showToast('Downloaded share card.', 1)
			}
		} catch (e) {
			if (e?.name != 'AbortError') {
				showToast('Unable to share trade card.', 0)
			}
		} finally {
			isSharing = false
		}
	}
</script>

<style>
	.container {
		padding: 20px;
	}

	.preview {
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		overflow: hidden;
		background: var(--layer0);
		margin-bottom: 18px;
	}

	.preview img {
		display: block;
		width: 100%;
		height: auto;
	}

	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 240px;
		color: var(--text300);
		font-size: 90%;
	}

	.summary {
		white-space: pre-line;
		line-height: 1.5;
		color: var(--text200);
		font-size: 90%;
		padding-bottom: 18px;
	}

	.buttons {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	.buttons :global(button) {
		flex: 1 1 180px;
	}
</style>

<Modal title='Share Trade' width={720}>
	<div class='container'>
		<div class='preview'>
			{#if previewUrl}
				<img alt='Trade share card preview' src={previewUrl} />
			{:else}
				<div class='placeholder'>Generating share card...</div>
			{/if}
		</div>

		<div class='summary'>{shareText}</div>

		<div class='buttons'>
			<Button noSubmit={true} label='Download PNG' on:click={downloadCard} />
			<Button noSubmit={true} label='Share' isLoading={isSharing || isRendering} on:click={shareCard} />
			<Button noSubmit={true} label='Copy Summary' on:click={copySummary} />
			<Button noSubmit={true} isRed={true} label='Done' on:click={hideModal} />
		</div>
	</div>
</Modal>
