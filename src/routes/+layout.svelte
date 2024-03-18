<script lang="ts">
	import { AppShell } from '@skeletonlabs/skeleton';
	import '../app.postcss';
	import Navbar from '$components/navbar.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<AppShell slotSidebarLeft="bg-surface-50-900-token lg:w-auto" slotFooter="bg-black p-4">
	<!-- Header -->
	<svelte:fragment slot="header">
		<Navbar user={data.user} />
	</svelte:fragment>

	<!-- Sidebar (Left) -->
	<svelte:fragment slot="sidebarLeft"></svelte:fragment>

	<!-- Page Content -->
	<slot />

	<!-- Page Footer -->
	<svelte:fragment slot="pageFooter"></svelte:fragment>
</AppShell>
