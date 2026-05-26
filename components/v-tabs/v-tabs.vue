<template>
  <view class="v-tabs">
    <scroll-view
      class="v-tabs__scroll"
      scroll-x
      :scroll-with-animation="true"
      :show-scrollbar="false"
      :scroll-into-view="scrollIntoView"
    >
      <view class="v-tabs__container">
        <view
          v-for="(tab, index) in tabs"
          :id="'v-tab-' + index"
          :key="tab.id != null ? tab.id : index"
          class="v-tabs__container-item"
          :class="{ active: current === index }"
          :style="itemStyle(index)"
          @click="onTabClick(index)"
        >
          {{ getTabLabel(tab) }}
        </view>
        <view
          v-if="showLine"
          class="v-tabs__container-line"
          :style="lineStyle"
        ></view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: "VTabs",
  props: {
    modelValue: {
      type: Number,
      default: 0,
    },
    tabs: {
      type: Array,
      default: () => [],
    },
    field: {
      type: String,
      default: "name",
    },
    activeColor: {
      type: String,
      default: "#3aa76d",
    },
    lineColor: {
      type: String,
      default: "#3aa76d",
    },
    bold: {
      type: Boolean,
      default: false,
    },
    lineHeight: {
      type: String,
      default: "4rpx",
    },
    scroll: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      current: this.modelValue,
      scrollIntoView: "",
    };
  },
  computed: {
    showLine() {
      return this.lineColor && this.lineColor !== "transparent";
    },
    lineStyle() {
      return {
        backgroundColor: this.lineColor,
        height: this.lineHeight,
      };
    },
  },
  watch: {
    modelValue(val) {
      this.current = val;
      this.scrollIntoView = "v-tab-" + val;
    },
  },
  methods: {
    getTabLabel(tab) {
      if (typeof tab === "string") return tab;
      return tab[this.field] || tab.name || "";
    },
    itemStyle(index) {
      if (this.current !== index) return {};
      return {
        color: this.activeColor,
        fontWeight: this.bold ? "600" : "500",
      };
    },
    onTabClick(index) {
      if (this.current === index) return;
      this.current = index;
      this.scrollIntoView = "v-tab-" + index;
      this.$emit("update:modelValue", index);
      this.$emit("change", index);
    },
  },
};
</script>

<style scoped>
.v-tabs {
  width: 100%;
}

.v-tabs__scroll {
  width: 100%;
  white-space: nowrap;
}

.v-tabs__container {
  display: inline-flex;
  align-items: center;
  position: relative;
  min-width: 100%;
}

.v-tabs__container-item {
  flex-shrink: 0;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #6b766f;
  line-height: 88rpx;
}

.v-tabs__container-item.active {
  font-weight: 600;
}

.v-tabs__container-line {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 60rpx;
  border-radius: 4rpx;
  transition: transform 0.2s ease;
}
</style>
