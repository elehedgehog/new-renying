import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './DisasterManageImg.html?style=./DisasterManageImg.scss'
import * as moment from 'moment'

@WithRender
@Component
export default class DisasterManageImg extends Vue {
  moment = moment
  @Getter('systemStore/disasterMsg_global') disasterMsg_global
  @Action('systemStore/storeDisasterManageImg_global') storeDisasterManageImg_global
  imgMsg: any = {
    disasterName: '名称',
    uploadTime: '时间',
    uploader: '上传人',
    disasterAddress: '地点',
    content: '描述'
  }
  imgSrc: string = ''
  url = 'http://10.148.16.217:11160/renyin5/disaster'
  mounted() {
    this.imgSrc = this.url + this.disasterMsg_global.image1
  }
  closeDisasterMsg(){
    this.storeDisasterManageImg_global()
  }
  changeImg(src){
    this.imgSrc = src
  }
}