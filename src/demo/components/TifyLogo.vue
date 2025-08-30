<template>
	<svg
		width="592"
		height="240"
		viewBox="0 0 592 240"
		xmlns="http://www.w3.org/2000/svg"
	>
		<title>TIFY</title>
		<rect
			x="12"
			y="12"
			width="568"
			height="216"
			fill="none"
			stroke-width="24"
		/>
		<path d="M72 64h96v26h-34v86h-28V90H72" />
		<path
			d="M199 82h9v76h-9z"
			fill="#06b"
			opacity=".33"
		/>
		<path
			d="M208 74h12v92h-12z"
			fill="#06b"
			opacity=".67"
		/>
		<path
			fill="#06b"
			d="M220 64h28v112h-28z"
		/>
		<path d="M296 64h84v26h-56v23h52v26h-52v37h-28" />
		<path d="m520 64-38 75.27V176h-28v-36.73L416 64h30.16L468 107l21.84-43" />
	</svg>
</template>

<style scoped>
svg {
	max-height: 100%;
	width: 100%;
}

path:not([fill]) {
	fill: light-dark(#444, #fff);
}

rect {
	stroke: light-dark(#444, #fff);
}
</style>
