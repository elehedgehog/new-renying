import Vue from 'vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import WithRender from './SelectToggle.html?style=./SelectToggle.scss'

@WithRender
@Component
export default class SelectToggle extends Vue {
  @Prop({ default: [0, 1, 2, 3] }) optionData: any[]
  @Prop({ default: 168 }) width
  @Prop({ default: 30 }) height
  @Prop({ default: '#f0f1f4' }) backgroundColor
  @Prop() preSelectedOption
  @Prop() selectionChange: Function

  optionSelected = null
  isOptionPopupShow: boolean = false
  classBinding: string = ''

  created() {
    if (this.preSelectedOption) this.optionSelected = this.preSelectedOption
    else this.optionSelected = this.optionData[0]
  }

  @Watch('isOptionPopupShow')
  isOptionPopupShowChanged(val: any, oldVal: any): void {
    if (val) {
      let ele = <HTMLDivElement>document.querySelector('#SelectToggle')
      let winHeight = window.innerHeight
      let top = ele.getBoundingClientRect().top
      let popupHeight = this.optionData.length * 30
      if (top + popupHeight < winHeight)
        this.classBinding = 'topPos'
      else
        this.classBinding = 'bottomPos'
    }
  }
  @Watch('optionSelected')
  optionSelectedChanged(val: any, oldVal: any): void {
    this.selectOption(val)
    if (typeof this.selectionChange === 'function')
      this.selectionChange(this.optionSelected)
  }
  @Watch('preSelectedOption')
  preSelectedOptionChanged(val: any, oldVal: any): void {
    if (this.optionData.indexOf(val) !== -1) {
      this.optionSelected = val
    }
  }
  @Watch('optionData')
  optionDataChange(val) {
    if (this.optionData.indexOf(this.optionSelected) === -1) {
      this.optionSelected = this.optionData[0]
    }
  }

  selectOption(item) {
    this.optionSelected = item
    this.isOptionPopupShow = false
  }

  upward() {
    if (this.optionData.indexOf(this.optionSelected) >= 1)
      this.optionSelected = this.optionData[this.optionData.indexOf(this.optionSelected) - 1]
  }

  downward() {
    if (this.optionData.indexOf(this.optionSelected) < this.optionData.length - 1)
      this.optionSelected = this.optionData[this.optionData.indexOf(this.optionSelected) + 1]
  }

  openPopup() {
    this.isOptionPopupShow = !this.isOptionPopupShow
    let index = this.optionData.indexOf(this.optionSelected)
    let height = this.height * index
    this.$nextTick(() => {
      let el = <HTMLDivElement>this.$refs.popup
      el.scrollTop = height - 2 * this.height
    })
  }
}



