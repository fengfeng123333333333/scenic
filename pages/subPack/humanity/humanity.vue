<!--
  人文风光 — 沉浸式展示景区人文风光列表，模糊背景 + 轮播卡片 + 文字介绍
  遵循 改造标准.md & 设计稿规范.md
  所有颜色均通过 CSS 变量驱动，由 $themeStyle 注入主题值
  玻璃拟态半透明白色遮罩层保留，不影响主题切换

  旧函数映射：
    onLoad(option) → onLoad → getSceneryList()
    onSwiperChange   → onSwiperChange (保留不变)
    getSceneryList   → getSceneryList() (改造：添加 try/finally + pageReady + requestLoading)
-->
<template>
	<view class="humanity-page" :style="$themeStyle">
		<!-- 骨架屏加载态 -->
		<HumanitySkeleton v-if="!pageReady" />

		<template v-else>
			<!-- 接口请求遮罩 -->
			<RequestLoading v-if="requestLoading" text="正在加载..." />

			<!-- 模糊背景图 -->
			<image class="humanity__bg" :src="currentBgImage" mode="aspectFill" />

			<!-- 主内容层 -->
			<view class="humanity__main">
				<!-- 顶部安全区 + 返回按钮 -->
				<view class="humanity__top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
					<view class="humanity__back" @click="goBack">
						<u-icon name="arrow-left" color="#ffffff" size="22" />
					</view>
				</view>
				<!-- 顶部标题 -->
				<!-- <view class="humanity__title">{{ currentTitle }}</view> -->

				<!-- 轮播卡片区域 -->
				<view class="humanity__swiper">
					<swiper class="humanity__swiper-inner" :current="currentIndex" @change="onSwiperChange"
						previous-margin="30rpx" next-margin="120rpx" circular>
						<swiper-item v-for="(item, index) in imageList" :key="index" class="swiper-item">
							<view class="humanity__slide">
								<image class="humanity__slide-img"
									:class="{ 'humanity__slide-img--active': currentIndex === index }"
									:src="item.ImgUrl" mode="aspectFill" />
							</view>
						</swiper-item>
					</swiper>
				</view>

				<!-- 文字介绍卡片 -->
				<view class="humanity__intro">
					<view class="humanity__card">
						<view class="humanity__card-title">{{ currentTitle }}</view>
						<f-parse :content="currentContent" />
					</view>
				</view>
			</view>
		</template>

		<!-- Toast -->
		<u-toast ref="uToastRef" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";
	import HumanitySkeleton from "@/components/skeleton/humanity_skeleton.vue";
	import RequestLoading from "@/components/loading/request-loading.vue";
	import {
		useToast
	} from "@/util/toast.js";

	// ==================== 页面路由常量 ====================
	// （本页无跳转，预留结构）

	// ==================== 数据 ====================

	const currentIndex = ref(0);
	const imageList = ref([]);
	const pageReady = ref(false);
	const requestLoading = ref(false);

	// ==================== Refs ====================
	const {
		uToastRef,
		showToast
	} = useToast();

	// ==================== 计算属性 ====================
	const currentBgImage = computed(() => {
		return imageList.value[currentIndex.value]?.ImgUrl || "";
	});

	const currentTitle = computed(() => {
		return imageList.value[currentIndex.value]?.Title || "";
	});

	const currentContent = computed(() => {
		return imageList.value[currentIndex.value]?.Intro || "";
	});

	// ==================== 生命周期 ====================
	onLoad(() => {
		getSceneryList();
	});

	// ==================== 数据请求 ====================
	async function getSceneryList() {
		requestLoading.value = true;
		try {
			const res = await uni.$myRequest({
				url: "/api/Applets/AppletsGetAppletsSceneryList",
				method: "POST",
			});
			imageList.value = res.data?.Data || [];
		} catch {
			showToast("加载失败，请重试");
		} finally {
			requestLoading.value = false;
			pageReady.value = true;
		}
	}

	// ==================== 导航辅助 ====================
	const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0;

	function goBack() {
		uni.navigateBack();
	}

	// ==================== 业务方法 ====================
	const onSwiperChange = (e) => {
		currentIndex.value = e.detail.current;
	};
</script>

<style lang="scss" scoped>
	.humanity-page {
		position: relative;
		width: 100vw;
		min-height: 100vh;
		background-color: var(--color-bg);
		overflow: hidden;
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: border-box;
	}

	/* ====== 模糊背景图 ====== */
	.humanity__bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 840rpx;
		filter: blur(30rpx);
		opacity: 0.7;
		z-index: 0;
		transition: opacity 0.5s ease;
	}

	/* ====== 主内容层 ====== */
	.humanity__main {
		position: relative;
		z-index: 1;
		width: 100%;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	/* ====== 顶部安全区 + 返回按钮 ====== */
	.humanity__top-bar {
		display: flex;
		align-items: center;
		padding: 0 30rpx 20rpx;
	}

	.humanity__back {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.15);
	}

	.humanity__back:active {
		opacity: 0.7;
		transform: scale(0.92);
	}

	/* ====== 标题 ====== */
	.humanity__title {
		margin-top: 20rpx;
		padding: 0 30rpx;
		font-size: var(--font-size-h1);
		font-weight: 700;
		color: #ffffff;
		letter-spacing: 2rpx;
	}

	/* ====== 轮播区域 ====== */
	.humanity__swiper {
		margin-top: 50rpx;
		padding-left: 0;
	}

	.humanity__swiper-inner {
		width: 100%;
		height: 750rpx;
	}

	.swiper-item {
		display: flex;
		align-items: center;
		padding: 0 !important;
	}

	.humanity__slide {
		width: 95%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.humanity__slide-img {
		width: 100%;
		height: 100%;
		border-radius: var(--radius-sm);
		transform: scale(0.92);
		transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.humanity__slide-img--active {
		transform: scale(1);
	}

	/* ====== 文字介绍区域 ====== */
	.humanity__intro {
		flex: 1;
		padding: 0 30rpx;
		margin-top: 10rpx;
	}

	/* 玻璃拟态卡片（半透明白色保留，保留设计意图） */
	.humanity__card {
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(20rpx);
		border-radius: var(--radius-card);
		border: 1px solid rgba(255, 255, 255, 0.05);
		padding: 32rpx;
		box-shadow: var(--shadow-soft);
	}

	.humanity__card-title {
		font-size: var(--font-size-h1);
		font-weight: 700;
		color: var(--color-primary);
		margin-bottom: 20rpx;
		letter-spacing: 2rpx;
	}

	/* f-parse 富文本文字颜色穿透（玻璃拟态卡片为深色底，需浅色文字） */
	.humanity__card :deep(.f-parse) {
		font-size: var(--font-size-body);
		line-height: 1.8;
		text-align: justify;
		letter-spacing: 1rpx;
	}
</style>