<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;

	const imageBuffer = window.btoa(data.buffer.join(''));
</script>

<img alt="QR_Code" src="data:image/png;base64,{imageBuffer}" />
