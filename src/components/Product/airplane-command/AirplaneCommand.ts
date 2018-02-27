import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AirplaneCommand.html?style=./AirplaneCommand.scss'
import NewTrajectory from './new-trajectory/NewTrajectory'
import HistoryTrajectory from './history-trajectory/HistoryTrajectory'
import { airplaneCommand } from '../../../config/productId'
import * as moment from 'moment'
import SelectToggle from '../../commons/select-toggle/SelectToggle'

let map, L

@WithRender
@Component({
  components: {
    SelectToggle
  }
})
export default class AirplaneCommand extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  designSelected: string = 'new'
  currentView: any = NewTrajectory
  productId = airplaneCommand
  oldTrajectoryData = null

  selectOldTrajectory(data){
    this.oldTrajectoryData = data 
    this.currentView = NewTrajectory
    this.designSelected = 'new'
  }

  clearHistoryData(){
    this.oldTrajectoryData = null
  }

  toggleDesign(key) {
    if (key === this.designSelected) return
    this.designSelected = key
    this.currentView = key === 'new' ? NewTrajectory : HistoryTrajectory
  }

  
}