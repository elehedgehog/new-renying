import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ShortForecast.html?style=./ShortForecast.scss'
import { shortForecast } from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'

@WithRender
@Component
export default class ShortForecast extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  forecastTypeSelected = '1d'
  forecastTypeData = [
    { value: '1d', name: '主要城市预报' },
    { value: '5d', name: '主要城市5天预报' },
    { value: '7d', name: '精细化天气预报接口' }
  ]
  forecastPublishTime = {
    "1d": [11],
    "5d": [17],
    "7d": [6, 11, 16]
  }
  reqUrl = 'http://10.148.16.217:11160/renyin5/weather/forecast'
  listData = []
  fileName = ''
  productId = shortForecast
  htmlString = ''

  async created() {
    this.getHtmlString()
  }

  @Watch('forecastTypeSelected')
  forecastTypeSelectedChanged(val: any, oldVal: any): void {
    this.getHtmlString()
  }

  @Watch('fileName')
  async fileNameChanged(val: any, oldVal: any) {
    this.getHtmlString()
  }

  getReqDataTime() {
    let publishData: number[] = this.forecastPublishTime[this.forecastTypeSelected]
    let now = moment()
    let hour = Number(now.format('H'))
    console.info('hour', hour)
    let holder = 0
    if (hour > publishData[0]) {
      holder = publishData[0]
      for (let item of publishData) {
        if (hour >= item) {
          holder = item
        }
      }
    } else {
      holder = publishData[0]
      now.subtract(1, 'days')
    }
    return now.set('hour', holder).format('YYYY-MM-DD HH:00:00')
  }

  async getHtmlString() {
    let res = await axios({
      adapter: jsonp,
      url: this.reqUrl,
      params: {
        time: this.getReqDataTime(),
        type: this.forecastTypeSelected,
      }
    })
    if (res.data.stateCode !== 0) {
      Message({
        type: 'warning',
        message: '数据出错'
      })
      return
    }
    this.htmlString = res.data.data
    console.info(res.data)
  }
}



