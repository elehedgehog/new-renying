import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './SatelliteProduct.html?style=./SatelliteProduct.scss'
import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'

@WithRender
@Component
export default class SatelliteProduct extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  productId: string = CONFIG.satelliteProduct
  elementSelected = 'ttop'
  date = moment().format('YYYY-MM-DD')
  elementData: { name: string, value: string }[] = [
    { name: '云顶温度', value: 'ttop' },
    { name: '云顶高度', value: 'ztop' },
    { name: '过冷层厚度', value: 'hsc' },
    { name: '光学厚度', value: 'optn' },
    { name: '有效例子半径', value: 'ref' },
    { name: '云顶高度', value: 'ttop' },
    { name: '液水路径', value: 'lwp' },
    { name: '黑体亮温', value: 'tbb' },
  ]
  hourSelected = ''
  reqUrl = 'http://10.148.16.217:9020/dao/satpng/'
  imgUrl = ''
  hourData = []
  loading = false

  created() {
    let now = moment()
    this.genHourData()
    this.hourSelected = now.subtract(1, 'hours').format('HH') + ':00'
    this.draw()
  }

  @Watch('datetime')
  datetimeChanged(val: any, oldVal: any): void {
    this.draw()
  }
  @Watch('elementSelected')
  elementSelectedChanged(val: any, oldVal: any): void {
    this.draw()
  }
  @Watch('hourSelected')
  hourSelectedChanged(val: any, oldVal: any): void {
    this.draw()
  }

  genHourData() {
    this.hourData = []
    for (let i = 0; i < 24; i++) {
      this.hourData.push({
        text: (i < 10 ? '0' + i : i) + ':00',
        value: i
      })
    }
  }

  async draw() {
    this.imgUrl = this.reqUrl
      + '/' + this.elementSelected + '?'
      + 'date='
      + moment(moment(this.date).format('YYYY-MM-DD') + ' ' + this.hourSelected).format('YYYYMMDDHH')
    this.loading = true
    let img = new Image()
    img.src = this.imgUrl
    img.onload = () => this.loading = false
    img = null
  }
}