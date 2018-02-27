import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './TopNav.html?style=./TopNav.scss'
import { combinationClient } from '../../util/clientHelper'

@WithRender
@Component
export default class TopNav extends Vue {
  @Getter('systemStore/isMenuChanged_global') isMenuChanged_global
  @Getter('systemStore/isSecondMenuChanged_global') isSecondMenuChanged_global
  @Action('systemStore/changeSubMenu_global') changeSubMenu_global

  menu: any = []
  menuSelected: number = null
  width: string = null
  

  async mounted() {
    await this.getMenu()
    let key = this.menu[0].id, submenu = this.menu[0].subMenus
    this.toggleMenu(key, submenu)
  }

  async getMenu() {
    let data = await combinationClient.getMenu()
    if (!data) return
    this.menu = data
    this.width = (1 / data.length) * 100 + '%'
  }

  toggleMenu(key, submenu) {
    this.menuSelected = key
    this.changeSubMenu_global(submenu)
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