import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './CappiProfile.html?style=./CappiProfile.scss'
import * as moment from 'moment'

@WithRender
@Component
export default class CappiProfile extends Vue {
  @Getter('systemStore/cappiProfile_global') cappiProfile_global: any
  @Action('systemStore/storeisCappiProfileOn_global') storeisCappiProfileOn_global

  date: Date = new Date()
  hour: number = new Date().getHours()
  minute: number = 0
  imageUrl: string = ''
  isGetImage: boolean = true
  loading: boolean = false

  created() {
    let date = Date.now() - Date.now() % (6*60*1000) - (12*60*1000)
    this.date = new Date(date)
    this.hour = new Date(date).getHours()
    this.minute = new Date(date).getMinutes()
    this.getImageUrl()
  }

  getImageUrl() {
    let hour = this.hour >= 10 ?  this.hour : '0' + this.hour
    let minute = this.minute >= 10 ?  this.minute : '0' + this.minute
    let date = moment(this.date).format('YYYY-MM-DD') + ' ' + hour + ':' + minute + ':00'
    let SLat = this.cappiProfile_global.SLat,
        SLon = this.cappiProfile_global.SLon,
        ELat = this.cappiProfile_global.ELat,
        ELon = this.cappiProfile_global.ELon
    this.imageUrl = `http://10.148.83.228:9002/nc/jsonp/bin/contour/cut?modelName=cappi&datetime=${date}&varname=cappi&lon1=${SLon}&lat1=${SLat}&lon2=${ELon}&lat2=${ELat}&width=740&height=420&type=0&callback=cache`
    this.loading = true
    let image = new Image()
    image.onload = () => {
      this.isGetImage = true
      this.loading = false
    }
    image.onerror = () => {
      this.isGetImage = false
      this.loading = false
    }
    image.src = this.imageUrl
  }

  @Watch('date')
  onDateChanged(val: any, oldVal: any) {
    this.getImageUrl()
  }

  @Watch('hour')
  onHourChanged(val: any, oldVal: any) {
    this.getImageUrl()
  }

  @Watch('minute')
  onMinuteChanged(val: any, oldVal: any) {
    this.getImageUrl()
  }
}