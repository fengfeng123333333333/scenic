<template>
	<!-- 左侧分类列 —— 纯展示，emit select 事件 -->
	<view class="sidebar">
		<scroll-view scroll-y class="sidebar__scroll">
			<view
				v-for="(item, index) in itemize"
				:key="item.cid || index"
				class="sidebar__item"
				:class="{ 'sidebar__item--active': trigger === index }"
				@click="$emit('select', index, item.cid)"
			>
				<text class="sidebar__name">{{ item.value }}</text>
				<view v-if="item.sele_quantity > 0" class="sidebar__badge">
					{{ item.sele_quantity }}
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	defineProps({
		itemize: { type: Array, default: () => [] },
		trigger: { type: Number, default: 0 },
	});

	defineEmits(['select']);
</script>

<style lang="scss" scoped>
	.sidebar {
		width: 160rpx;
		flex-shrink: 0;
		background-color: var(--color-bg);
	}

	.sidebar__scroll {
		height: 100%;
	}

	.sidebar__item {
		padding: 24rpx 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: background-color 200ms ease;
		min-height: 76rpx;

		&--active {
			background-color: var(--color-bg-card);
			border-left: 4rpx solid var(--color-primary);

			.sidebar__name {
				color: var(--color-primary);
				font-weight: 600;
			}
		}
	}

	.sidebar__name {
		font-size: 13px;
		color: var(--color-text);
		line-height: 1.4;
		text-align: center;
	}

	.sidebar__badge {
		position: absolute;
		top: 8rpx;
		right: 6rpx;
		min-width: 32rpx;
		height: 32rpx;
		padding: 0 6rpx;
		border-radius: 16rpx;
		background-color: var(--color-danger);
		color: var(--color-text-on-primary);
		font-size: 10px;
		line-height: 32rpx;
		text-align: center;
		transform: scale(0.85);
	}
</style>
