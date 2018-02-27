import Vue from 'vue'
import Drag from 'draggabilly'

Vue.directive('drag', {
  // 当绑定元素插入到 DOM 中。
  inserted: (el, binding) => {
    new Drag(el, {
      handle: 'header'
    })
  }
})