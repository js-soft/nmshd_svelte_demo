<script>
	import { focusTrap } from '@skeletonlabs/skeleton';
	let isFocused = true;
</script>

<div class="container w-96 mx-auto p-4 my-16">
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
</div>
