// components/lineChart/lineChart.js
import * as echarts from '../../ec-canvas/echarts';

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
        normal: {
          color: '#3E63F8', //折点颜色
          lineStyle: {
            color: '#3E63F8' //折线颜色
          }
        }
      }
    }]
  };
  return option;
}
Component({

    /**
     * 组件的属性列表
     */
    properties: {
      locked: false,
      ecLine: {
        onInit: function (canvas, width, height, dpr) {
          console.log('中偶联剂')
          //初始化echarts元素，绑定到全局变量，方便更改数据
          chartLine = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr
          });
          canvas.setChart(chartLine);
        }
      },
      tabIndex: 0,
      subject: ''
    },

    /**
     * 组件的初始数据
     */
    data: {
      
    },
    lifetimes: {
      ready: function() {
        this.getStudentDes()
      },
      // detached: function() {
      //   initialTasks.flag = 'finished'
      //   initialTasks.tasks.length = 0
      // }
    },
    /**
     * 组件的方法列表
     */
    methods: {
      getStudentDes: function () {
        let data = {
          grades:{
            exam_time:['周一','周二','周三','周四','周五','周六','周日'],
            percentage:[11, 11, 15, 13, 12, 13, 10],
          }
        }
        // this.setData({
        //   // gradesDesc: data,
        //   scoreList: data.grades.list,
        //   locked: false
        // })
        // 成绩走势
        console.log('第三方',chartLine)
        // var xData = data.grades.exam_time;
        // var data_cur = data.grades.percentage;
        // var option = getOption(xData, data_cur);
        // chartLine.setOption(option);
      }
    }
})