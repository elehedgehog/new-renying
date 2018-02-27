import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './WeatherForecast.html?style=./WeatherForecast.scss'
import { weatherForecast } from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'

@WithRender
@Component
export default class WeatherForecast extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  forecastTypeSelected = 'roll'
  forecastTypeData = [
    { value: 'roll', name: '短期滚动' },
    { value: 'month', name: '省月趋势' },
    { value: 'season', name: '省季趋势' }
  ]
  reqUrl = {
    list: 'http://10.148.16.217:11160/renyin5/weather/climatic/allfiles',
    file: 'http://10.148.16.217:11160/renyin5/weather/climatic/name'
  }
  listData = []
  fileName = ''
  productId = weatherForecast
  htmlString = ''

  async created() {
    await this.getListData()
    this.fileName = this.listData[0].fileName
  }

  @Watch('forecastTypeSelected')
  forecastTypeSelectedChanged(val: any, oldVal: any): void {
    this.getListData()
  }

  @Watch('fileName')
  async fileNameChanged(val: any, oldVal: any) {
    let res = await axios({
      url: this.reqUrl.file,
      adapter: jsonp,
      params: {
        fileName: this.fileName
      }
    })
    if (res.data.stateCode === -99) {
      Message({
        type: 'warning',
        message: '数据出错'
      })
      return
    }
    this.htmlString = res.data.data
  }

  async getListData() {
    let res = await axios({
      adapter: jsonp,
      url: this.reqUrl.list,
      params: {
        currentPage: 1,
        pageSize: 999,
        type: this.forecastTypeSelected,
      }
    })
    if (res.data.stateCode === -99) {
      Message({
        type: 'warning',
        message: '数据出错'
      })
      return
    }
    this.listData = []
    let name = ''
    for (let item of this.forecastTypeData) {
      if (item.value === this.forecastTypeSelected) {
        name = item.name
        break
      }
    }
    for (let item of res.data.data.objs) {
      let holder = moment(item.datetime)
      this.listData.push({
        month: holder.format('MM'),
        year: holder.format('Y'),
        fileName: item.fileName,
        datetime: item.datetime,
        name
      })
    }
  }
}



