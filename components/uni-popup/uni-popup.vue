<template>
  <view v-if="visible" class="uni-popup" @touchmove.stop.prevent>
    <view
      class="uni-popup__mask"
      :class="{ 'uni-popup__mask--show': visible }"
      @click="onMaskClick"
    ></view>
    <view class="uni-popup__wrapper uni-popup__wrapper-center">
      <slot></slot>
    </view>
  </view>
</template>

<script>
export default {
  name: "UniPopup",
  props: {
    maskClick: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    open(type) {
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    onMaskClick() {
      if (this.maskClick) {
        this.close();
      }
    },
  },
};
</script>

<style scoped>
.uni-popup {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
}

.uni-popup__mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.45);
}

.uni-popup__wrapper {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.uni-popup__wrapper-center {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
