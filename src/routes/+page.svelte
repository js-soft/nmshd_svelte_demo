<script lang="ts">
	import { io } from '$lib/socket';
	import { onMount } from 'svelte';

	onMount(() => {
		io.on('test', (message) => {
			console.log(message);
		});
	});
</script>
