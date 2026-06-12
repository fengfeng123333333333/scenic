<template>
	<!-- 商品详情弹窗（含规格选择） —— emit close/spec-select/change/toast 事件 -->
	<view class="goods-popup" :style="$themeStyle">
		<view class="goods-popup__mask" @click="$emit('close')" />

		<view class="goods-popup__panel">
			<view class="goods-popup__handle">
				<view class="goods-popup__handle-bar" />
			</view>
			<view class="goods-popup__image-wrap">
				<image
					:src="currentImage"
					class="goods-popup__image"
					mode="aspectFill"
				/>
				<view class="goods-popup__close" @click="$emit('close')">
					<u-icon name="close" size="18" color="var(--color-text-on-primary)" />
				</view>
			</view>

			<scroll-view scroll-y class="goods-popup__body">
				<view class="goods-popup__info">
					<text class="goods-popup__name">{{ itemgood.name }}</text>
					<text v-if="itemgood.monthly_sales" class="goods-popup__sales">
						月售{{ itemgood.monthly_sales }}
					</text>
				</view>

				<view class="goods-popup__price-row">
					<text class="goods-popup__symbol">¥</text>
					<text class="goods-popup__price">{{ itemgood.unitprice }}</text>
				</view>

				<view class="goods-popup__ctrl">
					<view class="goods-popup__ctrl-btn" @click="handleReduce">
						<u-icon name="minus-circle" size="22" color="var(--color-primary)" />
					</view>
					<text class="goods-popup__ctrl-num">{{ itemgood.quantity || 0 }}</text>
					<view class="goods-popup__ctrl-btn" @click="handlePlus">
						<u-icon name="plus-circle" size="22" color="var(--color-primary)" />
					</view>
				</view>

				<view v-if="itemgood.att_hide && specs.length > 0" class="goods-popup__specs">
					<text class="goods-popup__specs-title">{{ itemgood.att_name }}</text>
					<view class="goods-popup__specs-list">
						<view
							v-for="(spec, sIndex) in specs"
							:key="sIndex"
							class="goods-popup__spec"
							:class="{ 'goods-popup__spec--active': selectedSpecIndex === sIndex }"
							@click="selectSpec(spec, sIndex)"
						>
							<text>{{ spec.attribute }}</text>
							<text class="goods-popup__spec-price">¥{{ spec.unitprice }}</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue';

	const props = defineProps({
		pro_details: { type: Object, default: () => ({}) },
	});

	const emit = defineEmits(['close', 'spec-select', 'change', 'toast']);

	const selectedSpecIndex = ref(-1);
	const selectedSpec = ref(null);

	const itemgood = computed(() => props.pro_details.itemgood || {});
	const specs = computed(() => {
		const raw = itemgood.value.specs || [];
		return [...raw].sort((a, b) => (a.unitprice || 0) - (b.unitprice || 0));
	});
	const currentImage = computed(() => {
		const img = itemgood.value.image;
		return img && img.length ? img[0].url : '';
	});

	function selectSpec(spec, sIndex) {
		selectedSpec.value = spec;
		selectedSpecIndex.value = sIndex;

		const idx = props.pro_details.index;
		const gIdx = props.pro_details.good_index;
		const cid = props.pro_details.cid;

		emit('spec-select', {
			index: idx,
			good_index: gIdx,
			cid,
			itemgood: itemgood.value,
			attribute: spec.attribute,
			unitprice: spec.unitprice,
			res_data: spec,
		});
	}

	function handleReduce() {
		checkSpec(() => {
			emit('change', { type: 'reduce', pro_details: props.pro_details });
		});
	}

	function handlePlus() {
		checkSpec(() => {
			emit('change', { type: 'plus', pro_details: props.pro_details });
		});
	}

	function checkSpec(callback) {
		if (itemgood.value.att_hide && specs.value.length > 0) {
			const hasSelected = itemgood.value.good_specs && itemgood.value.good_specs.length > 0;
			if (!hasSelected) {
				emit('toast', '请选择' + itemgood.value.att_name);
				return;
			}
		}
		callback();
	}
</script>

<style lang="scss" scoped>
	.goods-popup {
		position: fixed;
		inset: 0;
		z-index: 200;
	}

	.goods-popup__mask {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.4);
	}

	.goods-popup__panel {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		max-height: 75vh;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card) var(--radius-card) 0 0;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-modal);
		animation: slide-up 300ms ease-out;
	}

	.goods-popup__handle {
		display: flex;
		justify-content: center;
		padding: 12rpx 0 4rpx;
		flex-shrink: 0;
	}

	.goods-popup__handle-bar {
		width: 56rpx;
		height: 6rpx;
		border-radius: 3rpx;
		background-color: var(--color-border-light);
	}

	@keyframes slide-up {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	.goods-popup__image-wrap {
		position: relative;
		width: 100%;
		height: 360rpx;
		flex-shrink: 0;
	}

	.goods-popup__image {
		width: 100%;
		height: 100%;
	}

	.goods-popup__close {
		position: absolute;
		top: 16rpx;
		right: 16rpx;
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.3);
		border-radius: 50%;

		&:active {
			transform: scale(0.9);
			transition: transform 120ms ease;
		}
	}

	.goods-popup__body {
		flex: 1;
		padding: 24rpx 24rpx 0;
		padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
	}

	.goods-popup__info {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.goods-popup__name {
		font-size: 17px;
		font-weight: 600;
		color: var(--color-text);
	}

	.goods-popup__sales {
		font-size: 11px;
		color: var(--color-text-secondary);
	}

	.goods-popup__price-row {
		display: flex;
		align-items: baseline;
		margin-top: 12rpx;
	}

	.goods-popup__symbol {
		font-size: 13px;
		color: var(--color-danger);
		font-weight: 600;
	}

	.goods-popup__price {
		font-size: 20px;
		color: var(--color-danger);
		font-weight: 700;
	}

	.goods-popup__ctrl {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 12rpx;
		margin-top: 20rpx;
	}

	.goods-popup__ctrl-btn {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;

		&:active {
			transform: scale(0.85);
			transition: transform 120ms ease;
		}
	}

	.goods-popup__ctrl-num {
		font-size: 17px;
		font-weight: 600;
		color: var(--color-text);
		min-width: 40rpx;
		text-align: center;
	}

	.goods-popup__specs {
		margin-top: 24rpx;
		padding-top: 24rpx;
		border-top: 1rpx solid var(--color-border-light);
	}

	.goods-popup__specs-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 16rpx;
		display: block;
	}

	.goods-popup__specs-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.goods-popup__spec {
		padding: 12rpx 20rpx;
		border: 1rpx solid var(--color-border-light);
		border-radius: var(--radius-sm);
		background-color: var(--color-bg);
		display: flex;
		align-items: center;
		gap: 8rpx;
		font-size: 13px;
		color: var(--color-text);
		transition: all 150ms ease;

		&:active {
			transform: scale(0.96);
		}

		&--active {
			border-color: var(--color-primary);
			background-color: var(--color-primary-bg-light);
			color: var(--color-primary);
		}
	}

	.goods-popup__spec-price {
		font-size: 12px;
		font-weight: 600;
	}
</style>
