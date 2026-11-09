<script>
	import katex from 'katex';
	import 'katex/dist/katex.min.css';

	export let math;
	export let displayMode = false;
	export let style;

	const options = {
		displayMode,
		throwOnError: false,
		style
	};

	$: katexString = katex.renderToString(math, options);
</script>


{@html katexString}
