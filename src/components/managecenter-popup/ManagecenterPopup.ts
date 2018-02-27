import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ManagecenterPopup.html?style=./ManagecenterPopup.scss'
import ProductsClass from './products-class/ProductsClass'
import BusinessClass from './business-class/BusinessClass'
import AddClass from './add-class/AddClass'
import IncreaseProduct from './increase-product/IncreaseProduct'
import { menusClient } from '../../util/clientHelper'

@WithRender
@Component
export default class ManagecenterPopup extends Vue {
  classSelected: string = 'product';
  currentView: any = ProductsClass
  addClassView: any = null;
  increaseProductView: any = null;
  productLi: any = null;

  async toggleClass(key){
    if (key === this.classSelected) return
    await this.getProductList()
    this.classSelected = key
    this.currentView = key  === 'product' ? ProductsClass : BusinessClass
  }

  async toggleClassPopup(){
    await this.getProductList()
    this.addClassView = this.addClassView ? null : AddClass
  }
  toggleIncreasePopup() {
    this.increaseProductView = this.increaseProductView ? null : IncreaseProduct
  }

  async getProductList(){  //获取产品列表
    let data = await menusClient.productList()
    if(!data){
      Vue.prototype['$message']({
        type: 'error',
        message: '添加失败'
      })
    }
    this.productLi = data
    console.log(this.productLi)
  }
  
}