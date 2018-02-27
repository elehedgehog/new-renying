import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './MountainFlood.html?style=./MountainFlood.scss'
import * as CONFIG from '../../../config/productId'
import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'
import { getVelLevel } from '../../../util/windHelper'

import WindRadarDrawer from '../../../util/windRadarUtil'

let markerCollection = [],
  L = window['L'],
  monthDataHolder: any = null;

@WithRender
@Component
export default class MountainFlood extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global

  loading = false
  imgError = false;
  imgErrorSrc = '/static/img/nopic.png';
  productId = CONFIG.mountainFlood
  date: any = Date.now()
  reqUrl: string = 'http://10.148.16.217:11160/renyin5/warn/img/moun/city'
  imgUrl: string = ''

  option = {
    disabledDate(time) {
      const momentHolder = moment(time);
      const month = momentHolder.format('YYYYMM').substr(0, 6);
      if (!monthDataHolder[month]) {
        return true;
      }
      for (const item of monthDataHolder[month]) {
        const img = item.replace('zhTV', '').replace('.jpg', '');
        if (img === momentHolder.format('YYYYMMDD')) {
          return false;
        }
      }
      return true;
    },
  }

  async created() {
    this.getImg()
    let momentHolder = moment(this.date)
    if (Number(momentHolder.format('HH')) < 20) {
      this.date = Number(momentHolder.subtract(1, 'days').format('x'))
    }
    if (!monthDataHolder) {
      monthDataHolder = {};
      this.loading = true;
      await this.computeMonthData();
      this.loading = false;
    }
  }

  async computeMonthData() {
    const dateArr = {};
    for (let year = moment().year() - 2; year <= moment().year(); year++) {
      for (let month = 1; month <= 12; month++) {
        dateArr[year + String(month < 10 ? '0' + month : month)] = [];
      }
    }
    for (const key in dateArr) {
      const momentHolder = moment(new Date(key));
      const monthDataHolderName = momentHolder.format('YYYYMM').substr(0, 6);
      if (!monthDataHolder[monthDataHolderName]) {
        monthDataHolder[monthDataHolderName] = await getMonthImg(monthDataHolderName);
      }
    }
    async function getMonthImg(string) {
      const src = 'http://10.148.16.217:11160/renyin5/warn/img/moun/city/month';
      const res = await axios.get(src, {
        params: {
          month: string
        }
      });
      return res.data.data;
    }
  }


  async getImg() {
    let src = 'http://10.148.16.217:11160/renyin5/warn/img/moun/city' +
      `?time=${moment(this.date).format('YYYY-MM-DD')} 00:00:00`
    this.imgUrl = src
    const img = document.createElement('img');
    img.src = src;
    img.onload = () => {
      this.imgError = false;
    }
    img.onerror = () => {
      this.imgError = true;
    }
  }

  dateRange(time) {
    console.log(time);
    console.log('dateRange');
    return false;
  }

  @Watch('date')
  dateChanged(val: any, oldVal: any): void {
    this.getImg()
  }
}