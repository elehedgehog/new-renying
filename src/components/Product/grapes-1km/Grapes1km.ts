import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './Grapes1km.html?style=./Grapes1km.scss'
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
export default class Grapes1km extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  loading = false
  productId = CONFIG.grapes1km
  date: any = Date.now()
  elementData = [
    { value: 'mslp', name: '海平面气压' },
    { value: 'temp2m', name: '2米温度' },
    { value: 'rh2m_wind10m', name: '2米相对湿度' },
    { value: 'rain12min', name: '12分钟累计降雨' },
    { value: 'wind10m', name: '10米风' },
    { value: 'rain1h', name: '1小时累积降雨' },
    { value: 'cref', name: '组合雷达反射率' },
  ]
  elementSelected = 'mslp'
  hourData: string[] = []
  minuteData: string[] = []
  hourSelected: string = ''
  minuteSelected: string = ''
  imgUrl = ''
  reqUrl = 'http://10.148.16.217:11160/renyin5/satelite/img/grapes1km'
  latestHourUrl = 'http://10.148.16.217:11160/renyin5/satelite/grapes1km/latest'
  latestHour = ''
  forecastHour = '000'
  forecastHourData = []

  async created() {
    this.computeHouAndMinute()
    this.getForecastMinute('mslp')
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
      forecast: Number(this.forecastHour)
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
  @Watch('minuteSelected')
  onminuteSelectedChanged (val: any, oldVal: any) {
    this.computeHouAndMinute()
    this.draw()
  }
  minuteSelectedChange(val) {
    this.minuteSelected = val
  }
  @Watch('date')
  dateChanged(val: any, oldVal: any): void {
    this.computeHouAndMinute()
    this.draw()
  }
  @Watch('forecastHour')
  forecastHourChanged(val: any, oldVal: any): void {
    this.draw()
  }
  forecastHourChange(val) {
    this.forecastHour = val
  }
  @Watch('hourSelected')
  hourSelectedChanged(val: string, oldVal: any): void {
    this.computeHouAndMinute()
    this.draw()
  }
  hourSelectedChange(val) {
    this.hourSelected = val
  }
  @Watch('elementSelected')
  async elementSelectedChanged(val: string, oldVal: any) {
    let nowHolder = moment().subtract(1, 'hours').format('YYYY-MM-DD HH')
    if (nowHolder ===
      `${moment(this.date).format('YYYY-MM-DD')} ${this.hourSelected}`) {
      await this.getLatestHour()
    }
    this.getForecastMinute(val)
    this.draw()
  }

  private getForecastMinute(val: string) {
    let start = 0, end = 360
    if (val.match(/rain1h/)) {
      start = 60
    } else if (val.match(/rain12min/)) {
      start = 12
    } else {
      start = 0
    }
    let arr = []
    for (let i = start; i <= end; i += 12) {
      arr.push(i < 10 ? '00' + i : (i < 100 ? '0' + i : i))
    }
    this.forecastHourData = arr
    if (this.forecastHourData.indexOf(this.forecastHour) === -1) {
      this.forecastHour = this.forecastHourData[0]
    }
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
  }
}