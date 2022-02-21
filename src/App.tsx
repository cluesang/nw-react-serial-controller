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
import { SerialPortList, SerialPortConnection, SerialPortMonitor, SerialReader, SerialSender, SerialManager} from './components/SerialUIComponents';
import { SerialDeviceController } from './controllers/SerialDeviceController';
import './App.css';

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse)=>{
  console.log(request, sender, sendResponse);
});

const App = () => {

  const [alertMessage, setAlertMessage] = useState<string | undefined>();
  const [showNotifications, setShowNotifications] = useState(false);

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
      <SerialManager onError={onError}/>
      <SerialManager onError={onError}/>
    </div>
  );
}

export default App;
