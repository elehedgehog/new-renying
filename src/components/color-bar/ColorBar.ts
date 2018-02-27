import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './ColorBar.html?style=./ColorBar.scss'

@WithRender
@Component
export default class ColorBar extends Vue {
  @Getter('systemStore/colorbarElements_global') colorbarElements_global
  url = 'http://10.148.83.228:8922/other/colortable/renderColorTable?name={name}&tip=&offset=0&width=420&height=30&horizontal=true'
}