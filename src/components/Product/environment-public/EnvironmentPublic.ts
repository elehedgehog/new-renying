import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './EnvironmentPublic.html?style=./EnvironmentPublic.scss'
import { agricultureAnalysis } from '../../../config/productId'
import SelectToggle from '../../commons/select-toggle/SelectToggle'
import DatePickerToggle from '../../commons/date-picker-toggle/DatePickerToggle'
import * as moment from 'moment'
import * as CONFIG from '../../../config/productId';
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'

@WithRender
@Component({
  components: {
    SelectToggle,
    DatePickerToggle
  }
})
export default class EnvironmentPublic extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  productId = CONFIG.environmentPublic
  fileName = ''
  proxyUrl = 'http://10.148.16.217:11160/renyin5/conn/business/bulletin'
  loading = false
  urlPrefix = 'http://10.148.8.228/word/'
  url = ''

  async created() {
    this.loading = true
    let res = await axios({
      url: this.proxyUrl
    })
    this.url = this.urlPrefix + res.data.data.replace(/"/g, '')
    this.loading = false
    console.info(this.urlPrefix)
  }
}



