import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './HumanComfort.html?style=./HumanComfort.scss'
import { agricultureAnalysis } from '../../../config/productId'
import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'

@WithRender
@Component
export default class HumanComfort extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  url = 'http://172.22.1.201/gdqx/yjs/comfort.htm'
  productId = CONFIG.HumanComfort

  async created() {
  }
}



