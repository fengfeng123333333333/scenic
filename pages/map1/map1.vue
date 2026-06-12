<!--
  地图导览详情页（map1.vue）
  ==========================================
  重构标准：page-refactor-standard.md
  主题色：全部通过 CSS 变量驱动

  旧函数 → 新函数映射：
    onLoad(option)          → onLoad(() => { initPage() })
    tabQuer(item, index)    → switchTab(item, index)
    getMarker(e)            → onMarkerTap(e)
    dizhi()                 → openLocation()
    show()                  → showDetailPopup()
    watchClose()            → closeDetail()
    loadGdtbLayerByRegion() → addGroundOverlay()
-->

<template>
	<view class="map-page" :style="$themeStyle">
		<view v-if="!pageReady" class="map-page__skeleton">
			<view class="skeleton-tabs" />
			<view class="skeleton-map" />
		</view>

		<template v-else>
			<!-- <u-navbar :title="pageTitle" :placeholder="true" :autoBack="true" /> -->

			<view class="map-page__tabs">
				<scroll-view scroll-x class="tabs-scroll">
					<view class="tabs-item" :class="{ 'tabs-item--active': activeTab === index }"
						v-for="(item, index) in tabList" :key="index" @click="switchTab(item, index)">
						<image :src="
                index === activeTab ? item.SelectImgUrl : item.UnSelectImgUrl
              " mode="aspectFit" class="tabs-item__icon" />
						<text class="tabs-item__label"
							:class="{ 'tabs-item__label--active': activeTab === index }">{{ item.Name }}</text>
					</view>
				</scroll-view>
			</view>

			<map id="map" ref="mapRef" class="map-page__map" :latitude="center.latitude" :longitude="center.longitude"
				@markertap="onMarkerTap" @labeltap="onMarkerTap" scale="17" :min-scale="15" :max-scale="20"
				show-location enable-building enable-3D enable-zoom />
		</template>

		<view class="map-page__popup" v-if="popupVisible">
			<view class="popup-header">
				<text class="popup-header__title">{{ guide.ScenicName }}</text>
				<view class="popup-header__close" @click="popupVisible = false">
					<u-icon name="close" color="var(--color-text-secondary)" size="20" />
				</view>
			</view>
			<view class="popup-body">
				<image :src="guide.DefaultsImgUrl" mode="aspectFill" class="popup-body__thumb" />
				<view class="popup-body__intro">
					<f-parse :content="guide.Intro || ''" />
				</view>
			</view>
			<view class="popup-footer">
				<text class="popup-footer__btn" @click="openLocation">去这里</text>
				<text class="popup-footer__btn" @click="showDetailPopup">详情</text>
			</view>
		</view>

		<u-popup :show="detailVisible" mode="center" @close="closeDetail">
			<view class="detail-popup">
				<view v-if="guide.MediaType == 0">
					<image :src="
              (guide.AllImgUrlList && guide.AllImgUrlList[0]) ||
              guide.DefaultsImgUrl
            " mode="aspectFill" class="detail-popup__img" />
					<luch-audio :src="audioSrc" :name="audioName" :poster="audioPoster" :author="audioAuthor"
						:play.sync="audioPlay" />
				</view>
				<view v-if="guide.MediaType == 1">
					<video id="detailVideo" class="detail-popup__video" :src="guide.VideoFileUrl" controls
						:poster="guide.DefaultsImgUrl" />
				</view>
				<view class="detail-popup__body">
					<f-parse :content="guide.Intro || ''" />
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from "vue";
	import {
		onLoad
	} from "@dcloudio/uni-app";

	const pageReady = ref(false);
	const pageTitle = ref("");
	const tabList = ref([]);
	const activeTab = ref(0);
	const center = ref({
		latitude: 0,
		longitude: 0
	});
	const guide = ref({});
	const popupVisible = ref(false);
	const detailVisible = ref(false);
	const enableZoom = ref(true);

	const audioPoster = ref("");
	const audioName = ref("");
	const audioAuthor = ref("");
	const audioSrc = ref("");
	const audioPlay = ref(true);

	let mapContext = null;
	let gdtbLayerId = 0;
	let mapMeta = {};

	onLoad((option) => {
		pageTitle.value = option?.str || "地图导览";
		initPage();
	});

	onMounted(() => {
		mapContext = uni.createMapContext("map");
		mapContext.initMarkerCluster({
			enableDefaultStyle: false,
			zoomOnClick: true,
			gridSize: 60,
		});
	});

	async function initPage() {
		try {
			const navRes = await uni.$myRequest({
				url: "/api/Applets/GetMapNavBarList",
				method: "POST",
			});
			tabList.value = navRes?.data?.Data || [];
			if (tabList.value.length > 0) await switchTab(tabList.value[0], 0);
		} catch (err) {
			console.error("[map1] 初始化失败:", err);
		} finally {
			pageReady.value = true;
		}
	}

	async function switchTab(item, index) {
		activeTab.value = index;
		popupVisible.value = false;
		try {
			const res = await uni.$myRequest({
				url: "/api/Applets/GetMapguideDetailByNavBarID",
				method: "POST",
				data: {
					MapNavBarID: item.MapNavBarID
				},
			});
			const data = res?.data?.Data || {};
			mapMeta = data.Mapguide || {};
			center.value = {
				latitude: mapMeta.Latitude || 0,
				longitude: mapMeta.Longitude || 0,
			};

			if (mapMeta.PictureUrl && mapMeta.TopLeftLatitude) addGroundOverlay();

			const guides = data.VoiceGuideDetailList || [];
			addMarkers(guides);
		} catch (err) {
			console.error("[map1] 切换Tab失败:", err);
		}
	}

	function addMarkers(guides) {
		const markers = guides.map((item) => ({
			id: item.VoiceGuideID,
			latitude: Number(item.latitude),
			longitude: Number(item.longitude),
			iconPath: item.LocationIconUrl,
			width: 30,
			height: 30,
			joinCluster: true,
			label: item.IsShowName == 1 ?
				{} :
				{
					content: item.ScenicName,
					width: 60,
					height: 30,
					borderWidth: 1,
					borderRadius: 5,
					bgColor: "#ffffff",
					textAlign: "center",
				},
		}));
		mapContext.addMarkers({
			markers,
			clear: true
		});
	}

	function addGroundOverlay() {
		gdtbLayerId++;
		mapContext.addGroundOverlay({
			id: gdtbLayerId,
			src: mapMeta.PictureUrl,
			visible: true,
			zindex: 1,
			opacity: 1,
			bounds: {
				northeast: {
					latitude: mapMeta.TopLeftLatitude,
					longitude: mapMeta.TopLeftLongitude,
				},
				southwest: {
					latitude: mapMeta.LowerRightLatitude,
					longitude: mapMeta.LowerRightLongitude,
				},
			},
		});
	}

	async function onMarkerTap(e) {
		try {
			const res = await uni.$myRequest({
				url: "/api/Applets/GetVoiceGuideDetail",
				method: "POST",
				data: {
					VoiceGuideID: e.markerId || e.detail?.markerId
				},
			});
			const data = res?.data?.Data || {};
			guide.value = data;
			audioPoster.value = data.DefaultsImgUrl || "";
			audioName.value = data.ScenicName || "";
			audioAuthor.value = "请点击播放语音讲解";
			audioSrc.value = data.VoiceFileUrl || "";
			popupVisible.value = true;
		} catch (err) {
			console.error("[map1] 获取导览详情失败:", err);
		}
	}

	function openLocation() {
		popupVisible.value = false;
		uni.openLocation({
			latitude: Number(guide.value.latitude),
			longitude: Number(guide.value.longitude),
			name: guide.value.ScenicName,
		});
	}

	function showDetailPopup() {
		popupVisible.value = false;
		detailVisible.value = true;
	}

	function closeDetail() {
		detailVisible.value = false;
		audioPlay.value = false;
		// 暂停视频播放
		const videoCtx = uni.createVideoContext("detailVideo");
		if (videoCtx) videoCtx.pause();
	}
</script>

<style lang="scss" scoped>
	.map-page {
		width: 100vw;
		height: 100vh;
		position: relative;
	}

	.map-page__skeleton {
		width: 100%;
		height: 100%;
	}

	.skeleton-tabs {
		height: 100rpx;
		background: var(--color-skeleton-base);
	}

	.skeleton-map {
		height: calc(100vh - 100rpx);
		background: var(--color-skeleton-base);
	}

	.map-page__map {
		width: 100vw;
		height: 100vh;
	}

	.map-page__tabs {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 99;
		background: var(--color-bg-card);
		box-shadow: var(--shadow-soft);
	}

	.tabs-scroll {
		white-space: nowrap;
		height: 100rpx;
		display: flex;
		align-items: center;
	}

	.tabs-item {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 20rpx;
		min-width: 100rpx;
		height: 100%;
		border-bottom: 4rpx solid transparent;
	}

	.tabs-item--active {
		border-bottom-color: var(--color-primary);
	}

	.tabs-item__icon {
		width: 36rpx;
		height: 36rpx;
	}

	.tabs-item__label {
		font-size: 22rpx;
		color: var(--color-text-secondary);
		margin-top: 4rpx;
	}

	.tabs-item__label--active {
		color: var(--color-primary);
	}

	.map-page__popup {
		position: absolute;
		bottom: 40rpx;
		left: 50%;
		transform: translateX(-50%);
		width: 600rpx;
		max-height: 500rpx;
		background: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-modal);
		overflow: hidden;
		z-index: 100;
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16rpx 24rpx;
		border-bottom: 1rpx solid var(--color-border-light);
	}

	.popup-header__title {
		font-size: 28rpx;
		font-weight: 600;
		color: var(--color-text);
	}

	.popup-header__close {
		padding: 8rpx;
	}

	.popup-body {
		display: flex;
		padding: 16rpx 24rpx;
		gap: 16rpx;
	}

	.popup-body__thumb {
		width: 140rpx;
		height: 140rpx;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.popup-body__intro {
		flex: 1;
		max-height: 140rpx;
		overflow: hidden;
		font-size: 24rpx;
		color: var(--color-text-secondary);
		line-height: 1.5;
	}

	.popup-footer {
		display: flex;
		justify-content: center;
		gap: 30rpx;
		padding: 16rpx 0 24rpx;
	}

	.popup-footer__btn {
		padding: 10rpx 40rpx;
		background: var(--color-primary);
		color: var(--color-text-on-primary);
		border-radius: 30rpx;
		font-size: 26rpx;
	}

	.detail-popup {
		width: 560rpx;
		max-height: 80vh;
		overflow-y: auto;
		background: var(--color-bg-card);
		border-radius: var(--radius-card);
		padding-bottom: env(safe-area-inset-bottom);
	}

	.detail-popup__img {
		width: 100%;
		display: block;
	}

	.detail-popup__video {
		width: 100%;
	}

	.detail-popup__body {
		padding: 20rpx;
	}
</style>