<template>
	<view class="sk-humanity" :style="$themeStyle">
		<!-- 导航栏占位 -->
		<view class="sk-humanity__navbar">
			<view class="sk-humanity__navbar-back shimmer-bg"></view>
		</view>

		<!-- 模糊背景图区域占位 -->
		<view class="sk-humanity__bg shimmer-bg"></view>

		<!-- 标题占位 -->
		<view class="sk-humanity__title shimmer-bg"></view>

		<!-- 轮播卡片区域占位 -->
		<view class="sk-humanity__swiper">
			<view class="sk-humanity__slide shimmer-bg" v-for="i in 3" :key="i"></view>
		</view>

		<!-- 文字介绍卡片占位 -->
		<view class="sk-humanity__card">
			<view class="sk-line sk-line--w40 shimmer-bg"></view>
			<view class="sk-line sk-line--w90 shimmer-bg"></view>
			<view class="sk-line sk-line--w90 shimmer-bg"></view>
			<view class="sk-line sk-line--w90 shimmer-bg"></view>
			<view class="sk-line sk-line--w70 shimmer-bg"></view>
			<view class="sk-line sk-line--w90 shimmer-bg"></view>
			<view class="sk-line sk-line--w50 shimmer-bg"></view>
		</view>
	</view>
</template>

<script setup>
</script>

<style lang="scss" scoped>
	.sk-humanity {
		position: relative;
		min-height: 100vh;
		background-color: var(--color-bg);
		overflow: hidden;
		padding-bottom: env(safe-area-inset-bottom);
		box-sizing: border-box;
	}

	.shimmer-bg {
		position: relative;
		overflow: hidden;
		background-color: var(--color-border-light);

		&::after {
			content: "";
			position: absolute;
			inset: 0;
			background: linear-gradient(90deg,
					transparent 0%,
					rgba(255, 255, 255, 0.45) 35%,
					rgba(255, 255, 255, 0.55) 50%,
					rgba(255, 255, 255, 0.45) 65%,
					transparent 100%);
			animation: shimmer-slide 1.5s ease-in-out infinite;
		}
	}

	@keyframes shimmer-slide {
		0% {
			transform: translateX(-100%);
		}

		100% {
			transform: translateX(100%);
		}
	}

	.sk-humanity__navbar {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		height: 96rpx;
		padding: 0 32rpx;
	}

	.sk-humanity__navbar-back {
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.sk-humanity__bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 840rpx;
		z-index: 0;
	}

	.sk-humanity__title {
		position: relative;
		z-index: 2;
		width: 300rpx;
		height: 48rpx;
		border-radius: 8rpx;
		margin: 20rpx 30rpx 0;
	}

	.sk-humanity__swiper {
		position: relative;
		z-index: 2;
		display: flex;
		gap: 24rpx;
		margin-top: 30rpx;
		padding-left: 30rpx;
		overflow: hidden;
	}

	.sk-humanity__slide {
		flex-shrink: 0;
		width: 580rpx;
		height: 660rpx;
		border-radius: var(--radius-sm);
	}

	.sk-humanity__card {
		position: relative;
		z-index: 2;
		margin: 10rpx 30rpx 0;
		padding: 32rpx;
		border-radius: var(--radius-card);
		background-color: var(--color-bg-card);
		box-shadow: var(--shadow-soft);
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.sk-line {
		height: 24rpx;
		border-radius: 8rpx;
	}

	.sk-line--w40 {
		width: 40%;
	}

	.sk-line--w50 {
		width: 50%;
	}

	.sk-line--w70 {
		width: 70%;
	}

	.sk-line--w90 {
		width: 90%;
	}
</style>
