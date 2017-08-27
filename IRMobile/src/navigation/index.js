import React from 'react'
import { StackNavigator, TabNavigator } from 'react-navigation'
import { connect } from 'react-redux'
import { setCurrentRemoteId, setModalVisible, setHeaderModalVisible, setEditMode } from '../actions'

import RemoteContainer from '../components/RemoteContainer'

import {
  TAB_BACKGROUND_COLOR_ACTIVE,
  TAB_BACKGROUND_COLOR_INACTIVE,
  TAB_LABEL_COLOR_ACTIVE,
  TAB_LABEL_COLOR_INACTIVE
} from '../constants/colors'

const Navigator = StackNavigator({
  Remote: { screen: RemoteContainer },
  }, {
  initialRouteName: 'Remote',
  headerMode: 'float',
})

export const createTabNavigator = (keys, Screen) => {
  const routeConfig = {}
  keys.forEach(key => {
    routeConfig[key] = { screen: Screen }
  })

  const navigatorConfig = {
    initialRouteName: keys[keys.length-1],
    swipeEnabled: true,
    animationEnabled: true,
    order: keys,
    tabBarOptions: {
      activeTintColor: TAB_LABEL_COLOR_ACTIVE,
      inactiveTintColor: TAB_LABEL_COLOR_INACTIVE,
      activeBackgroundColor: TAB_BACKGROUND_COLOR_ACTIVE,
      inactiveBackgroundColor: TAB_BACKGROUND_COLOR_INACTIVE,
    }
  }

  const onNavigationStateChange = function(prevState, newState){
    console.log('STATE CHANGED', prevState, newState)
    if (this.setCurrentRemoteId) this.setCurrentRemoteId(newState.routes[newState.index].routeName)
    if (this.setHeaderModalVisible) this.setHeaderModalVisible(false)
  }

  const mapDispatchToProps = function(dispatch){
    return {
      setCurrentRemoteId: remoteId => dispatch(setCurrentRemoteId(remoteId)),
      setHeaderModalVisible: visible => dispatch(setHeaderModalVisible(visible)),
      setEditMode: editing => dispatch(setEditMode(editing))
    }
  }

  const Navigator = connect(null, mapDispatchToProps)(TabNavigator(routeConfig, navigatorConfig))
  return <Navigator onNavigationStateChange={onNavigationStateChange} />

}

export default Navigator
