<!--
  订单详情/支付页面 —— 遵循改造标准 + 设计稿规范 + UI/UX Max Pro
  主题：通过 var(--color-*) 变量驱动，支持 6 套主题切换
  旧函数映射：pay()→handlePay / add_dish()→goToRestaurant
-->
<template>
	<view class="order-detail" :style="$themeStyle">
		<!-- 顶部 -->
		<view class="order-detail__top">
			<view class="order-detail__remind">
				<text class="order-detail__remind-title">下单成功</text>
				<text class="order-detail__remind-desc">订单支付后才能出餐</text>
			</view>
		</view>

		<!-- 主体 -->
		<view class="order-detail__body">
			<!-- 商品列表 -->
			<view class="order-detail__card">
				<view class="order-detail__merchant">
					<u-icon name="shopping-cart" size="16" color="var(--color-text-secondary)" />
					<text>已选商品</text>
				</view>
				<view v-for="(item, idx) in goods_list" :key="idx" class="order-detail__food">
					<image
						:src="item.image && item.image.length ? item.image[0].url : ''"
						mode="aspectFill"
						class="order-detail__food-img"
					/>
					<view class="order-detail__food-info">
						<text class="order-detail__food-name">{{ item.name }}</text>
						<text v-if="item.good_specs" class="order-detail__food-specs">{{ item.good_specs }}</text>
						<text class="order-detail__food-meta">x{{ item.quantity }}{{ item.unit }}</text>
					</view>
					<text class="order-detail__food-price">¥{{ item.total_price }}</text>
				</view>

				<view class="order-detail__total">
					<text class="order-detail__total-num">共{{ other_data.TotalNumber }}份</text>
					<view class="order-detail__total-price">
						<text>总计</text>
						<text class="order-detail__total-amount">¥{{ other_data.TotalMoney }}</text>
					</view>
				</view>
			</view>

			<!-- 订单信息 -->
			<view class="order-detail__card order-detail__info">
				<view class="order-detail__info-row">
					<text class="order-detail__info-label">订单编号</text>
					<text class="order-detail__info-value">{{ other_data.OrderCode }}</text>
				</view>
				<view class="order-detail__info-row">
					<text class="order-detail__info-label">桌台名称</text>
					<text class="order-detail__info-value">{{ number_people }}</text>
				</view>
				<view v-if="orderRemark" class="order-detail__info-row">
					<text class="order-detail__info-label">备注</text>
					<view class="order-detail__info-value-wrap">
						<text class="order-detail__info-value" :class="{ 'order-detail__info-value--clamped': !remarkExpanded }">{{ orderRemark }}</text>
						<view v-if="remarkNeedExpand" class="order-detail__remark-toggle" @click="remarkExpanded = !remarkExpanded">
							<text>{{ remarkExpanded ? '收起' : '展开全部' }}</text>
							<u-icon :name="remarkExpanded ? 'arrow-up' : 'arrow-down'" size="12" color="var(--color-primary)" />
						</view>
					</view>
				</view>
			</view>

			<!-- 支付方式 -->
			<view class="order-detail__payment">
				<view class="order-detail__payment-header">
					<text class="order-detail__payment-title">选择支付方式</text>
				</view>
				<view class="order-detail__pay-item" @click="baseValue = '0'">
					<u-icon name="weixin-fill" size="24" color="#07C160" />
					<text class="order-detail__pay-label">微信支付</text>
					<view class="order-detail__radio" :class="{ 'order-detail__radio--checked': baseValue === '0' }">
						<view v-if="baseValue === '0'" class="order-detail__radio-dot" />
					</view>
				</view>
				<view v-if="other_data.IsBindMember == true" class="order-detail__pay-item" @click="baseValue = '1'">
					<u-icon name="red-packet" size="24" color="var(--color-secondary)" />
					<text class="order-detail__pay-label">会员支付</text>
					<view class="order-detail__radio" :class="{ 'order-detail__radio--checked': baseValue === '1' }">
						<view v-if="baseValue === '1'" class="order-detail__radio-dot" />
					</view>
				</view>
			</view>
		</view>

		<!-- 底部支付按钮 -->
		<view v-if="close_dish" class="order-detail__footer">
			<view
				class="order-detail__pay-btn"
				:class="{ 'order-detail__pay-btn--disabled': payLoading }"
				@click="handlePay"
			>
				<u-loading-icon v-if="payLoading" mode="circle" size="16" color="var(--color-text-on-primary)" />
				<text>{{ payLoading ? '支付中...' : '支付' }}</text>
			</view>
		</view>

		<RequestLoading v-if="payLoading" text="正在支付..." />
		<u-toast ref="uToastRef" />
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { useToast } from '@/util/toast.js'
	import { useStore } from '@/store/index.js'
	import RequestLoading from '@/components/loading/request-loading.vue'

	const PAGE_ROUTES = {
		restaurant: '/pages/subPack/restaurant/restaurant',
		order: '/pages/index/index',
	}

	const { state, setOrder } = useStore()
	const { uToastRef, showToast } = useToast()

	const other_data = ref({})
	const baseValue = ref('0')
	const number_people = ref('')
	const close_dish = ref(true)
	const payLoading = ref(false)
	const paying = ref(false)
	const goods_list = ref([])
	const remarkExpanded = ref(false)

	const orderRemark = computed(() => state.orderRemark || other_data.value.Remark || other_data.value.remark || '')
	const remarkNeedExpand = computed(() => orderRemark.value.length > 30)

	async function handlePay() {
		if (paying.value) return
		paying.value = true
		payLoading.value = true

		try {
			const openid = uni.getStorageSync('userinfo') || {}
			const res = await uni.$myRequest({
				url: '/api/Applets/AppletsPayGoodsOrder',
				method: 'POST',
				data: {
					openId: openid.openid,
					orderID: other_data.value.OrderID,
					payType: baseValue.value,
				},
			})

			if (res.data.Code == 200 && baseValue.value == '0') {
				payLoading.value = false
				if (other_data.value.TotalMoney == 0) {
					setOrder(other_data.value.OrderID)
					uni.reLaunch({ url: `${PAGE_ROUTES.order}?tab=1` })
				} else {
					const pay_info = res.data.Data || {}
					setOrder(other_data.value.OrderID)
					uni.requestPayment(Object.assign({}, {
						paySign: pay_info.paySign,
						timeStamp: pay_info.timeStamp,
						nonceStr: pay_info.nonceStr,
						package: pay_info.package_str,
						signType: pay_info.signType,
					}, {
						success() { uni.reLaunch({ url: `${PAGE_ROUTES.order}?tab=1` }) },
						fail() {},
					}))
				}
			} else if (res.data.Code == 200 && other_data.value.IsBindMember == true && baseValue.value == '1') {
				setOrder(other_data.value.OrderID)
				uni.reLaunch({ url: `${PAGE_ROUTES.order}?tab=1` })
			} else {
				payLoading.value = false
				showToast('支付失败')
			}
		} catch {
			payLoading.value = false
			showToast('网络异常，请重试')
		}

		paying.value = false
		setTimeout(() => { payLoading.value = false }, 30000)
	}

	onLoad((option) => {
		if (option.id !== undefined && option.status === 'success') {
			close_dish.value = false
		}
		number_people.value = state.number_people || ''
		other_data.value = state.paymen || {}
		goods_list.value = state.payDay || []
	})
</script>

<style lang="scss" scoped>
	.order-detail {
		min-height: 100vh;
		background-color: var(--color-bg);
		display: flex;
		flex-direction: column;
	}

	.order-detail__top {
		background: linear-gradient(180deg, var(--color-primary), var(--color-primary-hover));
		height: 300rpx;
		flex-shrink: 0;
	}

	.order-detail__remind {
		padding: 60rpx 0 0 50rpx;
	}

	.order-detail__remind-title {
		font-size: 18px;
		font-weight: 700;
		color: var(--color-text-on-primary);
		display: block;
		padding-bottom: 20rpx;
	}

	.order-detail__remind-desc {
		font-size: 14px;
		color: var(--color-text-on-primary);
		opacity: 0.85;
	}

	.order-detail__body {
		flex: 1;
		padding: 0 20rpx;
		position: relative;
		top: -100rpx;
		padding-bottom: 180rpx;
	}

	.order-detail__card {
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		padding: 0 20rpx;
		margin-bottom: 20rpx;
		box-shadow: var(--shadow-soft);
	}

	.order-detail__merchant {
		height: 80rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
		font-size: 13px;
		color: var(--color-text-secondary);
	}

	.order-detail__food {
		display: flex;
		align-items: center;
		padding: 24rpx 0;
		gap: 20rpx;

		& + & {
			border-top: 1rpx solid var(--color-border-light);
		}
	}

	.order-detail__food-img {
		width: 120rpx;
		height: 120rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
	}

	.order-detail__food-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 4rpx;
	}

	.order-detail__food-name {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text);
	}

	.order-detail__food-specs {
		font-size: 11px;
		color: var(--color-text-secondary);
		padding: 2rpx 8rpx;
		background-color: var(--color-bg);
		border-radius: 6rpx;
		align-self: flex-start;
	}

	.order-detail__food-meta {
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	.order-detail__food-price {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text);
		flex-shrink: 0;
	}

	.order-detail__total {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding: 24rpx 0;
		border-top: 1rpx solid var(--color-border-light);
	}

	.order-detail__total-num {
		font-size: 12px;
		color: var(--color-text-secondary);
	}

	.order-detail__total-price {
		display: flex;
		align-items: center;
		font-size: 14px;
		color: var(--color-text);
		padding-left: 40rpx;
	}

	.order-detail__total-amount {
		font-size: 17px;
		font-weight: 700;
		color: var(--color-text);
		padding-left: 20rpx;
	}

	/* 订单信息 */
	.order-detail__info {
		padding: 8rpx 20rpx;
	}

	.order-detail__info-row {
		display: flex;
		align-items: flex-start;
		padding: 20rpx 0;
		gap: 24rpx;

		& + & {
			border-top: 1rpx solid var(--color-border-light);
		}
	}

	.order-detail__info-label {
		font-size: 13px;
		color: var(--color-text-secondary);
		width: 130rpx;
		flex-shrink: 0;
	}

	.order-detail__info-value {
		font-size: 13px;
		color: var(--color-text);
		flex: 1;
		word-break: break-all;

		&--clamped {
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
		}
	}

	.order-detail__info-value-wrap {
		flex: 1;
	}

	.order-detail__remark-toggle {
		display: inline-flex;
		align-items: center;
		gap: 4rpx;
		margin-top: 8rpx;
		font-size: 12px;
		color: var(--color-primary);

		&:active { opacity: 0.7; }
	}

	/* 支付方式 */
	.order-detail__payment {
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
		overflow: hidden;
	}

	.order-detail__payment-header {
		padding: 24rpx 24rpx 0;
	}

	.order-detail__payment-title {
		font-size: 15px;
		font-weight: 600;
		color: var(--color-text);
	}

	.order-detail__pay-item {
		display: flex;
		align-items: center;
		padding: 28rpx 24rpx;
		gap: 16rpx;

		& + & {
			border-top: 1rpx solid var(--color-border-light);
		}

		&:active {
			background-color: var(--color-primary-bg-light);
			transition: background-color 150ms ease;
		}
	}

	.order-detail__pay-label {
		flex: 1;
		font-size: 14px;
		color: var(--color-text);
	}

	.order-detail__radio {
		width: 40rpx;
		height: 40rpx;
		border: 2rpx solid var(--color-border-light);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;

		&--checked {
			border-color: var(--color-primary);
		}
	}

	.order-detail__radio-dot {
		width: 22rpx;
		height: 22rpx;
		border-radius: 50%;
		background-color: var(--color-primary);
	}

	.order-detail__footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: var(--color-bg-card);
		padding: 20rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.04);
		z-index: 10;
	}

	.order-detail__pay-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		height: 88rpx;
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
		color: var(--color-text-on-primary);
		font-size: 16px;
		font-weight: 600;
		border-radius: var(--radius-button);
		transition: all 120ms ease;

		&:active {
			transform: scale(0.96);
			opacity: 0.88;
		}

		&--disabled {
			opacity: 0.85;
			pointer-events: none;
		}
	}
</style>
