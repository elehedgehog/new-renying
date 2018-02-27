import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './RequirePopup.html?style=./RequirePopup.scss'

@WithRender
@Component
export default class RequirePopup extends Vue {
}