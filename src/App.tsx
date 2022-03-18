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
import regression from "regression";
import { SerialManager } from './components/SerialUIComponents';
import POCReader from './components/POCReader';
import * as types from './controllers/IPOCReaderController';
import * as enums from "./controllers/POC_enums";
import { CalibrationChart, DiagnosticResultsChart } from './components/charts/BarChart';
import './App.css';

interface iExponentialFits {
  site:string;
  coeff: {
    a: number;
    b: number;
  }
}

const expoFitCalibrations = (calibrations:types.iCalibrationResults) =>
{
  let dataPoints:{ [site:string]:regression.DataPoint[] } = {};
    // let expCoefs:{}
    Object.entries(calibrations).map(([slide, results])=>{
      Object.entries(results).map(([site, result])=>{
        const {slope, intercept, r2, testDuration, pwm} = result;
        const stopIndex = slide.substring(slide.length-1);
        const stopLevel = parseInt(stopIndex,10);
        if(slope && testDuration)
        {
          const dataPoint:regression.DataPoint = [stopLevel, testDuration];
          if(!dataPoints[site]) dataPoints[site] = [];
          console.log(dataPoint);
          dataPoints[site].push(dataPoint);
        }
      });
    });
    console.log(dataPoints);
    const fits:iExponentialFits[] = Object.entries(dataPoints).map(([site, points])=>{
      const fit = regression.exponential(points);
      console.log(fit);
      return {
        site: site,
        coeff: {
          a: fit.equation[0],
          b: fit.equation[1]
        }
      }
    });
    return fits
}

const flattenCalibrationObjectData = (calibrations:types.iCalibrationResults) =>
{    
  const flattenedResults = Object.entries(calibrations).map(([slide, results])=>{
    return Object.entries(results).map(([site, result])=>{
      const stopIndex = slide.substring(slide.length-1);
      const stopLevel = parseInt(stopIndex,10);
      return {
        slide_no: slide,
        stop_Level: stopLevel,
        site_id: site,
        ...result
      }
    });
  });
  return flattenedResults;
}

const App = () => {

  const [alertMessage, setAlertMessage] = useState<string | undefined>();
  const [showNotifications, setShowNotifications] = useState(false);

  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isInRoutine, setIsInRoutine] = useState<boolean>(false);
  const [isDiagonsing, setIsDiagonsing] = useState<boolean>(false);

  const [results, setResults] = useState<types.iDiagnosticResults|undefined>();
  const [calibrations, setCalibrations] = useState<types.iCalibrationResults>();
 
  const [expoFits, setExpoFits] = useState<iExponentialFits[]>([]);

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
                  This is some placeholder block-level help text for the above input. It's a bit lighter and easily wraps to a new line.
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
              <h2>Results</h2>
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
      </Container>
    </div>
  );
}

export default App;
