import { get } from 'svelte/store'
import { formatDate, formatForDisplay, formatSide, formatMarketName, formatOrderType } from '@lib/formatters'
import { historySorted } from '@lib/stores'

export function exportHistoryToCSV() {
	const items = get(historySorted)
	if (!items || items.length === 0) return

	const headers = [
		'Order ID', 'Date', 'Side', 'Market', 'Price', 'Size',
		'Asset', 'Margin', 'Leverage', 'Type', 'Status', 'Reason',
		'P/L', 'Fee', 'Expiry'
	]

	const rows = items.map(item => [
		item.status === 'liquidated' ? 'Liq' : item.orderId,
		formatDate(item.timestamp),
		formatSide(item.isLong, item.isReduceOnly),
		formatMarketName(item.market),
		item.price * 1 > 0 ? formatForDisplay(item.price) : '',
		formatForDisplay(item.size),
		item.asset,
		formatForDisplay(item.margin),
		item.leverage ? formatForDisplay(item.leverage) : '',
		formatOrderType(item.orderType),
		item.status,
		item.reason || '',
		item.pnl ? formatForDisplay(item.pnl) : '',
		formatForDisplay(item.fee),
		item.expiry ? formatDate(item.expiry) : ''
	])

	const csvContent = [
		headers.join(','),
		...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
	].join('\n')

	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	const now = new Date()
	const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
	link.href = url
	link.download = `cap-trading-history-${dateStr}.csv`
	link.click()
	URL.revokeObjectURL(url)
}
