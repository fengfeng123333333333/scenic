<template>
	<view class="content">
		<web-view :src="srr" style="width: 300px; height: 200px;"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				srr: ""
			}
		},
		onLoad(option) {
			this.srr = option.mind
			console.log(option, "ooooooooo")
		}
	}
</script>

<style>
	.content {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
</style>