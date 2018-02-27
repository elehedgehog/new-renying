import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './SearchJobpoint.html?style=./SearchJobpoint.scss'

@WithRender
@Component
export default class SearchJobpoint extends Vue {
  @Getter('systemStore/operateStationData_global') operateStationData_global

  value = null;
  operateStationData = [];
  timeoutHolder = null;
  stationsSelected: any = {}

  destroyed() {
    this.removeAllLayer()
  }

  @Watch('value')
  search() {
    this.operateStationData = [];
    this.removeAllLayer()
    if (this.value.length === 0 || !this.value) {
      return;
    }
    this.operateStationData_global.forEach(item => {
      if ((typeof item.town === 'string' && item.town.includes(this.value)) ||
        (typeof item.airport === 'string' && item.airport.includes(this.value)) ||
        (typeof item.city === 'string' && item.city.includes(this.value)) ||
        (typeof item.address === 'string' && item.address.includes(this.value))) {
        this.operateStationData.push(item)
      }
    })
    if (this.operateStationData.length > 10) {
      this.operateStationData = this.operateStationData.slice(0, 10);
      this.operateStationData.push({
        city: '....',
        address: '....'
      });
    }
  }

  removeAllLayer() {
    for (let i in this.stationsSelected) {
      window['map'].removeLayer(this.stationsSelected[i])
    }
  }

  isSelected(id) {
    return this.stationsSelected[id] ? true : false
  }

  selectStation(id, index) {
    console.log(id);
    if (this.stationsSelected[id]) {
      window['map'].removeLayer(this.stationsSelected[id])
      delete this.stationsSelected[id]
    } else {
      const item = {
        lat: this.operateStationData[index].lat,
        lon: this.operateStationData[index].lon
      }
      this.stationsSelected[id] = window['L'].marker([item.lat, item.lon], {
        icon: window['L'].icon({
          className: 'shotpointPoint',
          iconUrl: '/static/img/toolbar_shell_icon.png',
          iconSize: [15, 15],
          iconAnchor: [7.5, 7.5],
        })
      })
      window['map'].addLayer(this.stationsSelected[id])
      window['map'].panTo([item.lat, item.lon])
    }
  }
}