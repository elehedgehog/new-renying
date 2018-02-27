import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './Measure.html?style=./Measure.scss'

let map, L
let points: any[] = [], polylines: any[] = [], distances: any[] = [], divIcons: any[] = []
let movePolyline: any = null
const icon = window['L'].icon({
  className: 'point',
  iconUrl: '/static/img/measure_circle.png', 
  iconSize: [10, 10],
  iconAnchor: [5, 5],
})

const polylineOpts = {
  color: '#0000FF', 
  weight: 2, 
  dashArray: '4, 5', 
  dashOffset: '2',
}

@WithRender
@Component

export default class Measure extends Vue {  
  @Prop() hidePop
  isMeasureOn: boolean = false
  clickIndex: number = -1

  mounted() {
    map = window['map']
    L = window['L']
  }

  measure() {
    this.isMeasureOn = !this.isMeasureOn
    if (this.isMeasureOn)
      this.startMeasure()
    else
      this.removeMeasure()
  }

  // 开始测量
  startMeasure() {
    ++this.clickIndex
    points.push([])
    polylines.push([])
    distances.push([])
    divIcons.push([])
    map.on('mousemove', this.mouseMoveEvent)
    map.on('click', this.clickEvent)
    map.on('contextmenu', this.contextmenuEvent)
  }

  // 鼠标移动事件
  mouseMoveEvent(e) {
    let text = points[this.clickIndex].length ? '左键点击测量，右键点击结束测量' : '左键点击开始测量'
    let left = e.containerPoint.x + 20, top = e.containerPoint.y + 20
    if (!document.querySelector('#measureTip')) {
      let ele = document.createElement('div')
      ele.id = 'measureTip'
      ele.style.position = 'absolute'
      ele.style.top = top + 'px'
      ele.style.left = left + 'px'
      ele.style.padding = '0 10px'
      ele.style.background = '#fff'
      ele.style.lineHeight = '20px'
      ele.style.fontSize = '12px'
      ele.style.color = '#999'
      ele.style.borderRadius = '4px'
      ele.style.zIndex = '999'
      ele.innerHTML = text
      document.body.appendChild(ele)
    } else {
      let ele: HTMLElement = <HTMLElement>document.querySelector('#measureTip')
      ele.style.top = top + 'px'
      ele.style.left = left + 'px'
      ele.innerHTML = text
    }
    if (points[this.clickIndex].length) {
      if (movePolyline) map.removeLayer(movePolyline)
      let lastPoint = points[this.clickIndex][points[this.clickIndex].length - 1]
      let lat = e.latlng.lat, lng = e.latlng.lng
      let lastPointLatLng = lastPoint.getLatLng()
      movePolyline = L.polyline([[lastPointLatLng.lat, lastPointLatLng.lng], [lat, lng]], polylineOpts)
      movePolyline.addTo(map)
    }
  }

  // 左键点击事件
  clickEvent(e) {
    if (!points[this.clickIndex].length) {        // 第一个点
      this.addPoint(e)
    } else {
      let lastPoint = points[this.clickIndex][points[this.clickIndex].length - 1]
      let point = this.addPoint(e)
      this.addPolylineLabel(lastPoint, point)
    }
  }

  // 右键点击事件
  contextmenuEvent(e) {
    if (!points[this.clickIndex].length) return
    map.off('click', this.clickEvent)
    map.off('mousemove', this.mouseMoveEvent)
    let ele = document.querySelector('#measureTip')
    if (ele) document.body.removeChild(ele)
      
    let lastPoint = points[this.clickIndex][points[this.clickIndex].length - 1]
    let lastPointLatLng = lastPoint.getLatLng()

    // 距离总计
    if (points[this.clickIndex].length > 2) {
      const opts = L.divIcon({
        className: 'lastDivIcon',
        html: `<div class="lastDivIcon" style="position:absolute;padding:6px"><span style="display: inline-block; white-space: nowrap;">总计：${eval(distances[this.clickIndex].join('+')).toFixed(2)}公里</span></div>`
      });
      let divIcon = L.marker([lastPointLatLng.lat, lastPointLatLng.lng], { icon: opts })
      divIcon.id = 'lastDivIcon'
      divIcon.addTo(map)
    }

    if (movePolyline) {
      map.removeLayer(movePolyline)
      movePolyline = null
    }

    map.off('contextmenu', this.contextmenuEvent)
    this.isMeasureOn = false

    // setTimeout(() => {
    //   this.startMeasure()
    // }, 0)
  }

  // 添加点
  addPoint(e) {
    let marker = L.marker([e.latlng.lat, e.latlng.lng], { icon })
    points[this.clickIndex].push(marker)
    marker.id = 'measurePoint'
    marker.addTo(map)
    return marker
  }

  // 添加连线 距离div
  addPolylineLabel(lastPoint, point) {
    // polyline
    let lastPointLatLng = lastPoint.getLatLng(),
        pointLatLng = point.getLatLng()
    let polyline = L.polyline([[lastPointLatLng.lat, lastPointLatLng.lng], [pointLatLng.lat, pointLatLng.lng]], polylineOpts)
    polyline.id = 'measurePolyline'
    polyline.addTo(map)
    polylines[this.clickIndex].push(polyline)
    // label
    let centerPoint = [(lastPointLatLng.lat + pointLatLng.lat) / 2, (lastPointLatLng.lng + pointLatLng.lng) / 2]
    let distance = L.latLng(lastPointLatLng.lat, lastPointLatLng.lng).distanceTo([pointLatLng.lat, pointLatLng.lng])
    distance = (distance / 1000).toFixed(2)
    distances[this.clickIndex].push(distance)
    const opts = L.divIcon({
      className: 'divIcon',
      html: `<div class="distanceIcon" style="position:absolute;padding:6px"><span style="display: inline-block; white-space: nowrap;">${distance}公里</span></div>`
    });
    let divIcon = L.marker(centerPoint, { icon: opts })
    divIcon.id = 'measureDivIcon'
    divIcon.addTo(map)
    divIcons[this.clickIndex].push(divIcon)
  }

  // 移除测量数据
  removeMeasure() {
    this.isMeasureOn = false
    this.clickIndex = -1
    map.off('click', this.clickEvent)
    map.off('contextmenu', this.contextmenuEvent)
    map.off('mousemove', this.mouseMoveEvent)
    let ele = document.querySelector('#measureTip')
    if (ele) document.body.removeChild(ele)
    if (movePolyline) {
      map.removeLayer(movePolyline)
      movePolyline = null
    }
    if (!points.length) return
    map.eachLayer(e => {
      if (e.id === 'measurePoint' || e.id === 'measurePolyline' || e.id === 'measureDivIcon' || e.id === 'lastDivIcon')
        map.removeLayer(e)
    })
    points = [], polylines = [], distances = [], divIcons = []
  }
}