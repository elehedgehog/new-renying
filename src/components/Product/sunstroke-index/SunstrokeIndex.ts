import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './SunstrokeIndex.html?style=./SunstrokeIndex.scss'
import { agricultureAnalysis } from '../../../config/productId'
import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'

@WithRender
@Component
export default class SunstrokeIndex extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  url = 'http://172.22.1.201/gdqx/yjs/gz_heat.htm'
  productId = CONFIG.SunstrokeIndex

  async created() {
  }
}



