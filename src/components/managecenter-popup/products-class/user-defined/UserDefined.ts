import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './UserDefined.html?style=./UserDefined.scss'
import { menusClient } from '../../../../util/clientHelper'
@WithRender 
@Component
export default class UserDefined extends Vue {
  @Action('systemStore/storeMenuChanged_global') storeMenuChanged_global
  @Prop() closeUsedefined
  @Prop() nameModify
  @Prop() getMenu
  firstMenu: any = null

  async modifyFirstMenu() {  //修改一级菜单
    let data = await menusClient.modifyFirstMenu(this.nameModify.id, this.firstMenu, '', '')
    if(data) {
      Vue.prototype['$message']({
        type: 'success',
        message: '修改成功'
      })
      this.closeUsedefined()
      this.getMenu()
      this.storeMenuChanged_global()
    } else
      Vue.prototype['$message']({
        type: 'error',
        message: '修改失败'
      })
  }
  
}