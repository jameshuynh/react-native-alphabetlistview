'use strict'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactNative, {
  Platform,
  StyleSheet,
  View,
  Text,
  NativeModules,
  Dimensions
} from 'react-native'

const { UIManager } = NativeModules
const returnTrue = () => true

const isIPhoneX = () => {
  let d = Dimensions.get('window')
  const { height, width } = d

  return (
    // This has to be iOS duh
    Platform.OS === 'ios' &&
    // Accounting for the height in either orientation
    (height === 812 || width === 812)
  )
}

const returnTrue = () => true

export default class SectionList extends Component {
  constructor(props, context) {
    super(props, context)

    this.onSectionSelect = this.onSectionSelect.bind(this)
    this.resetSection = this.resetSection.bind(this)
    this.detectAndScrollToSection = this.detectAndScrollToSection.bind(this)
    this.lastSelectedIndex = null
  }

  onSectionSelect(sectionId, fromTouch) {
    this.props.onSectionSelect && this.props.onSectionSelect(sectionId)

    if (!fromTouch) {
      this.lastSelectedIndex = null
    }
  }

  resetSection() {
    this.lastSelectedIndex = null
  }

  detectAndScrollToSection(e) {
    const ev = e.nativeEvent.touches[0]
    const locationY = ev.locationY
    const { height } = this.measure
    UIManager.measure(
      ReactNative.findNodeHandle(this.firstEl),
      (_x, _y, _width, _height, _pageX, pageY) => {
        this.firstElPageY = pageY - (isIPhoneX() ? 80 : 64)
        let index = Math.floor((locationY - this.firstElPageY) / height)
        if (index < 0) {
          index = 0
        }
        if (index >= this.props.sections.length) {
          return
        }

        if (
          this.lastSelectedIndex !== index &&
          this.props.data[this.props.sections[index]].length
        ) {
          this.lastSelectedIndex = index
          this.onSectionSelect(this.props.sections[index], true)
        }
      }
    )
  }

  fixSectionItemMeasure() {
    const sectionItem = this.refs.sectionItem0
    if (!sectionItem) {
      return
    }
    this.measureTimer = setTimeout(() => {
      sectionItem.measure((x, y, width, height, pageX, pageY) => {
        this.measure = {
          y: pageY,
          width,
          height
        }
      })
    }, 0)
  }

  componentDidMount() {
    this.fixSectionItemMeasure()
  }

  // fix bug when change data
  componentDidUpdate() {
    this.fixSectionItemMeasure()
  }

  componentWillUnmount() {
    this.measureTimer && clearTimeout(this.measureTimer)
  }

  render() {
    const SectionComponent = this.props.component
    const sections = this.props.sections.map((section, index) => {
      const title = this.props.getSectionListTitle
        ? this.props.getSectionListTitle(section)
        : section

      const textStyle = this.props.data[section].length
        ? styles.text
        : styles.inactivetext

      const extraProps =
        index === 0 ? { ref: firstEl => (this.firstEl = firstEl) } : {}

      const child = SectionComponent ? (
        <SectionComponent sectionId={section} title={title} {...extraProps} />
      ) : (
        <View style={styles.item} {...extraProps}>
          <Text style={[textStyle, this.props.fontStyle]}>{title}</Text>
        </View>
      )

      return (
        <View key={index} ref={'sectionItem' + index} pointerEvents="none">
          {child}
        </View>
      )
    })

    return (
      <View
        ref="view"
        style={[styles.container, this.props.style]}
        onStartShouldSetResponder={returnTrue}
        onMoveShouldSetResponder={returnTrue}
        onResponderGrant={this.detectAndScrollToSection}
        onResponderMove={this.detectAndScrollToSection}
        onResponderRelease={this.resetSection}>
        {sections}
      </View>
    )
  }
}

SectionList.propTypes = {
  /**
   * A component to render for each section item
   */
  component: PropTypes.func,

  /**
   * Function to provide a title the section list items.
   */
  getSectionListTitle: PropTypes.func,

  /**
   * Function to be called upon selecting a section list item
   */
  onSectionSelect: PropTypes.func,

  /**
   * The sections to render
   */
  sections: PropTypes.array.isRequired,

  /**
   * A style to apply to the section list container
   */
  style: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),

  /**
   * Text font size
   */
  fontStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object])
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
    right: 0,
    paddingRight: 10,
    paddingLeft: 10,
    justifyContent: 'center',
    top: 0,
    bottom: 0
  },

  item: {
    padding: 0
  },

  text: {
    fontWeight: '700',
    color: '#008fff'
  },

  inactivetext: {
    fontWeight: '700',
    color: '#CCCCCC'
  }
})
