import { Getter, GetterTree } from "vuex";
import { State } from './state-system'

export function userInfo_global(state: State) {
  return state.userInfo
}

export function subMenu_global(state: State) {
  return state.subMenu
}

export function productViewHolder_global (state: State): any {
  return state.productViewHolder
}

export function isClosingPopup_global (state: State): any {
  return state.isClosingPopup
}

export function articleViewHolder_global (state: State):any {
  return state.articleViewHolder
}

export function isMenuChanged_global (state: State): boolean {
  return state.isMenuChanged
}

export function isSecondMenuChanged_global (state: State):any {
  return state.isSecondMenuChanged
}

export function socketMessage_global (state: State): any {
  return state.socketMessage
}

export function isDisasterManageImg_global (state: State):any {
  return state.isDisasterManageImg
}

export function disasterMsg_global (state: State):any {
  return state.disasterMsg
}

export const cappiProfile_global = (state: State): any => state.cappiProfile

export function isCappiProfileOn_global (state: State):any {
  return state.isCappiProfileOn
}
export function isOrderDispatchOn_global (state: State):any {
  return state.isOrderDispatchOn
}

export function socketCurrentMessage_global(state: State) {
  return state.socketCurrentMessage
}


export function phoneLiveId_global(state: State) {
  return state.phoneLiveId
}

export function isSearchOperateStationWindowOn_global (state: State): any {
  return state.isSearchOperateStationWindowOn
}

export function isLeftNavOpened_global(state: State) {
  return state.isLeftNavOpened
}

export function freshOperate_global (state: State): any {
  return state.freshOperate
}

export function transportData_global (state: State): any {
  return state.transportData
}

export function isTransportDataChange_global (state: State): any {
  return state.isTransportDataChange
}

export function appGroupData_global (state: State): any {
  return state.appGroupData
}

export function appUserData_global (state: State): any {
  return state.appUserData
}

export function operateStationData_global (state: State): any {
  return state.operateStationData
}


export function isShowTransportLayer_global (state: State): any {
  return state.isShowTransportLayer
}

export function isShowAirRequestLayer_global (state: State): any {
  return state.isShowAirRequestLayer
}
export function isShowAirLineLayer_global (state: State): any {
  return state.isShowAirLineLayer
}
export function isShowPhoneLiveLayer_global (state: State): any {
  return state.isShowPhoneLiveLayer
}

export function phoneLiveData_global (state: State): any {
  return state.phoneLiveData
}
export function airRequestData_global (state: State): any {
  return state.airRequestData
}

export function aqiDetailInfo_global (state: State):any {
  return state.aqiDetailInfo
}

export function colorbarElements_global (state: State):any {
  return state.colorbarElements
}
export function isTransportOpened_global (state: State):any {
  return state.isTransportOpened
}

export default <GetterTree<State, any>>{
  userInfo_global,
  subMenu_global,
  productViewHolder_global,
  isClosingPopup_global,
  articleViewHolder_global,
  isMenuChanged_global,
  isSecondMenuChanged_global,
  socketMessage_global,
  isDisasterManageImg_global,
  disasterMsg_global,
  socketCurrentMessage_global,
  isSearchOperateStationWindowOn_global,
  isLeftNavOpened_global,
  cappiProfile_global,
  isCappiProfileOn_global,
  isOrderDispatchOn_global,
  freshOperate_global,
  transportData_global,
  isTransportDataChange_global,
  appGroupData_global,
  appUserData_global,
  operateStationData_global,
  phoneLiveId_global,
  isShowTransportLayer_global,
  isShowAirRequestLayer_global,
  isShowAirLineLayer_global,
  isShowPhoneLiveLayer_global,
  airRequestData_global,
  phoneLiveData_global,
  aqiDetailInfo_global,
  colorbarElements_global,
  isTransportOpened_global,
}
