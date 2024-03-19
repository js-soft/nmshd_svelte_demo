<script lang="ts">
	import { AppShell } from '@skeletonlabs/skeleton';
</script>

<AppShell>
	<div class="democontainer mg-20 py-10">
		<slot />
	</div>
</AppShell>

<style>
	.democontainer {
		justify-items: center;
		align-content: center;
		display: grid;
		padding-top: 5rem;
	}
</style>
