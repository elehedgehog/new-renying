import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter} from 'vuex-class'
import WithRender from './ProductsClass.html?style=./ProductsClass.scss'
import AddProduct from './add-product/AddProduct'
import ReviseProduct from './revise-product/ReviseProduct'
import UserDefined from './user-defined/UserDefined'
import { combinationClient, menusClient} from '../../../../util/clientHelper'
import { menuConf } from '../defaultMenuConf'

@WithRender
@Component
export default class ProductsClass extends Vue {
  @Prop() productLi
  @Getter('systemStore/subMenu_global') subMenu_global
  @Getter('systemStore/isMenuChanged_global') isMenuChanged_global
  @Action('systemStore/storeSecondMenuChanged_global') storeSecondMenuChanged_global
  addProductView: any = null
  reviseProductView: any = null
  userDefinedView:any = null
  analyzeOptSelected: string = null
  menu: any = []
  nameModify: any = null
  addProdType: string = ''
  addProdEl: any = null
  
  async mounted() {
    await this.getMenu()
  }
  async getMenu() {
    let data = await combinationClient.getMenu()
    if (!data) return

    for (let el of data) {
      if (el.id === 'nfm1') {
        for (let opt of el.subMenus) {
          if (opt.id in menuConf) {
            for (let item of opt.subMenus) {
              item.isDefault = item.default
              if (menuConf[opt.id].indexOf(item.id) === -1) item.default = false
            }
          } else {
            for (let item of opt.subMenus) {
              item.isDefault = item.default
              item.default = false
            }
          }
        }
      } else {
        if (el.id in menuConf) {
          for (let opt of el.subMenus) {
            opt.isDefault = opt.default
            if (menuConf[el.id].indexOf(opt.id) === -1) opt.default = false
          }
        } else {
          for (let opt of el.subMenus) {
            opt.isDefault = opt.default
            opt.default = false
          }
        }
      }
    }

    this.menu = data
  }

  @Watch('isMenuChanged_global')
  onisMenuChanged_globalChanged (val: any, oldVal: any) {
    this.getMenu()
  }
  
  toggleProductPopup(type, el){
    this.addProdType = type
    this.addProdEl = el
    this.addProductView = this.addProductView ? null : AddProduct
  }

  toggleRevisePopup(opt){
    this.reviseProductView = this.reviseProductView ? null : ReviseProduct
    this.analyzeOptSelected = opt
  }
  toggleUsedefined(el){
    console.log(el)
    this.nameModify = el
    this.userDefinedView = this.userDefinedView ? null : UserDefined
  }

  async deleteFirstMenu(id) {  //删除一级菜单
    Vue.prototype['$confirm']('是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      let data = await menusClient.deleteFirstMenu(id)
      if(data) {
        Vue.prototype['$message']({
          type: 'success',
          message: '删除成功'
        })
        this.getMenu()
        this.storeSecondMenuChanged_global()
      } else
        Vue.prototype['$message']({
          type: 'error',
          message: '删除失败'
        })
    }).catch(() => {})
  }

  deleteMenu(type, parent, id) {  //删除二级、三级菜单   // 调用修改接口
    Vue.prototype['$confirm']('是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      let arr = []
      for (let el of parent.subMenus)
        arr.push(el.id)
      let idIndex = arr.indexOf(id)
      arr.splice(idIndex, 1)
      let subMenuIds = arr.length ? arr.join('$') : '""'
      let data
      if (type === 'second')
        data = await menusClient.modifyFirstMenu(parent.id, parent.name, '', subMenuIds)
      else
        data = await menusClient.modifySecondMenu(parent.id, parent.name, '', subMenuIds)
      if(data) {
        Vue.prototype['$message']({
          type: 'success',
          message: '删除成功'
        })
        this.getMenu()
        this.storeSecondMenuChanged_global()
      } else
        Vue.prototype['$message']({
          type: 'error',
          message: '删除失败'
        })
    }).catch(() => {})
  }

}