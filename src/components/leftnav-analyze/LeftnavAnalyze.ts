import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './LeftnavAnalyze.html?style=./LeftnavAnalyze.scss'
import { secondMenuClassName, thridMenuClassName } from './menuClassNameConfig'
import { combinationClient } from '../../util/clientHelper'

import * as CONFIG from '../../config/productId'

@WithRender
@Component
export default class LeftnavAnalyze extends Vue {
  // @Getter('systemStore/subMenu_global') subMenu_global
  @Getter('systemStore/productViewHolder_global') productViewHolder_global
  @Action('systemStore/toggleProductView_global') toggleProductView_global
  @Getter('systemStore/articleViewHolder_global') articleViewHolder_global 
  @Action('systemStore/changeArticleViewHolder_global') changeArticleViewHolder_global 
  
  @Getter('systemStore/isMenuChanged_global') isMenuChanged_global
  @Getter('systemStore/isSecondMenuChanged_global') isSecondMenuChanged_global
  @Action('systemStore/changeSubMenu_global') changeSubMenu_global

  secondMenuClassName = secondMenuClassName
  thridMenuClassName = thridMenuClassName

  menu: any = []
  menuSelected: string = null
  minHeight: string = ''

  leftNavSelected: number = null
  leftNavSubSelected: string = null

  thridMenuSelected: number = null
  articletView: any = null
  navSpreadPop: boolean = false

  mounted() {
    this.getMenu() 
  }

  toggleNavSpreadPop () {
    this.navSpreadPop = !this.navSpreadPop
    this.$store.commit('systemStore/toggleLeftNavOpenState')
  }

  // 一级菜单
  async getMenu() {
    let data = await combinationClient.getMenu()
    if (data) {
      let height = 0
      for (let el of data) {
        this.$set(el, 'isSubMenuShow', false)
        height = height > (el.subMenus.length + 2) * 40 ? height : (el.subMenus.length + 2) * 40
      }
      this.menu = data
      this.minHeight = height + 'px'
    }
  }
  toggleMenu(key, submenu) {
    this.menuSelected = key
    this.changeSubMenu_global(submenu)
  }
  // 二级菜单
  toggleleftNav(opt, key) {
    if(opt.url)
      window.open(opt.url)
    else {
      let flag = this.leftNavSelected  === opt.id
      this.leftNavSelected = flag ? null : opt.id
      this.menuSelected = flag ? null : key
      // if (flag) {
      //   this.menuSelected = null
      // } else {
      //   if (!opt.document && !opt.subMenus.length)
      //     this.menuSelected = key
      // }
    }
  }

  @Watch('leftNavSelected')
  isleftNavSelectedChanged (val, oldVal) {
    if (val) {
      let key = this.thridMenuClassName[val] ? '3-' + val : val
      if (!this.productViewHolder_global[key])
        this.toggleProductView_global({ id: key, action: true })
    }
    if (oldVal) {
      let key = this.thridMenuClassName[oldVal] ? '3-' + oldVal : oldVal
      if (this.productViewHolder_global[key])
        this.toggleProductView_global({ id: key, action: false })
    }
    this.leftNavSubSelected = null
    this.changeArticleViewHolder_global({id: null,type: null})
    this.thridMenuSelected = null
  }

  // 文档菜单
  toggleArticle(type, key) {
    this.leftNavSubSelected = this.leftNavSubSelected === type ? null : type
    this.changeArticleViewHolder_global({id: key,type: this.leftNavSubSelected})
  }

  hasDocumentMenu(subMenus) {
    let flag = false
    for (let el of subMenus) {
      if (el.document) {
        flag = true
        break
      }
    }
    return flag
  }

  // 三级菜单
  toggleSubNav(item, key) {       // opt 为二级菜单
    setTimeout(() => {
      if(item.url)
        window.open(item.url)
      else {
        let flag = this.thridMenuSelected === item.id
        this.thridMenuSelected = flag ? null : item.id
        this.menuSelected = flag ? null : key
      }
    }, 0)
  }

  @Watch('thridMenuSelected')
  isthridMenuSelectedChanged (val, oldVal) {
    if (val) {
      let key = this.thridMenuClassName[val] ? '3-' + val : val
      if (!this.productViewHolder_global[key])
        this.toggleProductView_global({ id: key, action: true })
    }
    if (oldVal) {
      let key = this.thridMenuClassName[oldVal] ? '3-' + oldVal : oldVal
      if (this.productViewHolder_global[key])
        this.toggleProductView_global({ id: key, action: false })
    }
    // if (!this.productViewHolder_global['3-' + val] && val)
    //   this.toggleProductView_global({ id: '3-' + val, action: true })
    // if (this.productViewHolder_global['3-' + oldVal] && oldVal)
    //   this.toggleProductView_global({ id: '3-' + oldVal, action: false })
  }

  // 关闭窗口时 关闭菜单选中
  @Watch('productViewHolder_global')
  onproductViewHolder_globalChanged(val: any, oldVal: any): void {
    if(this.leftNavSelected) {
      let key = this.thridMenuClassName[this.leftNavSelected] ? '3-' + this.leftNavSelected : this.leftNavSelected
      if (!val[key]) this.leftNavSelected = null
    }
    if (this.thridMenuSelected) {
      let key = this.thridMenuClassName[this.thridMenuSelected] ? '3-' + this.thridMenuSelected : this.thridMenuSelected
      if (!val[key]) this.thridMenuSelected = null
      // if (!val['3-' + this.thridMenuSelected]) this.thridMenuSelected = null
    }
  }

  // 关闭文档窗口时 关闭菜单选中
  @Watch('articleViewHolder_global')
  onarticleViewHolder_globalChanged(val: any, oldVal: any): void {
    if (!val.type) this.leftNavSubSelected = null
  }

  @Watch('isMenuChanged_global')
  onisMenuChanged_globalChanged (val: any, oldVal: any) {
    this.getMenu()
  }
  @Watch('isSecondMenuChanged_global')
  async onisSecondMenuChanged_globalChanged (val: any, oldVal: any) {
    await this.getMenu()
    let flag = false      //清除侧栏
    this.menu.map((el, index) => {
      if (el.id  === this.menuSelected) {
        flag = true
        let submenu = this.menu[index].subMenus
        this.changeSubMenu_global(submenu)
      }
    })
    if (!flag) {
      this.menuSelected = this.menu[0].id
      let submenu = this.menu[0].subMenus
      this.changeSubMenu_global(submenu)
    }


    this.menu.map((el, index) => {
      if (el.id === this.menuSelected) {
        let submenu = this.menu[index].subMenus
        this.changeSubMenu_global(submenu)
      }
    })
  }
}