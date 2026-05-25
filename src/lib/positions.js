// Positions library

export const positions = writable([])

export function availableMarginToRemove(position) {
	// Calculate available margin that can be removed
	// This is the position's margin minus any required minimum margin
	if (!position || !position.margin) return 0
	const requiredMargin = position.size * 0.01 / position.leverage || 0
	return Math.max(0, position.margin - requiredMargin)
}