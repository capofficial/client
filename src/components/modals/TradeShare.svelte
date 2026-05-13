<script>
	import Modal from './Modal.svelte'
	import Button from '@components/layout/Button.svelte'
	import { showToast } from '@lib/ui'

	export let data = {};

	$: isPositive = (data.pnlRaw || 0) * 1 >= 0;
	$: cardTitle = data.kind == 'history' ? 'Trade Result' : 'Open Position';
	$: priceLabel = data.kind == 'history' ? 'Price' : 'Entry';
	$: rows = [
		{label: priceLabel, value: data.price},
		{label: 'Market Price', value: data.currentPrice},
		{label: 'Size', value: data.size},
		{label: 'Margin', value: data.margin},
		{label: 'Leverage', value: data.leverage ? `${data.leverage}x` : ''},
		{label: 'Status', value: data.status},
		{label: 'Time', value: data.time}
	].filter((row) => row.value !== undefined && row.value !== '' && row.value !== null);

	function escaped(value) {
		return String(value ?? '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function fileName() {
		const market = String(data.market || 'trade').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
		return `cap-${market}-${data.kind || 'share'}.png`;
	}

	function summaryText() {
		const pnl = data.pnlPercent ? `${data.pnl} (${data.pnlPercent})` : data.pnl;
		return `CAP ${cardTitle}: ${data.side} ${data.market} | P/L ${pnl} | Size ${data.size}`;
	}

	function cardSvg() {
		const pnlColor = isPositive ? '#00D604' : '#FF5000';
		const pnl = escaped(data.pnl || '0');
		const pnlPercent = data.pnlPercent ? ` ${escaped(`(${data.pnlPercent})`)}` : '';
		const detailRows = rows.map((row, index) => {
			const y = 372 + index * 38;
			return `
				<text x="88" y="${y}" fill="#8d96a7" font-size="22" font-family="Inter, Arial">${escaped(row.label)}</text>
				<text x="1112" y="${y}" fill="#f4f7fb" font-size="24" font-family="Inter, Arial" text-anchor="end" font-weight="600">${escaped(row.value)}</text>
			`;
		}).join('');

		return `
			<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
				<rect width="1200" height="675" fill="#080b10"/>
				<rect x="36" y="36" width="1128" height="603" rx="32" fill="#10151e" stroke="#253044" stroke-width="2"/>
				<circle cx="1048" cy="142" r="76" fill="${pnlColor}" opacity="0.12"/>
				<circle cx="1048" cy="142" r="42" fill="${pnlColor}" opacity="0.24"/>
				<text x="88" y="118" fill="#f4f7fb" font-size="38" font-family="Inter, Arial" font-weight="800">CAP</text>
				<text x="88" y="164" fill="#8d96a7" font-size="24" font-family="Inter, Arial">${escaped(cardTitle)}</text>
				<text x="88" y="246" fill="#f4f7fb" font-size="54" font-family="Inter, Arial" font-weight="800">${escaped(data.market || '')}</text>
				<text x="88" y="294" fill="${pnlColor}" font-size="30" font-family="Inter, Arial" font-weight="800">${escaped(data.side || '')}</text>
				<text x="1112" y="246" fill="${pnlColor}" font-size="58" font-family="Inter, Arial" font-weight="900" text-anchor="end">${pnl}</text>
				<text x="1112" y="294" fill="${pnlColor}" font-size="28" font-family="Inter, Arial" font-weight="800" text-anchor="end">${pnlPercent}</text>
				<line x1="88" y1="334" x2="1112" y2="334" stroke="#253044" stroke-width="2"/>
				${detailRows}
				<text x="88" y="596" fill="#596274" font-size="20" font-family="Inter, Arial">cap.io</text>
				<text x="1112" y="596" fill="#596274" font-size="20" font-family="Inter, Arial" text-anchor="end">Generated from CAP trade data</text>
			</svg>
		`;
	}

	async function imageBlob() {
		const svgBlob = new Blob([cardSvg()], {type: 'image/svg+xml;charset=utf-8'});
		const url = URL.createObjectURL(svgBlob);
		try {
			const image = new Image();
			await new Promise((resolve, reject) => {
				image.onload = resolve;
				image.onerror = reject;
				image.src = url;
			});
			const canvas = document.createElement('canvas');
			canvas.width = 1200;
			canvas.height = 675;
			const context = canvas.getContext('2d');
			context.drawImage(image, 0, 0);
			return await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
		} finally {
			URL.revokeObjectURL(url);
		}
	}

	async function downloadImage() {
		const blob = await imageBlob();
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = fileName();
		link.click();
		URL.revokeObjectURL(url);
		showToast('Share image downloaded.', 1);
	}

	async function shareImage() {
		const blob = await imageBlob();
		const file = new File([blob], fileName(), {type: 'image/png'});
		if (navigator.canShare && navigator.canShare({files: [file]})) {
			await navigator.share({files: [file], title: `CAP ${data.market}`, text: summaryText()});
			return;
		}
		await navigator.clipboard.writeText(summaryText());
		showToast('Share text copied.', 1);
	}

	async function copyText() {
		await navigator.clipboard.writeText(summaryText());
		showToast('Share text copied.', 1);
	}
</script>

<style>
	.container {
		padding: var(--base-padding);
	}
	.card {
		background: radial-gradient(circle at 85% 20%, rgba(0, 214, 4, 0.14), transparent 28%), var(--layer0);
		border: 1px solid var(--layer200);
		border-radius: var(--base-radius);
		padding: 24px;
		overflow: hidden;
	}
	.card.red {
		background: radial-gradient(circle at 85% 20%, rgba(255, 80, 0, 0.14), transparent 28%), var(--layer0);
	}
	.top {
		display: flex;
		justify-content: space-between;
		gap: 20px;
		margin-bottom: 24px;
	}
	.brand {
		font-weight: 800;
		font-size: 22px;
	}
	.kind {
		color: var(--text2);
		font-size: 85%;
		margin-top: 4px;
	}
	.market {
		font-size: 28px;
		font-weight: 800;
		margin-bottom: 6px;
	}
	.side {
		font-weight: 700;
	}
	.pnl {
		text-align: right;
		font-size: 28px;
		font-weight: 800;
		color: var(--primary);
		white-space: nowrap;
	}
	.red .pnl {
		color: var(--secondary);
	}
	.pnl-percent {
		font-size: 15px;
		margin-top: 6px;
	}
	.details {
		border-top: 1px solid var(--layer100);
		padding-top: 12px;
	}
	.detail {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		padding: 8px 0;
	}
	.label {
		color: var(--text2);
	}
	.value {
		font-weight: 600;
		text-align: right;
	}
	.actions {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin-top: var(--base-padding);
	}
	@media all and (max-width: 600px) {
		.actions {
			grid-template-columns: 1fr;
		}
		.top {
			flex-direction: column;
		}
		.pnl {
			text-align: left;
		}
	}
</style>

<Modal title='Share Trade' width={520}>
	<div class='container'>
		<div class='card' class:red={!isPositive}>
			<div class='top'>
				<div>
					<div class='brand'>CAP</div>
					<div class='kind'>{cardTitle}</div>
				</div>
				<div>
					<div class='market'>{data.market}</div>
					<div class='side' class:green={isPositive} class:red={!isPositive}>{data.side}</div>
				</div>
			</div>
			<div class='top'>
				<div>
					<div class='kind'>P/L</div>
					<div class='pnl'>{data.pnl}</div>
					{#if data.pnlPercent}
						<div class='pnl pnl-percent'>{data.pnlPercent}</div>
					{/if}
				</div>
			</div>
			<div class='details'>
				{#each rows as row}
					<div class='detail'>
						<div class='label'>{row.label}</div>
						<div class='value'>{row.value}</div>
					</div>
				{/each}
			</div>
		</div>
		<div class='actions'>
			<Button noSubmit={true} isSmall={true} label='Download' on:click={downloadImage} />
			<Button noSubmit={true} isSmall={true} label='Share' on:click={shareImage} />
			<Button noSubmit={true} isSmall={true} label='Copy Text' on:click={copyText} />
		</div>
	</div>
</Modal>
