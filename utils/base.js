// 公共函数库
const app = getApp()
class Base {
	constructor() {
		this.baseUrl = app.globalData.globalUrl;
  }

	/**
	 * 提示框
	 * icon [success,loading,none]
	 */
	toast(
		title,
		duration = 2000,
		icon = 'none',
		image = '',
		mask = true,
		callback
	) {
		wx.showToast({
			title: title,
			icon: icon,
			image: image,
			duration: duration,
			mask: mask,
			success: function () {
				callback && callback()
			}
		})
	}

	modal(
		content = '',
		callback,
		errorback
	) {
		wx.showModal({
			title: "提示",
			content: content,
			success: function (res) {
				if (res.confirm) {
					callback && callback()
					console.log('用户点击确定')
				} else if (res.cancel) {
					errorback && errorback()
					console.log('用户点击取消')
				}
			}
		})
	}
}
export {
	Base
}