<template>
	<!-- 底部购物车条 —— 纯展示，emit open-cart / submit 事件 -->
	<view class="cart-bar">
		<view class="cart-bar__icon-wrap" @click="$emit('open-cart')">
			<u-icon name="shopping-cart" size="24" color="var(--color-text-on-primary)" />
			<view v-if="totalQuantity > 0" class="cart-bar__badge">{{ totalQuantity > 99 ? '99+' : totalQuantity }}
			</view>
		</view>

		<view class="cart-bar__info">
			<text class="cart-bar__total">¥{{ totalPrice.toFixed(2) }}</text>
			<text class="cart-bar__desc">已选{{ totalQuantity }}件</text>
		</view>

		<view class="cart-bar__submit" :class="{ 'cart-bar__submit--disabled': totalQuantity === 0 }"
			@click="handleSubmit">
			选好了
		</view>
	</view>
</template>

<script setup>
	const props = defineProps({
		totalPrice: {
			type: Number,
			default: 0
		},
		totalQuantity: {
			type: Number,
			default: 0
		},
	});

	const emit = defineEmits(['open-cart', 'submit']);

	function handleSubmit() {
		if (props.totalQuantity === 0) return;
		emit('submit');
	}
</script>

<style lang="scss" scoped>
	.cart-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		padding: 40rpx 24rpx;
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		background-color: var(--color-bg-card);
		border-top: 1rpx solid var(--color-border-light);
		z-index: 99;
	}

	.cart-bar__icon-wrap {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-primary);
		border-radius: 50%;
		position: relative;
		margin-top: -32rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);

		&:active {
			transform: scale(0.92);
			transition: transform 120ms ease;
		}
	}

	.cart-bar__badge {
		position: absolute;
		top: -4rpx;
		right: -4rpx;
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

	.cart-bar__info {
		margin-left: 20rpx;
		display: flex;
		flex-direction: column;
	}

	.cart-bar__total {
		font-size: 17px;
		font-weight: 700;
		color: var(--color-text);
	}

	.cart-bar__desc {
		font-size: 11px;
		color: var(--color-text-secondary);
		margin-top: 2rpx;
	}

	.cart-bar__submit {
		margin-left: auto;
		padding: 16rpx 40rpx;
		background-color: var(--color-primary);
		color: var(--color-text-on-primary);
		font-size: 15px;
		font-weight: 600;
		border-radius: var(--radius-button);
		transition: all 120ms ease;
		white-space: nowrap;

		&:active {
			transform: scale(0.95);
			opacity: 0.88;
		}

		&--disabled {
			opacity: 0.45;
			pointer-events: none;
		}
	}
</style>