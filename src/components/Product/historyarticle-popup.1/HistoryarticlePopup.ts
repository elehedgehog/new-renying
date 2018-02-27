import Vue from 'vue'
import { Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './HistoryarticlePopup.html?style=./HistoryarticlePopup.scss'

@WithRender
@Component
export default class HistoryarticlePopup extends Vue {
  @Getter('systemStore/articleViewHolder_global') articleViewHolder_global  
  @Action('systemStore/changeArticleViewHolder_global') changeArticleViewHolder_global
  selectDate: Date = null
  provincePopup:boolean = false;
  countyPopup:boolean = false;
  cityPopup:boolean = false;
  minify: boolean = false;
  
}