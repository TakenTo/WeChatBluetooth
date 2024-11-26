// pages/excel/excel.js
// 引入依赖库
// 引入依赖库
const XLSX = require("../../utils/xlsx.mini.min.js");
import { Base } from '../../utils/base.js';
import * as echarts from '../../ec-canvas/echarts';
const ecBLE = require('../../utils/ecBLE.js')
const base = new Base();
const getHead =  '0x68,0x73,0x63,0x6D,0x64,0x20'; // 设备给手机发-包头
const giveHead = '0x68,0x73,0x63,0x6D,0x66,0x22'; // 手机给设备发-包头
const tail='0x0d,0x0A';// 包尾
const wenDuFaValue = '0x70' // 温度阈值
const danWei = '0x71' // 单位
const mingCheng = '0x72'//设备名称
const baoJingOff='0x73' // 是否开启报警开关
const deleteData='0x75' // 删除历史数据
const getData='0x76'//查询历史数据
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
      trigger: 'axis',
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
      min: 'dataMin', // 最小值取数据中的最小值
      max: 'dataMax',  // 最大值取数据中的最大值
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
        normal: {
          label : {show: true},
          // color: '#65E893', //折点颜色
          color: (params) => {
            // 根据值动态设置颜色
            if (params.value > 38) {
                return '#f56c6c'; // 超过 38 显示红色
            } else {
                return '#65E893'; // 其他显示绿色
            }
          },
        }
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
    historyShow:false,// 历史记录弹窗
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
      name:'设备名',
      temperature:'温度',
      unit:',单位',
      warnValue:'报警值',
      dianliang:'20%',
      warnStatus:'报警开关', // 报警开关
    },
    xlsxdata:[
      {
        rgtime:"05:15",
        value:36.8
      },
      {
        rgtime:"06:15",
        value:36.7
      },
      {
        rgtime:"07:15",
        value:36.8
      },
      {
        rgtime:"08:15",
        value:36.4
      },
      {
        rgtime:"09:15",
        value:35.8
      },
      {
        rgtime:"10:15",
        value:36.1
      },
      {
        rgtime:"11:15",
        value:36.2
      },
      {
        rgtime:"13:15",
        value:36.3
      },
      {
        rgtime:"14:15",
        value:36.4
      },
      {
        rgtime:"15:15",
        value:36.8
      },
      {
        rgtime:"16:25",
        value:36.9
      },{
        rgtime:"17:35",
        value:37.1
      }]
  },
  /**
   * 下载exportExcel
   */
exportExcel(){
   let that = this
    //表内容
    let xlsxdata=this.data.xlsxdata
 
    // 表头
    let title = ['时间','温度值'];
    let sheet = [title]
    // 数据整理
    xlsxdata.forEach(item => {
      sheet.push([item.rgtime,item.value])
    });
    console.log('啥？',sheet)
    // return
  // XLSX插件使用
  var ws = XLSX.utils.aoa_to_sheet(sheet);
  var wb = XLSX.utils.book_new();
  let time =  base.formatTime(new Date())
  // console.log('多少',time)
  XLSX.utils.book_append_sheet(wb, ws, time);
  const fileData = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' }); 
  //保存的本地地址
  const filePath = `${wx.env.USER_DATA_PATH}/${time}.xlsx`; 
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
        canvas.setChart(chartLine);
        that.getStudentDes()
      }
    }})
    // 监听蓝牙变化
    ecBLE.onBLECharacteristicValueChange((str, strHex) => {
      // 去除前两位
     let arr = strHex.split(',')
     //['0x17', '0x23', '0x03', '0x75']
     let bbb = arr.slice(6,arr.length-2) 
      if(bbb[0]==wenDuFaValue){ //温度阈值
       let temp =  base.hexDeleteTow(bbb[1]) + '.' + base.hexDeleteTow(bbb[2])
       that.setData({
        ['WenInfo.warnValue']: temp,
       })
      }else if(bbb[0]==danWei){ // 单位
        let r = ''
        if(bbb[1] =='0x01'){
          r = '℃'
        }else if(bbb[1] =='0x02'){
          r = '℉'
        }
        that.setData({
          ['WenInfo.unit']: r,
         })
      }else if(bbb[0]==mingCheng){ // 名称

      }else if(bbb[0]==baoJingOff){ // 报警开关
        let r = ''
        if(bbb[1] =='0x01'){
          r = '开'
        }else if(bbb[1] =='0x02'){
          r = '关'
        }
        that.setData({
          ['WenInfo.unit']: r,
         })
      }else if(bbb[0]==deleteData){
        // 删除历史数据，啥也不干
      }
      else if(bbb[0]==getData){ // 查看历史数据

      }else{ // 温度-时间（年-月-日-时-分）
        // 0x24,0x11,0x24,0x15 ,0x23 后两位是温度
        let temp =  base.hexDeleteTow(bbb[bbb.length-2]) + '.' + base.hexDeleteTow(bbb[length-1])
       that.setData({
        ['WenInfo.temperature']: temp,
       })
      }
    })
  },
  getStudentDes: function () {
    let data = {
      grades:{
        exam_time:['05:10','06:10','07:10','08:10','09:10','10:10','11:10'],
        percentage:[36.5, 37.3, 36, 35.8, 38.3,37.8, 38],
      }
    }
    // 成绩走势
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
  if( !unit || !wenValue){
    base.toast('请输入完整')
    return
  }
  this.setInfoClose()
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
  let reg = /^[a-zA-Z0-9]{1,10}$/
  if(!reg.test(name)){
    base.toast('只能输入数字和字母')
    return
  }
  this.nameClose()
  // 要请求硬件之后再改页面上的值吧？
  wx.showToast({
    title: '成功',
    icon: 'success',
    duration: 2000
  })  
},
// 历史记录弹窗
openHistory(e){
  const param = e.currentTarget.dataset.param; // 获取动态数据
  this.setData({
    historyShow:param
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