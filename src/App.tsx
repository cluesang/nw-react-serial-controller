import React, { useEffect, useState } from 'react';
import { 
  Row
, Button
, Offcanvas
, OffcanvasHeader
, OffcanvasBody 
, Alert
} from 'reactstrap';
import { SerialPortList, SerialPortConnection, SerialPortMonitor} from './components/SerialUIComponents';
import TerminalController from './components/TerminalController';
import { SerialDeviceController } from './controllers/SerialDeviceController';
import './App.css';

const App = () => {

  const [openCanvas, setOpenCanvas ] = useState(false);
  const [disablePortList, setDisablePortList ] = useState(false);
  const [alertMessage, setAlertMessage ] = useState<string|undefined>();
  const [serialDeviceInfo, setSerialDeviceInfo] = useState<chrome.serial.DeviceInfo|undefined>();
  const [serialConnectionInfo, setSerialConnectionInfo] = useState<chrome.serial.ConnectionInfo|undefined>();
  const toggleCanvas = () => setOpenCanvas(!openCanvas);
  
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
    setAlertMessage(msg);
  }

  return (
    <div className="App">
      <div>
        <Row>
          <Alert>
              {alertMessage}
          </Alert>
          <Button
            color="primary"
            onClick={toggleCanvas}
          >
            Open Monitor
          </Button>
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
        </Row>
      <Offcanvas
        direction="bottom"
        toggle={toggleCanvas}
        isOpen={openCanvas}
      >
        <OffcanvasHeader toggle={toggleCanvas}>
          Terminal
        </OffcanvasHeader>
        <OffcanvasBody>
          <SerialPortMonitor />
        </OffcanvasBody>
      </Offcanvas>
    </div>
    </div>
  );
}

export default App;
