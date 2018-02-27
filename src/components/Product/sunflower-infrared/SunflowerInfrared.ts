import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './SunflowerInfrared.html?style=./SunflowerInfrared.scss'
import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import SelectToggle from '../../commons/select-toggle/SelectToggle'

@WithRender

@Component({
  components: {
    SelectToggle
  }
})
export default class SunflowerInfrared extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  minify: boolean = false
  moment: any = moment
  productId: string = CONFIG.sunflower
  imgUrl: string = ''
  timeRange: any[] = [moment().subtract(24, 'hours'), moment().subtract(1, 'hours')]   //初始化两小时前到一小时前
  dateRange: any[] = [0, 0]
  firstDate: string = moment().subtract(4, 'days').format('YYYY/MM/DD 00:00:00')
  totalRangeNum: number = 0                     // 格子个数
  productSelected: string = 'inf_bw'            //产品类型
  areaSelected: string = 'SouthChina'       //区域
  unitSelected: number = 1           //
  productTime: Date = null           //当前选中格子时间
  timeIndexSelected: number = 1       //当前选中格子下标
  productOpt = {
    inf_bw: '红外灰度图',
    inf_col: '红外彩图',
    vap_bw: '水汽灰度图',
    vis_3ch: '可见光3通道彩图',
    vis_col: '可见光彩图',
    vis_bw: '可见光灰度图',
  }
  intervalHolder: any = null
  loading: boolean = false
  unitData: any = []
  areaList: any = { SouthChina: '华南', GuangDong: '广东' }

  mounted() {
    this.initTimeRanger()
    for (let i = 1; i <= 5; i++) {
      this.unitData.push(i)
    }
  }

  beforeDestroy() {
    if (this.intervalHolder)
      clearInterval(this.intervalHolder)
  }

  async initTimeRanger() {
    let t = await this.getLatestHour()
    let nextTime = new Date(t).getTime()
    let prevTime = nextTime - 24 * 60 * 60 * 1000
    this.timeRange = [new Date(prevTime), new Date(nextTime)]
    let tomorrow = moment().add(1, 'days').format('YYYY/MM/DD 00:00:00')
    let hour = (new Date(tomorrow).getTime() - new Date(nextTime).getTime()) / (60 * 60 * 1000)
    this.dateRange = [96 - hour, 120 - hour]
    this.timeChanged()
  }

  changeUrl(area, product, time) {
    let url = `http://10.148.16.217:11160/renyin5/satelite/img/hm8?area=${area}&product=${product}&time=${time}`

    console.log(url)
    this.loading = true
    let img = new Image()
    img.onload = () => {
      this.loading = false
      this.imgUrl = url
    }
    img.onerror = () => {
      this.loading = false
      this.imgUrl = 'static/img/nopic.png'
    }
    img.src = url
  }
  //获取最新时间
  async getLatestHour() {
    let latestHourUrl = 'http://10.148.16.217:11160/renyin5/satelite/hm8/latest'
    let res = await axios({
      adapter: jsonp,
      url: latestHourUrl,
      params: {
        area: this.areaSelected,
        product: this.productSelected,
      }
    })
    if (res.data.stateCode === 0) {
      let latestHour = res.data.data.datetime
      return moment(latestHour).format("YYYY-MM-DD HH:00:00")
    }
  }

  @Watch('productSelected')
  async onProductSelectedChange(val, oldVal) {
    await this.initTimeRanger()
    this.changeUrl(this.areaSelected, val, moment(this.productTime).format('YYYY-MM-DD HH:mm:00'))
  }
  @Watch('areaSelected')
  onareaSelectedChanged(val: any, oldVal: any) {
    this.changeUrl(val, this.productSelected, moment(this.productTime).format('YYYY-MM-DD HH:mm:00'))
  }

  // 更改时间范围
  timeChanged() {
    let prog = <HTMLDivElement>this.$refs.progress
    let inner = <HTMLDivElement>this.$refs.progressInner
    this.$nextTick(() => {
      prog.scrollTop = inner.offsetHeight
    })
    this.productTime = new Date(this.timeRange[1] - this.timeRange[1] % (10 * 60 * 1000))
    this.changeUrl(this.areaSelected, this.productSelected, moment(this.productTime).format('YYYY-MM-DD HH:mm:00'))
    this.totalRangeNum = (new Date(this.timeRange[1] - this.timeRange[1] % (10 * 60 * 1000)).getTime() - new Date(this.timeRange[0] - this.timeRange[0] % (10 * 60 * 1000)).getTime()) / (10 * 60 * 1000) + 1
    this.timeIndexSelected = this.totalRangeNum
  }

  toggleProTime(index) {
    this.timeIndexSelected = index
    let time: any = moment(new Date(this.timeRange[0] - this.timeRange[0] % (10 * 60 * 1000))).add((index - 1) * 10, 'minutes')
    this.productTime = new Date(time)
    this.changeUrl(this.areaSelected, this.productSelected, moment(this.productTime).format('YYYY-MM-DD HH:mm:00'))
  }


  goBack() {
    if (this.timeIndexSelected === 1) {
      this.timeIndexSelected = this.totalRangeNum + 1
      let prog = <HTMLDivElement>this.$refs.progress
      let inner = <HTMLDivElement>this.$refs.progressInner
      prog.scrollTop = inner.offsetHeight
    }
    this.timeIndexSelected--
    let time: any = moment(this.productTime).subtract(10, 'minutes')
    this.productTime = new Date(time)
    this.changeUrl(this.areaSelected, this.productSelected, moment(this.productTime).format('YYYY-MM-DD HH:mm:00'))
    if (this.intervalHolder) this.play()
  }

  goNext() {
    if (this.timeIndexSelected === this.totalRangeNum) {
      this.timeIndexSelected = 0;
      let prog = <HTMLDivElement>this.$refs.progress
      prog.scrollTop = 0
    }
    this.timeIndexSelected++
    let time: any = moment(this.productTime).add(10, 'minutes')
    this.productTime = new Date(time)
    this.changeUrl(this.areaSelected, this.productSelected, moment(this.productTime).format('YYYY-MM-DD HH:mm:00'))
    if (this.intervalHolder) this.play()
  }

  @Watch('unitSelected')
  onunitSelectedchanged(val, oldVal) {
    if (this.intervalHolder) {
      this.play()
      setTimeout(this.play, 0)
    }
  }
  unitSelectedChange(val) {
    this.unitSelected = val
  }

  play() {
    if (!this.intervalHolder) {
      this.intervalHolder = setInterval(() => {
        let prog = <HTMLDivElement>this.$refs.progress
        if (this.timeIndexSelected === this.totalRangeNum) {
          prog.scrollTop = 0
          this.timeIndexSelected = 1
          this.productTime = new Date(this.timeRange[0] - this.timeRange[0] % (10 * 60 * 1000))
        } else {
          let remainder = this.timeIndexSelected / 30
          if (remainder % 1 === 0) {
            let inner = <HTMLDivElement>this.$refs.progressInner
            prog.scrollTop = inner.offsetHeight
            let innerHeight = prog.scrollTop
            prog.scrollTop = innerHeight / (this.totalRangeNum - 31) * 30 * remainder
          }
          this.timeIndexSelected++
          this.productTime = new Date(new Date(this.productTime).getTime() + 10*60*1000)
        }
        this.changeUrl(this.areaSelected, this.productSelected, moment(this.productTime).format('YYYY-MM-DD HH:mm:00'))
      }, 1000 / this.unitSelected)
    } else {
      clearInterval(this.intervalHolder)
      this.intervalHolder = null
    }
  }

  formatTooltip(key) {
    let time = moment(this.firstDate).add(key, 'hours').format('YYYY-MM-DD HH时')
    return time
  }

  dateChanged() {
    let prevDate = moment(this.firstDate).add(this.dateRange[0], 'hours')
    let nextDate = moment(this.firstDate).add(this.dateRange[1], 'hours')
    this.timeRange = [prevDate, nextDate]
    this.timeChanged()
  }

  goPrevDate() {
    let prevDate = moment(this.timeRange[0]).subtract(1, 'days')
    let nextDate = moment(this.timeRange[1]).subtract(1, 'days')
    this.timeRange = [prevDate, nextDate]
    this.timeChanged()
    this.firstDate = moment(this.firstDate).subtract(1, 'days').format('YYYY/MM/DD 00:00:00')
  }

  goNextDate() {
    let tomorrow = moment().add(1, 'days').format('YYYY/MM/DD 00:00:00')
    let nextDate: any = moment(this.timeRange[1]).add(1, 'days')
    if (new Date(nextDate).getTime() > new Date(tomorrow).getTime()) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '时间不能超过当前天'
      })
    } else {
      let prevDate = moment(this.timeRange[0]).add(1, 'days')
      this.timeRange = [prevDate, nextDate]
      this.timeChanged()
      this.firstDate = moment(this.firstDate).add(1, 'days').format('YYYY/MM/DD 00:00:00')
    }
  }
}