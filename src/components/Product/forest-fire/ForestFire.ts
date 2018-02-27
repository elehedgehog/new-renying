import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ForestFire.html?style=./ForestFire.scss'

import * as moment from 'moment'
import jsonp from 'axios-jsonp'
import axios from 'axios'
import { Message } from 'element-ui'
import * as CONFIG from '../../../config/productId'

let layerGroup = null,
  icon = {
    "3": null,
    "4": null,
    "5": null
  }

@WithRender
@Component
export default class ForestFire extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  datetime = moment().subtract(10, 'minute').format('YYYY-MM-DD HH:mm')
  url = 'http://10.148.16.217:11160/renyin5/warn/tf?&addrType=province&name=广东&warnType=forest'
  data = null
  iconImgUrl_normal = '/static/img/home_fire.png'
  iconImgUrl_warning = '/static/img/home_fire.png'
  loading: boolean = false
  productId = CONFIG.forestFire

  async created() {
    this.getData()
    this.createIcon()
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
    console.info(this.data)
    this.addMarker()
  }

  addMarker() {
    layerGroup.clearLayers()
    for (let item of this.data) {
      layerGroup.addLayer(
        window['L'].marker([item.lat, item.lon], {
          icon: icon[item.forestLev]
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
        <header>${val.stationName}</header>
        <ul class="cf"j>
          <li>时间</li>        
          <li>${moment(val.datetime).format('YYYY-MM-DD HH:mm')}<span><span></li>        
        </ul>
        <ul class="cf">
          <li>城市</li>        
          <li>${val.city}<span><span></li>        
        </ul> 
        <ul class="cf">
          <li>火险等级</li>        
          <li>${this.getLevel(val.forestLev)}色预警<span>
        </ul>    
      </main>`)
  }

  getLevel(val) {
    switch (val) {
      case 3: return '黄'
      case 4: return '橙'
      case 5: return '红'
      default: '黄';
    }
  }

  createIcon() {
    icon["3"] = window['L'].icon({
      iconUrl: '/static/img/home_fire_yellow.png',
      iconSize: [24, 37],
      iconAnchor: [12, 37],
      popupAnchor: [0, -37],
    })
    icon["4"] = window['L'].icon({
      iconUrl: '/static/img/home_fire_orange.png',
      iconSize: [24, 37],
      iconAnchor: [12, 37],
      popupAnchor: [0, -37],
    })
    icon["5"] = window['L'].icon({
      iconUrl: '/static/img/home_fire_red.png',
      iconSize: [24, 37],
      iconAnchor: [12, 37],
      popupAnchor: [0, -37],
    })
  }

}



