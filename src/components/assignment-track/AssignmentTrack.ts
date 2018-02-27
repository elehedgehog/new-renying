import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AssignmentTrack.html?style=./AssignmentTrack.scss'

import axios from 'axios'
import jsonp from 'axios-jsonp'
import { Message } from 'element-ui'

@WithRender
@Component
export default class AssignmentTrack extends Vue {
  @Getter('systemStore/socketCurrentMessage_global') socketCurrentMessage_global
  @Getter('systemStore/isLeftNavOpened_global') isLeftNavOpened_global
  @Getter('systemStore/freshOperate_global') freshOperate_global

  assignmentPop: boolean = false
  reqUrl: string = 'http://10.148.16.217:11160/renyin5/fp/exists'
  changeStageUrl: string = 'http://10.148.16.217:11160/renyin5/fp/stage/update'
  getOperatorStateUrl: string = 'http://10.148.16.217:11160/renyin5/fp/exists/reply/records'
  operatorData: any[] = []
  operateData: any[] = []
  operateSelected: any = {
    stage: null,
    wos: {}
  }

  async created() {
    await this.getOperatorData()
    this.getOperateData()
  }

  async getOperateData() {
    this.operateData = []
    let res = await axios({
      url: this.reqUrl,
      params: {
        type: 'rk'
      }
    })
    let arr = []
    for (let item of res.data.data) {
      let state = '未回复'
      for (let subItem of this.operatorData) {
        if (subItem.fpId === item.fpId) {
          state = subItem.state
          break
        }
      }
      arr.push(Object.assign(item, { type: 'rk', state: getState(state, item.stage) }))
    }
    this.operateData = this.operateData.concat(arr)
    res = await axios({
      url: this.reqUrl,
      params: {
        type: 'pl'
      }
    })
    arr = []
    for (let item of res.data.data) {
      // for (let subItem of this.operatorData) {
      //   if (subItem.fpId === item.fpId) {
      arr.push(Object.assign(item,
        { type: 'pl'/* , state: getState(subItem.state, item.stage)  */ }))
      // break
      //   }
      // }
    }
    this.operateData = this.operateData.concat(arr)

    function getState(text, stage) {
      switch (text) {
        case null: return '未回复'
        case 0: return stage === 4 ? '不作业' : '不响应'
        case 1: return stage === 4 ? '作业' : '响应'
        default: return '等待'
      }
    }
  }

  async changeStage(type: 'next' | 'stop' | 'previous') {
    let params = {
      osId: this.operateSelected.wos.id,
      type: this.operateSelected.type,
      stage: 0
    }
    if (type === 'previous') {
      params.stage = this.operateSelected.stage - 1
    } else if (type === 'next') {
      params.stage = this.operateSelected.stage + 1
    } else {
      params.stage = 6
    }
    

    let res = await axios({
      url: this.changeStageUrl,
      params
    })
    if (res.data.stateCode === 0) {
      Message({
        type: 'success',
        message: '成功更新'
      })
    } else {
      Message({
        type: 'error',
        message: '更新失败'
      })
    }
    await this.getOperateData()
    this.reselectedOperate()
  }

  @Watch('freshOperate_global')
  async  freshOperate_globalChanged(val: any, oldVal: any) {
    await this.getOperatorData()
    await this.getOperateData()
    this.reselectedOperate()
  }

  @Watch('socketCurrentMessage_global')
  async socketCurrentMessage_globalChanged(val: any, oldVal: any) {
    await this.getOperatorData()
    await this.getOperateData()
    this.reselectedOperate()
  }

  reselectedOperate() {
    if (this.operateSelected.stage !== null && this.operateData.length > 0) {
      for (let item of this.operateData) {
        if (item.wos.id === this.operateSelected.wos.id) {
          this.operateSelected = item
        }
      }
    } else {
      this.operateSelected = {
        stage: null
      }
    }
  }

  async getOperatorData() {
    let res = await axios({
      url: this.getOperatorStateUrl
    })
    this.operatorData = res.data.data
  }
}