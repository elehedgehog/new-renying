import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './Zmap.html?style=./Zmap.scss'

@WithRender
@Component
export default class Zmap extends Vue {
  mapOptions: any = {
    subdomains: [1, 2, 3],
    maxZoom: 17,
    minZoom: 3
  }

  mounted() {
    let L: any = window['L']
    this.setContainer()
    window.onresize = this.setContainer
    let map = L.map('Zmap', { crs: L.CRS.EPSG900913, attributionControl: false, zoomControl: false }).setView([23, 113], 7)
    window['map'] = map
    let terLayer = new L.tileLayer("http://119.29.102.103:8097/vt/lyrs=p&x={x}&y={y}&z={z}", this.mapOptions)
    window['terLayer'] = terLayer
    terLayer.addTo(map)
    window['satLayer'] = new L.tileLayer("http://119.29.102.103:8097/vt/lyrs=y&x={x}&y={y}&z={z}", this.mapOptions)
    window['business'] = new L.tileLayer("http://119.29.102.103:8097/vt/lyrs=m&x={x}&y={y}&z={z}", this.mapOptions)
    window["windRenderer"] = L.svg()
    window["windRenderer"].addTo(map)
  }

  setContainer() {
    let w = window.innerWidth,
        h = window.innerHeight
    document.getElementById('Zmap').style.width = w + 'px'
    document.getElementById('Zmap').style.height = h + 'px'
  }
}