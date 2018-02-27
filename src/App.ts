import Vue from 'vue'
import { Component, Prop, Watch } from "vue-property-decorator";
import { Getter, Action } from "vuex-class";
import WithRender from './App.html?style=./App.scss'

// import { CookieHelper } from './util/cookie'
import Cookies from 'js-cookie'
import { userClient } from './util/clientHelper'

import ProductEntry from './components/product-entry/ProductEntry'
import LoginPage from './components/login-page/LoginPage';
import HeaderTitle from './components/header-title/HeaderTitle';
import TopNav from './components/top-nav/TopNav';
import LeftnavAnalyze from './components/leftnav-analyze/LeftnavAnalyze';
import Zmap from './components/z-map/Zmap'
import GlobalMessage from './components/global-message/GlobalMessage'

import ToolBar from './components/tool-bar/ToolBar'
import ManagecenterPopup from "./components/managecenter-popup/ManagecenterPopup"
import DemandWarning from './components/GlobalPopup/demand-warning/DemandWarning'
import AssignmentTrack from './components/assignment-track/AssignmentTrack'
import CappiProfile from './components/GlobalPopup/cappi-profile/CappiProfile'
import OrderDispatch from './components/GlobalPopup/order-dispatch/OrderDispatch'
import AirQualityDetail from './components/GlobalPopup/air-quality-detail/AirQualityDetail'
import { CookieHelper } from 'util/cookie';
import ZmapTool from './components/zmap-tool/ZmapTool'
import ColorBar from './components/color-bar/ColorBar'
import TransportStatus from './components/GlobalPopup/transport-status/TransportStatus';


@WithRender
@Component({
  components: {
    HeaderTitle,
    ProductEntry,
    TopNav,
    LeftnavAnalyze,
    GlobalMessage,
    Zmap,
    ToolBar,
    DemandWarning,
    ManagecenterPopup,
    AssignmentTrack,
    ZmapTool,
  }
})

export default class App extends Vue {
  @Getter('systemStore/userInfo_global') userInfo_global
  @Getter('systemStore/isCappiProfileOn_global') isCappiProfileOn_global
  @Getter('systemStore/isOrderDispatchOn_global') isOrderDispatchOn_global
  @Getter('systemStore/aqiDetailInfo_global') aqiDetailInfo_global
  @Getter('systemStore/isTransportOpened_global') isTransportOpened_global
  @Action('systemStore/changeUserInfo_global') changeUserInfo_global
  @Getter('systemStore/colorbarElements_global') colorbarElements_global

  loginPageView = null
  leftNavView: any = null
  CappiProfileView: any = null
  transportView: any = null
  OrderDispatchView: any = null
  AQIDetailView: any = null
  colorbarView: any = null

  closeLoginPage() {
    this.loginPageView = null
    // CookieHelper.delCookie('login')
    Cookies.remove('login')
  }
  viewLoginPage() {
    this.loginPageView = LoginPage
  }

  async created() {
    let loginString = localStorage.getItem('login')
    if (!loginString) {
      this.loginPageView = LoginPage
      return
    }
    let loginData = JSON.parse(loginString);
    if (loginData.date < Date.now() - (1000 * 60 * 60 * 24 * 7)) {
      this.loginPageView = LoginPage
    } else {
      let loginInfo = loginData.data.split('%')
      let data = await userClient.login(loginInfo[0], loginInfo[1])
      this.changeUserInfo_global(data)
      this.$store.dispatch('systemStore/connectSocket_global')
    }
  }

  @Watch('isCappiProfileOn_global')
  onisCappiProfileOn_globalChanged(val: any, oldVal: any) {
    this.CappiProfileView = val ? CappiProfile : null
  }
  @Watch('isOrderDispatchOn_global')
  onisOrderDispatchOn_globalChanged(val: any, oldVal: any) {
    this.OrderDispatchView = val ? OrderDispatch : null
  }

  @Watch('isTransportOpened_global')
  onisTransportOpened_globalChanged (val: any, oldVal: any) {
    this.transportView = val ? TransportStatus : null
  }
  @Watch('aqiDetailInfo_global')
  onaqiDetailInfo_globalChanged(val: any, oldVal: any) {
    this.AQIDetailView = Object.keys(val).length ? AirQualityDetail : null
  }

  @Watch('colorbarElements_global')
  oncolorbarElements_globalChanged (val: any, oldVal: any) {
    this.colorbarView = Object.keys(val).length ? ColorBar : null
  }
}