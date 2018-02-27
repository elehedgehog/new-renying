import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ReviseProduct.html?style=./ReviseProduct.scss'
import { menusClient } from '../../../../util/clientHelper'
@WithRender
@Component
export default class ReviseProduct extends Vue {
  @Prop() closeRevise
  @Prop() analyzeOptSelected
  @Prop() getMenu
  @Action('systemStore/storeSecondMenuChanged_global') storeSecondMenuChanged_global
  isInputShow: boolean = false
  isUrlShow:boolean = false
  name: string = ''
  url: string = ''
  id: string = ''
  secondMenuImageUrl = {
    nsm8: 'static/img/product/8.png',
    nsm9: 'static/img/product/9.png',
    nsm10: 'static/img/product/10.png',
    nsm12: 'static/img/product/12.png',
    nsm13: 'static/img/product/13.png',
  
    nsm17: 'static/img/product/17.png',
    nsm18: 'static/img/product/18.png',
    nsm19: 'static/img/product/19.png',
    nsm20: 'static/img/product/20.png',
    nsm21: 'static/img/product/21.png',
    nsm22: 'static/img/product/22.png',
    nsm23: 'static/img/product/23.png',
    nsm24: 'static/img/product/24.png',
    nsm25: 'static/img/product/25.png',
    nsm26: 'static/img/product/26.png',
    nsm27: 'static/img/product/27.png',
    nsm28: 'static/img/product/28.png',
    nsm29: 'static/img/product/29.png',
    nsm30: 'static/img/product/30.png',
  
    nsm31: 'static/img/product/31.png',
    nsm32: 'static/img/product/32.png',
    nsm33: 'static/img/product/33.png',
    nsm34: 'static/img/product/34.png',
    nsm36: 'static/img/product/36.png',
    nsm37: 'static/img/product/37.png',
  
    nsm38: 'static/img/product/38.png',
    nsm39: 'static/img/product/39.png',
    nsm40: 'static/img/product/49.png',
    nsm41: 'static/img/product/41.png',
    nsm42: 'static/img/product/42.png',
    nsm43: 'static/img/product/43.png',
    nsm44: 'static/img/product/44.png',
    nsm45: 'static/img/product/45.png',
    nsm46: 'static/img/product/46.png',
    nsm47: 'static/img/product/47.png',
    nsm48: 'static/img/product/48.png',
    nsm49: 'static/img/product/49.png',
    nsm50: 'static/img/product/50.png',
    nsm51: 'static/img/product/51.png',
    nsm52: 'static/img/product/52.png',
    nsm53:'static/img/product/53.png',
    nsm54:'static/img/product/54.png',
    nsm55:'static/img/product/55.png',
    nsm59:'static/img/product/59.png',
    nsm56:'static/img/product/56.png',
    nsm57:'static/img/product/57.png',
    nsm58:'static/img/product/58.png',
    nsm60:'static/img/product/60.png',
    nsm64:'static/img/product/64.png',
  }
  thridMenuImageUrl = {
    ntm1: 'static/img/product/3-1.png',
    ntm2: 'static/img/product/3-2.png',
    ntm3: 'static/img/product/3-3.png',
    ntm4: 'static/img/product/3-4.png',
    ntm5: 'static/img/product/3-5.png',
    ntm6: 'static/img/product/3-6.png',
    ntm7: 'static/img/product/3-7.png',
    ntm8: 'static/img/product/3-8.png',
    ntm9: 'static/img/product/3-9.png',
    ntm10: 'static/img/product/3-10.png',
    ntm11: 'static/img/product/3-11.png',
    ntm12: 'static/img/product/3-12.png',
    ntm13: 'static/img/product/3-13.png',
    ntm14: 'static/img/product/3-14.png',
    ntm15: 'static/img/product/3-15.png',
    ntm16: 'static/img/product/3-16.png',
    ntm17: 'static/img/product/3-17.png',
  }

  mounted() {
    this.id = this.analyzeOptSelected.id
    this.name = this.analyzeOptSelected.name
    this.url = this.analyzeOptSelected.url
  }
  async modifyMenu(){  //修改二级 三级菜单
    let data
    if ('subMenus' in this.analyzeOptSelected) {
      data = await menusClient.modifySecondMenu(this.id, this.name, this.url, '')
    } else {
      data = await menusClient.modifyThirdMenu(this.id, this.name, this.url)
    }
    if(data) {
      Vue.prototype['$message']({
        type: 'success',
        message: '修改成功'
      })
      this.closeRevise()
      this.getMenu()
      this.storeSecondMenuChanged_global()
    } else
      Vue.prototype['$message']({
        type: 'error',
        message: '修改失败'
      })
    
  }
  
}