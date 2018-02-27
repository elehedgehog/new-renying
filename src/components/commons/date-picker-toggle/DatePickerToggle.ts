import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './DatePickerToggle.html?style=./DatePickerToggle.scss'

import * as moment from 'moment'

@WithRender
@Component
export default class DatePickerToggle extends Vue {
  @Prop({ default: 168 }) width
  @Prop({ default: 30 }) height
  @Prop({ default: '#f0f1f4' }) backgroundColor
  @Prop() preSelectedDateTime
  @Prop() selectionChange: Function

  dateSelected = Date.now()
  classBinding: string = ''

  created() {
    if (this.preSelectedDateTime) {
      this.dateSelected = this.preSelectedDateTime
    }
  }

  @Watch('dateSelected')
  dateSelectedChanged(val: any, oldVal: any): void {
    this.selectionChange(this.dateSelected)
  }

  upward() {
    this.dateSelected = Number(moment(this.dateSelected).add(1, 'days').format('x'))
  }

  downward() {
    this.dateSelected = Number(moment(this.dateSelected).subtract(1, 'days').format('x'))
  }
}



