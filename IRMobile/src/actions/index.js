import uuid from 'react-native-uuid'

import { ASSIGN_IR_CODE, CREATE_BUTTON, DELETE_BUTTON, EDIT_BUTTON, SET_BASE_URL } from '../constants/actions'



export function assignIRCode(id, codeData) {
  console.log('ASSIGNING IR CODE TO BUTTON', id, codeData)
  const { type, value, length } = codeData
  return {
    type: ASSIGN_IR_CODE,
    payload: {
      id,
      type,
      value,
      length,
    },
  }
}

export function createButton() {
 return (dispatch, getState) => {
   return {
     type: CREATE_BUTTON,
     id: uuid.v1()
   }
 }
}

export function deleteButton(id) {
  return {
    type: DELETE_BUTTON,
    id,
  }
}

export function editButton({ id, title, icon }) {
  return {
    type: EDIT_BUTTON,
    payload: {
      id,
      title,
      icon,
    }
  }
}

export function setBaseUrl(url) {
  return {
    type: SET_BASE_URL,
    payload: url,
  }
}

let pollInterval

export function captureIRCode(buttonId, setRecordButton, onStatusChanged) {
  return async (dispatch, getState) => {
    console.log('CAPTURING!!', buttonId)
    try {
      const response = await dispatch(startRecord())
      if (response.ok) {
        dispatch(checkForCapturedCode(buttonId, setRecordButton, onStatusChanged))
      }
    } catch (err) {
      console.log('## startRecord err', err)
      if (pollInterval) clearInterval(pollInterval)
    }
  }
}

export function startRecord() {
  return async (dispatch, getState) => {
    console.log('START RECORD')
    const { baseUrl } = getState().network
    const response = await fetch(`${baseUrl}/rec`)
    return response
  }
}

export function stopRecord() {
  return async (dispatch, getState) => {
    const { baseUrl } = getState().network
    try {
      fetch(`${baseUrl}/stop`)
      if (pollInterval) clearInterval(pollInterval)
    } catch (err) {
      console.log('## stopRecord err', err)
    }
  }
}

export function clearRecordingState() {
  return async (dispatch, getState) => {
    const { baseUrl } = getState().network
    try {
      fetch(`${baseUrl}/clear`)
    } catch (err) {
      console.log('## clearRecordingState err', err)
    }
  }
}

const MAX_TIMES_TO_CHECK_FOR_NEW_CODE = 10

export function checkForCapturedCode(buttonId, setRecordButton = () => {}, onStatusChanged = () => {}) {
  return async (dispatch, getState) => {
    const { baseUrl } = getState().network
    try {

      if (pollInterval) clearInterval(pollInterval)

      // Check for IR code every second
      let pollCounter = 0
      pollInterval = setInterval(async () => {

        console.log('Checking...', pollCounter)

        const response = await fetch(`${baseUrl}/check`)
        const codeData = await response.json()
        if (codeData && codeData.value) {
          console.log('GOT A CODE!', codeData)
          clearInterval(pollInterval)
          dispatch(assignIRCode(buttonId, codeData))
          onStatusChanged(true)
          setRecordButton(null)
          console.log('GOT CODE')
        } else if (pollCounter > MAX_TIMES_TO_CHECK_FOR_NEW_CODE) {
          // Too much time has passed, give up
          dispatch(stopRecord())
          clearInterval(pollInterval)
          onStatusChanged(false)
          setRecordButton(null)
          console.log('MAX REACTHED')
        }
        pollCounter++
      }, 1000)
    } catch (err) {
      pollInterval && clearInterval(pollInterval)
      console.log('ERR!!!')
      onStatusChanged(false)
      setRecordButton(null)
    }
  }
}

export function transmitIRCode(buttonId) {
  return async (dispatch, getState) => {
    const { baseUrl } = getState().network
    console.log(getState().buttons)
    const { type, value, length } = getState().buttons[buttonId]
    console.log('TRANSMITTING CODE', value)

    const response = await fetch(`${baseUrl}/send?len=${length}&val=${value}&type=${type}`)
    const text = await response.text()
    console.log(text)
  }
}
