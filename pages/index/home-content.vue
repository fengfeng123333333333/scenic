<template>
	<view class="home-content">
		<IndexSkeleton v-if="!pageReady" />

		<template v-else>
			<!-- <u-navbar :title="weather.ScenicName" leftIcon="home" :placeholder="true" :autoBack="true" :fixed="false" /> -->
			<view class="hero" :class="{ 'hero--national': currentThemeKey === 'national-day' }">
				<ScaleSwiper :banList="banList" :autoplay="true" :zoomDuration="2500" />
				<!-- 国庆烟花 Canvas -->
				<canvas v-if="currentThemeKey === 'national-day'" type="2d" id="fireworkCanvas"
					class="hero__firework" />
				<view class="hero__weather" v-if="weather.Weather">
					<text class="hero__weather-text">{{ weather.Weather }}</text>
				</view>

			</view>

			<!-- 国庆节日横幅装饰 -->
			<view class="hero__festival" v-if="currentThemeKey === 'national-day'">
				<image class="hero__festival-bg" src="/static/images/中国传统节日横幅背景设计.png" mode="aspectFill" />
				<view class="hero__festival-inner">
					<text class="hero__festival-star">★</text>
					<text class="hero__festival-title">欢度国庆 · 盛世华诞</text>
					<text class="hero__festival-star">★</text>
				</view>
				<text class="hero__festival-sub">壮丽山河 · 共赏美景</text>
			</view>

			<view class="info-card">
				<view class="row">
					<view class="row__icon row__icon--secondary">
						<u-icon name="clock" color="var(--color-primary)" size="28" />
					</view>
					<view class="row__content">
						<text class="label">{{ weather.OpeningHoursTitle }}</text>
						<text class="value">{{ weather.OpeningHours }}</text>
					</view>
				</view>
				<view class="row row--clickable" @click="dizhi">
					<view class="row__icon row__icon--secondary">
						<u-icon name="map" color="var(--color-primary)" size="28" />
					</view>
					<view class="row__content">
						<text class="label">景区地址</text>
						<text class="value">{{ weather.Address }}</text>
					</view>
				</view>
				<view class="row row--clickable" @click="calPhone">
					<view class="row__icon row__icon--secondary">
						<u-icon name="phone" color="var(--color-primary)" size="28" />
					</view>
					<view class="row__content">
						<text class="label">{{ weather.PhoneTitle }}</text>
						<text class="value">{{ weather.Phone }}</text>
					</view>
				</view>
			</view>
			<!-- 	<view class="passenger-notice" v-if="weather.PassengerFlow != ''">
				<u-notice-bar :text="String(weather.PassengerFlow)" />
			</view> -->
			<view class="noticeDiv" v-if="card.length> 0">
				<f-notice :text="card" :speed="3000" @click="swiperClick" />
			</view>
			<view class="noticeDiv" v-if="weather.PassengerFlow">
				<f-notice :text="weather.PassengerFlowList" :speed="3000" />
			</view>
			<view class="block" v-if="isShow">
				<view class="icon-grid">
					<view class="item" v-for="(item, index) in title" :key="item.ID"
						@click="menPiao(item.PageUrl, item.Title, item)">
						<view class="icon-bg">
							<image class="item__icon" :src="item.ImageUrl" mode="aspectFit" />
						</view>
						<text class="item__label">{{ item.Title }}</text>
					</view>
				</view>

				<image class="seat-banner" :src="weather.EnableAppletSeatMainImgUrl"
					v-if="weather.EnableAppletSeatMainImgUrl != ''" mode="widthFix" />

				<view class="tab-nav tabLis" v-if="classification.length > 0">
					<f-tabs v-model="activeTab" :tabs="classification" field="name" @change="changeTab"
						lineColor="transparent" :scroll="true" />

					<template v-if="isActive == 0">
						<Kong v-if="tickList.length === 0" text="当前暂无可售票项" />
						<view class="product-grid tickList" v-else>
							<view class="product-card tick" v-for="(item, index) in tickList"
								@click="tickDetails(item.TicketID)" :key="index">
								<image class="product-card__image tabListImage" :src="item.ImgUrl" mode="aspectFill" />
								<view class="product-card__body">
									<text class="product-card__name name">{{
                    item.TicketName
                  }}</text>
									<view class="product-card__price-row">
										<text class="price"><text
												class="price__symbol">￥</text>{{ item.SellPrice }}</text>
										<text class="discount">￥{{ item.MarketPrice }}</text>
									</view>
									<text class="product-tag" v-if="item.LabelList"
										v-for="(item1, index1) in item.LabelList" :key="index1">{{ item1 }}</text>
								</view>
							</view>
						</view>
					</template>

					<template v-if="isActive == 1">
						<Kong v-if="tickList.length === 0" text="暂无商品" />
						<view class="product-grid tickList" v-else>
							<view class="product-card tick" v-for="(item, index) in tickList" @click="purchase(item)"
								:key="index">
								<image class="product-card__image tabListImage" :src="item.ImgUrl" mode="aspectFill" />
								<view class="product-card__body">
									<text class="product-card__name name">{{
                    item.GoodsName
                  }}</text>
									<view class="product-card__price-row">
										<text class="price">￥{{ item.SellPrice }}</text>
										<text class="discount">￥{{ item.MarketPrice }}</text>
									</view>
									<text class="product-tag" v-if="item.LabelList"
										v-for="(item1, item) in item.LabelList" :key="index">{{ item1 }}</text>
								</view>
							</view>
						</view>
					</template>

					<template v-if="isActive == 2">
						<Kong v-if="tickList.length === 0" text="当前暂无会员套餐" />
						<view class="product-grid tickList" v-else>
							<view class="product-card tick" v-for="(item, index) in tickList" @click="menberCard(item)"
								:key="index">
								<image class="product-card__image tabListImage" :src="item.ImgUrl" mode="aspectFill" />
								<view class="product-card__body">
									<text class="product-card__name name">{{
                    item.TicketName
                  }}</text>
									<view class="product-card__price-row">
										<text class="price">￥{{ item.SellPrice }}</text>
										<text class="discount">￥{{ item.MarketPrice }}</text>
									</view>
									<text class="product-tag" v-if="item.LabelList"
										v-for="(item1, item) in item.LabelList" :key="index">{{ item1 }}</text>
								</view>
							</view>
						</view>
					</template>

					<template v-if="isActive == 3">
						<Kong v-if="tickList.length === 0" text="当前暂无优惠券" />
						<view class="product-grid tickList" v-else>
							<view class="product-card tick product-card--coupon" v-for="(item, index) in tickList"
								@click="linqu(item)" :key="index">
								<image class="product-card__image tabListImage" :src="item.ImgUrl" mode="aspectFill" />
								<view class="product-card__body">
									<text class="product-card__name name">{{ item.Name }}</text>
									<view class="product-card__price-row product-card__price-row--inline">
										<text class="price"><text class="price__symbol">￥</text>{{ item.Price }}</text>
										<text class="discount">￥{{ item.MarketPrice }}</text>
									</view>
									<text class="disc">截止日期：{{ item.EndTimeDesc }}</text>
								</view>
							</view>
						</view>
					</template>
				</view>
			</view>

			<view class="footer-info edition" v-if="weather.CompanyName != '' || weather.CompanyName != null">
				<view class="bink">{{ weather.CompanyName }}</view>
				<view class="bink">{{ weather.SupportContent }}</view>
				<view class="bink">{{ weather.AppletVersion }}</view>
			</view>

			<!-- 国庆页脚装饰 -->
			<view class="national-footer" v-if="currentThemeKey === 'national-day'">
				<text class="national-footer__star">★</text>
				<text class="national-footer__text">盛世华诞 · 共赏山河</text>
				<text class="national-footer__star">★</text>
			</view>

			<!-- 国庆浮动装饰元素 -->
			<template v-if="currentThemeKey === 'national-day'">
				<view class="festival-float festival-float--1">
					<image src="/static/images/灯笼.png" mode="aspectFit" class="festival-float__img" />
				</view>
				<view class="festival-float festival-float--2">★</view>
				<view class="festival-float festival-float--3">
					<image src="/static/images/灯笼.png" mode="aspectFit" class="festival-float__img" />
				</view>
				<view class="festival-float festival-float--4">★</view>
				<view class="festival-float festival-float--5">
					<image src="/static/images/灯笼.png" mode="aspectFit" class="festival-float__img" />
				</view>
				<view class="festival-float festival-float--6">★</view>
			</template>

			<!-- 国庆飘落粒子 -->
			<template v-if="currentThemeKey === 'national-day'">
				<view class="confetti confetti--1">✦</view>
				<view class="confetti confetti--2">✧</view>
				<view class="confetti confetti--3">✦</view>
				<view class="confetti confetti--4">✧</view>
				<view class="confetti confetti--5">✦</view>
				<view class="confetti confetti--6">✧</view>
				<view class="confetti confetti--7">✦</view>
				<view class="confetti confetti--8">✧</view>
			</template>

		</template>
		<!-- 阅读规定 -->
		<u-popup ref="noticeModle" :show="noticePopShow" mode="center" :overlay="true" :mask-click="false">
			<view class="modal scalVie">
				<scroll-view class="warp modal__scroll" scroll-y="true">
					<view class="modal__title title">{{ notbcLit.Title }}</view>
					<f-parse :content="notbcLit.Content" />
				</scroll-view>
				<view class="botme modal__footer">
					<view class="modal__checkbox">
						<u-checkbox-group @change="checkboxChange">
							<u-checkbox :activeColor="noticeCheckboxColor" v-model="noticShow" shape="shape"
								label="我已阅读并遵守以上规定" />
						</u-checkbox-group>
					</view>
					<view class="modal__action">
						<button :class="{ active: deist == false }" :disabled="deist" class="btn" @click="close">
							确定
						</button>
					</view>
				</view>
			</view>
		</u-popup>
		<u-popup :show="item.show" :zIndex="10077 + index + 1" v-for="(item, index) in popList" :key="index"
			:overlay="true" :safeAreaInsetBottom="false" mode="center">
			<view class="popup-ad">
				<image class="popup-ad__image" :src="item.img" @click="inMag()" mode="widthFix" />
				<view class="guan">
					<u-icon name="close-circle" color="var(--color-bg-card)" @click="mindImga(index)" size="35"
						class="mdic" />
				</view>
			</view>
		</u-popup>
		<!-- 主题切换浮动按钮（本地演示用） -->
		<view class="theme-fab" @click="showThemePanel = true">
			<u-icon name="setting" color="var(--color-text-on-primary)" size="22" />
		</view>

		<!-- 主题选择面板 -->
		<u-popup :show="showThemePanel" mode="bottom" :round="20" :closeOnClickOverlay="true"
			@close="showThemePanel = false" :safeAreaInsetBottom="true">
			<view class="theme-panel">
				<view class="theme-panel__title">切换主题（本地演示）</view>
				<view class="theme-panel__grid">
					<view class="theme-panel__item" v-for="theme in themeList" :key="theme.key" :class="{
              'theme-panel__item--active': currentThemeKey === theme.key,
            }" @click="handleThemeSwitch(theme.key)">
						<view class="theme-panel__dot" :style="{ background: theme.primaryColor }" />
						<text class="theme-panel__name">{{ theme.name }}</text>
					</view>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		getCurrentInstance,
		watch,
		onMounted,
		onBeforeUnmount
	} from "vue";
	import store from "../../store/index.js";
	import IndexSkeleton from "../../components/skeleton/index_skeleton.vue";
	import Kong from "../../components/kong/kong.vue";
	import ScaleSwiper from '@/components/scale-swiper/scale-swiper.vue'
	import {
		applyTheme,
		getThemeMetaList,
		getStoredThemeKey,
		getThemeVars
	} from "@/styles/themes.js";

	const proxy = getCurrentInstance().proxy || getCurrentInstance();
	const props = defineProps({
		active: Boolean
	});
	const emit = defineEmits(["ready"]);

	const hasLoaded = ref(false);

	const indicatorDots = ref(true);
	const autoplay = ref(true);
	const interval = ref(2000);
	const duration = ref(500);
	const banList = ref([]);
	const activeTab = ref(0);
	const tickList = ref([]);
	const numberPhone = ref("");
	const weather = ref({
		CompanyName: "",
		SupportContent: "",
		AppletVersion: ""
	});
	const isShow = ref("");
	const imgHeight = ref("");
	const card = ref([]);
	const title = ref([]);
	const isActive = ref(0);
	const classification = ref([]);
	const noticShow = ref(false);
	const deist = ref(true);
	const infoShow = ref(false);
	const popList = ref([]);
	const notbcLit = ref({
		Title: "",
		Content: ""
	});
	const noticeModle = ref(null);
	const noticePopShow = ref(false);
	const noticeCheckboxColor = computed(() => {
		const vars = getThemeVars();
		return vars['--color-primary'] || '#FF0000';
	});
	const pageReady = ref(false);

	// ==================== 主题切换（本地演示） ====================
	const showThemePanel = ref(false);
	const currentThemeKey = ref(getStoredThemeKey());
	const themeList = computed(() =>
		getThemeMetaList().map((t) => {
			const vars = getThemeVars(t.key);
			return {
				...t,
				primaryColor: vars?.["--color-primary"] || "var(--color-disabled)",
			};
		}),
	);

	function handleThemeSwitch(key) {
		applyTheme(key);
		currentThemeKey.value = key;
		showThemePanel.value = false;
		setTimeout(() => {
			uni.reLaunch({
				url: "/pages/index/index"
			});
		}, 300);
	}

	// ==================== 国庆烟花 Canvas ====================
	const fireworkTimer = ref(null);
	const fireworkAniId = ref(null);

	class Particle {
		constructor(x, y, color) {
			this.x = x;
			this.y = y;
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * 4 + 2;
			this.vx = Math.cos(angle) * speed;
			this.vy = Math.sin(angle) * speed;
			this.color = color;
			this.alpha = 1;
			this.decay = Math.random() * 0.015 + 0.008;
			this.radius = Math.random() * 2.5 + 1;
		}

		update() {
			this.x += this.vx;
			this.y += this.vy;
			this.vy += 0.04;
			this.alpha -= this.decay;
		}

		draw(ctx) {
			ctx.save();
			ctx.globalAlpha = Math.max(this.alpha, 0);
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		}
	}

	function startFirework() {
		const query = uni.createSelectorQuery().in(proxy);
		query.select("#fireworkCanvas").fields({
			node: true,
			size: true
		}).exec((res) => {
			if (!res || !res[0] || !res[0].node) return;
			const canvas = res[0].node;
			const width = res[0].width;
			const height = res[0].height;
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext("2d");
			let particles = [];

			function launch() {
				const colors = ["#FF3D3D", "#FFD700", "#FF6B35", "#FF4444", "#FFAA00", "#FF6666", "#FFCC00"];
				const cx = Math.random() * width * 0.7 + width * 0.15;
				const cy = Math.random() * height * 0.5 + height * 0.15;
				const color = colors[Math.floor(Math.random() * colors.length)];
				for (let i = 0; i < 80; i++) {
					particles.push(new Particle(cx, cy, color));
				}
				// 拖尾粒子（慢速衰减，更小）
				for (let i = 0; i < 20; i++) {
					const p = new Particle(cx + (Math.random() - 0.5) * 10, cy + (Math.random() - 0.5) * 10,
						color);
					p.decay = 0.004;
					p.radius = 1.2;
					p.vx *= 0.3;
					p.vy *= 0.3;
					particles.push(p);
				}
			}

			function animate() {
				ctx.clearRect(0, 0, width, height);
				particles = particles.filter((p) => p.alpha > 0.01);
				particles.forEach((p) => {
					p.update();
					p.draw(ctx);
				});
				fireworkAniId.value = canvas.requestAnimationFrame(animate);
			}

			animate();
			launch();
			fireworkTimer.value = setInterval(launch, 1500);
		});
	}

	function stopFirework() {
		if (fireworkTimer.value) {
			clearInterval(fireworkTimer.value);
			fireworkTimer.value = null;
		}
		if (fireworkAniId.value) {
			cancelAnimationFrame(fireworkAniId.value);
			fireworkAniId.value = null;
		}
	}

	onMounted(() => {
		if (currentThemeKey.value === "national-day") {
			startFirework();
		}
	});

	onBeforeUnmount(() => {
		stopFirework();
	});

	const myRequest = (options) => uni.$myRequest(options);
	console.log("777777777777777777777");
	watch(
		() => props.active,
		(val) => {
			if (val && !hasLoaded.value) {
				hasLoaded.value = true;
				startPageFun();
			}
		}, {
			immediate: true
		},
	);

	function startPageFun() {
		console.log("8888888888");
		pageReady.value = false;
		payLoad();
	}

	async function payLoad() {
		try {
			titleImg();
			const list = await myRequest({
				url: "/api/Applets/AppletsMainScenicInfo",
				method: "POST",
			});
			const notcLit = list.data?.Data?.Popup || {};
			weather.value = list.data?.Data || {};
			if (weather.value.PassengerFlow && weather.value.PassengerFlow.trim() !== '') {
				weather.value.PassengerFlowList = [weather.value.PassengerFlow];
			}
			if (
				notcLit.IsAlways == 0 &&
				notcLit.ImgUrlList != null &&
				weather.value.Popup &&
				weather.value.Popup.IsShow == 1
			) {
				popList.value = notcLit.ImgUrlList.map((item) => ({
					img: item,
					show: true,
				}));
			}
			store.state.isSow = list.data.Data.UpgradeMode;
			isShow.value = list.data.Data.UpgradeMode != 1;
			if (
				weather.value.Popup &&
				weather.value.Popup.IsShow == 1 &&
				weather.value.Popup.PopType == 0
			) {
				infoShow.value = true;
			}
			card.value = [];
			const noticeList = weather.value.NoticeList || [];
			for (let i = 0; i < noticeList.length; i++) {
				card.value.push(noticeList[i].Title);
			}
			numberPhone.value = uni.getStorageSync("phone");
			bannar();
			setTimeout(() => {
				if (classification.value.length) changeTab(0);
			}, 200);
			if (noticeList.length > 0 && weather.value.PopNotice == 1) {
				const PopNotice = uni.getStorageSync("PopNotice");
				if (!PopNotice) {
					uni.setStorage({
						key: "PopNotice",
						data: noticeList[0]
					});
					notciVal(noticeList[0].NoticeID);
					if (!weather.value.Popup || weather.value.Popup.IsShow != 1)
						noticePopShow.value = true;
				} else if (PopNotice.NoticeID != noticeList[0].NoticeID) {
					uni.setStorage({
						key: "PopNotice",
						data: noticeList[0]
					});
					notciVal(noticeList[0].NoticeID);
					noticePopShow.value = true;
				}
			}
		} finally {
			setTimeout(() => {
				pageReady.value = true;
				emit("ready");
			}, 800);
		}
	}

	function inMag() {
		if (!weather.value.Popup || weather.value.Popup.IsLink != 1) return;
		const p = weather.value.Popup;
		if (p.LinkType == 0)
			uni.navigateTo({
				url: `/pages/details/details?tId=${p.ParamID}`
			});
		else if (p.LinkType == 1)
			uni.navigateTo({
				url: "/pages/notice/noticList?notic=" + p.ParamID,
			});
		else if (p.LinkType == 2) {
			const mi = uni.getStorageSync("menberInfo");
			if (numberPhone.value || weather.value.EnableAppletNeedGetPhone == 0) {
				if (mi) {
					uni.navigateTo({
						url: "/pages/subPack/menber/recharge?menber=" + mi.MemberID,
					});
					store.state.tickId = p.ParamID;
				} else
					uni.navigateTo({
						url: "/pages/subPack/menber/menber?menber=" + 0
					});
			} else {
				uni.redirectTo({
					url: "/pages/information/information"
				});
			}
		} else if (p.LinkType == 3)
			uni.navigateTo({
				url: "/pages/introduce/introduce"
			});
		else if (p.LinkType == 4) {
			const cs = JSON.stringify({
				MerchantID: p.MerchantID,
				ShopID: p.ShopID,
				GoodsID: p.ParamID,
			});
			uni.navigateTo({
				url: "/pages/productList/productDetails?currentSite=" + cs,
			});
		}
	}

	function checkboxChange(val) {
		deist.value = val.length === 0;
	}

	function close() {
		noticePopShow.value = false;
	}

	async function notciVal(value) {
		const list = await myRequest({
			url: "/api/Applets/AppletsGetScenicNoticeInfo?NoticeID=" + Number(value),
			method: "POST",
		});
		notbcLit.value = list.data.Data;
	}

	function swiperClick(val) {
		const nl = weather.value.NoticeList || [];
		if (!nl[val]) return;
		uni.navigateTo({
			url: "/pages/notice/noticList?notic=" + nl[val].NoticeID,
		});
	}

	function imageLoad(e) {
		const id = e.currentTarget.id,
			idx = id.substr(3),
			item = banList.value[idx];
		uni
			.createSelectorQuery()
			.in(proxy)
			.select("#" + id)
			.boundingClientRect((data) => {
				item.containerHeight = (data.width * e.detail.height) / e.detail.width;
				imgHeight.value = (data.width * e.detail.height) / e.detail.width;
				proxy.$forceUpdate();
			})
			.exec();
	}

	function calPhone() {
		uni.makePhoneCall({
			phoneNumber: weather.value.Phone
		});
	}

	function dizhi() {
		console.log(weather.value.LocalityY, weather.value.LocalityX);
		if (!weather.value.LocalityY || !weather.value.LocalityX) {
			return;
		}
		uni.openLocation({
			latitude: Number(weather.value.LocalityY),
			longitude: Number(weather.value.LocalityX),
			name: weather.value.ScenicName,
			address: weather.value.Address,
		});
	}

	function mindImga(index) {
		popList.value[index].show = false;
	}

	function infoClose() {
		infoShow.value = false;
	}

	function linqu(item) {
		uni.navigateTo({
			url: `/pages/rollcenter/rolldetails?id=${item.ID}`,
		});
	}

	function menberCard(item) {
		if (numberPhone.value || weather.value.EnableAppletNeedGetPhone == 0) {
			uni.navigateTo({
				url: "/pages/menber/recharge?menber=" + 0,
			});
			store.state.tickId = item.TicketID;
		} else {
			uni.redirectTo({
				url: "/pages/information/information"
			});
		}
	}

	function purchase(item) {
		const cs = JSON.stringify({
			MerchantID: item.MerchantID,
			ShopID: item.ShopID,
			GoodsID: item.GoodsID,
		});
		uni.navigateTo({
			url: "/pages/productList/productDetails?currentSite=" + cs,
		});
	}

	function changeTab(index) {
		if (!classification.value[index]) return;
		activeTab.value = index;
		const pu = classification.value[index].PageUrl;
		if (pu == "/pages/ticket/ticket") {
			isActive.value = 0;
			tick();
		} else if (pu == "/pages/subPack/productList/productList") {
			product();
			isActive.value = 1;
		} else if (pu == "/pages/subPack/menber/menber") {
			menber();
			isActive.value = 2;
		} else if (pu == "/pages/subPack/rollcenter/rollcenter") {
			rollMen();
			isActive.value = 3;
		}
	}

	async function rollMen() {
		const oi = uni.getStorageSync("userinfo");
		const list = await myRequest({
			url: "/api/AppletsIndoor/CouponCenterList",
			data: {
				openId: oi.openid,
				ChooseCompanyID: 0,
				ChooseScenicID: 0
			},
			method: "POST",
		});
		tickList.value = list.data.Data;
	}
	async function menber() {
		const list = await myRequest({
			url: "/api/Applets/AppletsRecommendOpenCardTicket",
			method: "POST",
		});
		tickList.value = list.data.Data;
	}
	async function product() {
		const list = await myRequest({
			url: "/api/Applets/AppletsRecommendGoods",
			method: "POST",
		});
		tickList.value = list.data.Data;
	}

	function tickDetails(index) {
		if (numberPhone.value || weather.value.EnableAppletNeedGetPhone == 0) {
			uni.navigateTo({
				url: `/pages/details/details?tId=${index}`
			});
			store.state.tickId = index;
		} else {
			uni.redirectTo({
				url: "/pages/information/information"
			});
		}
	}

	function menPiao(val, str, item) {
		if (item.IsJump === 0) {
			if (val == "/pages/subPack/menber/menber") {
				uni.navigateTo({
					url: "/pages/menber/menber?menber=0" + "&str=" + str,
				});
			} else if (val == "/pages/ticket/ticket") {
				uni.$emit("switchTab", 2);
			} else if (val == "/pages/subPack/productList/productList") {
				uni.navigateTo({
					url: `/pages/productList/productList`,
				});
			} else if (val == "/pages/subPack/notice/notice") {
				uni.navigateTo({
					url: `/pages/notice/notice`,
				});
			} else if (val == "/pages/subPack/noticList/noticList") {
				uni.navigateTo({
					url: `/pages/noticList/noticList`,
				});
			} else if (val == "/pages/Stop/Stop") {
				uni.navigateTo({
					url: "/pages/stop/stop"
				});
			} else if (val == "/pages/subPack/route/route") {
				uni.navigateTo({
					url: `/pages/route/route?str=` + str,
				});
			} else if (val == "/pages/subPack/rollcenter/rollcenter") {
				uni.navigateTo({
					url: `/pages/rollcenter/rollcenter`,
				});
			} else if (val == "/pages/subPack/seat/detailsSeat") {
				uni.navigateTo({
					url: `/pages/seat/detailsSeat?str=` + str,
				});
			} else if (val == "/pages/subPack/map1/map1") {
				uni.navigateTo({
					url: `/pages/map1/map1`,
				});
			} else if (val == "/pages/contactus/contactus") {
				uni.makePhoneCall({
					phoneNumber: weather.value.Phone
				});
			} else if (val == "/pages/busline/busline") {
				uni.openLocation({
					latitude: Number(weather.value.LocalityY),
					longitude: Number(weather.value.LocalityX),
					name: weather.value.ScenicName,
					address: weather.value.Address,
				});
			} else if (val == "/pages/subPack/activitydetail/activitydetail") {
				uni.navigateTo({
					url: `/pages/subPack/activitydetail/activitydetail?title=${item.Title}`,
				});
			} else if (val.indexOf("https://") === 0) {
				uni.navigateTo({
					url: `/pages/ar/ar?mind=` + val
				});
			} else {
				uni.navigateTo({
					url: `${val}?str=` + str
				});
			}
		} else {
			if (item.PageUrl.indexOf("http") != -1)
				uni.navigateTo({
					url: "/pages/webview/webview?url=" + encodeURIComponent(item.PageUrl),
				});
			else {
				const ed = {};
				const jp = item.JumpPara;
				if (jp)
					jp.split("&").forEach((p) => {
						const [k, v] = p.split("=");
						if (k) ed[k] = decodeURIComponent(v || "");
					});
				uni.navigateToMiniProgram({
					appId: item.JumpAppID,
					path: item.PageUrl,
					extraData: ed,
					envVersion: "trial",
				});
			}
		}
	}

	async function tick() {
		const list = await myRequest({
			url: "/api/Applets/AppletsRecommendTicket",
			method: "POST",
		});
		tickList.value = list.data.Data;
	}

	async function titleImg() {
		const list = await myRequest({
			url: "/api/Applets/AppletsGetModuleList",
			method: "POST",
		});
		title.value = [];
		classification.value = [];
		list.data.Data.forEach((item) => {
			if (
				item.PageUrl != "/pages/subPack/ballmenber/ballmenber" &&
				item.PageUrl != "/pages/subPack/venue/venue"
			)
				title.value.push(item);
		});
		list.data.Data.forEach((item) => {
			if (
				[
					"/pages/ticket/ticket",
					"/pages/subPack/productList/productList",
					"/pages/subPack/menber/menber",
					"/pages/subPack/rollcenter/rollcenter",
				].includes(item.PageUrl)
			) {
				classification.value.push({
					name: item.Title,
					id: item.ID,
					disabled: true,
					PageUrl: item.PageUrl,
				});
			}
		});
	}

	async function bannar() {
		const list = await myRequest({
			url: "/api/Applets/AppletsGetScenicImg",
			method: "POST",
		});
		banList.value = list.data?.Data || [];
	}
</script>

<script>
	export default {
		onShareAppMessage() {
			return {
				title: "小程序",
				path: "/pages/index/index"
			};
		},
	};
</script>

<style lang="scss" scoped>
	.home-content {
		min-height: 100vh;
	}

	:deep(.u-navbar__content) {
		background-color: transparent !important;
		height: 96rpx !important;
	}

	:deep(.u-navbar__content__title) {
		font-size: var(--font-size-h2, 30rpx) !important;
		font-weight: 600 !important;
		color: var(--color-text) !important;
	}

	:deep(.u-navbar__content__left .u-icon) {
		color: var(--color-primary) !important;
	}

	.hero {
		position: relative;
		width: 100%;
		height: 450rpx;
	}

	/* 国庆红色遮罩（::after 伪元素，不依赖子节点层级） */
	.hero--national::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(180deg, rgba(212, 48, 47, 0.35) 0%, rgba(212, 48, 47, 0.05) 100%);
		z-index: 10;
		pointer-events: none;
		border-radius: inherit;
	}

	.hero__swiper {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.hero__slide {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.hero__image {
		width: 100%;
		height: 100%;
		display: block;
		filter: brightness(1.05) saturate(0.92);
	}

	.hero__mask {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 55%;
		background: linear-gradient(180deg,
				rgba(255, 255, 255, 0) 40%,
				rgba(232, 246, 236, 0.6) 100%);
		pointer-events: none;
	}

	.hero__weather {
		position: absolute;
		bottom: 62rpx;
		left: 32rpx;
		z-index: 4;
		pointer-events: none;
	}

	.hero__weather-text {
		color: var(--color-bg-card);
		font-size: var(--font-size-h2, 30rpx);
		font-weight: 600;
		line-height: var(--line-height-h2, 40rpx);
		text-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.25);
	}

	:deep(.hero__swiper .wx-swiper-dot),
	:deep(.hero__swiper .uni-swiper-dot) {
		width: 12rpx !important;
		height: 12rpx !important;
		border-radius: 50%;
		margin: 0 6rpx !important;
		border: 1rpx solid var(--color-primary-border-light);
	}

	:deep(.hero__swiper .wx-swiper-dot-active),
	:deep(.hero__swiper .uni-swiper-dot-active) {
		width: 16rpx !important;
		height: 16rpx !important;
		border-color: var(--color-primary);
		background-color: var(--color-primary);
	}

	.hero__notice {
		width: 80%;
		position: absolute;
		bottom: 32rpx;
		left: 32rpx;
		z-index: 2;
	}

	.passenger-notice {
		margin: var(--space-6, 48rpx) 32rpx 0;
	}

	.passenger-notice :deep(.u-notice-bar) {
		background-color: var(--color-bg-card) !important;
		border-radius: var(--radius-card) !important;
		box-shadow: var(--shadow-soft);
		padding: 24rpx 32rpx !important;
	}

	.passenger-notice :deep(.u-notice-bar__content__text) {
		color: var(--color-text) !important;
		font-size: var(--font-size-caption, 24rpx) !important;
	}

	.info-card {
		// margin: var(--space-6, 48rpx) 32rpx 0;
		width: 100%;
		padding: 24rpx 32rpx;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
		position: relative;
		z-index: 1;
		margin-top: -30rpx;
	}

	.row {
		display: flex;
		align-items: center;
		height: 90rpx;
		padding: 16rpx 0;
	}

	.row+.row {
		border-top: 1rpx solid var(--color-border-light);
	}

	.row__icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
	}

	.row__content {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: baseline;
		gap: 12rpx;
	}

	.row .label {
		flex-shrink: 0;
		width: 144rpx;
		font-size: 26rpx;
		color: var(--color-text-secondary);
		font-weight: 400;
		line-height: var(--line-height-caption, 36rpx);
	}

	.row .value {
		flex: 1;
		font-size: var(--font-size-body, 28rpx);
		color: var(--color-text);
		font-weight: 600;
		line-height: var(--line-height-body, 40rpx);
		word-break: break-all;
	}

	.row--clickable:active {
		transform: scale(0.98);
		opacity: 0.9;
	}

	.block {
		background-color: var(--color-bg);
		padding-bottom: var(--space-6, 48rpx);
	}

	.icon-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 24rpx;
		margin: var(--space-6, 48rpx) 32rpx 0;
		padding: 40rpx 24rpx;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
	}

	.item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		min-height: 128rpx;
	}

	.item:active {
		transform: scale(0.96);
	}

	.item:active .icon-bg {
		background-color: var(--color-primary);
	}

	.item__icon {
		width: 56rpx;
		height: 56rpx;
	}

	.item__label {
		font-size: var(--font-size-caption, 24rpx);
		color: var(--color-text-secondary);
		text-align: center;
		line-height: var(--line-height-caption, 36rpx);
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.icon-bg {
		width: 112rpx;
		height: 112rpx;
		border-radius: 50%;
		background-color: var(--color-primary-bg-light);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.seat-banner {
		width: calc(100% - 64rpx);
		margin: var(--space-6, 48rpx) 32rpx 0;
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
		display: block;
	}

	.tab-nav {
		margin: var(--space-6, 48rpx) 32rpx 0;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
		overflow: hidden;
		padding: 24rpx 16rpx 0;
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24rpx;
		padding: 32rpx 24rpx 24rpx;
	}

	.product-card {
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
		overflow: hidden;
	}

	.product-card:active {
		transform: scale(0.97);
		box-shadow: none;
	}

	.product-card__image {
		width: 100%;
		aspect-ratio: 4/3;
		height: auto;
		display: block;
		border-radius: var(--radius-card) var(--radius-card) 0 0;
	}

	.product-card__body {
		padding: 24rpx;
	}

	.product-card__name {
		font-size: var(--font-size-body, 28rpx);
		font-weight: 600;
		color: var(--color-text);
		line-height: var(--line-height-body, 40rpx);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.product-card__price-row {
		margin-top: 16rpx;
		display: flex;
		align-items: flex-end;
	}

	.product-card__price-row--inline {
		flex-direction: row;
		align-items: baseline;
		gap: 12rpx;
	}

	.product-card--coupon {
		padding-bottom: 8rpx;
	}

	.price {
		font-size: 32rpx;
		font-weight: 700;
		color: var(--color-primary);
	}

	.price__symbol {
		font-size: var(--font-size-caption, 24rpx);
	}

	.discount {
		font-size: var(--font-size-caption, 24rpx);
		color: var(--color-text-secondary);
		text-decoration: line-through;
		opacity: 0.7;
		line-height: var(--line-height-caption, 36rpx);
		margin-left: 10rpx;
	}

	.disc {
		margin-top: 8rpx;
		font-size: var(--font-size-caption, 24rpx);
		color: var(--color-text-secondary);
		display: block;
		line-height: var(--line-height-caption, 36rpx);
	}

	.product-tag {
		display: inline-block;
		margin-top: 12rpx;
		margin-right: 8rpx;
		font-size: var(--font-size-small, 22rpx);
		color: var(--color-secondary);
		border: 1rpx solid var(--color-secondary);
		padding: 4rpx 12rpx;
		border-radius: var(--radius-sm, 16rpx);
	}

	.footer-info {
		margin-top: 64rpx;
		padding: 0 32rpx 48rpx;
		color: var(--color-text-secondary);
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}

	.footer-info .bink {
		width: 100%;
		text-align: center;
		font-size: var(--font-size-caption, 24rpx);
		line-height: var(--line-height-caption, 36rpx);
		margin-top: 8rpx;
	}

	.modal {
		position: relative;
		width: 85vw;
		max-width: 600rpx;
		height: 70vh;
		max-height: 900rpx;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-modal, 0 24rpx 60rpx rgba(0, 0, 0, 0.12));
		overflow: hidden;
		padding: 32rpx 32rpx 0;
		box-sizing: border-box;
	}

	.modal__scroll {
		width: 100%;
		height: calc(100% - 200rpx);
	}

	.modal__title {
		font-weight: 600;
		font-size: var(--font-size-h1, 36rpx);
		color: var(--color-text);
		text-align: center;
		margin-bottom: 32rpx;
		line-height: var(--line-height-h1, 44rpx);
	}

	.modal__footer {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--color-bg-card);
		padding: 24rpx 32rpx calc(32rpx + env(safe-area-inset-bottom));
		border-radius: 0 0 var(--radius-card) var(--radius-card);
	}

	.modal__checkbox {
		margin-bottom: 24rpx;
	}

	.modal__checkbox :deep(.u-checkbox__label-wrap__text) {
		color: var(--color-primary) !important;
		font-size: var(--font-size-body, 28rpx) !important;
	}

	.modal__action {
		display: flex;
		justify-content: center;
	}

	.btn {
		width: 100%;
		max-width: 400rpx;
		min-height: 96rpx;
		line-height: 96rpx;
		font-size: var(--font-size-body, 28rpx);
		font-weight: 600;
		color: var(--color-bg-card);
		background-color: var(--color-disabled);
		border: none;
		border-radius: var(--radius-button);
		opacity: 0.6;
	}

	.btn::after {
		border: none;
	}

	.btn.active {
		color: var(--color-bg-card) !important;
		background-color: var(--color-primary) !important;
		opacity: 1;
	}

	.btn:active:not([disabled]) {
		transform: scale(0.96);
	}

	.popup-ad {
		position: relative;
		width: 85vw;
		max-width: 650rpx;
	}

	.popup-ad__image {
		width: 100%;
		display: block;
		border-radius: var(--radius-card);
	}

	.guan {
		width: 64rpx;
		height: 64rpx;
		position: absolute;
		top: 24rpx;
		right: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* ====== 主题切换浮动按钮 ====== */
	.theme-fab {
		position: fixed;
		right: 24rpx;
		bottom: 280rpx;
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
		transition: all 160ms ease;
	}

	.theme-fab:active {
		opacity: 0.8;
		transform: scale(0.92);
	}

	/* ====== 主题选择面板 ====== */
	.theme-panel {
		padding: 32rpx 24rpx;
	}

	.theme-panel__title {
		font-size: var(--font-size-body, 28rpx);
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 24rpx;
		text-align: center;
	}

	.theme-panel__grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}

	.theme-panel__item {
		width: calc(50% - 10rpx);
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 20rpx 16rpx;
		border-radius: var(--radius-sm, 16rpx);
		background: var(--color-bg);
		border: 2rpx solid transparent;
		transition: all 120ms ease;
	}

	.theme-panel__item--active {
		border-color: var(--color-primary);
		background: var(--color-primary-bg-light);
	}

	.theme-panel__item:active {
		opacity: 0.8;
		transform: scale(0.97);
	}

	.theme-panel__dot {
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.theme-panel__name {
		font-size: var(--font-size-caption, 24rpx);
		color: var(--color-text);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.noticeDiv {
		margin: var(--space-6, 48rpx) 32rpx 0;
		background-color: var(--color-bg-card);
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-soft);
	}

	/* ====== 国庆红绸带 ====== */
	.national-ribbon {
		width: 100%;
		padding: 16rpx 32rpx;
		background: linear-gradient(90deg, #D4302F 0%, #E63946 50%, #D4302F 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(212, 48, 47, 0.3);
	}

	.national-ribbon__year {
		font-size: 24rpx;
		font-weight: 700;
		color: #FFE082;
		letter-spacing: 2rpx;
	}

	.national-ribbon__text {
		font-size: 24rpx;
		font-weight: 600;
		color: #FFFFFF;
		letter-spacing: 4rpx;
		animation: ribbonShine 3s ease-in-out infinite;
	}

	@keyframes ribbonShine {

		0%,
		100% {
			opacity: 0.85;
		}

		50% {
			opacity: 1;
			text-shadow: 0 0 12rpx rgba(255, 224, 130, 0.6);
		}
	}

	/* ====== 国庆节日装饰 ====== */
	.hero__festival {
		position: relative;
		overflow: hidden;
		margin: 0 32rpx;
		padding: 32rpx 24rpx;
		background: linear-gradient(135deg, #D4302F 0%, #E6B422 100%);
		border-radius: var(--radius-card);
		box-shadow: 0 0 20rpx rgba(230, 180, 34, 0.3), var(--shadow-soft);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		animation: festivalGlow 2s ease-in-out infinite;
	}

	.hero__festival-bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		border-radius: inherit;
	}

	.hero__festival-inner,
	.hero__festival-sub {
		position: relative;
		z-index: 1;
	}

	/* 横幅扫光 */
	.hero__festival::after {
		content: "";
		position: absolute;
		top: -50%;
		left: -50%;
		width: 30%;
		height: 200%;
		background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%);
		transform: skewX(-25deg);
		animation: shimmerSweep 3s ease-in-out infinite;
		pointer-events: none;
	}

	@keyframes shimmerSweep {
		0% {
			left: -50%;
		}

		100% {
			left: 150%;
		}
	}

	@keyframes festivalGlow {

		0%,
		100% {
			box-shadow: 0 0 20rpx rgba(230, 180, 34, 0.3), var(--shadow-soft);
		}

		50% {
			box-shadow: 0 0 40rpx rgba(230, 180, 34, 0.55), 0 0 80rpx rgba(212, 48, 47, 0.25), var(--shadow-soft);
		}
	}

	.hero__festival-inner {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.hero__festival-star {
		font-size: 32rpx;
		color: #FFE082;
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
	}

	.hero__festival-title {
		font-size: var(--font-size-h2);
		font-weight: 700;
		color: #FFFFFF;
		letter-spacing: 4rpx;
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
	}

	.hero__festival-sub {
		font-size: var(--font-size-caption);
		color: rgba(255, 255, 255, 0.85);
		letter-spacing: 2rpx;
	}

	/* ====== 浮动装饰元素 ====== */
	.festival-float {
		position: fixed;
		z-index: 800;
		pointer-events: none;
		font-size: 56rpx;
		opacity: 0.5;
		animation: festivalFloat 3s ease-in-out infinite;
	}

	.festival-float--1 {
		top: 15%;
		left: 16rpx;
		animation-delay: 0s;
		font-size: inherit;
		width: 72rpx;
		height: 92rpx;
	}

	.festival-float--2 {
		top: 45%;
		right: 20rpx;
		animation-delay: 0.6s;
		font-size: 48rpx;
		color: #E6B422;
	}

	.festival-float--3 {
		top: 65%;
		left: 24rpx;
		animation-delay: 1.2s;
		font-size: inherit;
		width: 64rpx;
		height: 82rpx;
	}

	.festival-float--4 {
		top: 30%;
		right: 8rpx;
		animation-delay: 1.8s;
		font-size: 44rpx;
		color: #E6B422;
	}

	.festival-float--5 {
		top: 78%;
		left: 40rpx;
		animation-delay: 0.3s;
		font-size: inherit;
		width: 56rpx;
		height: 72rpx;
	}

	.festival-float--6 {
		top: 55%;
		right: 36rpx;
		animation-delay: 0.9s;
		font-size: 40rpx;
		color: #E6B422;
	}

	.festival-float__img {
		width: 100%;
		height: 100%;
		display: block;
	}

	@keyframes festivalFloat {

		0%,
		100% {
			transform: translateY(0) scale(1);
		}

		50% {
			transform: translateY(-24rpx) scale(1.05);
		}
	}

	/* ====== 飘落粒子 ====== */
	.confetti {
		position: fixed;
		z-index: 801;
		pointer-events: none;
		font-size: 32rpx;
		color: #E6B422;
		opacity: 0;
		animation: confettiFall 4s linear infinite;
	}

	.confetti--1 {
		left: 5%;
		animation-delay: 0s;
		animation-duration: 3.5s;
	}

	.confetti--2 {
		left: 15%;
		animation-delay: 0.8s;
		animation-duration: 4.2s;
	}

	.confetti--3 {
		left: 28%;
		animation-delay: 1.6s;
		animation-duration: 3.8s;
	}

	.confetti--4 {
		left: 40%;
		animation-delay: 0.4s;
		animation-duration: 4.5s;
	}

	.confetti--5 {
		left: 55%;
		animation-delay: 2.0s;
		animation-duration: 3.2s;
	}

	.confetti--6 {
		left: 68%;
		animation-delay: 1.2s;
		animation-duration: 4.0s;
	}

	.confetti--7 {
		left: 80%;
		animation-delay: 2.4s;
		animation-duration: 3.6s;
	}

	.confetti--8 {
		left: 92%;
		animation-delay: 0.6s;
		animation-duration: 4.8s;
	}

	@keyframes confettiFall {
		0% {
			top: -10%;
			opacity: 0;
			transform: translateX(0) rotate(0deg);
		}

		10% {
			opacity: 0.8;
		}

		90% {
			opacity: 0.6;
		}

		100% {
			top: 110%;
			opacity: 0;
			transform: translateX(40rpx) rotate(720deg);
		}
	}

	/* ====== 国庆页脚装饰 ====== */
	.national-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		padding: 40rpx 0;
		opacity: 0.6;
	}

	.national-footer__star {
		font-size: 24rpx;
		color: #E6B422;
	}

	.national-footer__text {
		font-size: var(--font-size-caption);
		color: var(--color-text-secondary);
		letter-spacing: 4rpx;
	}
</style>