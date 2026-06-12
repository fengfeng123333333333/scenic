<template>
	<view class="page-index" :style="$themeStyle">
		<!-- 4 个 Tab 面板，v-show 保持挂载不销毁 -->
		<HomeContent v-show="currentTab === 0" :active="currentTab === 0" @ready="onHomeReady" />
		<OrderContent v-show="currentTab === 1" :active="currentTab === 1" :initialStatus="orderStatus" />
		<TicketContent v-show="currentTab === 2" :active="currentTab === 2" />
		<MyContent v-show="currentTab === 3" :active="currentTab === 3" />

		<!-- 底部导航栏 -->
		<tab-bar :current="String(currentTab)" :festivalIcons="festivalTabIcons" @change="onTabChange" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		onBeforeUnmount
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import {
		getStoredThemeKey
	} from "@/styles/themes.js";
	import HomeContent from "./home-content.vue";
	import OrderContent from "./order-content.vue";
	import TicketContent from "./ticket-content.vue";
	import MyContent from "./my-content.vue";

	const currentTab = ref(0);
	const orderStatus = ref(0);

	const festivalTabIcons = computed(() => {
		if (getStoredThemeKey() === "national-day") {
			return [
				// "/static/images/tab-国.jpg",
				// "/static/images/tab-庆.jpg",
				// "/static/images/tab-快.jpg",
				// "/static/images/tab-乐.jpg",
				"https://cdn.huibaitech.com/qrcode/public/holiday/guo.jpg",
				"https://cdn.huibaitech.com/qrcode/public/holiday/qing.jpg",
				"https://cdn.huibaitech.com/qrcode/public/holiday/kuai.jpg",
				"https://cdn.huibaitech.com/qrcode/public/holiday/le.jpg",
			];
		}
		if (getStoredThemeKey() === "dragon-boat") {
			return [
				// "/static/images/tab-端.jpg",
				// "/static/images/tab-午.jpg",
				// "/static/images/tab-安.jpg",
				// "/static/images/tab-康.jpg",
				"https://cdn.huibaitech.com/qrcode/public/holiday/duan.jpg",
				"https://cdn.huibaitech.com/qrcode/public/holiday/wu.jpg",
				"https://cdn.huibaitech.com/qrcode/public/holiday/an.jpg",
				"https://cdn.huibaitech.com/qrcode/public/holiday/kang.jpg",
			];
		}
		return [];
	});

	onLoad((option) => {
		console.log("66666666666666666666");
		const tab = Number(option?.tab);
		if (!isNaN(tab) && tab >= 0 && tab <= 3) {
			currentTab.value = tab;
		}
		orderStatus.value = Number(option?.status) || 0;
	});

	onMounted(() => {
		uni.$on("switchTab", (index) => {
			if (typeof index === "number" && index >= 0 && index <= 3) {
				currentTab.value = index;
				uni.pageScrollTo({
					scrollTop: 0,
					duration: 0
				});
			}
		});
	});

	onBeforeUnmount(() => {
		uni.$off("switchTab");
	});

	function onTabChange(index) {
		currentTab.value = index;
		uni.pageScrollTo({
			scrollTop: 0,
			duration: 0
		});
	}

	function onHomeReady() {
		console.log("HomeContent 数据就绪");
	}
</script>

<script>
	export default {
		onShareAppMessage() {
			return {
				title: "小程序",
				path: "/pages/index/index"
			};
		},
	};
</script>

<style>
	page {
		min-height: 100vh;
		background-color: var(--color-bg);
	}
</style>

<style lang="scss" scoped>
	.page-index {
		min-height: 100vh;
		background-color: var(--color-bg);
		padding-bottom: calc(128rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
		font-family:
			"PingFang SC",
			Roboto,
			system-ui,
			-apple-system,
			"Helvetica Neue",
			Arial,
			sans-serif;
	}
</style>