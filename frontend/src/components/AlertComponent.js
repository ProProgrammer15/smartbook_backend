import React from 'react'
import { Alert } from 'react-bootstrap'

export default function AlertComponent(props) {
  return (
    <div>
      {props.alert && <Alert key={props.alert.type} variant={props.alert.type}>
          {props.alert.type}: {props.alert.message}
        </Alert>}
    </div>
  )
}
