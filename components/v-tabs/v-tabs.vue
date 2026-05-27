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
  height: 96rpx;
}

.v-tabs__scroll {
  width: 100%;
  height: 100%;
  white-space: nowrap;
}

.v-tabs__container {
  display: inline-flex;
  align-items: center;
  position: relative;
  min-width: 100%;
  height: 100%;
}

.v-tabs__container-item {
  flex-shrink: 0;
  padding: 0 24rpx;
  margin: 0 8rpx;
  font-size: 28rpx;
  color: var(--color-text-secondary);
  font-weight: 500;
  line-height: 60rpx;
  border-radius: 9999rpx;
  transition: all 200ms ease-in-out;
}

.v-tabs__container-item.active {
  font-weight: 600;
  color: var(--color-bg-card);
  background-color: var(--color-primary);
  box-shadow: var(--shadow-soft);
}

.v-tabs__container-line {
  /* line style is applied via :style binding */
}
</style>
