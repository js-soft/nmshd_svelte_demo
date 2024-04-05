<script lang="ts">
	import { focusTrap, getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import { io } from '$lib/socket';
	let isFocused = true;

	export let data: PageData;
	const toastStore = getToastStore();

	io.on('login_error', (msg: string) => {
		const t: ToastSettings = {
			message: msg,
			timeout: 5000
		};
		toastStore.trigger(t);
	});

	const imageBuffer = window.btoa(data.buffer.join(''));
</script>

<div class="container w-96 mx-auto p-4 my-16">
	<section class="space-y-4">
		<form use:focusTrap={isFocused} method="POST">
			<label class="label my-4">
				<span>Username</span>
				<input class="input" name="username" type="text" placeholder="Input" />
			</label>

			<label class="label my-4">
				<span>Password</span>
				<input class="input" name="password" type="password" placeholder="password" />
			</label>

			<button class="btn variant-filled">Login</button>
		</form>
		<img alt="QR_Code" src="data:image/png;base64,{imageBuffer}" />
	</section>
</div>
