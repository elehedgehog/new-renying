import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './Grapes3km.html?style=./Grapes3km.scss'
import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'
import { getVelLevel } from '../../../util/windHelper'

import WindRadarDrawer from '../../../util/windRadarUtil'
import SelectToggle from '../../commons/select-toggle/SelectToggle'



let markerCollection = [],
  L = window['L']

@WithRender
@Component({
  components: {
    SelectToggle
  }
})
export default class Grapes3km extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  latestHourUrl = 'http://10.148.16.217:11160/renyin5/satelite/grapes1km/latest'
  latestHour = ''
  date: any = Date.now()
  productId = CONFIG.grapes3km
  regionData = [
    { value: 'guangdong', name: '广东' },
    { value: 'southchina', name: '华南' }
  ]
  regionSelected: String = 'guangdong'
  productData = productData
  optionData = productData.guangdong
  elementSelected = 'mslp'
  hourData: string[] = []
  minuteData: string[] = []
  hourSelected: string = ''
  minuteSelected: string = ''
  imgUrl = ''
  reqUrl = 'http://10.148.16.217:11160/renyin5/satelite/img/grapes3km'
  forecastHour = '000'
  forecastHourData = []
  loading = false

  async created() {
    this.forecastHour
    this.computeHouAndMinute()
    this.forecastHourData = this.optionData[0].sub[0].times
    this.forecastHour = this.forecastHourData[0]
    this.optionData[0].isSelected = true
    this.optionData[0].sub[0].isSelected = true
    await this.getLatestHour()
    this.draw()
  }


  async getLatestHour() {
    let res = await axios({
      adapter: jsonp,
      url: this.latestHourUrl,
      params: {
        product: this.elementSelected
      }
    })
    if (res.data.stateCode === 0) {
      this.latestHour = res.data.data.datetime
    }
    let mtHolder = moment(this.latestHour).add(8, 'hours')
    this.minuteSelected = mtHolder.format('mm')
    this.hourSelected = mtHolder.format('HH')
  }

  async draw() {
    let params = {
      product: this.elementSelected,
      time: moment(`${moment(this.date).format('YYYY-MM-DD')} ${this.hourSelected}:${this.minuteSelected}:00`)
        .subtract(8, 'hours').format('YYYY-MM-DD HH:mm:00'),
      forecast: Number(this.forecastHour),
      area: this.regionSelected
    }
    this.imgUrl = this.reqUrl + '?'
    for (let key in params) {
      this.imgUrl += '&' + key + '=' + params[key]
    }
    this.loading = true
    let img = new Image()
    img.src = this.imgUrl
    img.onload = () => this.loading = false
    img = null
  }

  @Watch('date')
  dateChanged(val: any, oldVal: any): void {
    this.computeHouAndMinute()
    this.draw()
  }
  @Watch('hourSelected')
  hourSelectedChanged(val: any, oldVal: any): void {
    this.computeHouAndMinute()
    this.draw()
  }
  hourSelectedChange(val){
    this.hourSelected = val
  }
  @Watch('regionSelected')
  regionSelectedChange(val) {
    for (let i in productData) {
      for (let el of productData[i]) {
        for (let opt of el.sub) {
          opt.isSelected = false
        }
      }
    }
    this.optionData = this.productData[val]
    let ele = Object.keys(this.productData[val])[0]
    this.elementSelected = this.productData[val][ele].sub[0].value
    this.draw()
    this.optionData[0]["isSelected"] = true
    this.optionData[0].sub[0].isSelected = true
  }
  @Watch('forecastHour')
  forecastHourChanged(val: any, oldVal: any): void {
    this.draw()
  }
  forecastHourChange(val){
    this.forecastHour = val
  }
  @Watch('elementSelected')
  elementSelectedChanged(val: any, oldVal: any): void {
    this.draw()
  }

  toggleOpt(value, key) {
    for (let item of this.optionData) {
      for (let subItem of item.sub) {
        if (subItem.value === value) {
          subItem.isSelected = true
          this.forecastHourData = subItem.times
          if (subItem.times.indexOf(this.forecastHour) === -1) {
            this.forecastHour = this.forecastHourData[0]
          }
        }
        else
          subItem.isSelected = false
      }
    }
    this.elementSelected = value
  }

  computeHouAndMinute() {
    this.minuteData = []
    this.hourData = []
    for (let i = 0; i < 60; i += 12) {
      if (i === 0) {
        this.minuteData.push('00')
      } else if (i < 10) {
        this.minuteData.push('0' + i)
      } else {
        this.minuteData.push(String(i))
      }
    }

    let maxHour = 0,
      selectedDate = new Date(this.date).getDate(),
      nowDate = new Date().getDate()
    if (selectedDate < nowDate)
      maxHour = 24
    else if (selectedDate === nowDate)
      maxHour = new Date().getHours()
    else
      maxHour = 0
    for (let i = 0; i < maxHour; i++) {
      if (i === 0) {
        this.hourData.push('00')
      } else if (i < 10) {
        this.hourData.push('0' + i)
      } else {
        this.hourData.push(String(i))
      }
    }
    if (this.hourSelected.length === 0)
      this.hourSelected = this.hourData[this.hourData.length - 1]

    this.minuteSelected = this.minuteData[this.minuteData.length - 1]
  }
}

const forseeTimeData = {
  '0-24': (() => {
    let arr = []
    for (let i = 0; i <= 24; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '1-24': (() => {
    let arr = []
    for (let i = 1; i <= 24; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '3-24': (() => {
    let arr = []
    for (let i = 3; i <= 24; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
  '6-24': (() => {
    let arr = []
    for (let i = 6; i <= 24; i++) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    return arr
  })(),
}
const productData = {
  'southchina': [
    {
      name: '地面要素',
      isSelected: false,
      sub: [
        { isSelected: false, value: 'mslp', name: '海平面气压', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'temp2m', name: '2米温度', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'wind10m', name: '10米风', times: forseeTimeData['1-24'] },
        { isSelected: false, value: 'rain1h', name: '1小时累积降雨', times: forseeTimeData['1-24'] },
        { isSelected: false, value: 'rain3h', name: '3小时累积降雨', times: forseeTimeData['3-24'] },
        { isSelected: false, value: 'rain6h', name: '6小时累积降雨', times: forseeTimeData['6-24'] },
        { isSelected: false, value: 'dbzr', name: '雷达回波(3km)', times: forseeTimeData['1-24'] },
      ]
    }, {
      name: '高空要素', 
      isSelected: false,
      sub: [
        { isSelected: false, value: 'wind925hght925', name: '925hPa风+高度', times: forseeTimeData['1-24'] },
        { isSelected: false, value: 'wind850hght500', name: '850hPa风+500hPa高度', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'wind700hght700', name: '700hPa形式', times: forseeTimeData['1-24'] },
        { isSelected: false, value: 'wind500hght500temp500', name: '500hPa形式', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'wind200stream200hght200', name: '200hPa形式', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'temp850-500', name: '850-500温度', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'temp700-500', name: '700-500温度', times: forseeTimeData['1-24'] },
      ]
    }, {
      name: '水汽条件',
      isSelected: false,
      sub: [
        { isSelected: false, value: 'rhum500', name: '500hPa相对湿度+风', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'rhum850', name: '850hPa相对湿度+风', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'rhum925', name: '925hPa相对湿度+风', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'vflux850', name: '850水汽通量', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'vflux925', name: '925水汽通量', times: forseeTimeData['0-24'] },
      ]
    }, {
      name: '不稳定层结',
      isSelected: false,
      sub: [
        { isSelected: false, value: 'kiki', name: 'k指数', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'sweat', name: 'SWAET-威胁指数', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'tti', name: 'TT指数', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'epi', name: 'EPI对流不稳定指数', times: forseeTimeData['0-24'] },
      ]
    }
  ],
  'guangdong': [
    {
      name: '地面要素',  
      isSelected: false,
      sub: [
        { isSelected: false, value: 'mslp', name: '海平面气压', times: forseeTimeData['1-24'] },
        { isSelected: false, value: 'temp2m', name: '2米温度', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'wind10m', name: '10米风', times: forseeTimeData['1-24'] },
        { isSelected: false, value: 'rain1h', name: '1小时累积降雨', times: forseeTimeData['1-24'] },
        { isSelected: false, value: 'rain3h', name: '3小时累积降雨', times: forseeTimeData['3-24'] },
        { isSelected: false, value: 'rain6h', name: '6小时累积降雨', times: forseeTimeData['6-24'] },
        { isSelected: false, value: 'dbzr', name: '雷达回波(3km)', times: forseeTimeData['1-24'] },
      ]
    }, {
      name: '不稳定层结',
      isSelected: false,
      sub: [
        { isSelected: false, value: 'kiki', name: 'k指数', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'sweat', name: 'SWAET-威胁指数', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'tti', name: 'TT指数', times: forseeTimeData['0-24'] },
        { isSelected: false, value: 'epi', name: 'EPI对流不稳定指数', times: forseeTimeData['0-24'] },
      ]
    }]
}