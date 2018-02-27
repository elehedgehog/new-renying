import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './WpradarPopup.html?style=./WpradarPopup.scss'

@WithRender
@Component
export default class WpradarPopup extends Vue {
  dataType: string = null
  imgType: string = null
  time: string = null
  toggleDataType(key) {
    this.dataType = key
  }
  toggleImgType(key) {
    this.imgType = key
  }
  toggleTime(key) {
    this.time = key
  }
  

}