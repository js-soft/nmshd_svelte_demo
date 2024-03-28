<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	let imageBuffer: string;
	if (!data.user!.enmeshed_address) {
		imageBuffer = window.btoa(data.buffer.join(''));
	}
</script>

{#if data.user?.enmeshed_address}
	{#each data.user.enmeshed_address as addr}
		<p>{addr}</p>
	{/each}
{:else}
	<img alt="QR_Code" src="data:image/png;base64,{imageBuffer}" />
{/if}
