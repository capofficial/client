<script>
	import { fade, fly } from 'svelte/transition';
	import { X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	export let title = '';
	export let isOpen = false;
	export let maxWidth = '28rem';
	export let showClose = true;

	const dispatch = createEventDispatcher();

	function close() {
		isOpen = false;
		onClose?.();
	function handleKeydown(e) {
		if (e.key === 'Escape') close();
	}

	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) close();
	}
</script>

<svelte:window on:keydown={handleKeydown} />
{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		on:click={handleBackdropClick}
		transition:fade={{ duration: 150 }}
	>
		<div