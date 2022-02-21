import React, { useEffect, useState } from 'react';
import { 
  Container
, Row
, Col
, Button
, Offcanvas
, OffcanvasHeader
, OffcanvasBody 
, Alert
} from 'reactstrap';
import { SerialPortList, SerialPortConnection, SerialPortMonitor, SerialReader, SerialSender} from './components/SerialUIComponents';
import { SerialDeviceController } from './controllers/SerialDeviceController';
import './App.css';

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse)=>{
  console.log(request, sender, sendResponse);
});

const App = () => {

  const [openCanvas, setOpenCanvas ] = useState(false);
  const [isConnected, setIsConnected ] = useState(false);
  const [alertMessage, setAlertMessage ] = useState<string|undefined>();
  const [serialDeviceInfo, setSerialDeviceInfo] = useState<chrome.serial.DeviceInfo|undefined>();
  const [serialConnectionInfo, setSerialConnectionInfo] = useState<chrome.serial.ConnectionInfo|undefined>();
  const [seriallineData, setSeriallineData] = useState<string[]>([""]);
  const [showNotifications, setShowNotifications] = useState(false);
  const toggleCanvas = () => setOpenCanvas(!openCanvas);

  const alertUser = (message:string) =>
  {
    setShowNotifications(true);
    setAlertMessage(message);
    setTimeout(()=>setShowNotifications(false),7500);
  }

  const toggleNotification = () => setShowNotifications(!showNotifications);
  
  useEffect(()=>{
    init();
  },[]);

  const init = async() => 
  {
  }

  const onSerialPortSelect = (deviceInfo: chrome.serial.DeviceInfo) =>
  {
    console.log(deviceInfo);
    setSerialDeviceInfo(deviceInfo);
  }

  const onSerialPortConnect = (connectionInfo: chrome.serial.ConnectionInfo) =>
  {
    console.log(connectionInfo);
    setSerialConnectionInfo(connectionInfo);
    setIsConnected(true);
  }

  const onSerialPortDisconnect = (result: boolean) =>
  {
    console.log(result);
    setSerialConnectionInfo(undefined);
    setIsConnected(false);
  }

  const onSerialInput = (input:string) =>
  {
    console.log(input);
  }

  const onSerialSend = (sendInfo:object) =>
  {
    console.log(sendInfo);
  }

  const onError = (msg: string) =>
  {
    console.log(msg);
    if(msg.length>0) alertUser(msg);
  }

  return (
    <div className="App">
      <Container>
        <Row>
          <Col sm={"12"} className={(showNotifications)?"my-2":"my-5"}>
            {(!showNotifications)? false :
              <Alert
                color="info"
                isOpen={showNotifications}
                toggle={toggleNotification}
              >
                {alertMessage}
              </Alert>}
          </Col>
        </Row>
        <Row xs={"4"}>
          <Col sm={"3"} className={"d-flex justify-content-end"}>
            <SerialPortConnection
              onConnect={onSerialPortConnect} 
              onDisconnect={onSerialPortDisconnect} 
              onError={onError}
              serialDeviceInfo={serialDeviceInfo}
              serialConnectionInfo={serialConnectionInfo}
            />
            <SerialPortList 
              onSelect={onSerialPortSelect} 
              isConnected={isConnected}
              onError={onError}
            />
          </Col>
          <Col sm={"4"} >
            <SerialReader 
              connectionId={serialConnectionInfo?.connectionId}
              onSerialInput={onSerialInput}
              onError={onError}
            />
          </Col>
          <Col sm={"4"} >
            <SerialSender
              connectionId={serialConnectionInfo?.connectionId}
              onSerialSend={onSerialSend}
              onError={onError}
            />
          </Col>
          <Col sm={"1"} className={"my-2"} >
            <Button
              color={(isConnected)?"primary":"secondary"}
              className={(!isConnected)?"muted":""}
              disabled={!isConnected}
              onClick={toggleCanvas}
            >
              Monitor
            </Button>
          </Col>
        </Row>
    </Container>
      <Offcanvas
        direction="end"
        toggle={toggleCanvas}
        isOpen={openCanvas}
        style={{width: "50vw"}}
        unmountOnClose={false}
      >
        <OffcanvasHeader toggle={toggleCanvas}>
          Monitor
        </OffcanvasHeader>
        <OffcanvasBody>
          <SerialPortMonitor 
            connectionId={serialConnectionInfo?.connectionId}
            onSerialInput={onSerialInput}
            onError={onError}
            />
        </OffcanvasBody>
      </Offcanvas>
    </div>
  );
}

export default App;
