<template>
	<!-- 购物车弹窗 —— emit close/change/empty 事件 -->
	<view class="cart-popup" :style="$themeStyle">
		<view class="cart-popup__mask" @click="$emit('close')" />

		<view class="cart-popup__panel">
			<view class="cart-popup__handle">
				<view class="cart-popup__handle-bar" />
			</view>
			<view class="cart-popup__header">
				<text class="cart-popup__title">购物车</text>
				<view class="cart-popup__empty-btn" @click="$emit('empty')">
					<u-icon name="trash" size="18" color="var(--color-text-secondary)" />
					<text>清空</text>
				</view>
			</view>

			<view v-if="shopping_card.length === 0" class="cart-popup__empty">
				<u-icon name="shopping-cart" size="48" color="var(--color-disabled)" />
				<text>购物车空空如也</text>
			</view>

			<scroll-view v-else scroll-y class="cart-popup__list">
				<view
					v-for="(item, index) in shopping_card"
					:key="item._id || index"
					class="cart-popup__item"
				>
					<image
						:src="item.image && item.image.length ? item.image[0].url : ''"
						class="cart-popup__item-img"
						mode="aspectFill"
					/>
					<view class="cart-popup__item-info">
						<text class="cart-popup__item-name">{{ item.name }}</text>
						<text class="cart-popup__item-price">¥{{ item.total_price || (item.unitprice * item.quantity).toFixed(2) }}</text>
					</view>
					<view class="cart-popup__item-ctrl">
						<view
							class="cart-popup__ctrl-btn"
							@click.stop="handleChange('reduce', index, item)"
						>
							<u-icon name="minus-circle" size="20" color="var(--color-primary)" />
						</view>
						<text class="cart-popup__ctrl-num">{{ item.quantity }}</text>
						<view
							class="cart-popup__ctrl-btn"
							@click.stop="handleChange('plus', index, item)"
						>
							<u-icon name="plus-circle" size="20" color="var(--color-primary)" />
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
	defineProps({
		shopping_card: { type: Array, default: () => [] },
	});

	const emit = defineEmits(['close', 'empty', 'change']);

	function handleChange(type, index, item) {
		const quantity = type === 'reduce' ? item.quantity - 1 : item.quantity + 1;
		emit('change', {
			type,
			index,
			quantity,
			_id: item._id,
			cid: item.cid,
			good_index: item.good_index,
			unitprice: item.unitprice,
		});
	}
</script>

<style lang="scss" scoped>
	.cart-popup {
		position: fixed;
		inset: 0;
		z-index: 200;
	}

	.cart-popup__mask {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.4);
	}

	.cart-popup__panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		max-height: 60vh;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card) var(--radius-card) 0 0;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-modal);
		animation: slide-up 300ms ease-out;
	}

	.cart-popup__handle {
		display: flex;
		justify-content: center;
		padding: 12rpx 0 4rpx;
		flex-shrink: 0;
	}

	.cart-popup__handle-bar {
		width: 56rpx;
		height: 6rpx;
		border-radius: 3rpx;
		background-color: var(--color-border-light);
	}

	@keyframes slide-up {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	.cart-popup__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 24rpx 16rpx;
		border-bottom: 1rpx solid var(--color-border-light);
		flex-shrink: 0;
	}

	.cart-popup__title {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text);
	}

	.cart-popup__empty-btn {
		display: flex;
		align-items: center;
		gap: 4rpx;
		font-size: 12px;
		color: var(--color-text-secondary);

		&:active { opacity: 0.7; }
	}

	.cart-popup__list {
		flex: 1;
		overflow-y: auto;
		padding: 0 24rpx;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.cart-popup__item {
		display: flex;
		align-items: center;
		padding: 20rpx 0;
		gap: 16rpx;

		& + & {
			border-top: 1rpx solid var(--color-border-light);
		}
	}

	.cart-popup__item-img {
		width: 96rpx;
		height: 96rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
	}

	.cart-popup__item-info {
		flex: 1;
		overflow: hidden;
	}

	.cart-popup__item-name {
		font-size: 14px;
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
	}

	.cart-popup__item-price {
		font-size: 13px;
		font-weight: 600;
		color: var(--color-danger);
		margin-top: 6rpx;
		display: block;
	}

	.cart-popup__item-ctrl {
		display: flex;
		align-items: center;
		gap: 8rpx;
		flex-shrink: 0;
	}

	.cart-popup__ctrl-btn {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;

		&:active {
			transform: scale(0.85);
			transition: transform 120ms ease;
		}
	}

	.cart-popup__ctrl-num {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text);
		min-width: 32rpx;
		text-align: center;
	}

	.cart-popup__empty {
		padding: 80rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		font-size: 14px;
		color: var(--color-text-secondary);
	}
</style>
