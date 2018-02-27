import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './OrderDispatch.html?style=./OrderDispatch.scss'
import * as CONFIG from '../../../config/productId'
@WithRender
@Component
export default class OrderDispatch extends Vue {
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  @Getter('systemStore/userInfo_global') userInfo_global
  @Getter('systemStore/appUserData_global') appUserData_global
  @Getter('systemStore/appGroupData_global') appGroupData_global
  @Getter('systemStore/operateStationData_global') operateStationData_global

  productId: string = CONFIG.orderDispatch

  msgSelected: string = 'new'
  listType: 'group' | 'station' = 'group'
  subject: string = ''
  groups: any = []   //分组列表
  selectedPeople: any = {}
  addresseeList: any = ''  //收信人
  msgContent: string = ''  // 短信内容
  keyString: string = ''  //搜索
  searchList = []      //搜索列表
  groupOptionData = []
  groupOptionDataHolder = []
  stationOptionData = []
  stationOptionDataHolder = []
  sendTarget = []
  timeoutHolder = null
  addressee: any = []
  sendInfo: any[] = []

  mounted(){
   
  }
  created() {
    if (this.appGroupData_global.length > 0) {
      this.listType === 'group' ? this.computeGroupOptionData() : this.computeStationData()
    }
  }

  computeStationData() {
    this.stationOptionDataHolder = []
    for (let item of this.operateStationData_global) {
      if (item.appUser) {
        let temp = Object.assign({}, item)
        this.stationOptionDataHolder.push({
          name: `编号:${item.opId} 指挥员:${item.appUser ? item.appUser.name : ''}`,
          phone: item.appUser ? item.appUser.phone : null,
          id: item.appUser ? item.appUser.id : null,
          username: item.appUser ? item.appUser.name : null,
          isToggle: false
        })
      }
    }
    this.stationOptionData = Object.assign(this.stationOptionDataHolder, {})
  }

  computeGroupOptionData() {
    this.groupOptionDataHolder = []
    for (let item of this.appGroupData_global) {
      let temp = Object.assign(item, {})
      temp.isSelected = false
      temp.isToggle = false
      for (let subItem of temp.appUsers) {
        subItem.isSelected = false
        subItem.isToggle = false
      }
      this.groupOptionDataHolder.push(temp)
    }
    this.groupOptionData = Object.assign({}, this.groupOptionDataHolder)
  }

  @Watch('appGroupData_global')
  appGroupData_globalChanged(val: any, oldVal: any): void {
    this.computeGroupOptionData()
  }

  @Watch('operateStationData_global')
  operateStationData_globalChanged(val: any, oldVal: any): void {
    this.computeGroupOptionData()
  }

  @Watch('listType')
  listTypeChanged(val: any, oldVal: any): void {
    this.computeGroupOptionData()
    this.computeStationData()
  }

  @Watch('keyString')
  onkeyStringChanged(val: any, oldVal: any) {
    if (this.timeoutHolder)
      clearTimeout(this.timeoutHolder)
    this.timeoutHolder = setTimeout(() => {
      let holder = []
      if (this.listType === 'group') {
        if (val.length == 0)
          this.groupOptionData = Object.assign({}, this.groupOptionDataHolder)
        else {
          for (let item of this.groupOptionDataHolder) {
            if (item.groupname && item.groupname.includes(val)) {
              holder.push(item)
            } else {
              let temp = Object.assign({}, item)
              temp.appUsers = []
              for (let user of item.appUsers) {
                if (user.name !== null && user.name.includes(val))
                  temp.appUsers.push(user)
              }
              if (temp.appUsers.length !== 0)
                holder.push(temp)
            }
          }
          this.groupOptionData = holder
        }
      } else {
        if (val.length == 0)
          this.stationOptionData = Object.assign({}, this.stationOptionDataHolder)
        else {
          let holder = []
          for (let item of this.stationOptionDataHolder) {
            if (item.name.includes(val))
              holder.push(item)
          }
          this.stationOptionData = holder
        }
      }
    }, 300)
  }

  toggleItem(item) {
    item.isToggle = !item.isToggle
    this.$forceUpdate()
    this.computeSendTarget()
  }

  selectSendTarget(item, parentItem?) {
    item.isSelected = !item.isSelected
    if (item.appUsers) {
      for (let user of item.appUsers) {
        user.isSelected = item.isSelected
      }
    } else {
      if (!item.isSelected) {
        parentItem.isSelected = false
      } else {
        if (parentItem.appUsers) {
          let flag = true
          for (let el of parentItem.appUsers) {
            if (!el.isSelected) {
              flag = false
              break
            }
          }
          parentItem.isSelected = flag
        }
      }
    }
    this.$forceUpdate()
    this.computeSendTarget()
  }

  computeSendTarget() {
    this.sendTarget = []
    if (this.listType === 'group') {
      console.log(this.groupOptionData)
      for (let key in this.groupOptionData) {
        let item = this.groupOptionData[key]
        let isThisGroupSelected = false
        item.isSelected ? isThisGroupSelected = true : isThisGroupSelected = false
        for (let user of item.appUsers) {
          if (isThisGroupSelected || user.isSelected)
            this.sendTarget.push({
              phone: user.phone,
              userId: user.id,
              name: user.name
            })
        }
      }
    }
    else
      for (let item of this.stationOptionData) {
        if (item.isToggle)
          this.sendTarget.push({
            userId: item.id,
            phone: item.phone,
            name: item.username
          })
      }
  }

  async sendMsg() {
    if (!this.msgContent) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '短信内容不得为空'
      })
      return
    }

    if (this.sendTarget.length === 0) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '请选择至少一个收信人'
      })
      return
    }
    let userIds = []
    for (let el of this.sendTarget) {
      userIds.push(el.userId)
    }
    let ws = new WebSocket('ws://10.148.16.217:11160/renyin5/ws')
    ws.onopen = e => {
      let param: any = {
        mark: '#text',
        groupIds: [],
        userIds,
        message: this.msgContent
      }
      param = JSON.stringify(param)
      console.log(param)
      ws.send(param)
      this.sendInfo.push({ message: this.msgContent, sendTarget: JSON.parse(JSON.stringify(this.sendTarget)) })
      this.msgContent = ''
      Vue.prototype['$message']({
        type: 'success',
        message: '发送成功'
      })
    }
  }
}