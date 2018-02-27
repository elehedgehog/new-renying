import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AddClass.html?style=./AddClass.scss'
import { menusClient } from '../../../../util/clientHelper'
@WithRender
@Component
export default class AddClass extends Vue {
  @Action('systemStore/storeMenuChanged_global') storeMenuChanged_global
  @Prop() closeFn
  @Prop() productLi

  productSelected: any = []
  productList: any = []
  elementSelected: string = ''
  firstMenu: string = ''

  mounted() {
    for(let item of this.productLi) {
      this.productList.push({ key: item.id, label: item.name })
    }
    
  }



  // toggleOpt(item, name){
  //   if (name) {
  //     for(let opt of this.classOpt) {
  //       for(let subOpt of opt.sub){
  //         subOpt.isSelected = false
  //       }
  //     }
  //     item.isSelected = !item.isSelected
  //   } else {
  //     for(let opt of this.classOpt){
  //       if(opt.name === item.name) opt.isSelected = !opt.isSelected
  //       else opt.isSelected = false
        // opt.isSelected = opt.name === item.name ? !opt.isSelected : false
    //   }
    // }
    // if (item.value && item.isSelected)
    //   this.elementSelected = item.value
  // }

  async addFirstMenu() {   //添加一级菜单
    if(!this.firstMenu) return
    else{
      let suffix = `list[0].name=${this.firstMenu}&list[0].url=&list[0].subMenuIds=${this.productSelected.join('$')}`
      let data = await menusClient.addFirstMenu(suffix)
      if(!data){
        Vue.prototype['$message']({
          type: 'error',
          message: '添加失败'
        })
      } else {
        Vue.prototype['$message']({
          type: 'success',
          message: '添加成功'
        })
        this.storeMenuChanged_global()
        this.closeFn()
      }
    }
  }
}