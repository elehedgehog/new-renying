import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AirQuality.html?style=./AirQuality.scss'
import * as CONFIG from '../../../config/productId'
import jsonp from 'axios-jsonp'
import axios from 'axios'
let L = window['L']
@WithRender
@Component

export default class AirQuality extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  @Action('systemStore/storeaqiDetailInfo_global') storeaqiDetailInfo_global
  productId = CONFIG.airQuality
  typeList: any = ['AQI','PM2.5','PM10','O3','NO2','SO2','CO']
  colorLevel: any = {
    'AQI': [0, 25, 50, 75, 100, 125, 150, 175, 200, 250, 300],
    'PM2.5': [0, 25, 35, 50, 75, 95, 115, 130, 150, 200, 250],
    'PM10': [0, 25, 50, 100, 150, 200, 250, 300, 350, 380, 420],
    'O3': [0, 80, 160, 180, 200, 250, 300, 350, 400, 600, 800],
    'NO2':[0, 50, 100, 150, 200, 450, 700, 950, 1200, 1800, 2340],
    'SO2':[0, 75, 150, 300, 500, 580, 650, 720, 800, 1200, 1600],
    'CO':[0, 2, 5, 7, 10, 20, 35, 45, 60, 75, 90],
  }
  colorNumber: any = this.colorLevel['AQI']
  typeSelected: string = 'val_AQI'
  timeSelected: number = 1
  newAirList: any = {}
  reqUrl = 'http://10.148.16.217:11160/renyin5'

  async mounted() {
    await this.airQualityData()
    this.getLonLat()
   
  }

  @Watch('timeSelected')
  async ontimeSelectedChanged (val: any, oldVal: any) {
    await this.airQualityData()
    this.getLonLat()
  } 

  destroyed() {
    this.clearLayer()
  }

  clearLayer() {
    window['map'].eachLayer(e => {
      if (e.id === 'boundary')
        window['map'].removeLayer(e)
    })
  }

  async  airQualityData() {
    let res = await axios({ url: this.reqUrl +  `/conn/business/weather/3days?hour=${this.timeSelected*24}` })
    let data = JSON.parse(res.data.data)
    console.log(data)
    for (let el of data) {
      this.newAirList[el.stationCode] = el
    }
  }
  async getLonLat() {
    let res = await axios({ url: this.reqUrl + `/conn/business/station/lls`})
    let data = JSON.parse(res.data.data).result
    for (let el of data) {
      if (!this.newAirList[el.name]) continue
      let latlngs = []
      for(let item of el.pointList) {
        let arr = []
        let pointList = item.split(', ')
        for (let opt of pointList) {
          arr.push([Number(opt.split(' ')[1]), Number(opt.split(' ')[0])])
        }
        latlngs.push(arr)
      }
      this.newAirList[el.name].pointList = latlngs
    }
    this.drawArea()
  }

  drawArea() {
    this.clearLayer()
    for (let id in this.newAirList) {
      let el = this.newAirList[id]
      if (!el.pointList) continue
      let val = el[this.typeSelected === 'val_PM2.5' ? 'val_PM25' : this.typeSelected]
      let fillColor = this.getColor(val)
      el.pointList.map((opt, index) => {
        let polygon = L.polygon(opt, {
          fillColor: fillColor,
          stroke: false,
          fillOpacity: 0.6
        })
        polygon.on('mousemove', e => {
          polygon.setStyle({ fillColor: '#fff' })
          let x = e.containerPoint.x,
              y = e.containerPoint.y
          let info = { type: this.typeSelected.slice(4), val, stationName: el.stationName, x, y }
          this.storeaqiDetailInfo_global(info) 
        })
        polygon.on('mouseout', e => {
          polygon.setStyle({ fillColor })
          this.storeaqiDetailInfo_global({})
        })
        polygon.id = 'boundary'
        polygon.addTo(window['map'])

        if (index === 0) {
          let divIconLatLng = polygon.getCenter()
          let marker = L.marker([divIconLatLng.lat, divIconLatLng.lng], {
            icon: L.divIcon({
              html: `<div>${val}</div>`
            })
          })
          marker.id = 'boundary'
          marker.addTo(window['map'])
        }
      })
    }
  }

  @Watch('typeSelected')
  ontypeSelectedChanged (val: any, oldVal: any) {
    this.drawArea()
    this.colorNumber = this.colorLevel[val.slice(4)]
  }

  getColor(val) {
    if (this.typeSelected === 'val_AQI') {
      if (val > 300) return '#7E0023'
      else if (val > 250) return '#92003C'
      else if (val > 200) return '#99004C'
      else if (val > 175) return '#DC0027'
      else if (val > 150) return '#FF0000'
      else if (val > 125) return '#FF6000'
      else if (val > 100) return '#FF7E00'
      else if (val > 75) return '#FFDC00'
      else if (val > 50) return '#FFFF00'
      else if (val > 25) return '#80FF00'
      else return '#00E400'
    } else if (this.typeSelected === 'val_PM2.5') {
      if (val > 250) return '#7E0023'
      else if (val > 200) return '#92003C'
      else if (val > 150) return '#99004C'
      else if (val > 130) return '#DC0027'
      else if (val > 115) return '#FF0000'
      else if (val > 95) return '#FF6000'
      else if (val > 75) return '#FF7E00'
      else if (val > 50) return '#FFDC00'
      else if (val > 35) return '#FFFF00'
      else if (val > 25) return '#80FF00'
      else return '#00E400'
    } else if (this.typeSelected === 'val_PM10') {
      if (val > 420) return '#7E0023'
      else if (val > 380) return '#92003C'
      else if (val > 350) return '#99004C'
      else if (val > 300) return '#DC0027'
      else if (val > 250) return '#FF0000'
      else if (val > 200) return '#FF6000'
      else if (val > 150) return '#FF7E00'
      else if (val > 100) return '#FFDC00'
      else if (val > 50) return '#FFFF00'
      else if (val > 25) return '#80FF00'
      else return '#00E400'
    } else if (this.typeSelected === 'val_SO2') {
      if (val > 1600) return '#7E0023'
      else if (val > 1200) return '#92003C'
      else if (val > 800) return '#99004C'
      else if (val > 720) return '#DC0027'
      else if (val > 650) return '#FF0000'
      else if (val > 580) return '#FF6000'
      else if (val > 500) return '#FF7E00'
      else if (val > 300) return '#FFDC00'
      else if (val > 150) return '#FFFF00'
      else if (val > 75) return '#80FF00'
      else return '#00E400'
    } else if (this.typeSelected === 'val_NO2') {
      if (val > 2340) return '#7E0023'
      else if (val > 1800) return '#92003C'
      else if (val > 1200) return '#99004C'
      else if (val > 950) return '#DC0027'
      else if (val > 700) return '#FF0000'
      else if (val > 450) return '#FF6000'
      else if (val > 200) return '#FF7E00'
      else if (val > 150) return '#FFDC00'
      else if (val > 100) return '#FFFF00'
      else if (val > 50) return '#80FF00'
      else return '#00E400'
    } else if (this.typeSelected === 'val_CO') {
      if (val > 90) return '#7E0023'
      else if (val > 75) return '#92003C'
      else if (val > 60) return '#99004C'
      else if (val > 45) return '#DC0027'
      else if (val > 35) return '#FF0000'
      else if (val > 20) return '#FF6000'
      else if (val > 10) return '#FF7E00'
      else if (val > 7) return '#FFDC00'
      else if (val > 5) return '#FFFF00'
      else if (val > 2) return '#80FF00'
      else return '#00E400'
    } else {
      if (val > 800) return '#7E0023'
      else if (val > 600) return '#92003C'
      else if (val > 400) return '#99004C'
      else if (val > 350) return '#DC0027'
      else if (val > 300) return '#FF0000'
      else if (val > 250) return '#FF6000'
      else if (val > 200) return '#FF7E00'
      else if (val > 180) return '#FFDC00'
      else if (val > 160) return '#FFFF00'
      else if (val > 80) return '#80FF00'
      else return '#00E400'
    }
  }
}