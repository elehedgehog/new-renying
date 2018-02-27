import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './RepoMonitor.html?style=./RepoMonitor.scss'
import * as CONFIG from '../../../config/productId'
import { AmmunitionStatus } from '../../../util/clientHelper'

@WithRender
@Component
export default class RepoMonitor extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.repoMonitor;
  isShow = false;

  toggleSwitch() {
    this.isShow = !this.isShow; 
    if(this.isShow) {
      this.getStatus()
    } else{
      this.clearLayer()
    }
  }
  destroyed(){
    this.clearLayer()
  }
  clearLayer() {
    window['map'].eachLayer(e => {
      if (e.id === 'ammunition')
        window['map'].removeLayer(e)
    })
  }

  async getStatus(){  //获取仓库湿度温度接口
    let data = await AmmunitionStatus.getStatus()
    if(data) {
      for(let el of data) {
        let marker = window['L'].marker([el.Lat,el.Lon], {
          icon: window['L'].divIcon({
            html: `
              <div class="status_detail cf">
                <div class="info">
                  <div class="val">${el.Temp}℃</div>
                  <div class="name">温度</div>
                </div>
                <div class="info">
                  <div class="val">${el.Humidity}%</div>
                  <div class="name">湿度</div>
                </div>
              </div>
              <div class="status_border"></div>
            `,
            iconAnchor: [55, 58],
          })
        })
        marker.id = 'ammunition'
        marker.addTo(window['map'])
      }
    }
  }
}