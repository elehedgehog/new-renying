import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './BusinessClass.html?style=./BusinessClass.scss'
import { menusClient } from  '../../../../util/clientHelper'



@WithRender
@Component
export default class BusinessClass extends Vue {
  @Action('systemStore/storeSecondMenuChanged_global') storeSecondMenuChanged_global
  @Prop() productLi
  @Prop() getProductList
  increaseProductView: any = null
  currentPage: number = 1
  pageSize: number = 10
  currentPageList: any = []     // 当前页数 产品列表
  modifyInfo: any = {}
  isInputShow: boolean = false
  isUrlShow:boolean = false
  name: string = ''
  url: string = ''
  isPopupOn: boolean = false

  mounted(){
    this.currentPage = 1
    this.currentPageList = this.productLi.slice(0,this.pageSize)
  }

  currentChange(e) {
    this.currentPage = e
    this.currentPageList = this.productLi.slice(this.pageSize*(e-1), this.pageSize*(e-1) + this.pageSize)
  }

  @Watch('productLi')
  onproductLiChanged (val: any, oldVal: any) {
    let e = this.currentPage
    this.currentPageList = this.productLi.slice(this.pageSize*(e-1), this.pageSize*(e-1) + this.pageSize)
  }

  async deleteProduct(item){
    Vue.prototype['$confirm']('是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      let data
      if(item.level === '2')
        data = await menusClient.deleteSecondMenu(item.id)
      else
        data = await menusClient.deleteThirdMenu(item.id)
      if(!data){
        Vue.prototype['$message']({
          type: 'error',
          message: '删除失败'
        })
      } else {
        Vue.prototype['$message']({
          type: 'success',
          message: '删除成功'
        })
        this.storeSecondMenuChanged_global()
        await this.getProductList()
        this.currentChange(this.currentPage)
      }
    }).catch(() => {})
  }

  async modify(item) {
    if (item.default) return
    this.isInputShow = false
    this.isUrlShow = false
    this.modifyInfo = item
    this.name = item.name
    this.url = item.url
    this.isPopupOn = true
  }

  async modifyMenu(){
    let data = await menusClient.modifyThirdMenu(this.modifyInfo.id, this.name, this.url)
    if(data) {
      Vue.prototype['$message']({
        type: 'success',
        message: '修改成功'
      })
      this.isPopupOn = false
      this.storeSecondMenuChanged_global()
      await this.getProductList()
      this.currentChange(this.currentPage)
    } else
      Vue.prototype['$message']({
        type: 'error',
        message: '修改失败'
      })
    
  }
}