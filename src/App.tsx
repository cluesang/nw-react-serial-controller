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
import POCReader from './components/POCReader';
import * as types from './controllers/IPOCReaderController';
import * as enums from "./controllers/POC_enums";
import './App.css';

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse)=>{
  console.log(request, sender, sendResponse);
});

const App = () => {

  const [alertMessage, setAlertMessage] = useState<string | undefined>();
  const [showNotifications, setShowNotifications] = useState(false);

  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isInRoutine, setIsInRoutine] = useState<boolean>(false);
  const [isDiagonsing, setIsDiagonsing] = useState<boolean>(false);

  const [results, setResults] = useState<types.iDiagnosticResults|undefined>();
  const [calibrationResults, setCalibrationResults] = useState<types.iCalibrationResults>();

  const toggleNotification = () => setShowNotifications(!showNotifications);

  const alertUser = (message: string) => {
      setShowNotifications(true);
      setAlertMessage(message);
      setTimeout(() => setShowNotifications(false), 7500);
  }

  const onReaderStateChange = (state: string, message:string) =>
  {
    console.log(state);
    switch (state) {
      case enums.APP_STATE.STARTING_CALIBRATION:
        {
          setIsCalibrating(true);
        }
        break;
      case enums.APP_STATE.FINISHED_CALIBRATION:
        {
          setIsCalibrating(false);
        }
        break;
      case enums.APP_STATE.CANCELED_CALIBRATION:
        {
          setIsCalibrating(false);
        }
        break;
      case enums.APP_STATE.STARTING_ROUTINE:
        {
          setIsInRoutine(true);
        }
        break;
      case enums.APP_STATE.FINISHED_ROUTINE:
        {
          setIsInRoutine(false);
        }
        break;
      case enums.APP_STATE.CANCELED_ROUTINE:
        {
          setIsInRoutine(false);
        }
        break;
      case enums.READER_STATE.RUNNING_DIAGNOSTIC:
        {
          setIsDiagonsing(true);
        }
        break;
      case enums.READER_STATE.FINISHED_DIAGNOSTIC:
        {
          setIsDiagonsing(false);
        }
        break;
      case enums.READER_STATE.GETTING_METADATA:
        {
          
        }
        break;
    
      default:
        break;
    }
  }

  const onReaderResults = (result:types.iDiagnosticResults) =>
  {
    console.log(results);
    if(results)
    {
      setResults({...results, ...result});
    } else {
      setResults(result);
    }
  }
  
  const onError = (msg: string) => 
  {
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
      <Row>
         {/* <SerialManager 
            enableSend={false}
            enableMonitor={false}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            onData={onData}
            onError={onError}
            /> */}
      </Row>
      <POCReader
        onStateChange={onReaderStateChange}
        onResults={onReaderResults}
        onError={onError} 
      />
      <Row>
        <Col>
            {()=>JSON.stringify(results)}
            {(results)?(results["A1"])?results["A1"].slope:false:false}
        </Col>
      </Row>
    </div>
  );
}

export default App;
