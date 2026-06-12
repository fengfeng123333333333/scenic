<template>
	<!-- 右侧商品列表 —— 纯展示，emit add/remove/spec/scroll 事件 -->
	<view class="goods-list">
		<scroll-view
			scroll-y
			class="goods-list__scroll"
			:scroll-into-view="scrollInto"
			:show-scrollbar="false"
			@scroll="onScroll"
		>
			<view
				v-for="(group, gIndex) in goods"
				:key="gIndex"
				:id="'group-' + gIndex"
				class="goods-list__group"
			>
				<view class="goods-list__title">{{ group.typeName }}</view>

				<view
					v-for="(item, i) in group.good_query || []"
					:key="item._id || i"
					class="goods-list__card"
				>
					<image
						:src="item.image && item.image.length ? item.image[0].url : ''"
						class="goods-list__pic"
						mode="aspectFill"
					/>
					<view class="goods-list__info">
						<text class="goods-list__name">{{ item.name }}</text>
						<view class="goods-list__price-row">
							<text class="goods-list__symbol">¥</text>
							<text class="goods-list__price">{{ item.unitprice }}</text>
						</view>
						<view class="goods-list__ctrl">
							<view
								v-if="item.quantity > 0"
								class="ctrl-btn"
								@click.stop="$emit('remove', gIndex, i, group.cid, item)"
							>
								<u-icon name="minus-circle" size="22" color="var(--color-primary)" />
							</view>
							<text
								v-if="item.quantity > 0"
								class="ctrl-num"
							>{{ item.quantity }}</text>
							<view
								class="ctrl-btn"
								@click.stop="handleAdd(item, gIndex, i, group.cid)"
							>
								<u-icon name="plus-circle" size="22" color="var(--color-primary)" />
							</view>
						</view>
						<view
							v-if="item.att_hide && item.specs && item.specs.length > 0"
							class="specs-btn"
							@click.stop="$emit('spec', gIndex, i, group.cid, item)"
						>
							<text class="specs-btn__text">选规格</text>
							<view v-if="item.good_specs && item.good_specs.length > 0" class="specs-btn__badge">
								<text>{{ item.good_specs.length }}项已选</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	defineProps({
		goods: { type: Array, default: () => [] },
		scrollInto: { type: String, default: '' },
	});

	const emit = defineEmits(['add', 'remove', 'spec', 'scroll']);

	function onScroll(e) {
		emit('scroll', e);
	}

	function handleAdd(item, gIndex, i, cid) {
		if (item.att_hide && item.specs && item.specs.length > 0 && (!item.good_specs || item.good_specs.length === 0)) {
			emit('spec', gIndex, i, cid, item);
			return;
		}
		emit('add', gIndex, i, cid, item, '');
	}
</script>

<style lang="scss" scoped>
	.goods-list {
		flex: 1;
		overflow: hidden;
	}

	.goods-list__scroll {
		height: 100%;
		padding: 0 16rpx;
	}

	.goods-list__group {
		padding-bottom: 8rpx;
	}

	.goods-list__title {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text);
		padding: 16rpx 8rpx 8rpx;
	}

	.goods-list__card {
		display: flex;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
		margin-bottom: 16rpx;
		overflow: hidden;
		transition: transform 120ms ease;

		&:active {
			transform: scale(0.98);
		}
	}

	.goods-list__pic {
		width: 180rpx;
		height: 160rpx;
		flex-shrink: 0;
	}

	.goods-list__info {
		flex: 1;
		padding: 16rpx 16rpx 16rpx 20rpx;
		display: flex;
		flex-direction: column;
	}

	.goods-list__name {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text);
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.goods-list__price-row {
		margin-top: 6rpx;
		display: flex;
		align-items: baseline;
	}

	.goods-list__symbol {
		font-size: 12px;
		color: var(--color-danger);
		font-weight: 600;
	}

	.goods-list__price {
		font-size: 16px;
		color: var(--color-danger);
		font-weight: 600;
		line-height: 1.2;
	}

	.goods-list__ctrl {
		margin-top: auto;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 8rpx;
	}

	.ctrl-btn {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;

		&:active {
			transform: scale(0.88);
			opacity: 0.7;
			transition: all 120ms ease;
		}
	}

	.ctrl-num {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text);
		min-width: 36rpx;
		text-align: center;
		line-height: 48rpx;
		transition: all 200ms ease;
	}

	.specs-btn {
		margin-top: 8rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		background-color: var(--color-primary-bg-light);
		border: 1rpx solid var(--color-primary-border-light);
		align-self: flex-start;

		&:active {
			transform: scale(0.96);
			transition: all 120ms ease;
		}
	}

	.specs-btn__text {
		font-size: 12px;
		color: var(--color-primary);
	}

	.specs-btn__badge {
		font-size: 10px;
		color: var(--color-text-secondary);
		background-color: var(--color-bg);
		padding: 2rpx 8rpx;
		border-radius: 8rpx;
	}
</style>
