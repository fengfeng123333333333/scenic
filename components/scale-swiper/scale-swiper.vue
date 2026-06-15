<template>
	<view class="hero-zoom-swiper" v-if="banList.length">
		<view class="slide-wrapper">
			<!-- 槽位 A -->
			<view class="slide-item" :style="slotAStyle">
				<image
					v-if="slotA.index >= 0"
					class="hero__image"
					:src="banList[slotA.index]?.ImgUrl"
					mode="aspectFill"
				/>
				<view class="hero__mask" />
			</view>
			<!-- 槽位 B -->
			<view class="slide-item" :style="slotBStyle">
				<image
					v-if="slotB.index >= 0"
					class="hero__image"
					:src="banList[slotB.index]?.ImgUrl"
					mode="aspectFill"
				/>
				<view class="hero__mask" />
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

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
		default: 4000
	},
	crossfadeDuration: {
		type: Number,
		default: 600
	},
	maxScale: {
		type: Number,
		default: 1.15
	}
})

// ============ 双槽位状态 ============
const slotA = reactive({
	index: 0,
	zoomIn: true,
	opacity: 1,
	scale: 1,
	transitioning: false
})

const slotB = reactive({
	index: -1,
	zoomIn: false,
	opacity: 0,
	scale: 1.15,
	transitioning: false
})

// ============ 内联样式 ============
function buildStyle(slot) {
	const zoomMs = props.zoomDuration
	const fadeMs = props.crossfadeDuration
	return {
		opacity: slot.opacity,
		transform: `scale(${slot.scale})`,
		transition: slot.transitioning
			? `transform ${zoomMs}ms ease-in-out, opacity ${fadeMs}ms ease-in-out`
			: 'none'
	}
}

const slotAStyle = computed(() => buildStyle(slotA))
const slotBStyle = computed(() => buildStyle(slotB))

// ============ 轮播逻辑 ============
async function nextSlide() {
	if (!props.autoplay || props.banList.length <= 1) return

	const currentSlot = slotA.opacity > 0.5 ? slotA : slotB
	const nextSlot = currentSlot === slotA ? slotB : slotA

	const nextIndex = (currentSlot.index + 1) % props.banList.length
	const nextZoomIn = !currentSlot.zoomIn

	nextSlot.transitioning = false
	nextSlot.index = nextIndex
	nextSlot.zoomIn = nextZoomIn
	nextSlot.scale = nextZoomIn ? 1 : props.maxScale
	nextSlot.opacity = 0

	await nextTick()

	currentSlot.transitioning = true
	nextSlot.transitioning = true

	currentSlot.opacity = 0
	currentSlot.scale = currentSlot.zoomIn ? props.maxScale : 1

	nextSlot.opacity = 1
	nextSlot.scale = nextZoomIn ? props.maxScale : 1

	nextTriggerTime = Date.now() + props.crossfadeDuration
	onCrossfadeEnd = () => {
		currentSlot.transitioning = false
		currentSlot.opacity = 0
		currentSlot.index = -1
		onCrossfadeEnd = null
		startTimer()
	}
}

let heartbeatInterval = null
let nextTriggerTime = 0
let onCrossfadeEnd = null

function heartbeatCheck() {
	const now = Date.now()
	if (onCrossfadeEnd && now >= nextTriggerTime) {
		onCrossfadeEnd()
		return
	}
	if (!onCrossfadeEnd && now >= nextTriggerTime) {
		nextSlide()
	}
}

function startHeartbeat() {
	if (heartbeatInterval) return
	heartbeatInterval = setInterval(heartbeatCheck, 200)
}

function startTimer() {
	if (!props.autoplay || props.banList.length <= 1) return
	if (onCrossfadeEnd) return
	nextTriggerTime = Date.now() + props.zoomDuration - props.crossfadeDuration
	startHeartbeat()
}

function stopTimer() {
	onCrossfadeEnd = null
	if (heartbeatInterval) {
		clearInterval(heartbeatInterval)
		heartbeatInterval = null
	}
}

onMounted(() => {
	nextTick(() => {
		slotA.transitioning = true
		slotA.scale = props.maxScale
	})
	startTimer()
})

onUnmounted(() => {
	stopTimer()
})

watch(() => props.banList, (newVal) => {
	if (newVal.length > 0) {
		slotA.index = 0
		slotA.zoomIn = true
		slotA.opacity = 1
		slotA.scale = 1
		slotA.transitioning = false
		slotB.index = -1
		slotB.opacity = 0
		slotB.transitioning = false

		nextTick(() => {
			slotA.transitioning = true
			slotA.scale = props.maxScale
		})
		startTimer()
	} else {
		stopTimer()
	}
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
	background-color: #000;
}

.hero__image {
	width: 100%;
	height: 100%;
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
