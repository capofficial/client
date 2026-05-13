<script>
	import { onMount } from 'svelte'

	import Button from '@components/layout/Button.svelte'
	import Modal from './Modal.svelte'

	import { formatDate, formatForDisplay, formatMarketName, formatPnl, formatPriceForDisplay } from '@lib/formatters'
	import { showToast } from '@lib/ui'

	export let data;

	let imageUrl, shareText, shareUrl, canUseNativeShare = false;

	onMount(() => {
		canUseNativeShare = !!navigator.share;
	});

	function getNumber(value) {
		const number = value * 1;
		return isNaN(number) ? 0 : number;
	}

	function drawRoundRect(ctx, x, y, width, height, radius) {
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
	}

	function fillTextWithin(ctx, text, x, y, maxWidth, size, weight = 700) {
		let currentSize = size;
		do {
			ctx.font = `${weight} ${currentSize}px Inter, Arial, sans-serif`;
			currentSize -= 2;
		} while (ctx.measureText(text).width > maxWidth && currentSize > 26);
		ctx.fillText(text, x, y);
	}

	function drawMetric(ctx, label, value, x, y, width) {
		ctx.fillStyle = '#7d837f';
		ctx.font = '500 24px Inter, Arial, sans-serif';
		ctx.fillText(label, x, y);
		ctx.fillStyle = '#f4f7f4';
		fillTextWithin(ctx, value || '-', x, y + 44, width, 32, 650);
	}

	function getShareData() {
		const pnl = data?.pnl == undefined || data?.pnl === '' ? undefined : getNumber(data.pnl);
		const pnlPercent = data?.pnlPercent == undefined || data?.pnlPercent === '' ? undefined : getNumber(data.pnlPercent);
		const isProfit = pnl == undefined ? undefined : pnl >= 0;
		const market = formatMarketName(data?.market) || data?.market || '-';
		const side = data?.side || '-';
		const asset = data?.asset || '';
		const title = `${market} ${side}`;
		const pnlText = pnl == undefined ? data?.status || '-' : `${formatPnl(pnl)} ${asset}`;
		const percentText = pnlPercent == undefined ? '' : formatPnl(pnlPercent, true);
		return { pnl, pnlPercent, isProfit, market, side, asset, title, pnlText, percentText };
	}

	function renderImage() {
		if (!data) return;

		const canvas = document.createElement('canvas');
		canvas.width = 1200;
		canvas.height = 675;
		const ctx = canvas.getContext('2d');
		const shareData = getShareData();
		const accent = shareData.isProfit === false ? '#f84c20' : '#32d135';
		const typeLabel = data.type == 'history' ? 'Historical Trade' : 'Active Position';
		const status = data.status || typeLabel;

		ctx.fillStyle = '#111411';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		const gradient = ctx.createLinearGradient(0, 0, 1200, 675);
		gradient.addColorStop(0, 'rgba(50, 209, 53, 0.16)');
		gradient.addColorStop(0.55, 'rgba(255, 255, 255, 0)');
		gradient.addColorStop(1, shareData.isProfit === false ? 'rgba(248, 76, 32, 0.20)' : 'rgba(50, 209, 53, 0.10)');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = '#f4f7f4';
		ctx.font = '800 44px Inter, Arial, sans-serif';
		ctx.fillText('CAP', 72, 90);
		ctx.fillStyle = '#8b938d';
		ctx.font = '500 24px Inter, Arial, sans-serif';
		ctx.fillText(typeLabel, 72, 128);

		ctx.fillStyle = accent;
		drawRoundRect(ctx, 908, 58, 220, 54, 27);
		ctx.fill();
		ctx.fillStyle = '#101210';
		ctx.font = '700 23px Inter, Arial, sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText(status, 1018, 93);
		ctx.textAlign = 'left';

		ctx.fillStyle = '#f4f7f4';
		fillTextWithin(ctx, shareData.title, 72, 238, 720, 72, 800);
		ctx.fillStyle = accent;
		ctx.font = '800 96px Inter, Arial, sans-serif';
		ctx.fillText(shareData.pnlText, 72, 360);
		if (shareData.percentText) {
			ctx.fillStyle = '#cbd1cc';
			ctx.font = '700 42px Inter, Arial, sans-serif';
			ctx.fillText(`(${shareData.percentText})`, 72, 420);
		}

		ctx.strokeStyle = '#2f352f';
		ctx.lineWidth = 2;
		drawRoundRect(ctx, 72, 464, 1056, 126, 18);
		ctx.stroke();

		drawMetric(ctx, data.type == 'history' ? 'Price' : 'Entry', formatPriceForDisplay(data.entryPrice || data.price), 104, 522, 200);
		drawMetric(ctx, data.type == 'history' ? 'Type' : 'Current', data.type == 'history' ? data.orderType : formatPriceForDisplay(data.markPrice), 366, 522, 220);
		drawMetric(ctx, 'Size', `${formatForDisplay(data.size)} ${shareData.asset}`, 628, 522, 210);
		drawMetric(ctx, 'Margin', `${formatForDisplay(data.margin)} ${shareData.asset}`, 890, 522, 210);

		ctx.fillStyle = '#7d837f';
		ctx.font = '500 22px Inter, Arial, sans-serif';
		ctx.fillText(`${formatDate(data.timestamp) || ''}   cap.io`, 72, 632);

		imageUrl = canvas.toDataURL('image/png');
		shareUrl = `${window.location.origin}/trade/${data.market}`;
		shareText = `CAP ${typeLabel}: ${shareData.title} ${shareData.pnlText}${shareData.percentText ? ` (${shareData.percentText})` : ''}`;
	}

	async function getImageFile() {
		const response = await fetch(imageUrl);
		const blob = await response.blob();
		return new File([blob], `cap-${data.market}-trade.png`, { type: 'image/png' });
	}

	function downloadImage() {
		const link = document.createElement('a');
		link.href = imageUrl;
		link.download = `cap-${data.market}-trade.png`;
		link.click();
	}

	async function shareImage() {
		if (!navigator.share) return copyShareText();
		try {
			const file = await getImageFile();
			if (!navigator.canShare || navigator.canShare({ files: [file] })) {
				await navigator.share({ files: [file], title: shareText, text: shareText });
			} else {
				await navigator.share({ title: shareText, text: shareText, url: shareUrl });
			}
		} catch(e) {
			if (e.name != 'AbortError') showToast('Unable to share this trade.');
		}
	}

	async function copyShareText() {
		try {
			await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
			showToast('Share text copied.', 1);
		} catch(e) {
			showToast('Unable to copy share text.');
		}
	}

	$: renderImage(data);
</script>

<style>
	.container {
		padding: var(--base-padding);
	}
	.preview {
		display: block;
		width: 100%;
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		background-color: var(--layer0);
	}
	.actions {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 10px;
		padding-top: var(--base-padding);
	}
	@media all and (max-width: 600px) {
		.actions {
			grid-template-columns: 1fr;
		}
	}
</style>

<Modal title='Share Trade' width={620}>
	<div class='container'>
		{#if imageUrl}
			<img class='preview' src={imageUrl} alt='Trade share card' />
		{/if}
		<div class='actions'>
			<Button noSubmit={true} label='Download' on:click={downloadImage} />
			<Button noSubmit={true} label={canUseNativeShare ? 'Share' : 'Copy'} on:click={shareImage} />
			<Button noSubmit={true} label='Copy Text' on:click={copyShareText} />
		</div>
	</div>
</Modal>
