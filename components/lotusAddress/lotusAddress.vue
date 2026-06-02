<!--
  lotus-address — 省市区三级联动选择器
  ==========================================
  重构：Vue 3 Composition API（<script setup>）
  数据来源：Winglau14-lotusAddress.js（不变）
  主题色：通过 CSS 变量驱动
-->

<template>
  <view v-if="visible" class="lotus-address-mask" @tap.stop>
    <view class="lotus-address-box">
      <view class="lotus-address-action">
        <text @tap="cancelPicker" class="lotus-address-action-cancel"
          >取消</text
        >
        <text @tap="chosedVal" class="lotus-address-action-affirm">确认</text>
      </view>
      <view class="lotus-address-picker-box">
        <!-- 省 -->
        <scroll-view
          scroll-y
          :scroll-into-view="'pid' + pChoseIndex"
          class="lotus-address-picker-box-item"
        >
          <view
            @tap="clickPicker(0, pIndex, pItem)"
            :id="'pid' + pIndex"
            :class="
              pIndex === pChoseIndex
                ? 'lotus-address-picker lotus-address-picker2'
                : 'lotus-address-picker'
            "
            v-for="(pItem, pIndex) in province"
            :key="pIndex"
            >{{ pItem }}</view
          >
        </scroll-view>
        <!-- 市 -->
        <scroll-view
          scroll-y
          :scroll-into-view="'cid' + cChoseIndex"
          class="lotus-address-picker-box-item"
        >
          <view
            @tap="clickPicker(1, cIndex, cItem)"
            :id="'cid' + cIndex"
            :class="
              cIndex === cChoseIndex
                ? 'lotus-address-picker lotus-address-picker2'
                : 'lotus-address-picker'
            "
            v-for="(cItem, cIndex) in city"
            :key="cIndex"
            >{{ cItem }}</view
          >
        </scroll-view>
        <!-- 区 -->
        <scroll-view
          scroll-y
          :scroll-into-view="'tid' + tChoseIndex"
          class="lotus-address-picker-box-item"
        >
          <view
            @tap="clickPicker(2, tIndex, tItem)"
            :id="'tid' + tIndex"
            :class="
              tIndex === tChoseIndex
                ? 'lotus-address-picker lotus-address-picker2'
                : 'lotus-address-picker'
            "
            v-for="(tItem, tIndex) in town"
            :key="tIndex"
            >{{ tItem }}</view
          >
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from "vue";
import { lotusAddressJson } from "./lotusAddress.js";

// ==================== Props & Emits ====================
const props = defineProps({
  lotusAddressData: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["choseVal"]);

// ==================== 数据 ====================
const visible = ref(false);
const province = ref([]);
const city = ref([]);
const town = ref([]);
const provinceName = ref("");
const cityName = ref("");
const townName = ref("");
const pChoseIndex = ref(-1);
const cChoseIndex = ref(-1);
const tChoseIndex = ref(-1);

// ==================== 工具函数 ====================
function getTarId(name) {
  let id = 0;
  lotusAddressJson.forEach((item) => {
    if (item.name === name) id = item.value;
  });
  return id;
}

function getCityArr(parentId) {
  return lotusAddressJson
    .filter((item) => item.parent === parentId)
    .map((item) => item.name);
}

function getTownArr(parentId) {
  return lotusAddressJson
    .filter((item, idx) => idx > 34 && item.parent === parentId)
    .map((item) => item.name);
}

function getTarIndex(arr, tarName) {
  return arr.findIndex((item) => item === tarName);
}

// ==================== 初始化 ====================
function initFn() {
  if (!province.value.length) {
    province.value = lotusAddressJson
      .filter((_, i) => i <= 34)
      .map((item) => item.name);
  }

  const p = props.lotusAddressData.provinceName;
  const c = props.lotusAddressData.cityName;
  const t = props.lotusAddressData.townName;

  if (p) {
    pChoseIndex.value = getTarIndex(province.value, p);
    provinceName.value = p;
  }
  if (p && c) {
    city.value = getCityArr(getTarId(p));
    cChoseIndex.value = getTarIndex(city.value, c);
    cityName.value = c;
  }
  if (p && c && t) {
    town.value = getTownArr(getTarId(c));
    tChoseIndex.value = getTarIndex(town.value, t);
    townName.value = t;
  }
  if (!p && !c && !t) {
    pChoseIndex.value = -1;
    cChoseIndex.value = -1;
    tChoseIndex.value = -1;
    city.value = [];
    town.value = [];
  }
}

function getChosedData() {
  if (provinceName.value) {
    city.value = getCityArr(getTarId(provinceName.value));
    pChoseIndex.value = getTarIndex(province.value, provinceName.value);
  }
  if (cityName.value) {
    town.value = getTownArr(getTarId(cityName.value));
    cChoseIndex.value = getTarIndex(city.value, cityName.value);
  }
  if (townName.value) {
    tChoseIndex.value = getTarIndex(town.value, townName.value);
  }
}

// ==================== 监听 visible 变化 ====================
watch(
  () => props.lotusAddressData.visible,
  (val) => {
    if (val && !visible.value) {
      visible.value = true;
      provinceName.value = props.lotusAddressData.provinceName || "";
      cityName.value = props.lotusAddressData.cityName || "";
      townName.value = props.lotusAddressData.townName || "";
      initFn();
    }
  },
  { immediate: true },
);

// ==================== 交互 ====================
function clickPicker(type, index, name) {
  if (type === 0) {
    pChoseIndex.value = index;
    provinceName.value = name;
    cChoseIndex.value = -1;
    tChoseIndex.value = -1;
    cityName.value = "";
    townName.value = "";
  }
  if (type === 1) {
    cChoseIndex.value = index;
    cityName.value = name;
    tChoseIndex.value = -1;
    townName.value = "";
  }
  if (type === 2) {
    tChoseIndex.value = index;
    townName.value = name;
  }
  getChosedData();
}

function chosedVal() {
  const provinceCode = getTarId(provinceName.value);
  const cityCode = getTarId(cityName.value);
  const townCode = getTarId(townName.value);
  const isChose = provinceName.value && cityName.value ? 1 : 0;
  visible.value = false;
  emit("choseVal", {
    province: provinceName.value,
    provinceCode,
    city: cityName.value,
    cityCode,
    town: townName.value,
    townCode,
    isChose,
    visible: false,
  });
}

function cancelPicker() {
  const provinceCode = getTarId(provinceName.value);
  const cityCode = getTarId(cityName.value);
  const townCode = getTarId(townName.value);
  visible.value = false;
  emit("choseVal", {
    province: provinceName.value,
    provinceCode,
    city: cityName.value,
    cityCode,
    town: townName.value,
    townCode,
    isChose: 0,
    visible: false,
  });
}
</script>

<style lang="scss" scoped>
.lotus-address-mask {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background: rgba(0, 0, 0, 0.5);
}

.lotus-address-box {
  background: var(--color-bg-card, #fff);
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: auto;
  padding-bottom: env(safe-area-inset-bottom);
}

.lotus-address-action {
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25rpx 30rpx;
  position: relative;
  border-bottom: 1rpx solid var(--color-border-light, #eee);
}

.lotus-address-action-cancel {
  color: var(--color-text-secondary);
}
.lotus-address-action-affirm {
  color: var(--color-primary);
  font-weight: 600;
}

.lotus-address-picker-box {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10rpx 0;
}
.lotus-address-picker-box-item {
  height: 600rpx;
  overflow-y: auto;
  width: 33.333%;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.lotus-address-picker {
  font-size: 26rpx;
  padding: 30rpx 30rpx 30rpx 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: normal;
  box-sizing: border-box;
  color: var(--color-text);
}

.lotus-address-picker2 {
  color: var(--color-primary);
  font-weight: 600;
  position: relative;
  //   &::after {
  //     content: "";
  //     position: absolute;
  //     right: 0;
  //     top: 65%;
  //     transform: translateY(-35%) rotate(-45deg);
  //     width: 20rpx;
  //     height: 10rpx;
  //     border-left: 4rpx solid var(--color-primary);
  //     border-bottom: 4rpx solid var(--color-primary);
  //   }
}
</style>
