import React, { Component, PropTypes } from 'react'
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
}  from 'react-native'
import { connect } from 'react-redux'

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import CircleEditButton from './CircleEditButton'

import themes from '../constants/themes'

import { BUTTON_RADIUS } from '../constants/dimensions'

const PULSE_RATE = 750

class RemoteButton extends Component {

  static propTypes = {
    id: PropTypes.string,
    capturingButtonId: PropTypes.string,
    status: PropTypes.bool,
  }

  static contextTypes = {
    theme: PropTypes.string,
  }

  pulseAnim = new Animated.Value(0)
  statusAnim = new Animated.Value(0)

  state = {
    irCaptureStatus: null,
  }

  componentDidUpdate(prevProps) {
    const isRecording = this.props.capturingButtonId === this.props.id
    const hasNewStatus = (this.props.status !== null) && (prevProps.status !== this.props.status)
    if ((prevProps.capturingButtonId !== this.props.id) && isRecording) this.pulseBackground()
    if (isRecording && hasNewStatus) this.onStatusChanged()
  }

  pulseBackground = () => {
    if (this.props.capturingButtonId !== this.props.id) return

    Animated.timing(this.pulseAnim, {
      toValue: 1,
      duration: PULSE_RATE,
    }).start(() => {
      Animated.timing(this.pulseAnim, {
        toValue: 0,
        duration: PULSE_RATE,
      }).start(() => this.pulseBackground())
    })
  }

  onStatusChanged = () => {
    Animated.timing(this.statusAnim, {
      toValue: 1,
      duration: 250,
    }).start(() => {
      Animated.timing(this.statusAnim, {
        toValue: 0,
        duration: 250,
      }).start(() => {
        this.props.onStatusChangeEnd()
      })
    })
  }



  render() {
    const { iconSize = 30, id, style, title, editing, iconName, onPress = () => {}, onEditPress, capturingButtonId, status, color = LIGHT_GREY } = this.props
    const isRecording = capturingButtonId === id
    const hasStatus = status !== null

    const {
      LIGHT_GREY,
      BUTTON_BACKGROUND_COLOR,
      BUTTON_TEXT_COLOR,
      CAPTURING_IN_PROGRESS_COLOR,
      STATUS_GOOD_COLOR,
      STATUS_BAD_COLOR
    } = themes[this.context.theme]



    const flashColor = status ? STATUS_GOOD_COLOR : STATUS_BAD_COLOR




    const pulseStyle = {
        backgroundColor: this.pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [BUTTON_BACKGROUND_COLOR, CAPTURING_IN_PROGRESS_COLOR]
        })
      }

    const statusStyle = {
      backgroundColor: this.statusAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [BUTTON_BACKGROUND_COLOR, BUTTON_BACKGROUND_COLOR, flashColor]
      })
    }

    return (
      <View style={styles.wrapper}>
        <Animated.View
          style={[styles.animatedContainer, { backgroundColor: BUTTON_BACKGROUND_COLOR }, isRecording && pulseStyle, hasStatus && statusStyle, style]}
        >
          <TouchableOpacity
            onPress={editing ? () => onEditPress(id) :  () => onPress(id)}
            style={styles.touchable}
          >
            { !!iconName && <Icon name={iconName} size={iconSize} color={color} /> }
            { !!title && <Text style={[styles.text, { color: BUTTON_TEXT_COLOR }]} numberOfLines={1}>{title}</Text> }

          </TouchableOpacity>

        </Animated.View>
        { editing && <CircleEditButton onPress={() => onEditPress(id)} style={styles.editButton} /> }

      </View>
      )
    }
}

const mapStateToProps = (state, ownProps) => ({
  iconName: state.buttons[ownProps.id].icon,
  title: state.buttons[ownProps.id].title,
  editing: state.app.editing,
  capturingButtonId: state.app.capturingButtonId,
})

export default connect(mapStateToProps)(RemoteButton)

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: "300",
    fontSize: 15,
    paddingHorizontal: 7,
  },
  animatedContainer: {
    flex: 1,
    margin: 15,
    height: 75,
    borderRadius: BUTTON_RADIUS,
  },
  editButton: {
    position: 'absolute',
    transform: [
      { translateX: 8 },
      { translateY: 8 }
    ],
  }
})