import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './MidLongForecast.html?style=./MidLongForecast.scss'
import * as Config from '../../../config/productId'
import { midLongForecast } from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'

@WithRender
@Component
export default class MidLongForecast extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  productId = Config.midLongForecast
  urlPrefix = 'http://10.148.8.228/files_home/win/yww/forecast/text/FRC{date}0300.HTML'
  url = ''

  async created() {
    let momentHolder = moment()
    if(momentHolder.get('hour') < 3) {
      momentHolder.subtract(1, 'day')
    }
    this.url = this.urlPrefix.replace("{date}", momentHolder.format('DD'))
  }
}



