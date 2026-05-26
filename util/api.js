// const BASE_URL = 'https://saasapptest.huibaitech.com'
const BASE_URL = 'https://saasappreport.huibaitech.com'
// const BASE_URL = 'http://8.129.62.243:5566'
// 以后不用了 const BASE_URL = 'https://saasapp.huibaitech.com'
// 通过export向外暴露一个方法，方法名叫myRequest,调用myRequest方法时会向方法中传递一个对象options
export const myRequest = (options) => {
	return new Promise((resolve, reject) => { // 异步处理的封装通过promise比较好，并且要return出去，
		uni.request({ // 在回调函数中处理异步请求
			url: BASE_URL + options.url, // 将接口地址分为两部分，这样如果域名改变了好维护，接口地址从options中获取
			method: options.method || 'GET', // 方法从options中获取，如果没有传入method，则默认为GET，
			data: options.data || {}, // data从options中获取，如果没有传入data， 则默认一个空对象
			header: {
				'AppID': uni.getAccountInfoSync().miniProgram.appId,
			},
			success: (res) => {
				// 用箭头函数，res是返回来的数据
				if (res.data.Code !== 200 && res.data.Code != 301 && res.data.Code !=
					600) { // 如果请求失败，则给一个提示
					uni.showToast({
						title: res.data.Message,
						icon: 'none',
						duration: 2000
					});
					resolve(res)
				}
				resolve(res) //如果请求成功，调用resolve返回数据
			},
			fail: (err) => { // err 是返回来的错误信息
				uni.showToast({ // 给一个消息提示
					title: '请求接口失败'
				})
				reject(err) // 调用reject方法把错误消息返回出去
			}

		})
	})
}