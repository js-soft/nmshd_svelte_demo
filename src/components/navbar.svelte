<script lang="ts">
	import type { UserData } from '$lib/auth';
	import { AppBar, LightSwitch } from '@skeletonlabs/skeleton';

	export let user: UserData | undefined;

	$: demos = ['bildung', 'hcm'].filter((route) => user?.roles?.includes(route));
</script>

<AppBar>
	<svelte:fragment slot="lead"><a class="lg" href="/">Home</a></svelte:fragment>
	<svelte:fragment slot="trail">
		<LightSwitch />
		{#if !user}
			<a href="/login">Login</a>
		{:else}
			<a href="/auth/user">User</a>
			<a href="/auth">Protected</a>
			{#each demos as demo}
				<a href="/auth/demo/{demo}">{demo} </a>
			{/each}
			<form action="/?/logout" method="post">
				<input type="submit" value="Logout" />
			</form>
		{/if}
	</svelte:fragment>
</AppBar>
