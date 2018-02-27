import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './NewMessage.html?style=./NewMessage.scss'
import { groupsClient, messageDispatchClient } from '../../../../util/clientHelper'
@WithRender
@Component
export default class NewMessage extends Vue {
  @Getter('systemStore/userInfo_global') userInfo_global
  @Getter('systemStore/appUserData_global') appUserData_global
  @Getter('systemStore/appGroupData_global') appGroupData_global
  @Getter('systemStore/operateStationData_global') operateStationData_global

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
          isToggle: false,
          data: {
            userId: item.appUser.id,
            phone: item.appUser.phone,
            username: item.appUser.name
          }
        })
      }
    }
    this.stationOptionData = Object.assign(this.stationOptionDataHolder, {})
  }

  computeGroupOptionData() {
    this.groupOptionDataHolder = []
    for (let item of this.appGroupData_global) {
      if (!item) continue
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
            if (typeof item.groupname === 'string' && item.groupname.includes(val)) {
              holder.push(item)
            } else {
              let temp = Object.assign({}, item)
              temp.appUsers = []
              for (let user of item.appUsers) {
                if (typeof user.name === 'string' && user.name.includes(val))
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
            if (typeof item.name === 'string' && item.name.includes(val))
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
    this.computeSendTarget();
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
    console.log('stationOptionData', this.stationOptionData);
    this.sendTarget = []
    if (this.listType === 'group') {
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
            userId: item.data.userId,
            phone: item.data.phone,
            name: item.data.username
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
    let param = `msgContent=${this.msgContent}&sender=${this.userInfo_global.id}` +
      `&subject=${this.subject}`
    for (let i in this.sendTarget) {
      param += `&list[${i}].phone=${this.sendTarget[i].phone}` +
        `&list[${i}].userId=${this.sendTarget[i].userId}`
    }
    // let param = {
    //   msgContent: this.msgContent,
    //   sender: this.userInfo_global.id,
    //   list,
    // }
    let res = await messageDispatchClient.getmsgSend(param)
    if (res) {
      Vue.prototype['$message']({
        type: 'success',
        message: '发送成功'
      })
      this.msgContent = ''
    } else {
      Vue.prototype['$message']({
        type: 'warning',
        message: '发送失败'
      })
    }
  }
}