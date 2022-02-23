import React, { useEffect, useState } from 'react';
import { 
  Row
, Col
, Alert,
Button
} from 'reactstrap';
import { SerialManager } from './SerialUIComponents';
import {POCReaderController, READER_STATE, READER_ACTION} from '../controllers/POCReaderController';

interface iReaderAction {
  connectionId: number
, action: READER_ACTION
}

const ReaderAction = ({connectionId, action}:iReaderAction) =>
{
  const sendAction = () =>
  {
    const command = POCReaderController.genCommand(action);
    console.log(command);
    POCReaderController.send(connectionId,command);
  }

  return (
    <Button
      onClick={sendAction}
    >
      {action}
    </Button>
    )
}

const POCReader = () => {

  const [alertMessage, setAlertMessage] = useState<string | undefined>();
  const [showNotifications, setShowNotifications] = useState(false);
  const [readerState, setReaderState] = useState(POCReaderController.state);
  const [connectionId, setConnectionId] = useState<number>();

  const toggleNotification = () => setShowNotifications(!showNotifications);

  const alertUser = (message: string) => {
      setShowNotifications(true);
      setAlertMessage(message);
      setTimeout(() => setShowNotifications(false), 7500);
  }
  
  const onError = (msg: string) => {
      console.log(msg);
      if (msg.length > 0) alertUser(msg);
  }

  const onConnect = (connectionInfo: chrome.serial.ConnectionInfo) =>
  {
    // console.log(connectionInfo);
    setConnectionId(connectionInfo.connectionId);
    POCReaderController.setState(READER_STATE.CONNECTED);
  }

  const onDisconnect = (result: boolean) =>
  {
    console.log(result);
    POCReaderController.setState(READER_STATE.DISCONNECTED);
  }

  const onData = (connectionId:number, data: string) =>
  {
    POCReaderController.parseSerialOutput(data);
  }

  const onReaderStateChange = (state:READER_STATE) =>
  {
    setReaderState(state);
  }
  POCReaderController.onStateChange(onReaderStateChange);

  return (
    <div className="App">
      <Row>
          <Col sm={"12"} className={(showNotifications) ? "my-2" : "my-5"}>
              {(!showNotifications) ? false :
                  <Alert
                      color="info"
                      isOpen={showNotifications}
                      toggle={toggleNotification}
                  >
                      {alertMessage}
                  </Alert>}
          </Col>
      </Row>
      <SerialManager 
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        onData={onData}
        onError={onError}
        />
      <Row>
        <Col xs={2}>
          Reader State:
        </Col>
        <Col xs={2}>
          {readerState}
        </Col>
        <Col xs={8}>
          {(connectionId)?
            <div>
              <ReaderAction connectionId={connectionId} action={READER_ACTION.INITIALIZE} />
              <ReaderAction connectionId={connectionId} action={READER_ACTION.BLINK} />
              <ReaderAction connectionId={connectionId} action={READER_ACTION.GET_METADATA} />
              <ReaderAction connectionId={connectionId} action={READER_ACTION.RUN_DIAGNOSTIC} />
              <ReaderAction connectionId={connectionId} action={READER_ACTION.RESET} />
            </div>
          : false}
        </Col>
      </Row>
    </div>
  );
}

export default POCReader;
