<script lang="ts">
	import { AppBar, LightSwitch } from '@skeletonlabs/skeleton';

	export let user;
</script>

<AppBar>
	<svelte:fragment slot="lead"><a class="lg" href="/">Home</a></svelte:fragment>
	{#if user}
		<a href="/auth">Protected</a>
	{/if}
	<svelte:fragment slot="trail">
		<LightSwitch />
		{#if !user}
			<a href="/login">Login</a>
		{:else}
			<form action="/?/logout" method="post">
				<input type="submit" value="Logout" />
			</form>
		{/if}
	</svelte:fragment>
</AppBar>
