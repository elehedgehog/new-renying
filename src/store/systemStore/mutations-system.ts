import { Mutation, MutationTree } from "vuex";
import { State } from "./state-system";

import * as moment from 'moment'
import axios from 'axios'
import jsonp from 'axios-jsonp'

export function changeUserInfo(state: State, userInfo: any) {
  state.userInfo = userInfo
}

export function changeSubMenu(state: State, action: any) {
  state.subMenu = action
}

export function toggleProductView(state: State, payload: { id: number, action: boolean }) {
  state.productViewHolder[payload.id] = payload.action
  state.productViewHolder = { ...state.productViewHolder }
}

export function closeProductView(state: State) {
  for (let i in state.productViewHolder)
    state.productViewHolder[i] = false
  state.productViewHolder = { ...state.productViewHolder }
  state.isClosingPopup = !state.isClosingPopup
}

export function changeArticleViewHolder(state: State, action: any) {
  state.articleViewHolder.id = action.id
  state.articleViewHolder.type = action.type
  state.articleViewHolder = { ...state.articleViewHolder }
}

export function storeMenuChanged(state: State) {
  state.isMenuChanged = !state.isMenuChanged
}

export function storeSecondMenuChanged(state: State) {
  state.isSecondMenuChanged = !state.isSecondMenuChanged
}

export function connectSocket(state: State, wsUrl: string = 'ws://10.148.16.217:11160/renyin5/ws') {
  state.socket = new WebSocket(wsUrl)
  state.socket.onmessage = e => {
    let messageData = parseReturnMessage(JSON.parse(e.data))
    state.socketMessage.push(messageData)                                                                                                                                                                                                                                       
    state.socketCurrentMessage = messageData
  }
  state.socket.onclose = e => {
    state.socket = new WebSocket(wsUrl)
    state.socket.onmessage = e => {
      let messageData = parseReturnMessage(JSON.parse(e.data))
      state.socketMessage.push(messageData)
      state.socketCurrentMessage = messageData
    }
  }

  let socket = new window['SockJS']('http://10.148.16.217:11160/renying' + '/socket');
  let stompClient = window['Stomp'].over(socket);
  stompClient.connect({}, async frame => {
    // 空域申请
    stompClient.subscribe('/renying/airspace', async msg => {
      let event = JSON.parse(msg.body);
      let username
      for (let item of state.appUserData) {
        if (item.id === event.applicantId) {
          username = item.name
          break
        }
      }
      let message = {
        type: '空域',
        color: 'operate',
        target: username,
        datetime: moment(event.time).format('YYYY/MM/DD HH:mm'),
        content: username + `${event.status === 'started' ? '开始申请空域' :
          event.status === 'success' ? '申请空域成功' : '申请空域失败'}`,
        tooltipText: '',
        pos: event.info ? [event.info.lat, event.info.lon] : []
      }
      state.socketMessage.push(message)
      state.socketCurrentMessage = message
      state.getAirRequestData().then(data => state.airRequestData = data)
    })
    // 直播管理事件
    stompClient.subscribe('/renying/live', async msg => {
      let event = JSON.parse(msg.body);
      let username
      for (let item of state.appUserData) {
        if (item.id == event.liveId) {
          username = item.name
          break
        }
      }
      let message = {
        type: '直播',
        color: 'operate',
        target: username,
        datetime: moment(event.time).format('YYYY/MM/DD HH:mm'),
        content: `${event.status === 'started' ? '开始' : '结束'}了直播`,
        tooltipText: '',
        pos: event.info ? [event.info.lat, event.info.lon] : []
      }
      state.socketMessage.push(message)
      state.socketCurrentMessage = message
      state.getPhoneLiveData().then(data => state.phoneLiveData = data)
    })
    // 弹药管理事件
    stompClient.subscribe('/renying' + '/event', async msg => {
      let event: AmmunitionEvent = JSON.parse(msg.body);
      if (event.type !== null && event.type.match(/store|takeout|work|destroy/)) {
        console.log('1', event);
        let message = parseAmmunitionMessage(event)
        state.socketMessage.push(message)
        state.socketCurrentMessage = message
      } else if (event.type === null || event.type.match(/transport/)) {
        if (state.transportData[event.id]) {
          let temp = state.transportData[event.id]
          temp.pos = temp.pos.concat(event.pos)
          state.transportData = Object.assign(state.transportData,
            {
              [event.id]: temp.endPos ? temp : computeStartAndEndLayerAttribute(temp)
            })
        } else {
          let temp
          console.log('getAirRequestData')
          let res = await axios({
            url: state.getTransportDataUrl + event.id
          })
          console.log(res.data);
          temp = res.data
          temp.pos = temp.pos.concat(event.pos)
          state.transportData = Object.assign(state.transportData,
            { [event.id]: computeStartAndEndLayerAttribute(temp) })
          console.log('2', event);
          let message = parseAmmunitionMessage(temp)
          state.socketMessage.push(message)
          state.socketCurrentMessage = message
        }
        state.isTransportDataChange = Date.now()
      } else if (event.type.match(/arrive/)) {
        delete state.transportData[event.id]
        state.transportData = Object.assign(state.transportData, {})
        console.log('3', event);
        let message = parseAmmunitionMessage(event)
        state.socketMessage.push(message)
        state.socketCurrentMessage = message
      }
    });
  },
    err => {
      console.error(err)
    });

  function computeStartAndEndLayerAttribute(event) {
    // if (!event) return;
    let temp = event
    const info = JSON.parse(event.info[0])
    if (event.info[0] === null) {
      temp.startName = '起点'
    } else {
      if (!info.isRepo)
        for (let item of state.operateStationData) {
          if (item.id === info.id) {
            item.startName = item.county
            temp.startPos = [item.lat, item.lon]
            break
          }
        }
      else
        for (let item of state.repoData) {
          if (item.id === info.id) {
            temp.startName = item.name
            temp.startPos = [item.lat, item.lon]
            break
          }
        }
    }
    if (!info.isRepo) {
      for (let item of state.operateStationData) {
        if (item.id === event.stationId) {
          temp.endPos = [item.lat, item.lon]
          temp.endName = item.address
        }
      }
    } else {
      for (let item of state.repoData) {
        if (item.id === event.repo) {
          temp.endName = item.name
          temp.endPos = [item.lat, item.lon]
        }
      }
    }
    console.info('computed transportData', temp);
    return temp
  }

  function parseAmmunitionMessage(data: AmmunitionEvent) {
    console.log('parseAmmunitionMessage', data);
    let msg = {
      type: '弹药',
      color: 'operate',
      target: '',
      datetime: moment().format('YYYY/MM/DD HH:mm'),
      content: '',
      tooltipText: '',
      pos: data.pos[0] ? [data.pos[0].lon, data.pos[0].lat] : []
    }
    switch (data.type) {
      case 'store':
        msg.content = `入库了${getAmmunitionNumber(data)}枚弹药`;
        msg.target = `${getUserName(data)}`;
        break
      case 'takeout':
        msg.content = `出库了${getAmmunitionNumber(data)}枚弹药`;
        msg.target = `${getUserName(data)}`;
        break
      case 'work':
        msg.content = `使用了${getAmmunitionNumber(data)}枚弹药`;
        msg.target = `${getUserName(data)}`;
        break
      case 'destroy':
        msg.content = `销毁了${getAmmunitionNumber(data)}枚弹药`;
        msg.target = `${getUserName(data)}`;
        break
      case 'arrive':
        msg.content = `已经到达目的地${getDestinyAndStartName(data)}`;
        msg.target = `${getUserName(data)}`;
        break
      case 'transport':
        msg.content = `从${getDestinyAndStartName(data)}运输弹药到${getDestinyAndStartName(data)}`;
        msg.target = `${getUserName(data)}`;
        break
    }
    return msg
  }
  function getUserName(data: AmmunitionEvent) {
    for (let item of state.appUserData) {
      if (data.userId == item.id) {
        return item.name
      }
    }
  }

  function getDestinyAndStartName(data: AmmunitionEvent) {
    if (data.info[0] !== null)
      for (let item of state.repoData) {
        if (item.id === data.repo)
          return item.name
      }
    else {
      if (data.repo === null)
        for (let item of state.operateStationData) {
          if (item.id === data.stationId) {
            return item.name
          }
        }
      else
        for (let item of state.repoData) {
          if (item.id === data.repo)
            return item.name
        }
    }
  }
  function getAmmunitionNumber(data: AmmunitionEvent) {
    let number = 0
    for (let item of data.res) {
      if (item.type === 'Ammo')
        number += 1
      else
        number += 4
    }
    return number
  }

  function parseReturnMessage(data) {
    let msg = {
      type: '',
      color: 'operate',
      target: '',
      datetime: moment().format('YYYY/MM/DD HH:mm'),
      content: '',
      tooltipText: '指挥员 '
    }
    for (let item of state.operateStationData) {
      if (item.id === data.osId) {
        msg.target = item.appUser.name
        msg.tooltipText += item.appUser.phone
        break
      }
    }
    switch (data.stage) {
      case 0: msg.type = '需求分析'; break
      case 1: msg.type = '作业计划'; break
      case 2: msg.type = '作业潜力'; break
      case 3: msg.type = '作业预警'; break
      case 3: msg.type = '实时指挥'; break
      case 5: msg.type = '效果评估'; break
      default: msg.type = '五段流程'; break
    }
    if (data.stage == 0) {
      switch (data.state) {
        case 0: msg.content = '不响应'; break
        case 1: msg.content = '响应'; break
        default: msg.content = '等待'; break
      }
    } else {
      switch (data.state) {
        case 0: msg.content = '不作业'; break
        case 1: msg.content = '作业'; break
        default: msg.content = '等待'; break
      }
    }
    return msg
  }
}

export function toggleSearchOperateStation(state: State) {
  state.isSearchOperateStationWindowOn = !state.isSearchOperateStationWindowOn
}

export function updateAppGroupData(state: State, data) {
  state.appGroupData = data
}

export function updateOperateStationData(state: State, data) {
  state.operateStationData = data
}

export function socketSendMessage(state: State, message: any) {
  state.socket.send(message)
}

export function storeDisasterManageImg(state: State) {
  state.isDisasterManageImg = !state.isDisasterManageImg
}

export function storedisasterMsg(state: State, action: any) {
  state.disasterMsg = action
}

export function toggleLeftNavOpenState(state: State) {
  state.isLeftNavOpened = !state.isLeftNavOpened
}
export const storeCappiProfile = (state: State, data: { SLat: boolean, SLon: boolean, ELat: boolean, ELon: boolean }) => {
  state.cappiProfile.SLat = data.SLat
  state.cappiProfile.SLon = data.SLon
  state.cappiProfile.ELat = data.ELat
  state.cappiProfile.ELon = data.ELon
}

export function freshOperate(state: State) {
  state.freshOperate = Date.now()
}

export function storeisCappiProfileOn(state: State, action: any) {
  state.isCappiProfileOn = action
}
export function storeisOrderDispatchOn(state: State, action: any) {
  state.isOrderDispatchOn = action
}


export function toggleIsShowTransportLayer(state: State) {
  state.isShowTransportLayer = !state.isShowTransportLayer
}
export function toggleIsShowAirRequestLayer(state: State) {
  state.isShowAirRequestLayer = !state.isShowAirRequestLayer
}
export function toggleIsShowAirLineLayer(state: State) {
  state.isShowAirLineLayer = !state.isShowAirLineLayer
}
export function toggleIsShowPhoneLiveLayer(state: State) {
  state.isShowPhoneLiveLayer = !state.isShowPhoneLiveLayer
}


export function changePhoneLiveId(state: State, id: string) {
  state.phoneLiveId = id
}

export function storeaqiDetailInfo(state: State, data) {
  state.aqiDetailInfo = { ...data }
}

export function storecolorbarElements(state: State, data: { key: string, type: 'add' | 'remove' }) {
  if (data.type === 'add') {
    if (state.colorbarElements[data.key])
      state.colorbarElements[data.key]++
    else
      state.colorbarElements[data.key] = 1
  } else if (data.type === 'remove') {
    state.colorbarElements[data.key]--
    if (!state.colorbarElements[data.key])
      delete state.colorbarElements[data.key]
  }
  state.colorbarElements = { ...state.colorbarElements }
}
export function storeisTransportOpened(state: State,action) {
  state.isTransportOpened = action
}

export default <MutationTree<State>>{
  changeUserInfo,
  changeSubMenu,
  toggleProductView,
  closeProductView,
  changeArticleViewHolder,
  storeMenuChanged,
  storeSecondMenuChanged,
  connectSocket,
  socketSendMessage,
  storeDisasterManageImg,
  storedisasterMsg,
  storeCappiProfile,
  storeisCappiProfileOn,
  storeisOrderDispatchOn,
  updateAppGroupData,
  updateOperateStationData,
  toggleSearchOperateStation,
  toggleLeftNavOpenState,
  freshOperate,
  toggleIsShowAirLineLayer,
  toggleIsShowAirRequestLayer,
  toggleIsShowTransportLayer,
  toggleIsShowPhoneLiveLayer,
  changePhoneLiveId,
  storeaqiDetailInfo,
  storecolorbarElements,
  storeisTransportOpened,
}
