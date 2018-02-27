import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './GlobalMessage.html?style=./GlobalMessage.scss'
import * as CONFIG from '../../config/productId'

import axios from 'axios'
import jsonp from 'axios-jsonp'
import { phoneLivePanel } from '../../config/productId';
import { airRequestData_global, appUserData_global } from 'store/systemStore/getters-system';

let transportLayerHolder = {},
  airRequestLayerHolder = {},
  phoneLiveLayerHolder = {},
  map = window['map'],
  L = window['L'],
  vehicleIcon = L.icon({
    iconUrl: '/static/img/home_transport.png',
    iconSize: [52 / 2, 54 / 2],
    iconAnchor: [52 / 4, 54 / 4]
  }),
  liveIcon = L.icon({
    iconUrl: '/static/img/home_live.png',
    iconSize: [24, 37],
    iconAnchor: [12, 37]
  }),
  airRequestIcon = L.icon({
    iconUrl: '/static/img/toolbar_airspace.png',
    iconSize: [24, 37],
    iconAnchor: [12, 37]
  })

@WithRender
@Component
export default class GlobalMessage extends Vue {
  @Getter('systemStore/socketMessage_global') socketMessage_global: any[]
  @Getter('systemStore/socketCurrentMessage_global') socketCurrentMessage_global
  @Getter('systemStore/isSearchOperateStationWindowOn_global')
  isSearchOperateStationWindowOn
  @Getter('systemStore/transportData_global') transportData_global
  @Getter('systemStore/isTransportDataChange_global') isTransportDataChange_global
  @Getter('systemStore/isShowTransportLayer_global') isShowTransportLayer_global
  @Getter('systemStore/isShowAirRequestLayer_global') isShowAirRequestLayer_global
  @Getter('systemStore/isShowAirLineLayer_global') isShowAirLineLayer_global
  @Getter('systemStore/isShowPhoneLiveLayer_global') isShowPhoneLiveLayer_global
  @Getter('systemStore/phoneLiveData_global') phoneLiveData_global
  @Getter('systemStore/airRequestData_global') airRequestData_global
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  @Getter('systemStore/appUserData_global') appUserData_global

  isShowHistoryMessage: boolean = false
  intervalHolder: any = null
  get socketMessage() {
    let message = this.socketMessage_global.slice(this.socketCurrentMessage_global.length - 2,
      this.socketMessage_global.length - 1)
    message.reverse()
    return message
  }

  created() {
    this.intervalHolder = setInterval(() => {
      for (let key in transportLayerHolder) {
        if (Date.now() - transportLayerHolder[key].updateTime > 2 * 60 * 1000) {
          for (let i in transportLayerHolder[key]) {
            if (i === 'updateTime') continue
            window['map'].removeLayer(transportLayerHolder[key][i])
          }
          delete transportLayerHolder[key]
        }
      }
    }, 10000)
    this.updatePhoneLive()
    this.updateAirRequest()
  }

  @Watch('isShowPhoneLiveLayer_global')
  async isShowPhoneLiveLayer_globalChanged(val) {
    this.updatePhoneLive()
  }
  @Watch('phoneLiveData_global')
  async phoneLiveData_globalChanged(val) {
    this.updatePhoneLive()
  }

  @Watch('isShowAirRequestLayer_global')
  async isShowAirRequestLayer_globalChanged(val) {
    this.updateAirRequest()
  }
  @Watch('airRequestData_global')
  async airRequestData_globalChanged(val) {
    this.updateAirRequest()
  }

  @Watch('isTransportDataChange_global')
  isTransportDataChange_globalChanged(val: any, oldVal: any): void {
    this.updateTransportLayer()
  }
  @Watch('isShowTransportLayer_global')
  isShowTransportLayer_globalChange(val) {
    for (let transportKey in transportLayerHolder) {
      let item = transportLayerHolder[transportKey]
      for (let itemKey in item) {
        if (itemKey === 'updateTime') continue
        let subItem = item[itemKey]
        if (this.isShowTransportLayer_global) {
          if (!window['map'].hasLayer(subItem)) {
            window['map'].addLayer(subItem)
          }
        } else {
          if (window['map'].hasLayer(subItem)) {
            window['map'].removeLayer(subItem)
          }
        }
      }
    }
  }

  updateAirRequest() {
    let updateSign = Date.now()
    for (let item of this.airRequestData_global) {
      if (!item.info) continue
      if (!airRequestLayerHolder[item.applicantId]) {
        airRequestLayerHolder[item.applicantId] = {}
        airRequestLayerHolder[item.applicantId].layer = L.marker(
          [item.info.lat, item.info.lon],
          {
            icon: airRequestIcon
          })
        airRequestLayerHolder[item.applicantId].sign = updateSign
        airRequestLayerHolder[item.applicantId].layer.bindPopup(
          `<span>申请人:${(
            () => {
              for (let item of this.appUserData_global) {
                if (item.id === item.applicantId) {
                  return item.name
                }
              }
            }
          )()}</span>`
        )
      } else {
        if (typeof airRequestLayerHolder[item.applicantId] !== 'undefined')
          airRequestLayerHolder[item.applicantId].sign = updateSign
      }
      if (this.isShowPhoneLiveLayer_global && airRequestLayerHolder[item.applicantId])
        window['map'].addLayer(airRequestLayerHolder[item.applicantId].layer)
    }
    for (let key in airRequestLayerHolder) {
      if (!this.isShowAirRequestLayer_global
        || airRequestLayerHolder[key].sign != updateSign) {
        if (window['map'].hasLayer(airRequestLayerHolder[key].layer))
          window['map'].removeLayer(airRequestLayerHolder[key].layer)
        delete airRequestLayerHolder[key]
      }
    }
  }

  updatePhoneLive() {
    let updateSign = Date.now()
    for (let item of this.phoneLiveData_global) {
      if (!item.info) continue
      if (!phoneLiveLayerHolder[item.liveId]) {
        phoneLiveLayerHolder[item.liveId] = {}
        phoneLiveLayerHolder[item.liveId].layer = L.marker(
          [item.info.lat, item.info.lon],
          {
            icon: liveIcon
          })
        phoneLiveLayerHolder[item.liveId].sign = updateSign
      } else {
        if (typeof phoneLiveLayerHolder[item.liveId] !== 'undefined')
          phoneLiveLayerHolder[item.liveId].sign = updateSign
      }
      phoneLiveLayerHolder[item.liveId].layer.on('click', () => {
        this.$store.commit('systemStore/changePhoneLiveId', item.liveId)
        this.toggleProductView_global({ id: CONFIG.phoneLivePanel, action: true })
      })
      if (this.isShowPhoneLiveLayer_global && phoneLiveLayerHolder[item.liveId]) {
        window['map'].addLayer(phoneLiveLayerHolder[item.liveId].layer)
      }
    }
    for (let key in phoneLiveLayerHolder) {
      if (!this.isShowPhoneLiveLayer_global || phoneLiveLayerHolder[key] && phoneLiveLayerHolder[key].sign != updateSign) {
        if (window['map'].hasLayer(phoneLiveLayerHolder[key].layer))
          window['map'].removeLayer(phoneLiveLayerHolder[key].layer)
        delete phoneLiveLayerHolder[key]
      }
    }
  }

  updateTransportLayer() {
    for (let transportId in this.transportData_global) {
      let data: AmmunitionEvent = this.transportData_global[transportId]
      if (!data) continue;
      if (!transportLayerHolder[transportId]) {
        transportLayerHolder[transportId] = {
          lineLayer: null,
          vehicleLayer: null
        }
        if (data.pos.length !== 0) {
          addLineAndVehicleLayer(data, transportId, this.isShowTransportLayer_global)
        }
      } else {
        let LastPos = data.pos[data.pos.length - 1]
        if (transportLayerHolder[transportId].vehicleLayer) {
          transportLayerHolder[transportId].vehicleLayer.setLatLng(
            [LastPos.lat, LastPos.lon]
          )
          transportLayerHolder[transportId].lineLayer.setLatLngs(getLineData(data))
          transportLayerHolder[transportId].toEnd.setLatLngs([
            [LastPos.lat, LastPos.lon],
            data.endPos
          ])
        } else {
          addLineAndVehicleLayer(data, transportId, this.isShowTransportLayer_global)
        }
      }
    }

    function addLineAndVehicleLayer(data, transportId, addToMap: boolean) {
      transportLayerHolder[transportId] = {}
      let LastPos = data.pos[data.pos.length - 1]
      console.log('addLineAndVehicleLayer', data);
      transportLayerHolder[transportId].vehicleLayer = L.marker(
        [LastPos.lat, LastPos.lon], { icon: vehicleIcon }
      )
      transportLayerHolder[transportId].lineLayer = L.polyline(
        getLineData(data) 
      )
      if (data.endPos)
        transportLayerHolder[transportId].endLayer = L.circle(
          data.endPos, { radius: 50 }
        )
      if (data.endPos)
        transportLayerHolder[transportId].endLayerName = L.marker(data.endPos, {
          icon: new L.divIcon({
            className: 'transport-icon',
            html: `<span>终点:${data.endName}</span>`
          })
        })
      if (data.endPos)
        transportLayerHolder[transportId].toEnd = L.polyline(
          [
            [LastPos.lat, LastPos.lon],
            data.endPos
          ], { color: 'darkorange', dashArray: [4, 8] }
        )
      transportLayerHolder[transportId].startLayer = L.circle(
        data.startPos, { radius: 50 }
      )
      transportLayerHolder[transportId].startName = L.marker(
        data.startPos, {
          icon: new L.divIcon({
            className: 'transport-icon',
            html: `<span>起点:${data.startName}</span>`
          })
        })
      transportLayerHolder[transportId].updateTime = Date.now()
      if (addToMap) {
        for (let i in transportLayerHolder[transportId]) {
          if (i === 'updateTime') continue
          window['map'].addLayer(transportLayerHolder[transportId][i])
        }
        console.log(window['map'].hasLayer(transportLayerHolder[transportId].startLayer))
      }
    }

    function getLineData(data) {
      let lineData = []
      lineData.push(data.startPos)
      for (let item of data.pos) {
        if (item.lat == 0 && item.lon == 0) continue
        lineData.push([item.lat, item.lon])
      }
      return lineData
    }
  }
}



