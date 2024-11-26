// pages/device.js
const ecUI = require('../../utils/ecUI.js')
const ecBLE = require('../../utils/ecBLE.js')


let ctx
let isCheckScroll = true
let isCheckRevHex = false
let isCheckSendHex = false
let sendData = ''

Page({
    /**
     * 页面的初始数据
     */
    data: {
        textRevData: '',
        scrollIntoView: 'scroll-view-bottom',
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        ctx = this
        isCheckScroll = true
        isCheckRevHex = false
        isCheckSendHex = false
        sendData = ''
        ecBLE.setChineseType(ecBLE.ECBLEChineseTypeGBK)

        //on disconnect
        ecBLE.onBLEConnectionStateChange(() => {
            ecUI.showModal('提示', '设备断开连接')
        })
        //receive data
        ecBLE.onBLECharacteristicValueChange((str, strHex) => {
            let data =
                ctx.data.textRevData +
                ctx.dateFormat('[hh:mm:ss,S]:', new Date()) +
                (isCheckRevHex ? strHex.replace(/[0-9a-fA-F]{2}/g, ' $&') : str) +
                '\r\n'
            // console.log(data)
            ctx.setData({ textRevData: data })
            if (isCheckScroll) {
                if (ctx.data.scrollIntoView === "scroll-view-bottom") {
                    ctx.setData({ scrollIntoView: "scroll-view-bottom2" })
                } else {
                    ctx.setData({ scrollIntoView: "scroll-view-bottom" })
                }
            }
        })
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        ecBLE.onBLEConnectionStateChange(() => { })
        ecBLE.onBLECharacteristicValueChange(() => { })
        ecBLE.closeBLEConnection()
    },
    checkScroll(e) {
        if (e.detail.value.length) isCheckScroll = true
        else isCheckScroll = false
    },
    checkRevHex(e) {
        if (e.detail.value.length) isCheckRevHex = true
        else isCheckRevHex = false
    },
    checkSendHex(e) {
        if (e.detail.value.length) isCheckSendHex = true
        else isCheckSendHex = false
    },
    inputSendData(e) {
        sendData = e.detail.value
    },
    btClearTap() {
        this.setData({ textRevData: '' })
    },
    btSendTap() {
        if (isCheckSendHex) {
            let data = sendData
                .replace(/\s*/g, '')
                .replace(/\n/g, '')
                .replace(/\r/g, '')
            if (data.length === 0) {
                ecUI.showModal('提示', '请输入要发送的数据')
                return
            }
            if (data.length % 2 != 0) {
                ecUI.showModal('提示', '数据长度只能是双数')
                return
            }
            if (data.length > 488) {
                ecUI.showModal('提示', '最多只能发送244字节')
                return
            }
            if (!new RegExp('^[0-9a-fA-F]*$').test(data)) {
                ecUI.showModal('提示', '数据格式错误，只能是0-9,a-f,A-F')
                return
            }
            ecBLE.writeBLECharacteristicValue(data, true)
        } else {
            if (sendData.length === 0) {
                ecUI.showModal('提示', '请输入要发送的数据')
                return
            }
            let tempSendData = sendData.replace(/\n/g, '\r\n')
            if (tempSendData.length > 244) {
                ecUI.showModal('提示', '最多只能发送244字节')
                return
            }
            ecBLE.writeBLECharacteristicValue(tempSendData, false)
        }
    },
    dateFormat(fmt, date) {
        let o = {
            'M+': date.getMonth() + 1, //月份
            'd+': date.getDate(), //日
            'h+': date.getHours(), //小时
            'm+': date.getMinutes(), //分
            's+': date.getSeconds(), //秒
            'q+': Math.floor((date.getMonth() + 3) / 3), //季度
            S: date.getMilliseconds(), //毫秒
        }
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(
                RegExp.$1,
                (date.getFullYear() + '').substr(4 - RegExp.$1.length)
            )
        for (var k in o)
            if (new RegExp('(' + k + ')').test(fmt)) {
                // console.log(RegExp.$1.length)
                // console.log(o[k])
                fmt = fmt.replace(
                    RegExp.$1,
                    RegExp.$1.length == 1
                        ? (o[k] + '').padStart(3, '0')
                        : ('00' + o[k]).substr(('' + o[k]).length)
                )
            }
        return fmt
    },
    checkChinese(e){
        if(e.detail.value==='gbk'){
            ecBLE.setChineseType(ecBLE.ECBLEChineseTypeGBK)
        }else{
            ecBLE.setChineseType(ecBLE.ECBLEChineseTypeUTF8)
        }
    }
})
