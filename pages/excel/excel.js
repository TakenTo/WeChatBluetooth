// pages/excel/excel.js
// 引入依赖库
// 引入依赖库
const XLSX = require("../../utils/xlsx.mini.min.js");
import { Base } from '../../utils/base.js';
import * as echarts from '../../ec-canvas/echarts';
const base = new Base();
// 35 - 45   
let chartLine;
function getOption(xData, data_cur, data_his) {
  var option = {
    grid: {
      top: '20rpx',
      left: '2%',
      right: '5%',
      bottom: '0',
      containLabel: true
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData,
      axisLine: {
        lineStyle: {
          color: '#999',
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#999',
          opacity: 0
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dotted',
          color: '#D7D7D7'
        }
      }
    },
    series: [{
      data: data_cur || [],
      type: 'line',
      showSymbol: true,
      symbol: 'circle',
      symbolSize: 7,
      itemStyle: {
        color: '#65E893', //折点颜色
        // normal: {
        //   lineStyle: {
        //     color: '#dcdfe6' //折线颜色
        //   }
        // }
      },
      lineStyle:{
        color: '#dcdfe6' //折线颜色
      }
    }]
  };
  return option;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mainColor:'#65E893',
    zIndex:99999,
    setVisible:false,//设置弹窗visible
    name:'',
    setObj:{
      wenValue:'',
      unit:'',
      isWarn:false,
    },
    nameVisible:false,//设备名称-visible
    xlsxpath:'', // 导出地址
    ecLine: {}, 
    WenInfo:{
      name:'温度设备名',
      temperature:'36.5',
      unit:'℃',
      time:'2024-11-20 12:15',
      dianliang:'20%',
    }
  },
  /**
   * 下载exportExcel
   */
exportExcel(){
   let that = this
    //表内容
    let xlsxdata=[
      {
        rgtime:"2024-09-01 19:35:53",
        value:36.8
      },{
        rgtime:"2024-09-02 19:35:53",
        value:36.9
      },{
        rgtime:"2024-09-03 19:35:53",
        value:40
      }]
 
    // 表头
    let title = ['时间','温度值'];
    let sheet = [title]
    // 数据整理
    xlsxdata.forEach(item => {
      sheet.push([item.value,item.rgtime])
    });
    console.log('啥？',sheet)
    // return
  // XLSX插件使用
  var ws = XLSX.utils.aoa_to_sheet(sheet);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "excal2024");
  const fileData = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' }); 
  //保存的本地地址
  const filePath = `${wx.env.USER_DATA_PATH}/excal2024.xlsx`; 
  // 写文件
  const fs = wx.getFileSystemManager()
    fs.writeFile({
    filePath: filePath,
    data: fileData,
    encoding: 'base64',
    success(res) {
      that.setData({xlsxpath:filePath});
      const sysInfo = wx.getDeviceInfo()
      // 导出
      if (sysInfo.platform.toLowerCase().indexOf('windows') >= 0) {
        // 电脑PC端导出
        wx.saveFileToDisk({
          filePath: filePath,
          success(res) {
            console.log(res)
          },
          fail(res) {
            console.error(res)
            util.tips("导出失败")
          }
        })
      } else{
        // 打开文档,filePath 是写入资源的临时保存路径
        wx.openDocument({
          filePath: filePath,
          showMenu:true,
          success: function (res) {
              console.log('打开文档成功')
          },
          fail: console.error
        })
      }
    },
    fail(res) { 
      console.error('失败',res)
    }
  });
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    this.setData({
      ecLine:{onInit: function (canvas, width, height, dpr) {
        //初始化echarts元素，绑定到全局变量，方便更改数据
        chartLine = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        });
        console.log('什么',chartLine)
        canvas.setChart(chartLine);
        that.getStudentDes()
      }
    }})
  },
  getStudentDes: function () {
    let data = {
      grades:{
        exam_time:['05:10','06:10','07:10','08:10','09:10','10:10','11:10'],
        percentage:[36, 38, 35, 34, 40, 38, 36],
      }
    }
    // 成绩走势
    console.log('第三方',chartLine)
    var xData = data.grades.exam_time;
    var data_cur = data.grades.percentage;
    var option = getOption(xData, data_cur);
    chartLine.setOption(option);
  },
  /**
   * 打开‘设备名称’弹窗
   */
  openNameDialog(){
    this.setData({
      nameVisible:true
    })
  },
  /**
   * ’设置‘弹窗’
   */
  openSetDialog(){
    this.setData({
      setVisible:true
    })
  },
  // 设备名称修改
  nameInput(e) {
    this.setData({
        name: e.detail.value
    })
},
nameClose(){
  this.setData({
    name: '',
    nameVisible:false
  })
},
setInfoClose(){
  this.setData({
    setObj:{
      wenValue:'',
      unit:'',
      isWarn:false,
    } ,
    setVisible:false

  })
},
// 温度值
WenValueInput(e) {
  this.setData({
    ['setObj.wenValue']: e.detail.value,
  })
},
// 温度单位
unitChange(e){
  this.setData({
    ['setObj.unit']: e.detail,
  })
},
// 报警开关
offOnChange(e){
  this.setData({
    ['setObj.isWarn']: e.detail.value,
  })
},
// 设置-弹窗确定
setInfoConfirm(){
  let { isWarn,unit,wenValue} = this.data.setObj
  console.log('执行了么',this.data.setObj)
  if(!isWarn || !unit || !wenValue){
    base.toast('请输入完整')
    return
  }
  this.setData({setVisible:false})
  // 要请求硬件之后再改页面上的值吧？
  wx.showToast({
    title: '成功',
    icon: 'success',
    duration: 2000
  })  
},
// 设备名称-确定
nameConfirm(){
  let { name} = this.data
  if(!name){
    base.toast('请输入完整')
    return
  }
  this.setData({nameVisible:false})
  // 要请求硬件之后再改页面上的值吧？
  wx.showToast({
    title: '成功',
    icon: 'success',
    duration: 2000
  })  
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})