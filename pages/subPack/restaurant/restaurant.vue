<!--
  餐厅扫码点餐主页面 —— 遵循改造标准 + 设计稿规范 + UI/UX Max Pro
  主题：通过 var(--color-*) 变量驱动，支持 6 套主题切换
  旧函数映射：
    itemIze→itemIze / plus→handleAdd / reduce→handleRemove / shopping_Cart→shoppingCart
    qunint_of_goods→updateCategoryBadges / sub_database→submitOrder
    pop_Shopping→toggleCart / popup_item→openGoodsPopup / placean_order→showRemark
    dateChange→onMerchantChange / goods_height→calcGoodsHeight
    my_order→goToMyOrder / empty_data→emptyCart
-->
<template>
	<view class="restaurant" :style="$themeStyle">
		<!-- 骨架屏 -->
		<RestaurantSkeleton v-if="!pageReady" />

		<template v-if="pageReady">
			<!-- 顶部栏 -->
			<view class="restaurant__topbar">
				<text class="restaurant__table">桌号：{{ number_people }}</text>
			</view>

			<!-- 筛选栏 -->
			<view class="restaurant__filter">
				<ren-dropdown-filter :filterData="arrData" :defaultIndex="defaultIndex"
					@onSelected="onMerchantChange" />
			</view>

			<!-- 点餐主体 -->
			<view class="restaurant__body">
				<view class="restaurant__main">
					<CategorySidebar :itemize="itemize" :trigger="trigger" @select="itemIze" />
					<GoodsList :goods="goods" :scrollInto="scroll_into" @add="handleAdd" @remove="handleRemove"
						@spec="openGoodsPopup" @scroll="onGoodsScroll" />
				</view>

			</view>
			<CartBar :totalPrice="totalPrice" :totalQuantity="total_quantity"
				@open-cart="toggleCart(true)" @submit="showRemark" />
			<!-- 购物车弹窗 -->
			<CartPopup v-if="card" :shopping_card="shopping_card" @close="toggleCart(false)"
				@change="handleCartPopupChange" @empty="emptyCart" />

			<!-- 商品详情弹窗 -->
			<GoodsPopup v-if="popupitem" :pro_details="pro_details" @close="openGoodsPopup(false)"
				@spec-select="handleSpecSelect" @change="handleGoodsPopupChange" @toast="showToast" />
		</template>

		<!-- 广告弹窗 -->
		<u-popup :show="infoShow" mode="center" @close="infoShow = false" closeable
			:overlayStyle="{ backgroundColor: 'rgba(0,0,0,0.4)' }">
			<view class="restaurant__ad-popup">
				<image :src="coinList.ImgUrl" class="restaurant__ad-img" mode="widthFix" />
			</view>
		</u-popup>

		<!-- 下单备注弹窗 -->
		<u-popup :show="showRemarkPopup" mode="center" @close="showRemarkPopup = false" :round="16"
			:overlayStyle="{ backgroundColor: 'rgba(0,0,0,0.4)' }">
			<view class="restaurant__remark">
				<view class="restaurant__remark-header">
					<text class="restaurant__remark-title">下单备注</text>
				</view>
				<view class="restaurant__remark-body">
					<u--textarea v-model="remarkText" maxlength="100" count placeholder="请输入备注" />
				</view>
				<view class="restaurant__remark-footer">
					<view class="restaurant__remark-btn restaurant__remark-btn--cancel" @click="showRemarkPopup = false">取消</view>
					<view class="restaurant__remark-btn restaurant__remark-btn--confirm" @click="submitOrder">确认</view>
				</view>
			</view>
		</u-popup>

		<RequestLoading v-if="requestLoading" text="正在下单..." />
		<u-toast ref="uToastRef" />
	</view>
</template>

<script setup>
	import {
		ref,
		computed
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		useToast
	} from '@/util/toast.js'
	import {
		useStore
	} from '@/store/index.js'
	import RequestLoading from '@/components/loading/request-loading.vue'
	import RestaurantSkeleton from '@/components/skeleton/restaurant-skeleton.vue'
	import CartPopup from './components/shopping-cart.vue'
	import GoodsPopup from './components/goods-details.vue'
	import CategorySidebar from './components/category-sidebar.vue'
	import GoodsList from './components/goods-list.vue'
	import CartBar from './components/cart-bar.vue'
	import RenDropdownFilter from '@/components/ren-dropdown-filter/ren-dropdown-filter.vue'

	// ==================== 页面路由常量 ====================
	const PAGE_ROUTES = {
		orderDetail: '/pages/subPack/restaurant/order-details',
		order: '/pages/index/index',
	}

	// ==================== 数据 ====================
	const {
		state,
		setPaymen,
		setPayDay,
		setNumberPeople,
		setOrderRemark
	} = useStore()
	const {
		uToastRef,
		showToast
	} = useToast()
	const pageReady = ref(false)
	const requestLoading = ref(false)
	const defaultIndex = ref([0])
	const showRemarkPopup = ref(false)
	const remarkText = ref('')
	const itemize = ref([])
	const trigger = ref(0)
	const arrData = ref([
		[]
	])
	const coinList = ref({})
	const infoShow = ref(false)
	const goods = ref([])
	const heightset = ref([])
	const tophei = ref(0)
	const scroll_into = ref('')
	const seaId = ref('')
	const card = ref(false)
	const shopping_card = ref([])
	const popupitem = ref(false)
	const pro_details = ref({})
	const number_people = ref(0)
	const merchantID = ref('')
	const shopID = ref('')
	const mid = ref('')

	const totalPrice = computed(() =>
		shopping_card.value.reduce((p, c) => p + (c.total_price || c.unitprice * c.quantity || 0), 0)
	)

	const total_quantity = computed(() =>
		shopping_card.value.reduce((p, c) => p + (c.quantity || 0), 0)
	)

	// ==================== 数据请求 ====================
	function parseSceneParams(query) {
		if (query && query.scene) {
			const option = decodeURIComponent(query.scene)
			const strArry = option.split('=')
			if (strArry.length === 3) {
				number_people.value = strArry[1].split('&')[0]
				mid.value = strArry[2]
			}
		}
	}

	async function fetchMerchant() {
		const res = await uni.$myRequest({
			url: '/api/Applets/AppletsGetFoodMerchant',
			method: 'POST',
			data: {
				TableRoomID: Number(mid.value)
			},
		})
		const data = res.data.Data || []
		data.forEach(item => {
			arrData.value[0].push({
				text: item.Name,
				value: item.ID,
				CompanyID: item.CompanyID,
				ScenicID: item.ScenicID,
			})
		})
		if (data.length > 0) {
			await onMerchantChange([
				[{
					value: data[0].ID
				}]
			])
		}
	}

	// ==================== 业务方法 ====================
	async function itemIze(index, cid) {
		trigger.value = index
		scroll_into.value = cid
		seaId.value = cid

		const res = await uni.$myRequest({
			url: '/api/Applets/AppletsGetFoodGoods',
			method: 'POST',
			data: {
				typeID: Number(cid)
			},
		})

		const data = res.data.Data || {}
		coinList.value = data.Popup || {}
		if (coinList.value.IsShow == 1 && coinList.value.PopType == 0) {
			infoShow.value = true
		}

		if (goods.value.length === 0) {
			goods.value.push(...(data.goods || []))
		} else {
			const exists = goods.value.some(item => item.cid === cid)
			if (!exists) goods.value.push(...(data.goods || []))
			goods.value = removeDuplicate(goods.value)
		}
	}

	function removeDuplicate(arr) {
		const newArr = []
		for (const t of arr) {
			if (!newArr.find(c => c.cid === t.cid && c.good_query[0].name === t.good_query[0].name)) {
				newArr.push(t)
			}
		}
		return newArr
	}

	function onGoodsScroll(event) {
		const scrollTop = event.detail.scrollTop
		if (scrollTop >= tophei.value) {
			if (heightset.value[trigger.value] && scrollTop >= heightset.value[trigger.value]) {
				if (trigger.value < itemize.value.length - 1) trigger.value++
			}
		} else {
			if (heightset.value[trigger.value - 1] && scrollTop < heightset.value[trigger.value - 1]) {
				trigger.value--
			}
		}
		tophei.value = scrollTop
	}

	function handleAdd(index, good_index, cid, itemgood, mode) {
		const {
			quantity,
			image,
			name,
			unitprice,
			unit,
			_id,
			good_specs,
			MerchantID,
			ShopID
		} = itemgood
		const QU = mode === '001' ? quantity : (quantity || 0) + 1
		const gi = goods.value[index]
		if (gi && gi.good_query[good_index]) {
			gi.good_query[good_index].quantity = QU
			gi.good_query[good_index].good_specs = good_specs
		}
		const arr = {
			image,
			name,
			good_specs,
			unitprice,
			quantity: QU,
			unit,
			MerchantID,
			ShopID,
			total_price: unitprice * QU,
			_id,
			cid,
			good_index
		}
		shoppingCart(arr)
	}

	function handleRemove(index, good_index, cid, itemgood) {
		const {
			quantity,
			image,
			name,
			unitprice,
			unit,
			_id,
			good_specs,
			MerchantID,
			ShopID
		} = itemgood
		const QU = (quantity || 0) > 0 ? (quantity || 0) - 1 : 0
		const gi = goods.value[index]
		if (gi && gi.good_query[good_index]) {
			gi.good_query[good_index].quantity = QU
		}
		const arr = {
			image,
			name,
			good_specs,
			unitprice,
			quantity: QU,
			unit,
			MerchantID,
			ShopID,
			total_price: unitprice * QU,
			_id,
			cid,
			good_index
		}
		shoppingCart(arr)
	}

	function shoppingCart(arr) {
		if (shopping_card.value.length === 0) {
			shopping_card.value.push(arr)
		} else {
			const itemindex = shopping_card.value.findIndex(item => item._id === arr._id)
			if (itemindex === -1) {
				shopping_card.value.unshift(arr)
			} else {
				shopping_card.value[itemindex].quantity = arr.quantity
				shopping_card.value[itemindex].total_price = arr.total_price
				shopping_card.value[itemindex].good_specs = arr.good_specs
				shopping_card.value[itemindex].unitprice = arr.unitprice
			}
		}
		updateCategoryBadges()
		shopping_card.value = shopping_card.value.filter(item => item.quantity > 0)
	}

	function updateCategoryBadges() {
		if (shopping_card.value.length > 0) {
			const res = {}
			shopping_card.value.forEach(item => {
				res[item.cid] = (res[item.cid] || 0) + item.quantity
			})
			for (const k in res) {
				const idx = itemize.value.findIndex(i => i.cid == k)
				if (idx > -1) itemize.value[idx].sele_quantity = res[k]
			}
		} else {
			itemize.value.forEach(item => item.sele_quantity = 0)
		}
	}

	function handleCartPopupChange(payload) {
		const {
			type,
			index,
			quantity,
			_id,
			cid,
			good_index,
			unitprice
		} = payload
		if (shopping_card.value[index]) {
			shopping_card.value[index].quantity = quantity
			shopping_card.value[index].total_price = quantity * unitprice
		}
		const itemcid = goods.value.findIndex(item => item.cid == cid && item.good_query.some(g => g._id === _id))
		if (itemcid > -1 && goods.value[itemcid].good_query[good_index]) {
			goods.value[itemcid].good_query[good_index].quantity = quantity
		}
		updateCategoryBadges()
		shopping_card.value = shopping_card.value.filter(item => item.quantity > 0)
	}

	function emptyCart() {
		shopping_card.value = []
		itemize.value.forEach(item => item.sele_quantity = 0)
		goods.value.forEach(item => {
			(item.good_query || []).forEach(t => t.quantity = 0)
		})
		toggleCart(false)
	}

	function openGoodsPopup(value, index, good_index, cid, itemgood) {
		if (value === false) {
			popupitem.value = false
			return
		}
		popupitem.value = true
		if (itemgood && itemgood.specs) {
			itemgood.specs.sort((a, b) => (a.unitprice || 0) - (b.unitprice || 0))
		}
		pro_details.value = {
			index,
			good_index,
			cid,
			itemgood
		}
	}

	function handleSpecSelect(payload) {
		const {
			index,
			good_index,
			cid,
			itemgood,
			attribute,
			unitprice
		} = payload
		const gi = goods.value[index]
		if (gi && gi.good_query[good_index]) {
			gi.good_query[good_index].good_specs = itemgood.good_specs
			gi.good_query[good_index].unitprice = unitprice
		}
		handleAdd(index, good_index, cid, itemgood, '002')
	}

	function handleGoodsPopupChange(payload) {
		const {
			type,
			pro_details: pd
		} = payload
		if (type === 'reduce') {
			handleRemove(pd.index, pd.good_index, pd.cid, pd.itemgood)
		} else {
			handleAdd(pd.index, pd.good_index, pd.cid, pd.itemgood, '')
		}
	}

	function toggleCart(value) {
		card.value = value
	}

	function showRemark() {
		showRemarkPopup.value = true
	}

	async function submitOrder() {
		showRemarkPopup.value = false
		requestLoading.value = true

		try {
			const openid = uni.getStorageSync('userinfo') || {}
			const arr = shopping_card.value.map(item => {
				merchantID.value = item.MerchantID
				shopID.value = item.ShopID
				return {
					ticketID: item._id,
					ticketStockTimeID: 0,
					ticketName: item.name,
					number: item.quantity,
					unitPrice: item.unitprice,
					discountUnitPrice: item.unitprice,
					totalPrice: item.total_price,
				}
			})

			const res = await uni.$myRequest({
				url: '/api/Applets/AppletsCreateFoodGoodsOrder',
				method: 'POST',
				data: {
					openId: openid.openid,
					merchantID: merchantID.value,
					shopID: shopID.value,
					memberID: 0,
					totalNumber: total_quantity.value,
					totalMoney: Number(totalPrice.value.toFixed(2)),
					receivingMethod: 1,
					addressID: 0,
					consignee: '',
					phone: '',
					address: '',
					remark: remarkText.value,
					tableCode: number_people.value,
					shoppingCartList: arr,
				},
			})

			if (res.data.Code == 200 && res.data.Data.Result == true) {
				setPaymen(res.data.Data)
				setPayDay(shopping_card.value)
				setNumberPeople(number_people.value)
				setOrderRemark(remarkText.value)
				uni.navigateTo({
					url: PAGE_ROUTES.orderDetail
				})
			}
		} finally {
			requestLoading.value = false
		}
	}

	function goToMyOrder() {
		uni.navigateTo({
			url: `${PAGE_ROUTES.order}?tab=1`
		})
	}

	async function onMerchantChange(index) {
		const arr2 = index.flat()
		const res = await uni.$myRequest({
			url: '/api/Applets/AppletsGetFoodGoodsTypeByMid',
			method: 'POST',
			data: {
				merchantID: Number(arr2[0].value)
			},
		})
		emptyCart()
		goods.value = []
		itemize.value = res.data.Data || []
		if (itemize.value.length > 0) {
			seaId.value = itemize.value[0].cid
			itemIze(0, itemize.value[0].cid)
		}
	}

	// ==================== 生命周期 ====================
	onLoad(async (query) => {
		parseSceneParams(query)
		try {
			await fetchMerchant()
		} finally {
			pageReady.value = true
		}
	})
</script>

<style lang="scss" scoped>
	.restaurant {
		background-color: var(--color-bg);
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.restaurant__topbar {
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
		height: 88rpx;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		position: relative;
		z-index: 10;
		flex-shrink: 0;
	}

	.restaurant__table {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text-on-primary);
	}

	.restaurant__filter {
		background-color: var(--color-bg-card);
		padding: 10rpx 20rpx;
		border-bottom: 1rpx solid var(--color-border-light);
		position: relative;
		z-index: 9;
		flex-shrink: 0;
	}

	.restaurant__body {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.restaurant__main {
		flex: 1;
		display: flex;
		overflow: hidden;
		padding-bottom: calc(130rpx + env(safe-area-inset-bottom));
	}

	/* ========== 广告弹窗 ========== */
	.restaurant__ad-popup {
		width: 600rpx;
		border-radius: var(--radius-card);
		overflow: hidden;
	}

	.restaurant__ad-img {
		width: 100%;
		display: block;
	}

	/* ========== 下单备注弹窗 ========== */
	.restaurant__remark {
		width: 540rpx;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		overflow: hidden;
	}

	.restaurant__remark-header {
		padding: 32rpx 32rpx 0;
	}

	.restaurant__remark-title {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text);
	}

	.restaurant__remark-body {
		padding: 24rpx 32rpx;
	}

	.restaurant__remark-body :deep(.u-textarea) {
		border-radius: var(--radius-sm);
		background-color: var(--color-bg);
	}

	.restaurant__remark-footer {
		display: flex;
		padding: 0 32rpx 32rpx;
		gap: 20rpx;
	}

	.restaurant__remark-btn {
		flex: 1;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-button);
		font-size: 15px;
		font-weight: 600;
		transition: all 120ms ease;

		&:active {
			transform: scale(0.96);
			opacity: 0.88;
		}

		&--cancel {
			background-color: var(--color-bg);
			color: var(--color-text-secondary);
			border: 1rpx solid var(--color-border-light);
		}

		&--confirm {
			background-color: var(--color-primary);
			color: var(--color-text-on-primary);
		}
	}
</style>