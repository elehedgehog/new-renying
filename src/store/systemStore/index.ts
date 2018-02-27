import { Module, GetterTree, MutationTree, ActionTree } from "vuex";
import {State} from './state-system'
import Mutations from './mutations-system'
import Getters from './getters-system'
import Actions from './actions-system'

export default class SystemStore implements Module<State, any> {
  namespaced: boolean = true

  state: State
  mutations = Mutations
  getters = Getters
  actions = Actions

  constructor(){
    this.state = new State()
  }
}