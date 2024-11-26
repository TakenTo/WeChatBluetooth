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
  
 formatTime(date,type) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    if(type){
      let y = '0x'+ (year+'').substring(2)
      let temp = `0x68,0x73,0x63,0x6D,0x66,0x22,${y},0x${month},0x${day},0x${hour},0x${minute}`
      console.log('哈哈',temp)
        return temp
    }else{
      return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
    }
  }
  ab2hex(buffer) {
    return Array.prototype.map
      .call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2))
      .join(' ');
  }
  hexDeleteTow(str){
    return str.slice(2)
  }
}
export {
	Base
}