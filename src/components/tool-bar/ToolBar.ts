import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ToolBar.html?style=./ToolBar.scss'
import { toolbarClient } from '../../util/clientHelper'
import Measure from './measure/Measure'
import SearchJonbiont from './search-jobpoint/SearchJobpoint'
import { orderDispatch } from 'config/productId';

let graticule = null

@WithRender
@Component({
  components: {
    Measure
  }
})
export default class ToolBar extends Vue {
  @Action('systemStore/toggleSearchOperateStationWindow_global') 
    toggleSearchOperateStationWindow_global
  @Getter('systemStore/isCappiProfileOn_global') isCappiProfileOn_global
  @Getter('systemStore/isOrderDispatchOn_global') isOrderDispatchOn_global
  @Getter('systemStore/isTransportOpened_global') isTransportOpened_global
  @Action('systemStore/storeisTransportOpened_global') storeisTransportOpened_global
  @Action('systemStore/storeCappiProfile_global') storeCappiProfile_global 
  @Action('systemStore/storeisCappiProfileOn_global') storeisCappiProfileOn_global
  @Action('systemStore/storeisOrderDispatchOn_global') storeisOrderDispatchOn_global

  toolbarSelected: string = null
  topography: boolean = false
  latlon: boolean = false
  airdrome: boolean = false
  airspace: boolean = false
  shotpoint: boolean = false
  radios: boolean = false
  search: boolean = false
  transport: boolean = false
  searchView: any = null
  hidePop: boolean = false
  cappiProfile: boolean = false
  orderDispatch: boolean = false
  profileLatLng: any = { SLat: null, SLon: null, ELat: null, ELon: null }
  startPoint: any = null
  polyline: any = null
  toggleCappiProfile() {    // 雷达剖面
    this.cappiProfile = !this.cappiProfile
    if (this.cappiProfile)
      window['map'].on('click', this.cappiClickEvent)
    else {
      this.removeCappiProfile()
      this.storeisCappiProfileOn_global(false)
    }
  }
  cappiClickEvent(e: any) {
    if (!this.startPoint) {
      let lat = Number(e.latlng.lat.toFixed(2)),
          lng = Number(e.latlng.lng.toFixed(2))
      this.profileLatLng.SLat = lat
      this.profileLatLng.SLon = lng
      this.startPoint = window['L'].marker([lat, lng], {
        icon: window['L'].icon({
          className: 'point',
          iconUrl: '/static/img/cappi.png',
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        })
      })
      this.startPoint.addTo(window['map'])
      window['map'].on('mousemove', this.cappiMousemoveEvent)
    } else {
      this.profileLatLng.ELat = Number(e.latlng.lat.toFixed(2))
      this.profileLatLng.ELon = Number(e.latlng.lng.toFixed(2))
      this.storeCappiProfile_global(this.profileLatLng)
      this.storeisCappiProfileOn_global(true)
      this.removeCappiProfile()
    }
  }
  cappiMousemoveEvent(e: any) {
    if (this.polyline) window['map'].removeLayer(this.polyline)
    this.polyline = window['L'].polyline([[this.profileLatLng.SLat, this.profileLatLng.SLon], [e.latlng.lat, e.latlng.lng]], {
      color: '#f00',
      weight: 2
    })
    this.polyline.addTo(window['map'])
  }
  removeCappiProfile() {
    window['map'].off('click', this.cappiClickEvent)
    window['map'].off('mousemove', this.cappiMousemoveEvent)
    if (this.startPoint) {
      window['map'].removeLayer(this.startPoint)
      this.startPoint = null
    }
    if (this.polyline) {
      window['map'].removeLayer(this.polyline)
      this.polyline = null
    }
  }
  @Watch('isCappiProfileOn_global')
  onisCappiProfileOn_globalChanged (val: any, oldVal: any) {
    if (!val) this.cappiProfile = false
  }

  toggleOrderDispatch() { //指令调度
    this.orderDispatch = !this.orderDispatch
    if(this.orderDispatch) {
      this.storeisOrderDispatchOn_global(true)
    } else {
      this.storeisOrderDispatchOn_global(false)
    }
  }
  @Watch('isOrderDispatchOn_global')
  onisOrderDispatchOn_globalChanged (val: any, oldVal: any) {
    if (!val) this.orderDispatch = false
  }


  toggleSearch() { //搜索
    this.search = !this.search
    this.toggleSearchOperateStationWindow_global()
    if(this.search) {
      this.searchView = SearchJonbiont
    } else {
      this.searchView = null
    }
  }
  toggleTopography() {      //地形
    this.topography = !this.topography
    let map: any = window['map']
    if (this.topography) {
      window['business'].addTo(map)
      map.removeLayer(window['terLayer'])
    } else {
      window['terLayer'].addTo(map)
      map.removeLayer(window['business'])
    }
  }
  toggleLatlon() {    //经纬
    this.latlon = !this.latlon
    let L = window['L'], map = window['map']
    if (this.latlon) {
       graticule =  L.latlngGraticule({
          showLabel: true,
          zoomInterval: [
              {start: 2, end: 3, interval: 30},
              {start: 4, end: 4, interval: 10},
              {start: 5, end: 7, interval: 5},
              {start: 8, end: 10, interval: 1}
          ]
      }).addTo(map);
    } else {
      window['map'].removeLayer(graticule)
      graticule = null
    }
  }
  async toggleAirdrome() {     //飞机场
    this.airdrome = !this.airdrome
    let data = await toolbarClient.getAirports()
    let map = window['map']
    if(this.airdrome) {
      if(data) {
        let L = window['L']
        const icon = L.icon({
          className: 'airdromePonit',
          iconUrl: '/static/img/toolbar_aircraft_icon.png', 
          iconSize: [15, 15],
          iconAnchor: [7.5, 7.5],
        })
        for (let item of data) {
          let marker = L.marker([item.latitude,item.longitude], { icon: icon })
          marker.id = 'airdromePoint';
          marker.addTo(map);
        }
      }
    } else{
      map.eachLayer(e => { 
        if(e.id === 'airdromePoint') 
          map.removeLayer(e) 
      })
    }
  }

  async toggleAirspace() {        //飞行区域
    this.airspace = !this.airspace
    let data = await toolbarClient.getAirspace()
    let map = window['map']
    let L = window['L']
    if(this.airspace){
      if(data){
          for(let item of data){
            let str = item.edge1
            var arr = []
            arr = str.split(',')
            var newArr = []
            let totalLat = 0, totalLon = 0
            arr.map((opt, index) => {
              if (index % 2 === 0) {
                newArr.push([Number(opt)])
                totalLon += Number(opt)
              } else {
              let len = newArr.length
                newArr[len - 1].unshift(Number(opt))
                totalLat += Number(opt)
              }
            })
            let polyline = L.polyline(newArr, {color: 'black'})
                polyline.id = 'ryareas'
                polyline.addTo(map);

            const areatextLabel = L.divIcon({
              html: `<span style="color:red;font-size:14px;font-weight:bold;position:absolute;top:-15px;">${item.areatext}</span>`,
            });
            let areaPoint = L.marker([totalLat / newArr.length, totalLon / newArr.length], {icon: areatextLabel})
            areaPoint.id = 'areapoint'
            areaPoint.addTo(map)
          }
          
      }
    } else {
      map.eachLayer(e => { 
        if(e.id === 'ryareas' || e.id === 'areapoint') 
          map.removeLayer(e) 
      })
    }
  }

  async toggleShotpoint() {   //炮点
    this.shotpoint = !this.shotpoint
    let map = window['map']
    if(this.shotpoint) {
      let arr = [0, 1]
      arr.map(isFlow => {
        this.addShotpoint(isFlow)
      })
    } else {
      map.eachLayer(e => { 
        if(e.id === 'shotpointPoint') 
          map.removeLayer(e) 
      })
    }
  }

  async addShotpoint(isFlow) {
    let map = window['map']
    let data = await toolbarClient.getShotpoint(isFlow)
    if(data) {
      let L = window['L']
      const icon = L.icon({
        className: 'shotpointPoint',
        iconUrl: `/static/img/${isFlow === 0 ? 'toolbar_shell_icon.png' : 'toolbar_shell_fixed.png'}`, 
        iconSize: [15, 15],
        iconAnchor: [7.5, 7.5],
      })
      for (let item of data) {
        let marker = L.marker([item.lat,item.lon], { icon: icon })
        marker.id = 'shotpointPoint';
        marker.addTo(map);
      }
    }
  }

  async toggleRadios() {       //电台
    this.radios = !this.radios
    let data = await toolbarClient.getRadios()
    let map = window['map']
    if(this.radios) {
      if(data){
        let L = window['L']
        const icon = L.icon({
          className: 'radiosPoint',
          iconUrl: '/static/img/toolbar_radio.png',
          iconSize: [15, 15],
          iconAnchor: [7.5, 7.5],
        })
        const opts = {
          fillOpacity: 0.3,
          weight: 1,
          color: '#adb7c3', 
          fillColor: '#adb7c3'
        }
        for(let item of data) {
          let marker = L.marker([item.lat,item.lon], { icon: icon })
          marker.id = 'radiosPoint';
          marker.addTo(map)
          let circle = L.circle([item.lat,item.lon], Object.assign({ radius: item.height * 1000 }, opts));
          circle.id = 'raidiosCircle';
          circle.addTo(map);
        }
      }
    } else {
      map.eachLayer(e => {
        if(e.id === 'radiosPoint' || e.id === 'raidiosCircle')
          map.removeLayer(e)
      })
    }
  }
  toggleToolbar(){
    this.hidePop = !this.hidePop
  }
  toggleTransport() {      //自动设备运输状态
    this.transport = !this.transport
    this.storeisTransportOpened_global(this.transport)
  }
  @Watch('isTransportOpened_global')
  onisTransportOpened_globalChanged (val: any, oldVal: any) {
    if (!val) this.transport = false
  }

  
}