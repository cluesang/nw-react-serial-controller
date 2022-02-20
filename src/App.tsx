import React, { useEffect, useState } from 'react';
import { 
  Container
, Row
, Col
, Button
, Offcanvas
, OffcanvasHeader
, OffcanvasBody 
, Toast
, ToastHeader
, ToastBody
, Alert
} from 'reactstrap';
import { SerialPortList, SerialPortConnection, SerialPortMonitor} from './components/SerialUIComponents';
import { SerialDeviceController } from './controllers/SerialDeviceController';
import './App.css';

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse)=>{
  console.log(request, sender, sendResponse);
});

const App = () => {

  const [openCanvas, setOpenCanvas ] = useState(false);
  const [disablePortList, setDisablePortList ] = useState(false);
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
    SerialDeviceController.addListener((successStatus,connectionId,message)=>{
      // if(message.length===0)return
      console.log(successStatus,connectionId,message);
      setSeriallineData(seriallineData=>[...seriallineData,message]);
    });
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
    setDisablePortList(true);
  }

  const onSerialPortDisconnect = (result: boolean) =>
  {
    console.log(result);
    setSerialConnectionInfo(undefined);
    setDisablePortList(false);
  }

  const onError = (msg: string) =>
  {
    console.log(msg);
    alertUser(msg);
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
          <Col sm={"3"} >
            <SerialPortConnection
              onConnect={onSerialPortConnect} 
              onDisconnect={onSerialPortDisconnect} 
              onError={onError}
              serialDeviceInfo={serialDeviceInfo}
              serialConnectionInfo={serialConnectionInfo}
            />
            <SerialPortList 
              disabled={disablePortList}
              onSelect={onSerialPortSelect} 
              onError={onError}
            />
          </Col>
          <Col sm={"8"} >
            
          </Col>
          <Col sm={"1"} >
            <Button
              color="primary"
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
      >
        <OffcanvasHeader toggle={toggleCanvas}>
          Monitor
        </OffcanvasHeader>
        <OffcanvasBody>
          <SerialPortMonitor lineData={seriallineData}/>
        </OffcanvasBody>
      </Offcanvas>
    </div>
  );
}

export default App;
