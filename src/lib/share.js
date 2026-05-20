import { formatDate, formatForDisplay, formatMarketName, formatPnl, formatPriceForDisplay, formatSide } from './formatters'

function stripHtml(value) {
	return (value || '').replace(/<[^>]+>/g, '')
}

function formatMarketLabel(market) {
	return stripHtml(formatMarketName(market))
}

function formatPriceValue(value) {
	if (value === undefined || value === null || value === '' || isNaN(value * 1)) return '-'
	return formatPriceForDisplay(value)
}

function formatAssetValue(value, asset) {
	if (value === undefined || value === null || value === '' || isNaN(value * 1)) return '-'
	return `${formatForDisplay(value)} ${asset}`
}

export function buildTradeShareData(kind, trade, meta = {}) {
	const isHistory = kind == 'history'
	const side = isHistory ? formatSide(trade.isLong, trade.isReduceOnly, trade.pnl) : formatSide(trade.isLong)
	const pnl = meta.pnl ?? trade.pnl
	const status = isHistory ? (trade.status || '-') : 'Open'
	const timestamp = formatDate(trade.timestamp)

	const fields = [
		{ label: 'Entry Price', value: formatPriceValue(trade.price) },
		{ label: 'Size', value: formatAssetValue(trade.size, trade.asset) },
		{ label: 'Margin', value: formatAssetValue(trade.margin, trade.asset) },
		{ label: 'Leverage', value: trade.leverage ? `${formatForDisplay(trade.leverage)}×` : '-' }
	]

	if (isHistory) {
		fields.push(
			{ label: 'Order Status', value: status },
			{ label: 'P/L', value: pnl !== undefined ? `${formatPnl(pnl)} ${trade.asset}` : '-' },
			{ label: 'Fee', value: formatAssetValue(trade.fee, trade.asset) },
			{ label: 'Submitted', value: timestamp || '-' }
		)
	} else {
		fields.push(
			{ label: 'Current Price', value: formatPriceValue(meta.currentPrice) },
			{ label: 'P/L', value: pnl !== undefined ? `${formatPnl(pnl)} ${trade.asset}` : '-' },
			{ label: 'Funding', value: formatAssetValue(meta.funding, trade.asset) },
			{ label: 'Liq. Price', value: formatPriceValue(meta.liqPrice) }
		)
	}

	return {
		kind,
		title: isHistory ? 'Trade Recap' : 'Open Position',
		market: formatMarketLabel(trade.market),
		side,
		status,
		timestamp,
		pnl,
		asset: trade.asset,
		fileName: `cap-${kind}-${String(trade.market || 'trade').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`,
		fields
	}
}

export function buildTradeShareText(shareData) {
	return [
		`CAP ${shareData.title}`,
		`${shareData.market} • ${shareData.side}`,
		...shareData.fields.map((field) => `${field.label}: ${field.value}`)
	].join('\n')
}

export async function renderTradeShareCard(shareData) {
	const width = 1200
	const height = 675
	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	const ctx = canvas.getContext('2d')

	const gradient = ctx.createLinearGradient(0, 0, width, height)
	gradient.addColorStop(0, '#0f172a')
	gradient.addColorStop(0.55, '#111827')
	gradient.addColorStop(1, '#020617')
	ctx.fillStyle = gradient
	ctx.fillRect(0, 0, width, height)

	ctx.fillStyle = 'rgba(255,255,255,0.05)'
	ctx.fillRect(54, 54, width - 108, height - 108)
	ctx.strokeStyle = 'rgba(255,255,255,0.08)'
	ctx.lineWidth = 2
	ctx.strokeRect(54, 54, width - 108, height - 108)

	const accent = shareData.side.toLowerCase().includes('short') ? '#ff7a7a' : '#72f2a4'
	ctx.fillStyle = accent
	ctx.fillRect(86, 94, 14, 108)

	ctx.fillStyle = '#f8fafc'
	ctx.font = '700 28px sans-serif'
	ctx.fillText('CAP', 126, 120)
	ctx.font = '700 54px sans-serif'
	ctx.fillText(shareData.market, 126, 184)

	ctx.font = '600 28px sans-serif'
	ctx.fillStyle = accent
	ctx.fillText(shareData.side, 126, 228)

	ctx.textAlign = 'right'
	ctx.fillStyle = '#cbd5e1'
	ctx.font = '600 26px sans-serif'
	ctx.fillText(shareData.title, width - 96, 120)
	ctx.font = '500 22px sans-serif'
	ctx.fillText(shareData.timestamp || '', width - 96, 160)
	ctx.textAlign = 'left'

	const startY = 298
	const boxWidth = 480
	const boxHeight = 88
	const gapX = 44
	const gapY = 24

	shareData.fields.forEach((field, index) => {
		const col = index % 2
		const row = Math.floor(index / 2)
		const x = 86 + col * (boxWidth + gapX)
		const y = startY + row * (boxHeight + gapY)

		ctx.fillStyle = 'rgba(15, 23, 42, 0.74)'
		ctx.fillRect(x, y, boxWidth, boxHeight)
		ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)'
		ctx.lineWidth = 1
		ctx.strokeRect(x, y, boxWidth, boxHeight)

		ctx.fillStyle = '#94a3b8'
		ctx.font = '600 18px sans-serif'
		ctx.fillText(field.label.toUpperCase(), x + 24, y + 28)

		ctx.fillStyle = field.label == 'P/L' && shareData.pnl !== undefined ? (shareData.pnl * 1 >= 0 ? '#72f2a4' : '#ff7a7a') : '#f8fafc'
		ctx.font = '700 28px sans-serif'
		ctx.fillText(field.value, x + 24, y + 62)
	})

	ctx.fillStyle = 'rgba(148, 163, 184, 0.9)'
	ctx.font = '500 20px sans-serif'
	ctx.fillText('Shareable trade snapshot generated on CAP.', 86, height - 88)

	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob)
			} else {
				reject(new Error('Failed to generate share image'))
			}
		}, 'image/png')
	})
}
