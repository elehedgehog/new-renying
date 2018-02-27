import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './AddProduct.html?style=./AddProduct.scss'
import { menusClient } from '../../../../../util/clientHelper'
@WithRender
@Component
export default class AddProduct extends Vue {
  @Action('systemStore/storeMenuChanged_global') storeMenuChanged_global
  @Action('systemStore/storeSecondMenuChanged_global') storeSecondMenuChanged_global
  @Prop() closeFn
  @Prop() addProdType
  @Prop() addProdEl
  @Prop() getMenu

  productSelected: any = []
  defaultProductSelected: any = []
  productList: any = []

  async mounted() {
    this.productSelected = [] 
    this.defaultProductSelected = []
    for (let el of this.addProdEl.subMenus) {
      this.productSelected.push(el.id)
      if (el.default) this.defaultProductSelected.push(el.id)
    }
    let data = await menusClient.productList()
    if (!data) return
    for(let item of data) {
      let disabled = this.productSelected.indexOf(item.id) !== -1 && this.defaultProductSelected.indexOf(item.id) !== -1
      this.productList.push({ key: item.id, label: item.name, disabled })
    }
  }

  async addProduct(){
    if (!this.productSelected.length) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '请先添加产品'
      })
      return
    }
    let data
    let subMenuIds = this.productSelected.join('$')
    if (this.addProdType === 'second') 
      data = await menusClient.modifyFirstMenu(this.addProdEl.id, this.addProdEl.name, '', subMenuIds)
    else
      data = await menusClient.modifySecondMenu(this.addProdEl.id, this.addProdEl.name, '', subMenuIds)
    if (data) {
      Vue.prototype['$message']({
        type: 'success',
        message: '添加成功'
      })
      this.closeFn()
      this.getMenu()
      this.storeSecondMenuChanged_global()
    } else
      Vue.prototype['$message']({
        type: 'warning',
        message: '添加失败'
      })
  }
}