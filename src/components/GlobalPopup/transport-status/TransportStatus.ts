import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './TransportStatus.html?style=./TransportStatus.scss'
import * as moment from 'moment'
import { transportClient } from './../../../util/clientHelper'
@WithRender
@Component
export default class TransportStatus extends Vue {
  moment = moment
  @Action('systemStore/storeisTransportOpened_global') storeisTransportOpened_global

  transportList: any = {}
  mounted() {
    this.getInTransport()
  }
  async getInTransport(){  //获取所有正在运输中的自动设备
    let res = await transportClient.getInTransport()
    let obj = {}
    for (let el of res) {
      let transportEvent = el.transportEvent
      let data = await transportClient.getTransport(transportEvent)  //获取even
      el = Object.assign(el, data)
      obj[el.id] = el
    }
    this.transportList = obj
  }
  async arriveDevice(item) { //结束运输
    let param = {
      type: 'arrive',
      equip: item.device
    }
    let data = await transportClient.stopTransport(param)
    this.getInTransport()
  }
}