// index.js
const ecUI = require('../../utils/ecUI.js')
const ecBLE = require('../../utils/ecBLE.js')
let ctx

Page({
    data: {
        deviceListData: [],
        deviceListDataShow: [
          {
            manufacturer:'qq',
            name:""
          }
        ],
    },
    onLoad() {
        ctx = this
        setInterval(() => {
            ctx.setData({ deviceListDataShow: ctx.data.deviceListData })
        }, 400)
    },
    onShow() {
      ctx.setData({ deviceListData: [] })
      ctx.setData({ deviceListDataShow: [] })
      setTimeout(() => {
          ctx.openBluetoothAdapter()
      }, 100)
    },
    bindGetUserInfo(event){
      console.log('event',event.detail)
    },
    onPullDownRefresh: function () {
        ctx.setData({ deviceListData: [] })
        ctx.setData({ deviceListDataShow: [] })
        setTimeout(() => {
      console.log('setTimeout哈哈')
            wx.stopPullDownRefresh()
            ctx.openBluetoothAdapter()
        }, 500)
    },
    listViewTap(event) {
        ecUI.showLoading('设备连接中')
        ecBLE.onBLEConnectionStateChange(res => {
            ecUI.hideLoading()
            if (res.ok) {
                ecBLE.stopBluetoothDevicesDiscovery()
                wx.navigateTo({ url: '../excel/excel' })
            } else {
                ecUI.showModal(
                    '提示',
                    '连接失败,errCode=' + res.errCode + ',errMsg=' + res.errMsg
                )  
            }    
        })  
        const device = event.currentTarget.dataset.name
        ecBLE.createBLEConnection(device.id)
    },
    openBluetoothAdapter() {
      console.log('index.js,openBluetoothAdapter')
        ecBLE.onBluetoothAdapterStateChange(res => {
            if (res.ok) {
                console.log('Bluetooth adapter ok')
                ctx.startBluetoothDevicesDiscovery()
            } else {
                ecUI.showModal(
                    '提示',
                    `Bluetooth adapter error | ${res.errCode} | ${res.errMsg}`,
                    () => {
                        if (res.errCode === 30001) {
                            wx.openSystemBluetoothSetting()
                        }
                        if (res.errCode === 30003) {
                            wx.openAppAuthorizeSetting()
                        }
                        if (res.errCode === 30004) {
                            //跳转到小程序设置界面
                            wx.openSetting()
                        }
                    }
                )
            }
        })
        ecBLE.openBluetoothAdapter()
    },
    startBluetoothDevicesDiscovery() {
        console.log('start search')
        ecBLE.onBluetoothDeviceFound(res => {
            // console.log(`id:${res.id},name:${res.name},rssi:${res.rssi}`)
            for (const item of ctx.data.deviceListData) {
                if (item.id === res.id) {
                    item.name = res.name
                    item.rssi = res.rssi
                    return
                }
            }
            let manufacturer = ''
            if (res.name.length === 11 && res.name.startsWith('@')) {
                manufacturer = 'eciot'
            }
            if (res.name.length === 15 && res.name.startsWith('BT_')) {
                manufacturer = 'eciot'
            }
            ctx.data.deviceListData.push({
                id: res.id,
                name: res.name,
                rssi: res.rssi,
                manufacturer,
            })
        })
        ecBLE.startBluetoothDevicesDiscovery()
    },
})
