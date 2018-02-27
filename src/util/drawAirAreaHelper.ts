export default class {
  constructor(L: any, map: any) {
    this.L = L
    this.map = map
  }
  private L: any
  private map: any

  public affects: Array<number>[] = []
  private affectMarker: any[] = []
  private affectPolygon: any
  public isFinishDarwAffect: boolean = false

  private comparePointLatlng: number[] = []
  public compares: number[][] = []
  private compareMarker: any[] = []
  private comparePolygon: any
  public isFinishDarwCompare: boolean = false

  private iconStyle = {
    iconUrl: 'static/img/plane_point.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  }

  public startDrawAffectArea() {
    let map = this.map
    map.on('click', this.mapClickEvent)
    map.on('mousemove', this.mapMousemoveEvent)
    map.on('contextmenu', this.mapContextmenuEvent)
  }

  private mapClickEvent = e => {
    let L = this.L, map = this.map
    let latlng: number[] = [e.latlng.lat, e.latlng.lng]
    let marker = L.marker(latlng, {
      icon: L.icon(this.iconStyle)
    })
    marker.addTo(map)
    this.affects.push(latlng)
    this.affectMarker.push(marker)
    if (this.affects.length > 2) {
      if (this.affectPolygon) map.removeLayer(this.affectPolygon)
      this.affectPolygon = L.polygon(this.affects, {
        color: '#0ccaf5',
        weight: 2,
        fillColor: '#0ccaf5',
        fillOpacity: 0.2
      })
      this.affectPolygon.addTo(map)
    }
  }

  private mapMousemoveEvent = e => {
    let text = '左键点击绘制影响区域, 右键结束绘制'
    let left = e.containerPoint.x + 10, top = e.containerPoint.y + 10
    if (!document.querySelector('#airlineTip')) {
      let ele = document.createElement('div')
      ele.id = 'airlineTip'
      ele.style.position = 'absolute'
      ele.style.top = top + 'px'
      ele.style.left = left + 'px'
      ele.style.minWidth = text.length * 12 + 'px'
      ele.style.padding = '0 10px'
      ele.style.background = '#fff'
      ele.style.lineHeight = '22px'
      ele.style.textAlign = 'center'
      ele.style.fontSize = '12px'
      ele.style.color = '#999'
      ele.style.borderRadius = '4px'
      ele.style.zIndex = '999'
      ele.innerHTML = text
      document.body.appendChild(ele)
    } else {
      let ele: HTMLElement = <HTMLElement>document.querySelector('#airlineTip')
      ele.style.top = top + 'px'
      ele.style.left = left + 'px'
      ele.innerHTML = text
    }
  }

  private mapContextmenuEvent = e => {
    let map = this.map
    map.off('click', this.mapClickEvent)
    map.off('mousemove', this.mapMousemoveEvent)
    let ele = document.querySelector('#airlineTip')
    if (ele) document.body.removeChild(ele)
    this.isFinishDarwAffect = true
  }

  public startDrawCompareArea() {
    if (!this.affectPolygon) return
    this.affectPolygon.once('click', this.polygonClickEvent)
  }

  private polygonClickEvent = e => {
    let map = this.map
    this.comparePointLatlng = [e.latlng.lat, e.latlng.lng]
    map.on('mousemove', this.compareMousemoveEvent)
    map.on('click', this.mapCompClickEvent)
  }

  private compareMousemoveEvent = e => {
    let map = this.map, L = this.L
    let diffLat = e.latlng.lat - this.comparePointLatlng[0]
    let diffLon = e.latlng.lng - this.comparePointLatlng[1]
    if (this.comparePolygon) map.removeLayer(this.comparePolygon)
    if (this.compareMarker.length) {
      for (let el of this.compareMarker) map.removeLayer(el)
      this.compareMarker = []
    }
    this.compares = []
    let arr: number[][] = []
    for (let el of this.affects) {
      let latlng = [el[0] + diffLat, el[1] + diffLon]
      let marker = L.marker(latlng, {
        icon: L.icon(this.iconStyle)
      })
      marker.addTo(map)
      this.compareMarker.push(marker)
      this.compares.push(latlng)
      arr.push(latlng)
    }
    this.comparePolygon = L.polygon(arr, {
      color: '#12A7CB',
      weight: 2,
      fillColor: 'violet',
      fillOpacity: 0.2
    })  
    this.comparePolygon.addTo(map)
  }

  private mapCompClickEvent = e => {
    let map = this.map
    map.off('mousemove', this.compareMousemoveEvent)
    this.isFinishDarwCompare = true
  }

  public clearArea() {
    let map = this.map
    map.off('click', this.mapClickEvent)
    map.off('mousemove', this.mapMousemoveEvent)
    map.off('contextmenu', this.mapContextmenuEvent)
    map.off('mousemove', this.compareMousemoveEvent)
    map.off('click', this.mapCompClickEvent)
    if (this.affectMarker.length) {
      for (let el of this.affectMarker) map.removeLayer(el)
      this.affectMarker = []
    }
    if (this.affectPolygon) {
      this.affectPolygon.off('click', this.polygonClickEvent)
      map.removeLayer(this.affectPolygon)
      this.affectPolygon = null
    }
    if (this.compareMarker.length) {
      for (let el of this.compareMarker) map.removeLayer(el)
      this.compareMarker = []
    }
    if (this.comparePolygon) {
      map.removeLayer(this.comparePolygon)
      this.comparePolygon = null
    }
    let ele = document.querySelector('#airlineTip')
    if (ele) document.body.removeChild(ele)
  }
}