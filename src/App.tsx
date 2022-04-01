import React, { useEffect, useState } from 'react';
import { readFileSync } from 'fs';
import { 
  Container
, Row
, Col
, Button
, Alert,
FormGroup,
FormText,
Input,
Label
} from 'reactstrap';
import { iExponentialFits, iDxResult } from './Types';
import { expoFitCalibrations, flattenCalibrationObjectData } from './Utilities';
import { SerialManager } from './components/SerialUIComponents';
import POCReader from './components/POCReader';
import * as types from './controllers/IPOCReaderController';
import * as enums from "./controllers/POC_enums";
import { CalibrationChart, DiagnosticResultsChart } from './components/charts/BarChart';
import './App.css';

const App = () => {

  const [alertMessage, setAlertMessage] = useState<string | undefined>();
  const [showNotifications, setShowNotifications] = useState(false);

  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isInRoutine, setIsInRoutine] = useState<boolean>(false);
  const [isDiagonsing, setIsDiagonsing] = useState<boolean>(false);

  const [results, setResults] = useState<types.iDiagnosticResults|undefined>();
  const [calibrations, setCalibrations] = useState<types.iCalibrationResults>();
 
  const [expoFits, setExpoFits] = useState<iExponentialFits[]>([]);

  const [dxResults, setDxResults] = useState<iDxResult[]>();

  const toggleNotification = () => setShowNotifications(!showNotifications);

  const alertUser = (message: string) => 
  {
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
          if(calibrations)
          {
            const fits = expoFitCalibrations(calibrations);
            setExpoFits(fits);
          }
          
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
          if(results)
          {
            const calibrationFitsObject:any = {};

            expoFits.map((fit)=>{
              calibrationFitsObject[fit.site] = {
                a: fit.coeff.a,
                b: fit.coeff.b
              }
            });
            console.log(calibrationFitsObject);

            const newDxResult:iDxResult = {
              PatientID: "default Patient ID"
            , timeStamp: "default timestamp"
            , Box_ID: "get box id from box"
            , recommendation: "generate recommendation"
            , A1: results["A1"].slope
            , A2: results["A2"].slope
            , A3: results["A3"].slope
            , A4: results["A4"].slope
            , B1: results["B1"].slope
            , B2: results["B2"].slope
            , B3: results["B3"].slope
            , B4: results["B4"].slope
          
            , Calibration_A1_pwm: results["A1"].pwm
            , Calibration_A2_pwm: results["A2"].pwm
            , Calibration_A3_pwm: results["A3"].pwm
            , Calibration_A4_pwm: results["A4"].pwm
            , Calibration_B1_pwm: results["B1"].pwm
            , Calibration_B2_pwm: results["B2"].pwm
            , Calibration_B3_pwm: results["B3"].pwm
            , Calibration_B4_pwm: results["B4"].pwm
          
            , Calibration_A1_coeff_a: calibrationFitsObject["A1"].a||undefined
            , Calibration_A2_coeff_a: calibrationFitsObject["A2"].a||undefined
            , Calibration_A3_coeff_a: calibrationFitsObject["A3"].a||undefined
            , Calibration_A4_coeff_a: calibrationFitsObject["A4"].a||undefined
            , Calibration_B1_coeff_a: calibrationFitsObject["B1"].a||undefined
            , Calibration_B2_coeff_a: calibrationFitsObject["B2"].a||undefined
            , Calibration_B3_coeff_a: calibrationFitsObject["B3"].a||undefined
            , Calibration_B4_coeff_a: calibrationFitsObject["B4"].a||undefined
            
            , Calibration_A1_coeff_b: calibrationFitsObject["A1"].b ||undefined
            , Calibration_A2_coeff_b: calibrationFitsObject["A2"].b ||undefined
            , Calibration_A3_coeff_b: calibrationFitsObject["A3"].b ||undefined
            , Calibration_A4_coeff_b: calibrationFitsObject["A4"].b ||undefined
            , Calibration_B1_coeff_b: calibrationFitsObject["B1"].b ||undefined
            , Calibration_B2_coeff_b: calibrationFitsObject["B2"].b ||undefined
            , Calibration_B3_coeff_b: calibrationFitsObject["B3"].b ||undefined
            , Calibration_B4_coeff_b: calibrationFitsObject["B4"].b ||undefined
            }
            if(dxResults) {
              setDxResults([...dxResults,newDxResult]);
            } else {
              setDxResults([newDxResult]);
            }
            console.log(dxResults);
          }
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
          // take results
          // take calibration data
          // and reate a DxResults object
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

  const onLoadCalibration = async (selectedFiles: FileList|null) =>
  {
    console.log(selectedFiles);
    if(!selectedFiles) return
    try {
      const content = await selectedFiles[0].text();
      const loadedCalibration = JSON.parse(content);
      console.log(loadedCalibration);
      setCalibrations(loadedCalibration);
      // let's flatten the calibration object
      // slide_no
      // site_id

      const flattened = flattenCalibrationObjectData(loadedCalibration);
      console.log(flattened);

      const fits = expoFitCalibrations(loadedCalibration);
      setExpoFits(fits);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <Row>
          <Col className={(showNotifications) ? "my-2" : "my-5"}>
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
        <Row className={"text-left"}>
          <h2>Barcode Scanner</h2>
          <SerialManager 
              enableSend={false}
              enableMonitor={true}
              // onConnect={onConnect}
              // onDisconnect={onDisconnect}
              // onData={onData}
              onError={onError}
              />
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
              <FormGroup>
                <Label for="exampleFile">
                  File
                </Label>
                <Input
                  id="exampleFile"
                  name="file"
                  type="file"
                  onChange={(e)=>onLoadCalibration(e.target.files)}
                />
                <FormText>
                  Load previously saved calibration values.
                </FormText>
              </FormGroup>
              {(expoFits)?
                 expoFits.map((fit,index)=>{
                  return <div key={index} >{fit.site}: a:{fit.coeff.a} b:{fit.coeff.b}</div>
                })
              :false}
          </Col>
          <Col xs={"8"}>
              <CalibrationChart calibrationData={calibrations} />
          </Col>
        </Row>
        <Row>
          <Col xs={"4"}>
              <h2>Last Result</h2>
              {(results)?
                Object.entries(results).map(([site, {slope}], index)=>{
                  return <div key={index} >{site}: slope: {slope}</div>
                })
              :false}
          </Col>
          <Col xs={"8"}>
            <DiagnosticResultsChart diagnosticResults={results} />
          </Col>
        </Row>
        <Row>
          <Col xs={"12"} className={""}>
            <h2>Results</h2>
            {(dxResults)?
              dxResults.map(({PatientID,timeStamp,recommendation,A1,A2,A3,A4,B1,B2,B3,B4}, index)=>{
                return <div key={index} >{PatientID}: {recommendation}</div>
              })
            :false}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
