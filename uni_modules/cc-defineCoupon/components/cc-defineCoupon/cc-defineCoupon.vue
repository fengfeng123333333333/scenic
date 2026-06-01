<template>
  <view>
    <view
      v-for="(item, index) in couponList"
      :key="index"
      @click="linClick(item, index)"
      class="coupon_box"
    >
      <view class="left">
        <view class="left_top">
          <text class="hui">券</text>
          <text class="hui_name">{{ item.CouponName }}</text>
        </view>
        <view class="left_bottom">
          <text>有效日期：{{ item.EndTime }}</text>
        </view>
        <image src="./ylq.png" v-if="item.status == 1" class="ylq"></image>
      </view>
      <view class="right">
        <view class="money" v-if="item.CouponType == 0"
          >￥{{ item.AmountDesc }}</view
        >
        <view class="money" v-if="item.CouponType == 1">{{
          item.AmountDesc
        }}</view>
        <text>{{ item.IsThresholdDesc }}</text>
      </view>

      <view class="bottom">
        <view v-for="(row, indexs) in item.condition" :key="indexs">
          {{ indexs + 1 }}.{{ row }}
        </view>
        <view
          v-if="vdcm == 3"
          style="display: flex; position: absolute; right: 0"
        >
          <view class="activ" :class="{ active: isValueExists(item.ID) }">
            <u-icon
              name="checkbox-mark"
              v-if="isValueExists(item.ID)"
              color="#ffffff"
              size="23"
            ></u-icon>
            <u-icon name="checkbox-mark" v-else color="#999" size="23"></u-icon>
          </view>
          <text :class="{ coactive: isValueExists(item.ID) }">请选择使用</text>
        </view>
        <view
          class="receiveBtn"
          v-if="vdcm != 3"
          style="background-color: var(--color-primary)"
          @tap="onreceive(item, index)"
        >
          立即使用</view
        >
      </view>
    </view>
    <view class="liji" @click="onrece" v-if="vdcm == 3"> 立即使用 </view>
    <view style="height: 100rpx"> </view>
    <u-toast ref="uToast"></u-toast>
  </view>
</template>

<script>
// {{item.status!=1 ? '领取':''}}
export default {
  data() {
    return {
      checkboxValue1: "",
      drNumber: "",
      drinLis: [],
    };
  },

  components: {},

  props: {
    vdcm: {
      type: Number,
      default: 0,
    },
    colors: {
      type: String,
    },
    couponList: {
      type: Array,
    },
  },

  methods: {
    isValueExists(value) {
      return this.drinLis.some((item) => item.ID === value);
    },
    linClick(item, index) {
      console.log(this.vdcm);
      if (this.vdcm != 3) {
        return;
      }
      const idquit = this.drinLis.some((item1) => item1.CouponType == 1);
      const idd = this.drinLis.some((item1) => item1.ID == item.ID);
      if (idquit && idd == false) {
        this.$refs.uToast.show({
          type: "error",
          icon: false,
          title: "失败主题",
          message: "只能选一张折扣券",
        });
        return;
      }
      const idtyp = this.drinLis.some(
        (item1) => item1.CouponType == item.CouponType,
      );
      if (idtyp == false && this.drinLis.length > 0) {
        this.$refs.uToast.show({
          type: "error",
          icon: false,
          title: "失败主题",
          message: "折扣券与抵扣券不能同时使用",
        });
        return;
      }
      this.drNumber = 1;
      if (this.drinLis.length > 0) {
        const con = this.drinLis.findIndex((obj) => obj.ID == item.ID);
        if (con == -1) {
          this.drinLis.push(item);
        } else {
          const inde = this.drinLis.findIndex((obj) => obj.ID == item.ID);
          if (inde != -1) {
            this.drinLis.splice(inde, 1);
          } else {
            this.drinLis.splice(con, 1, item);
          }
        }
      } else {
        this.drinLis.push(item);
      }
      // this.subDrk.goodsAttributeList = [];
      // let driName = '';
      // this.drinLis.map((obj, index) => {
      // 	this.subDrk.goodsAttributeList.push({
      // 		goodsAttributeID: obj.GoodsAttributeID,
      // 		attributeName: obj.AttributeName,
      // 	});
      // 	driName += `#${obj.AttributeName}`;
      // });
      // this.subDrk.driName = driName;
      console.log(this.drinLis);
    },
    onreceive(item, index) {
      //领取优惠券
      let that = this;

      this.$emit("onReceive", item, item.CouponBindMemberID);
    },
    onrece(item, index) {
      if (this.drinLis.length > 0) {
        this.$emit("onRece", this.drinLis);
      } else {
        this.$emit("onRece", 0);
      }
    },
    checkboxChange(n) {
      console.log("change", n);
    },
  },
};
</script>
<style lang="scss" scoped>
.liji {
  width: 120rpx;
  margin-bottom: 150rpx;
  padding: 15rpx 50rpx;
  background-color: #47c29b;
  color: #ffffff;
  border-radius: 10rpx;
  font-size: 30rpx;
  margin-left: 270rpx;
}

.activ {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  text-align: center;
  border: 1rpx solid #999;
  padding: 5rpx;
}
.coactive {
  color: #47c29b !important ;
}
.active {
  background-color: #47c29b;
  border: 1rpx solid #47c29b !important;
}

.coupon_box {
  margin: 20upx;
  padding: 20upx;
  box-shadow: 0upx 0upx 10upx #ddd;
  position: relative;
  border-radius: 10upx;
  padding-bottom: 10upx;
  overflow: hidden;
}

.coupon_box .left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  border-bottom: 1upx solid #eee;
  padding-bottom: 20upx;
  position: relative;
}

.coupon_box .left .ylq {
  width: 60upx;
  height: 45upx;
  position: absolute;
  top: 0;
  right: 140upx;
}

.coupon_box .left .hui {
  width: 40upx;
  height: 40upx;
  font-size: 22upx;
  color: #fff;
  background-color: rgba(255, 84, 110, 0.8);
  border-radius: 8upx;
  line-height: 40upx;
  text-align: center;
  display: inline-block;
  transform: translateY(-5upx);
}

.coupon_box .left .left_top {
  width: 80vw;
  display: block;
  font-size: 26upx;
  font-weight: bold;
}

.left_top .hui_name {
  line-height: 60upx;
  height: 60upx;
  margin-left: 20upx;
  display: inline-block;
  font-size: 28upx;
}

.left_bottom {
  font-size: 24upx;
  font-weight: 500;
  color: #333;
  height: 60upx;
  line-height: 60upx;
}

.coupon_box .right {
  position: absolute;
  right: 20upx;
  top: 25upx;
  text-align: center;
}

.coupon_box .right .money {
  font-size: 45upx;
  margin-bottom: 10upx;
}

.coupon_box .right text {
  font-size: 24upx;
  color: #999;
}

.coupon_box .bottom {
  height: 60upx;
  line-height: 60upx;
  display: flex;
  align-content: flex-start;
  font-size: 24upx;
  margin-top: 10upx;
}

.coupon_box .bottom view {
  margin-right: 20upx;
  color: #888;
}

.receiveBtn {
  position: absolute;
  left: calc(100vw - 86px);

  width: 58px;
  height: 24px;
  line-height: 24px;

  border-radius: 4px;
  background-color: #fa436a;
  color: white !important;

  font-size: 12px;
  text-align: center;
  margin-top: 2px;
}
</style>
