<template>
	<view class="hero-zoom-swiper" v-if="banList.length">
		<view class="slide-wrapper">
			<view class="slide-item" :key="currentIndex + '-' + loopCount">
				<image class="hero__image" :class="zoomClass" :style="initialScaleStyle"
					:src="banList[currentIndex].ImgUrl" mode="aspectFill" />
				<view class="hero__mask" />
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		onUnmounted,
		watch
	} from 'vue'

	const props = defineProps({
		banList: {
			type: Array,
			required: true,
			default: () => []
		},
		autoplay: {
			type: Boolean,
			default: true
		},
		zoomDuration: {
			type: Number,
			default: 1500
		},
		maxScale: {
			type: Number,
			default: 1.15
		}
	})

	const currentIndex = ref(0)
	const loopCount = ref(0) // 辅助 key 强制重建
	const isZoomIn = ref(true) // true=拉近, false=拉远，每次切换翻转

	let timer = null

	const zoomClass = computed(() => {
		return isZoomIn.value ? 'zoom-in' : 'zoom-out'
	})

	const initialScaleStyle = computed(() => {
		if (!isZoomIn.value) {
			// 拉远：初始就是放大状态
			return {
				transform: `scale(${props.maxScale})`
			}
		}
		// 拉近：初始正常大小
		return {}
	})

	const nextSlide = () => {
		if (!props.autoplay || props.banList.length <= 1) return

		// 切换索引
		currentIndex.value = (currentIndex.value + 1) % props.banList.length
		// 翻转效果类型（上一张拉近，下一张就拉远）
		isZoomIn.value = !isZoomIn.value
		loopCount.value++

		startTimer()
	}

	const startTimer = () => {
		stopTimer()
		if (!props.autoplay || props.banList.length <= 1) return
		timer = setTimeout(() => {
			nextSlide()
		}, props.zoomDuration)
	}

	const stopTimer = () => {
		if (timer) {
			clearTimeout(timer)
			timer = null
		}
	}

	onMounted(() => {
		// 首张拉近，直接启动定时器
		startTimer()
	})

	onUnmounted(() => {
		stopTimer()
	})

	watch(() => props.autoplay, (val) => {
		if (val) startTimer()
		else stopTimer()
	})
</script>

<style scoped>
	.hero-zoom-swiper {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
		background-color: #000;
	}

	.slide-wrapper {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.slide-item {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero__image {
		width: 100%;
		height: 100%;
		opacity: 1;
	}

	.zoom-in {
		animation: zoom-in-effect v-bind(zoomDuration+'ms') ease-in-out forwards;
	}

	.zoom-out {
		animation: zoom-out-effect v-bind(zoomDuration+'ms') ease-in-out forwards;
	}

	@keyframes zoom-in-effect {
		from {
			transform: scale(1);
		}

		to {
			transform: scale(v-bind(maxScale));
		}
	}

	@keyframes zoom-out-effect {
		from {
			transform: scale(v-bind(maxScale));
		}

		to {
			transform: scale(1);
		}
	}

	.hero__mask {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>