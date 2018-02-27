import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './DryCondition.html?style=./DryCondition.scss'

import * as moment from 'moment'
import jsonp from 'axios-jsonp'
import axios from 'axios'
import { Message } from 'element-ui'
import * as CONFIG from '../../../config/productId'

let layerGroup = null,
  icon = []

@WithRender
@Component
export default class DryCondition extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  datetime = moment().format('YYYY-MM-DD HH:mm')
  url = 'http://10.148.16.217:9020/dao/ghjcData'
  data = null
  iconImgUrl_normal = '/static/img/home_drought'
  loading: boolean = false
  productId = CONFIG.dryCondition
  minify: boolean = true
  imgData: any[] = []
  imgSelected = null
  get imgUrl() {
    return 'http://10.148.16.217:11160/renyin5/weather/climatic/img/name?imgName=' + this.imgSelected
  }

  async created() {
    this.getData()
    this.getImgData()
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
        dateStart: moment(this.datetime).format('YYYY-MM-DD HH:mm:00')
      },
      adapter: jsonp
    })
    if (!res.data.status) {
      Message({
        type: 'warning',
        message: '当前时次没有数据，请更换时次'
      })
      this.loading = false
      return
    }
    this.data = res.data.list
    this.addMarker()
  }

  async getImgData() {
    let res = await axios({
      url: 'http://10.148.16.217:11160/renyin5/weather/climatic/allimgs?type=dry&currentPage=1&pageSize=1000',
      adapter: jsonp
    })
    if (res.data.stateCode === -99) {
      Message({
        type: 'warning',
        message: '图片列表数据源出错'
      })
      return
    }
    this.imgData = []
    for (let item of res.data.data.objs) {
      this.imgData.push({
        value: item.fileName,
        datetime: item.datetime
      })
    }
    if (this.imgData.length > 0)
      this.imgSelected = this.imgData[0].value
  }

  addMarker() {
    layerGroup.clearLayers()
    for (let item of this.data) {
      layerGroup.addLayer(
        window['L'].marker([item.lat, item.lon], {
          icon: icon[item.dj]
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
      <header>${val.name}</header>
      <ul class="cf"j>
      <li>时间</li>        
      <li>${moment(val.datetime).format('YYYY-MM-DD HH:mm')}<span><span></li>        
      </ul>
      <ul class="cf">
      <li>站点id</li>        
          <li>${val.obtid}<span><span></li>        
          </ul> 
        <ul class="cf">
        <li>等级</li>        
        <li>${this.getDryLevelText(val.dj)}</li>        
        </ul>
        </main>`)
  }

  getDryLevelText(val) {
    switch (val) {
      case 1: return '轻旱'
      case 2: return '中旱'
      case 3: return '重旱'
      case 4: return '特旱'
      default: return '正常'
    }
  }

  createIcon() {
    for (let i = 0; i <= 4; i++) {
      icon.push(
        window['L'].icon({
          iconUrl: this.iconImgUrl_normal + (i + 1) + '.png',
          iconSize: [24, 37],
          iconAnchor: [12, 37],
          popupAnchor: [0, -37],
        })
      )
    }
  }
}