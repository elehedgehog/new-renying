import Vue from 'vue'
import {Component, Watch} from 'vue-property-decorator'
import {Action, Getter} from 'vuex-class'
import OperateHistory from '../../commons/operation-history/OperateHistory'
import WithRender from './OperatePotentialHistory.html?style=./OperatePotentialHistory.scss'

@WithRender
@Component
export default class OperatePotentialHistory extends Vue {
  @Getter('systemStore/articleViewHolder_global') articleViewHolder_global
  @Action('systemStore/changeArticleViewHolder_global') changeArticleViewHolder_global

  minify: boolean = false

  word='20'
  OperateHistory=OperateHistory

}
