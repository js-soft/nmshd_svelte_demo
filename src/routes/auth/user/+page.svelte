<script lang="ts">
	import { io } from '$lib/socket';
	import type { PageData } from './$types';
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import type { ModalSettings, ToastSettings } from '@skeletonlabs/skeleton';
	export let data: PageData;

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	let imageBuffer: string = window.btoa(data.buffer.join(''));

	io.on('onboard_error', (msg: string) => {
		const t: ToastSettings = {
			message: msg,
			timeout: 5000
		};
		toastStore.trigger(t);
	});

	io.on('onboard', (addr: string) => {
		const addresses = data.user!.enmeshed_address ? data.user!.enmeshed_address : [];
		addresses.push(addr);
		data.user!.enmeshed_address = addresses;
	});

	async function trigger_delete(addr: string) {
		const modal: ModalSettings = {
			type: 'confirm',
			// Data
			title: 'Please Confirm',
			body: `Are you sure you wish to delete ${addr} from the connected accounts?`,
			// TRUE if confirm pressed, FALSE if cancel pressed
			response: async (r: boolean) => {
				if (r) {
					const res = await fetch(`/auth/user?${addr}`, {
						method: 'DELETE'
					});
					if (res.status === 204) {
						data.user!.enmeshed_address = data.user!.enmeshed_address?.filter((a) => a !== addr);
					}
				}
			}
		};
		modalStore.trigger(modal);
	}
</script>

<div class="container h-full mx-auto py-10 flex justify-center items-center">
	<div class="space-y-5">
		<section class="space-y-4">
			<h2 class="h2">Connected Enmeshed Accounts:</h2>
			<dl class="list-dl">
				{#if data.user?.enmeshed_address}
					{#each data.user.enmeshed_address as addr}
						<div>
							<span class="flex-auto">
								<p>{addr}</p>
							</span>
							<button
								type="button"
								class="btn-icon variant-filled-error"
								on:click={() => trigger_delete(addr)}>&#x2718;</button
							>
						</div>
					{/each}
				{/if}
			</dl>
			<h2>Scan to Onboard new Account:</h2>
			<img alt="QR_Code" src="data:image/png;base64,{imageBuffer}" />
		</section>
	</div>
</div>
