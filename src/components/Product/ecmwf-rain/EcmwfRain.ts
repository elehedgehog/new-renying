import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './EcmwfRain.html?style=./EcmwfRain.scss'
import * as moment from 'moment'
import * as CONFIG from '../../../config/productId'

@WithRender
@Component
export default class EcmwfRain extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  isComponentAlive = true
  productId: string = CONFIG.ecmwfRain
  ecwmfRainDate: Date = new Date()
  timeSelected: number = 3
  cumulateSelected: number = 3
  cumulate: number[] = [3, 6, 12, 24, 48, 72]
  utcSelected: number = 0
  loading: boolean = false
  imgLayer: any = null
  get leadtime() {           //时效计算
    let arr = []
    for (let i = 3; i < 72; i += 3) {
      if (i >= this.cumulateSelected)
        arr.push(i)
    }
    for (let i = 72; i <= 240; i += 6) {
    if (i >= this.cumulateSelected)
        arr.push(i)
    }
    return arr
  }

  mounted() {
    this.changeUrl()
  }
  destroyed() {
    this.isComponentAlive = false
    if(this.imgLayer) window['map'].removeLayer(this.imgLayer)
  }
  toggleUtcTime(key) {
    this.utcSelected = key
  }
  changeUrl() {
    let time = moment(this.ecwmfRainDate).format('YYYY-MM-DD ') + (this.utcSelected === 0 ? '00' : '12') + ':00:00',
        leadtime = this.timeSelected,
        cumulate = this.cumulateSelected
    let url = `http://10.148.16.217:11160/renyin5/satelite/img/grid/ecmwf/rain?time=${time}&leadtime=${leadtime}&cumulate=${cumulate}&left=108&right=119&top=26.5&bottom=19&width=800&height=800&proName=`
    this.loading = true
    let img = new Image()
    img.onload = () => {
      if(!this.isComponentAlive) return
      if(this.imgLayer) {
        window['map'].removeLayer(this.imgLayer)
        this.imgLayer = null
      } 
      this.loading = false
      this.imgLayer = window['L'].imageOverlay(url, [[26.5, 108],[19, 119]]).addTo(window['map'])
    }
    img.onerror = () => {
      if(!this.isComponentAlive) return
      if(this.imgLayer) {
        window['map'].removeLayer(this.imgLayer)
        this.imgLayer = null
      }
      this.loading = false
      Vue.prototype['$message']({
        type: 'error',
        message: '当前时次无数据'
      })
    }
    img.src = url
  }
  @Watch('cumulateSelected')
  oncumulateSelectedChanged (val: any, oldVal: any) {
    if(this.timeSelected < val){
      this.timeSelected = val
    }
    this.changeUrl()
  }
  @Watch('ecwmfRainDate')
  onecwmfRainDateChanged (val: any, oldVal: any) {
    this.changeUrl()
  }
  @Watch('utcSelected')
  onutcSelectedChanged (val: any, oldVal: any) {
    this.changeUrl()
  }
  @Watch('timeSelected')
  ontimeSelectedChanged (val: any, oldVal: any) {
    this.changeUrl()
  }
 

}