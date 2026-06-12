<template>
	<!-- 餐厅点餐骨架屏 —— 匹配 restaurant.vue 各模块布局 -->
	<view class="sk-restaurant" :style="$themeStyle" aria-hidden="true">
		<!-- 顶部栏占位（桌号） -->
		<view class="sk-restaurant__topbar">
			<view class="sk-line sk-line--w30 sk-line--h28" />
		</view>

		<!-- 商户筛选占位 -->
		<view class="sk-restaurant__filter">
			<view class="sk-line sk-line--w40 sk-line--h36" />
			<u-icon name="arrow-down" size="14" color="var(--color-text-secondary)" />
		</view>

		<!-- 主体：左侧分类 + 右侧商品 -->
		<view class="sk-restaurant__body">
			<!-- 左侧分类列 -->
			<view class="sk-restaurant__sidebar">
				<view v-for="n in 5" :key="n" class="sk-restaurant__cate">
					<view class="sk-line sk-line--w80 sk-line--h28" />
				</view>
			</view>

			<!-- 右侧商品列表 -->
			<view class="sk-restaurant__goods">
				<view v-for="n in 4" :key="n" class="sk-restaurant__card">
					<view class="sk-restaurant__card-img" />
					<view class="sk-restaurant__card-body">
						<view class="sk-line sk-line--w90 sk-line--h16" />
						<view class="sk-line sk-line--w40 sk-line--h14" />
						<view class="sk-restaurant__card-ctrl">
							<view class="sk-line sk-line--h28" style="width: 100rpx;" />
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部购物车条占位 -->
		<view class="sk-restaurant__bottombar">
			<view class="sk-restaurant__bottombar-icon">
				<view class="sk-circle sk-circle--48" />
			</view>
			<view class="sk-line sk-line--w30 sk-line--h20" />
			<view class="sk-restaurant__bottombar-btn">
				<view class="sk-line sk-line--w50 sk-line--h32" />
			</view>
		</view>
	</view>
</template>

<script setup>
	// 餐厅点餐骨架屏 —— 无 props，纯占位组件
	// 调用方通过 v-if="!pageReady" 控制显示/隐藏
</script>

<style lang="scss" scoped>
	/* ========== 根容器 ========== */
	.sk-restaurant {
		min-height: 100vh;
		background-color: var(--color-bg);
		display: flex;
		flex-direction: column;
	}

	/* ========== 微光扫过动画 ========== */
	.shimmer-bg {
		position: relative;
		overflow: hidden;
		background-color: var(--color-skeleton-base);

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
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}

	/* ========== 通用线条 ========== */
	.sk-line {
		background-color: var(--color-skeleton-base);
		border-radius: 8rpx;
		position: relative;
		overflow: hidden;

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

		&--h14 { height: 14rpx; }
		&--h16 { height: 16rpx; }
		&--h20 { height: 20rpx; }
		&--h28 { height: 28rpx; }
		&--h32 { height: 32rpx; }
		&--h36 { height: 36rpx; }
		&--w30 { width: 30%; }
		&--w40 { width: 40%; }
		&--w50 { width: 50%; }
		&--w80 { width: 80%; }
		&--w90 { width: 90%; }
	}

	.sk-circle {
		border-radius: 50%;
		background-color: var(--color-skeleton-base);
		position: relative;
		overflow: hidden;

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

		&--48 {
			width: 48rpx;
			height: 48rpx;
		}
	}

	/* ========== 顶部栏占位 ========== */
	.sk-restaurant__topbar {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 80rpx;
		padding-top: var(--status-bar-height, 44px);
		background-color: var(--color-primary);
		background-image: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
		flex-shrink: 0;
	}

	/* ========== 筛选占位 ========== */
	.sk-restaurant__filter {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 24rpx;
		background-color: var(--color-bg-card);
		border-bottom: 1rpx solid var(--color-border-light);
		flex-shrink: 0;
	}

	/* ========== 主体区域 ========== */
	.sk-restaurant__body {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* 左侧分类 */
	.sk-restaurant__sidebar {
		width: 160rpx;
		flex-shrink: 0;
		padding: 12rpx 0;
		background-color: var(--color-bg);
	}

	.sk-restaurant__cate {
		padding: 20rpx 16rpx;
	}

	/* 右侧商品 */
	.sk-restaurant__goods {
		flex: 1;
		padding: 16rpx 16rpx 0;
		overflow-y: auto;
	}

	.sk-restaurant__card {
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
		margin-bottom: 20rpx;
		display: flex;
		overflow: hidden;
	}

	.sk-restaurant__card-img {
		width: 180rpx;
		height: 160rpx;
		flex-shrink: 0;
		background-color: var(--color-skeleton-base);
		position: relative;
		overflow: hidden;

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

	.sk-restaurant__card-body {
		flex: 1;
		padding: 20rpx 16rpx;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.sk-restaurant__card-ctrl {
		margin-top: auto;
		display: flex;
		justify-content: flex-end;
	}

	/* ========== 底部购物车条 ========== */
	.sk-restaurant__bottombar {
		display: flex;
		align-items: center;
		padding: 16rpx 24rpx;
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		background-color: var(--color-bg-card);
		border-top: 1rpx solid var(--color-border-light);
		gap: 16rpx;
		flex-shrink: 0;
	}

	.sk-restaurant__bottombar-icon {
		flex-shrink: 0;
	}

	.sk-restaurant__bottombar-btn {
		margin-left: auto;
		width: 160rpx;
		padding: 12rpx 24rpx;
		background-color: var(--color-skeleton-base);
		border-radius: var(--radius-button);
		display: flex;
		justify-content: center;
	}
</style>
