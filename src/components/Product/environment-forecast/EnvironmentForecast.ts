import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './EnvironmentForecast.html?style=./EnvironmentForecast.scss'
import { agricultureAnalysis } from '../../../config/productId'
import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'

@WithRender
@Component
export default class EnvironmentForecast extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  urlPrefix = 'http://10.148.8.228/files_home/win/yww/forecast/pm25//FC_AIR_BCGZ_'
  url = ''
  productId = CONFIG.environmentForecast

  async created() {
    let momentHolder = moment()
    if (momentHolder.get('hour') < 12) {
      momentHolder.subtract(1, 'days')
    }
    this.url = this.urlPrefix + momentHolder.format('YYMMDD1200') + '.html'
  }
}



