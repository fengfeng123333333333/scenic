<script>
export default {
  globalData: {
    myData: "",
    tempObj: null,
    labMind: "",
    labKid: "",
    InvoiceUrl: "",
    fromSource: {},
    scenicCategory: "default", // 可存储景区分类，用于主题切换
  },
  data() {
    return {
      themeStyle: {}, // 绑定到根 view 的 CSS 变量对象
    };
  },
  computed: {
    rootStyle() {
      // 从 uni 全局变量读取
      console.log("uni 全局变量读取");
      return uni.$themeVars || "";
    },
  },
  onLaunch: function (option) {
    // 处理第三方跳转参数（原有逻辑）
    if (JSON.stringify(option.referrerInfo) != "{}") {
      this.globalData.labMind = option.referrerInfo.extraData.foo;
      this.globalData.labKid = option.referrerInfo.extraData.labKid;
      this.globalData.payPhone = option.referrerInfo.extraData.phone;
      this.globalData.fromSource = option.referrerInfo.extraData;
    } else {
      this.globalData.labMind = "";
      this.globalData.labKid = "";
      this.globalData.payPhone = "";
    }
    console.log("this.globalData.fromSource:", this.globalData.fromSource);

    // 版本更新管理器（原有逻辑）
    const updateManager = uni.getUpdateManager();
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        uni.showModal({
          content: "新版本已经准备好，是否重启应用？",
          showCancel: false,
          confirmText: "确定",
          success: (res) => {
            if (res.confirm) {
              updateManager.onUpdateReady((res) => {
                updateManager.applyUpdate();
              });
            }
          },
        });
      }
    });
    updateManager.onUpdateFailed((res) => {
      uni.showModal({
        content: "下载失败，请删除当前小程序后重新打开",
        showCancel: false,
        confirmText: "知道了",
      });
    });
  },
  onShow: function (options) {
    // 登录逻辑（原有）
    let openid = uni.getStorageSync("userinfo");
    console.log(openid, "我的idddd");
    if (openid) {
      console.log("进入了登录");
    } else {
      console.log("没进入登录");
      uni.login({
        provider: "weixin",
        success: async (loginRes) => {
          const res1 = await this.$myRequest({
            url: "/api/Applets/AppletsLogin",
            method: "POST",
            data: {
              code: loginRes.code,
            },
          });
          uni.setStorage({
            key: "userinfo",
            data: res1.data.Data,
          });
        },
      });
    }

    // 处理 referrerInfo（原有）
    if (options.referrerInfo) {
      this.loading = false;
      console.log("有餐厨");
      const skipAutoJump = uni.getStorageSync("skipAutoJump");
      if (skipAutoJump == "1") {
        console.log("跳过跳转订单");
        return;
      } else {
        console.log("没有跳过跳转订单", options);
      }
      if (options.referrerInfo.appId) {
        if (options.path == "pages/subPack/payment/payment") {
          uni.reLaunch({
            url: "/pages/order/order",
          });
        } else {
          uni.reLaunch({
            url: "/pages/index/index",
          });
        }
      } else {
        console.log("没有进入跳转1");
      }
    }
  },
  onPageNotFound(res) {
    console.error("页面不存在：", res.path);
    uni.setStorageSync("skipAutoJump", "1");
    uni.reLaunch({
      url: "/pages/index/index",
    });
  },
  onHide: function () {
    console.log("App Hide");
  },
  methods: {
    checkAppId(str, targetAppId) {
      const regex = new RegExp(targetAppId, "i");
      return regex.test(str);
    },
    /**
     * 初始化主题：获取景区分类，应用对应主题
     */
    initTheme() {
      // 方式1：从 globalData 中读取已有分类（可由其他页面设置）
      let category = this.globalData.scenicCategory;
      // 方式2：从本地存储获取（例如登录后接口返回）
      if (!category) {
        category = uni.getStorageSync("scenicCategory") || "default";
      }
      // 方式3：如果有接口获取景区分类，可以在这里调用异步请求
      // 示例：假设你有一个获取景区详情的接口
      // this.fetchScenicInfo().then(scenic => {
      //   const cat = scenic.category || 'default'
      //   this.applyTheme(cat)
      // }).catch(() => { this.applyTheme('default') })
    },
    applyTheme(category) {
      this.globalData.scenicCategory = category || "default";
    },
  },
};
</script>

<style lang="scss">
/* uview-plus 主题与组件样式（uni.scss 已统一注入设计 Token） */
@import "uview-plus/theme.scss";
@import "uview-plus/index.scss";

/* App.vue 仅保留自身所需的全局样式 */
</style>
