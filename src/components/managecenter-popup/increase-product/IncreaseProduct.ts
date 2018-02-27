import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './IncreaseProduct.html?style=./IncreaseProduct.scss'
import { menusClient} from '../../../util/clientHelper'

@WithRender
@Component
export default class IncreaseProduct extends Vue {
  @Prop() closeFn
  @Prop() getProductList

  name: string = ''
  url: string = ''
  isInputShow: boolean = false
  isUrlShow:boolean = false

  async addProduct() {
    if (!this.name) {
      Vue.prototype['$message']({
        type: 'warning',
        message: '产品名称不得为空'
      })
      return
    }
    let res = await menusClient.addThirdMenu(this.name, this.url)
    if (res) {
      Vue.prototype['$message']({
        type: 'success',
        message: '添加成功'
      })
      this.getProductList()
      this.closeFn()
    } else
      Vue.prototype['$message']({
        type: 'warning',
        message: '添加失败'
      })
  }
  
}