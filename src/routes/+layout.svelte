<script lang="ts">
	import { AppShell, Modal, Toast, initializeStores } from '@skeletonlabs/skeleton';
	import '../app.postcss';
	import Navbar from '$components/navbar.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { io } from '$lib/socket';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	initializeStores();
	export let data: PageData;
	onMount(() => {
		io.connect();
		io.on('failedLogin', (m) => {
			console.log(m);
		});
		io.on('login', async (m) => {
			const redirect = $page.url.searchParams.get('redirectTo');
			let res = await fetch(`/login?${redirect ? 'redirectTo=' + redirect : ''}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain'
				},
				redirect: 'follow',
				body: m
			});
			if (res.redirected) {
				await goto(res.url, { invalidateAll: true });
			}
		});
	});
</script>

<Modal />
<Toast />

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
