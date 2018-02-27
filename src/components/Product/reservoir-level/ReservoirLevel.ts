import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ReservoirLevel.html?style=./ReservoirLevel.scss'

import * as moment from 'moment'
import jsonp from 'axios-jsonp'
import axios from 'axios'
import { Message } from 'element-ui'
import * as CONFIG from '../../../config/productId'

let layerGroup = null,
  icon_normal = null,
  icon_warning = null

@WithRender
@Component
export default class ReservoirLevel extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  datetime = moment().subtract(20, 'minute').format('YYYY-MM-DD HH:mm')
  url = 'http://10.148.16.217:11160/renyin5/waterline/reservoir?&addrType=province&name=广东'
  data = null
  iconImgUrl_normal = '/static/img/home_WaL.png'
  iconImgUrl_warning = '/static/img/home_WaL_pre.png'
  loading: boolean = false
  productId = CONFIG.reservoirLevel

  async created() {
    this.getData()
  }
  destroyed() {
    layerGroup.clearLayers()
  }

  @Watch('datetime')
  datetimeChanged(val: any, oldVal: any): void {
    this.getData()
  }

  async getData() {
    if (!layerGroup) {
      layerGroup = window['L'].layerGroup()
      layerGroup.addTo(window['map'])
    }
    this.createIcon()
    this.loading = true
    let res = await axios({
      url: this.url,
      params: {
        time: moment(this.datetime).format('YYYY-MM-DD HH:mm:00')
      },
      adapter: jsonp
    })
    if (res.data.stateCode === -99) {
      Message({
        type: 'warning',
        message: '当前时次没有数据，请更换时次'
      })
      this.loading = false
      return
    }
    this.data = res.data.data
    this.addMarker()
  }

  addMarker() {
    layerGroup.clearLayers()
    for (let item of this.data) {
      layerGroup.addLayer(
        window['L'].marker([item.lat, item.lon], {
          icon: item.waterlev >= item.alertLev * (3 / 4) ? icon_normal : icon_warning
        }).bindPopup(this.createPopup(item))
      )
    }
    this.loading = false
  }

  createPopup(val) {
    return window['L'].popup({
      className: 'reservoir-popup',
      closeButton: false
    }).setContent(
      `<main>
        <header>${val.stationname}</header>
        <ul class="cf"j>
          <li>时间</li>        
          <li>${moment(val.datetime).format('YYYY-MM-DD HH:mm')}<span><span></li>        
        </ul>
        <ul class="cf">
          <li>当前水位</li>        
          <li>${val.waterlev}<span>(米)<span></li>        
        </ul> 
        <ul class="cf">
          <li>警告水位</li>        
          <li>${val.alertLev}<span>(米)<span></li>        
        </ul>    
        <ul class="cf">
          <li>水库总水量</li>        
          <li>${val.totalwater}<span>(万立方米)<span></li>        
        </ul>
        <ul class="cf">
          <li>地址</li>        
          <li>${val.address}</li>        
        </ul>
      </main>`)
  }

  createIcon() {
    if (!icon_normal) {
      icon_normal = window['L'].icon({
        iconUrl: this.iconImgUrl_normal,
        iconSize: [24, 37],
        iconAnchor: [12, 37],
        popupAnchor: [0, -37],
      })
    }
    if (!icon_warning) {
      icon_warning = window['L'].icon({
        iconUrl: this.iconImgUrl_warning,
        iconSize: [24, 37],
        iconAnchor: [12, 37],
        popupAnchor: [0, -37],
      })
    }
  }

}