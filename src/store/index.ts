import Vue from "vue";
import Vuex from 'vuex'
Vue.use(Vuex)

import SystemStore from './systemStore'


export default new Vuex.Store({
  modules: {
    systemStore: new SystemStore(),
  }
})