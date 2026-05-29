<template>
  <u-toast :ref="registerToastRef" />
</template>

<script>
import { initTheme } from "@/styles/themes.js";
import { registerToastRef } from "@/util/toast.js";

export default {
  globalData: {
    myData: "",
    tempObj: null,
    labMind: "",
    labKid: "",
    InvoiceUrl: "",
    fromSource: {},
    payPhone: "",
    scenicCategory: "",
  },
  onLaunch: function (option) {
    initTheme();

    if (option?.referrerInfo && JSON.stringify(option.referrerInfo) !== "{}") {
      const extra = option.referrerInfo.extraData || {};
      this.globalData.labMind = extra.foo || "";
      this.globalData.labKid = extra.labKid || "";
      this.globalData.payPhone = extra.phone || "";
      this.globalData.fromSource = extra;
    } else {
      this.globalData.labMind = "";
      this.globalData.labKid = "";
      this.globalData.payPhone = "";
    }
    console.log("globalData.fromSource:", this.globalData.fromSource);

    const updateManager = uni.getUpdateManager();
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        uni.showModal({
          content: "新版本已经准备好，是否重启应用？",
          showCancel: false,
          confirmText: "确定",
          success: (res) => {
            if (res.confirm) {
              updateManager.onUpdateReady(() => updateManager.applyUpdate());
            }
          },
        });
      }
    });
    updateManager.onUpdateFailed(() => {
      uni.showModal({
        content: "下载失败，请删除当前小程序后重新打开",
        showCancel: false,
        confirmText: "知道了",
      });
    });
  },
  onShow: function (options) {
    const openid = uni.getStorageSync("userinfo");
    if (!openid) {
      console.log("未登录，发起登录");
      uni.login({
        provider: "weixin",
        success: async (loginRes) => {
          const res1 = await uni.$myRequest({
            url: "/api/Applets/AppletsLogin",
            method: "POST",
            data: { code: loginRes.code },
          });
          uni.setStorage({ key: "userinfo", data: res1.data.Data });
        },
      });
    }

    if (options?.referrerInfo) {
      console.log("referrerInfo:", options.referrerInfo);
      const skipAutoJump = uni.getStorageSync("skipAutoJump");
      if (skipAutoJump == "1") {
        console.log("跳过跳转订单");
        return;
      }
      if (options.referrerInfo.appId) {
        if (options.path == "pages/subPack/payment/payment") {
          uni.reLaunch({ url: "/pages/order/order" });
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      }
    }
  },
  onPageNotFound(res) {
    console.error("页面不存在：", res.path);
    uni.setStorageSync("skipAutoJump", "1");
    uni.reLaunch({ url: "/pages/index/index" });
  },
  onHide: function () {
    console.log("App Hide");
  },
};
</script>
