import React, { useEffect, useState } from 'react';
import { 
  Row
, Col
, ListGroup
, ListGroupItem
, Button
, Container
, Modal
, ModalBody
, ModalHeader
, ModalFooter
} from 'reactstrap';
import CalibrationModal from './CalibrationModal';
import DiagnosticButtons from './DiagnosticButtons';
import POCSerialPortConnection from './POCSerialPortConnection';
import {POCReaderController} from '../controllers/POCReaderController';
import {APP_STATE, READER_STATE, READER_ACTION, READER_SITES} from "../controllers/POC_enums";
import * as defaults from "../controllers/POC_defaults";
import { LineChart } from './charts/Charts';
import { userPrompt, iDiagnosticResults } from '../controllers/IPOCReaderController';

interface iDiagnosticSiteData {
  [key: string]: {
      times:number[];
      voltages:number[];
  }
}

interface iReaderAction {
  action: READER_ACTION;
  disabled?: boolean;
}
const ReaderAction = ({action,disabled=false}:iReaderAction) =>
{
  const sendAction = () =>
  {
    const command = POCReaderController.genCommand(action);
    console.log(command);
    POCReaderController.req(command);
  }

  return (
    <Button
      onClick={sendAction}
      color={"success"}
      disabled={disabled}
    >
      {action}
    </Button>
    )
}

interface iPOCReader
{
  onStateChange:(state:string, message:string)=>void;
  onResults:(results:iDiagnosticResults)=>void;
  onError:(msg:string)=>void;
}
const POCReader = ({ onStateChange, onResults, onError }:iPOCReader) => {

  const [readerState, setReaderState] = useState(POCReaderController.state as string);
  const [connectionId, setConnectionId] = useState<number>();
  const [diagnosticSiteData, setDiagnosticSiteData] = useState<iDiagnosticSiteData>(defaults.diagnosticBuffer);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState<userPrompt>();
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [isSingleSiteRunning, setIsSingleSiteRunning] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  

  useEffect(() => {
    POCReaderController.addListener((successStatus, incommingConnectionId, message) => {
        if (!successStatus) if(onError) onError(message);
        if (connectionId === incommingConnectionId) {
          POCReaderController.parseSerialOutput(message);
        }
    });
  }, [connectionId]);

  const onConnect = (connectionInfo: chrome.serial.ConnectionInfo) =>
  {
    setConnectionId(connectionInfo.connectionId);
    setIsConnected(true);
    POCReaderController.setState(READER_STATE.CONNECTED);
    POCReaderController.setConnectionId(connectionInfo.connectionId);
  }

  const onDisconnect = (result: boolean) =>
  {
    // console.log(result);
    setIsConnected(false);
    POCReaderController.setState(READER_STATE.DISCONNECTED);
    POCReaderController.setConnectionId(undefined);
    POCReaderController.reset();
  }

  const onReaderStateChange = (state:READER_STATE|APP_STATE, message:string) =>
  {
    if(state === APP_STATE.FINISHED_CALIBRATION) setIsCalibrating(false);
    if(state === APP_STATE.FINISHED_ROUTINE) setIsDiagnosing(false);
    if(state === READER_STATE.FINISHED_DIAGNOSTIC && isSingleSiteRunning) setIsSingleSiteRunning(false);
    if(state === READER_STATE.RESET || state === READER_STATE.DISCONNECTED)
    {
      setIsCalibrating(false);
      setIsDiagnosing(false);
      setIsSingleSiteRunning(false);
    }
    setReaderState(message);
    onStateChange(state, message);
  }
  POCReaderController.onStateChange(onReaderStateChange);

  const onDiagnosticData = (siteData:iDiagnosticSiteData) =>
  {
    setDiagnosticSiteData(siteData);
  }
  POCReaderController.onDiagnosticData(onDiagnosticData);

  POCReaderController.onDiagnosticResults(onResults);

  const runRoutine = () =>
  {
    setIsDiagnosing(true);
    POCReaderController.runDefaultRoutine()
  }

  const stopRoutine = () =>
  {
    setIsDiagnosing(false);
    // console.log(isDiagnosing);
    POCReaderController.stopRoutine();
  }

  const runCalibration = () =>
  {
    // console.log("run calibration");
    setIsCalibrating(true);
    POCReaderController.runCalibration();
  }

  const promptUser = (userPrompt:userPrompt) =>
  {
    // console.log("user prompt: "+prompt);
    setUserPrompt(userPrompt);
    setOpenModal(true);
  }
  POCReaderController.onUserPrompt(promptUser);

  const continueCalibration = () =>
  {
    // console.log("continuing calibration");
    setOpenModal(false);
  }

  const stopCalibration = () =>
  {
    // console.log("Stop calibration");
    setOpenModal(false);
    setIsCalibrating(false);
    POCReaderController.stopCalibration();
  }

  const onSingleSiteRun = () => setIsSingleSiteRunning(true);
  
  return (
    <Container>
      <Row>
        <Col xs={8} className={"text-start"} >
          <POCSerialPortConnection
             onConnect={onConnect}
             onDisconnect={onDisconnect}
             onError={onError}
          />
          <span className={"m-3 text-start"}>
            {readerState}
          </span>
        </Col>
        <Col xs={4} className={"btn btn-group"}>
           {/* <ReaderAction 
              disabled={isCalibrating||isDiagnosing||isSingleSiteRunning||!isConnected} 
              action={READER_ACTION.INITIALIZE}
            /> */}
            <ReaderAction 
              disabled={isCalibrating||isDiagnosing||isSingleSiteRunning||!isConnected} 
              action={READER_ACTION.BLINK}
            />
            <ReaderAction 
              disabled={isCalibrating||isDiagnosing||isSingleSiteRunning||!isConnected} 
              action={READER_ACTION.GET_METADATA}
            />
            <ReaderAction 
              disabled={isCalibrating||isDiagnosing||isSingleSiteRunning||!isConnected} 
              action={READER_ACTION.RESET}
            />
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
           <div className='d-flex m-2 p-2 justify-content-between btn-group'>
              <Button 
                onClick={(isCalibrating)?stopCalibration:runCalibration}
                color={(isCalibrating)?"warning":"primary"}
                disabled={isDiagnosing&&!isCalibrating || isSingleSiteRunning ||!isConnected}
                >
                  {(isCalibrating)?"Stop Calibration":"Calibrate"}
              </Button> 
              <Button 
                onClick={(isDiagnosing)?stopRoutine:runRoutine}
                color={(isDiagnosing)?"warning":"primary"}
                disabled={(isCalibrating || isSingleSiteRunning ||!isConnected )}
                >
                {(isDiagnosing)?"Stop":"Run"}
              </Button>            
            </div>
          <DiagnosticButtons onSingleSiteRun={onSingleSiteRun} />
        </Col>
        <Col xs={8}>
          <LineChart siteData={diagnosticSiteData} />
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          
        </Col>
        <Col xs={4}>
          
        </Col>
        <Col xs={4}>
          
        </Col>
      </Row>
      <CalibrationModal 
        prompt={userPrompt}
        open={openModal}
        onAccept={continueCalibration}
        onCancel={stopCalibration}
        />
    </Container>
  );
}

export default POCReader;
