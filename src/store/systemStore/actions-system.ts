import { Store, ActionTree, ActionContext } from "vuex";
import { State } from './state-system';
import * as types from '../mutation-types'

export function changeUserInfo_global(store: ActionContext<State, any>, userInfo) {
  store.commit('changeUserInfo', userInfo)
}

export function changeSubMenu_global(store: ActionContext<State, any>, action) {
  store.commit('changeSubMenu', action)
}

export function toggleProductView_global(store: ActionContext<State, any>, payload) {
  store.commit('toggleProductView', payload)
}

export function closeProductView_global(store: ActionContext<State, any>) {
  store.commit('closeProductView')
}

export function changeArticleViewHolder_global(store: ActionContext<State, any>, action) {
  store.commit('changeArticleViewHolder', action)
}

export function storeMenuChanged_global(store: ActionContext<State, any>) {
  store.commit('storeMenuChanged')
}
export function storeSecondMenuChanged_global(store: ActionContext<State, any>, action) {
  store.commit('storeSecondMenuChanged', action)
}
export function storeDisasterManageImg_global (store:ActionContext<State, any>) {
  store.commit('storeDisasterManageImg')
}
export function storedisasterMsg_global (store:ActionContext<State, any>,action) {
  store.commit('storedisasterMsg',action)
}

export function connectSocket_global(store: ActionContext<State, any>) {
  store.commit('connectSocket')
}

export function socketSendMessage_global(store: ActionContext<State, any>, message: any) {
  store.commit('socketSendMessage', message)
}

export function toggleSearchOperateStationWindow_global (store: ActionContext<State, any>) {
  store.commit('toggleSearchOperateStation')
}

export const storeCappiProfile_global = (store: ActionContext<State, any>, data: { SLat: boolean, SLon: boolean, ELat: boolean, ELon: boolean }) => {
  store.commit('storeCappiProfile', data)
}

export function storeisCappiProfileOn_global (store:ActionContext<State, any>,action) {
  store.commit('storeisCappiProfileOn',action)
}
export function storeisOrderDispatchOn_global (store:ActionContext<State, any>,action) {
  store.commit('storeisOrderDispatchOn',action)
}

export function storeaqiDetailInfo_global (store:ActionContext<State, any>, data) {
  store.commit('storeaqiDetailInfo', data)
}

export function storecolorbarElements_global (store:ActionContext<State, any>,action) {
  store.commit('storecolorbarElements',action)
}
export function storeisTransportOpened_global (store:ActionContext<State, any>,action) {
  store.commit('storeisTransportOpened',action)
}


export default <ActionTree<State, any>>{
  changeUserInfo_global,
  changeSubMenu_global,
  toggleProductView_global,
  closeProductView_global,
  changeArticleViewHolder_global,
  storeMenuChanged_global,
  storeSecondMenuChanged_global,
  connectSocket_global,
  socketSendMessage_global,
  storeDisasterManageImg_global,
  storedisasterMsg_global,
  toggleSearchOperateStationWindow_global,
  storeCappiProfile_global,
  storeisCappiProfileOn_global,
  storeisOrderDispatchOn_global,
  storeaqiDetailInfo_global,
  storecolorbarElements_global,
  storeisTransportOpened_global,
}