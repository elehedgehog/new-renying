import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ZmapTool.html?style=./ZmapTool.scss'

@WithRender
@Component
export default class ZmapTool extends Vue {
  @Getter('systemStore/isLeftNavOpened_global') isLeftNavOpened_global
  lat = null
  lon = null

  mounted() {
    window['map'].on('mousemove', e => {
      this.lat = e.latlng.lat.toFixed(4)
      this.lon = e.latlng.lng.toFixed(4)
    })
  }
}