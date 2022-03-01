import React, { useEffect, useState } from 'react';
import { 
  Container
, Row
, Col
, Button
, Offcanvas
, OffcanvasHeader
, OffcanvasBody 
, Alert,
Accordion,
AccordionHeader,
AccordionItem
} from 'reactstrap';
import POCReader from './components/POCReader';
import * as types from './controllers/IPOCReaderController';
import * as enums from "./controllers/POC_enums";
import { CalibrationChart } from './components/charts/BarChart';
import './App.css';

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse)=>{
  console.log(request, sender, sendResponse);
});

function updateObject(obj:any, keys:any, value:any) {
  let key = keys.shift();
  if (keys.length > 0) {
    let tmp:any = updateObject(obj[key], keys, value);
    return {...obj, [key]: tmp};
  } else {
    return {...obj, [key]: value};
  }
}

const App = () => {

  const [alertMessage, setAlertMessage] = useState<string | undefined>();
  const [showNotifications, setShowNotifications] = useState(false);
  const [open, setOpen] = useState('');
  const toggle = (id:string) => {
    open === id ? setOpen('') : setOpen(id);
  };

  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isInRoutine, setIsInRoutine] = useState<boolean>(false);
  const [isDiagonsing, setIsDiagonsing] = useState<boolean>(false);

  const [results, setResults] = useState<types.iDiagnosticResults|undefined>();
  const [calibrations, setCalibrations] = useState<types.iCalibrationResults>();

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
          setCalibrations(undefined);
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
          setResults(undefined);
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
    console.log(result);
    setResults({...results,...result});
    console.log(results);
  }

  const onCalibration = (calibration:types.iCalibrationResults) =>
  {
    setCalibrations({...calibrations,...calibration});
    console.log(calibrations);
  }
  
  const onError = (msg: string) => 
  {
    console.log(msg);
    if (msg.length > 0) alertUser(msg);
  }

  return (
    <div className="App">
      <Row>
          <Col sm={"8"} className={(showNotifications) ? "my-2" : "my-5"}>
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
      <Container>
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
          onCalibration={onCalibration}
          onError={onError} 
        />
        <Row>
          <Col xs={"4"}>
              <h2>Calibration</h2>
          </Col>
          <Col xs={"8"}>
              <CalibrationChart calibrationData={calibrations} />
          </Col>
        </Row>
        <Row>
          <Col xs={"4"}>
              <h2>Diagnostic Results</h2>
          </Col>
          <Col xs={"8"}>
              {/* <BarChart /> */}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
