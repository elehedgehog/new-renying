import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AircraftCommand.html?style=./AircraftCommand.scss'
import * as CONFIG from '../../../config/productId'

@WithRender
@Component
export default class AircraftCommand extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  productId: string = CONFIG.aircraftCommand
  switchSelected: boolean = false
  
  toggleSwitch(){
    this.switchSelected = !this.switchSelected
  }
}