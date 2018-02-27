import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './CityShortForecast.html?style=./CityShortForecast.scss'
import { cityShortForecast } from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'
import SelectToggle from '../../commons/select-toggle/SelectToggle'

@WithRender
@Component({
  components: {
    SelectToggle
  }
})
export default class CityShortForecast extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  forecastTypeSelected = '广州'
  forecastTypeData = [
    '潮州', '东莞', '佛山', '揭阳',
    '广州', '河源', '惠州', '江门',
    '茂名', '梅州', '清远', '汕头',
    '汕尾', '韶关', '深圳', '阳江',
    '云浮', '湛江', '肇庆', '中山',
    '珠海'
  ]
  reqUrl = 'http://10.148.16.217:11160/renyin5/weather/city/nowcasting'
  title = ''
  content = ''
  forecaster = ''
  publishTime = ''
  productId = cityShortForecast

  async created() {
    this.getHtmlString()
  }

  @Watch('forecastTypeSelected')
  forecastTypeSelectedChanged(val: any, oldVal: any): void {
    this.getHtmlString()
  }
  forecastTypeSelectedChange(val) {
    this.forecastTypeSelected = val
  }

  @Watch('fileName')
  async fileNameChanged(val: any, oldVal: any) {
    this.getHtmlString()
  }


  async getHtmlString() {
    let res = await axios({
      adapter: jsonp,
      url: this.reqUrl,
      params: {
        cid: this.forecastTypeSelected,
      }
    })
    if (res.data.stateCode !== 0) {
      Message({
        type: 'warning',
        message: '数据出错'
      })
      return
    }
    this.content = res.data.data.text
    this.forecaster = res.data.data.forecaster
    this.publishTime = res.data.data.forecasttime
  }
}



