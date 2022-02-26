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
import { userPrompt } from '../controllers/IPOCReaderController';

interface iDiagnosticSiteData {
  [key: string]: {
      times:number[];
      voltages:number[];
  }
}

interface iReaderAction {
  action: READER_ACTION;
}
const ReaderAction = ({action}:iReaderAction) =>
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
      color={"info"}
    >
      {action}
    </Button>
    )
}

interface iPOCReader
{
  onError:(msg:string)=>void;
}
const POCReader = ({ onError }:iPOCReader) => {

  const [readerState, setReaderState] = useState(POCReaderController.state as string);
  const [connectionId, setConnectionId] = useState<number>();
  const [diagnosticSiteData, setDiagnosticSiteData] = useState<iDiagnosticSiteData>(defaults.diagnosticBuffer);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState<userPrompt>();
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  

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
    // console.log(connectionInfo);
    setConnectionId(connectionInfo.connectionId);
    POCReaderController.setState(READER_STATE.CONNECTED);
    POCReaderController.setConnectionId(connectionInfo.connectionId);
  }

  const onDisconnect = (result: boolean) =>
  {
    console.log(result);
    POCReaderController.setState(READER_STATE.DISCONNECTED);
    POCReaderController.setConnectionId(undefined);
  }

  const onReaderStateChange = (state:READER_STATE|APP_STATE, message:string) =>
  {
    if(state === APP_STATE.FINISHED_CALIBRATION) setIsCalibrating(false);
    if(state === APP_STATE.FINISHED_ROUTINE) setIsDiagnosing(false);
    setReaderState(message);
    // console.log(diagnosticSiteData);
  }
  POCReaderController.onStateChange(onReaderStateChange);

  const onDiagnosticData = (siteData:iDiagnosticSiteData) =>
  {
    setDiagnosticSiteData(siteData);
  }
  POCReaderController.onDiagnosticData(onDiagnosticData);

  const runRoutine = () =>
  {
    setIsDiagnosing(true);
    POCReaderController.runDefaultRoutine()
  }

  const stopRoutine = () =>
  {
    setIsDiagnosing(false);
    POCReaderController.stopRoutine();
  }

  const runCalibration = () =>
  {
    console.log("run calibration");
    setIsCalibrating(true);
    POCReaderController.runCalibration();
  }

  const promptUser = (userPrompt:userPrompt) =>
  {
    console.log("user prompt: "+prompt);
    setUserPrompt(userPrompt);
    setOpenModal(true);
  }
  POCReaderController.onUserPrompt(promptUser);

  const continueCalibration = () =>
  {
    console.log("continuing calibration");
    setOpenModal(false);
    // POCReaderController.runDefaultRoutine()
  }

  const stopCalibration = () =>
  {
    console.log("Stop calibration");
    setOpenModal(false);
    setIsCalibrating(false);
    POCReaderController.stopCalibration();
  }
  
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
          {/* <SerialManager 
            enableSend={false}
            enableMonitor={false}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            onData={onData}
            onError={onError}
            /> */}
            <ReaderAction action={READER_ACTION.INITIALIZE} />
            <ReaderAction action={READER_ACTION.BLINK} />
            <ReaderAction action={READER_ACTION.GET_METADATA} />
            <ReaderAction action={READER_ACTION.RESET} />
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          {(connectionId)?
            <div className='d-flex m-2 p-2 justify-content-between'>
              <CalibrationModal 
                prompt={userPrompt}
                open={openModal}
                onAccept={continueCalibration}
                onCancel={stopCalibration}
                />
              <Button 
                onClick={(isCalibrating)?stopCalibration:runCalibration}
                color={(isCalibrating)?"warning":"primary"}
                >
                  {(isCalibrating)?"Stop Calibration":"Calibrate"}
              </Button> 
              <Button 
                onClick={(isDiagnosing)?stopRoutine:runRoutine}
                color={(isDiagnosing)?"warning":"primary"}
                >
                {(isDiagnosing)?"Stop":"Run"}
              </Button>            
            </div>
          : false}
          {(connectionId)?
            <DiagnosticButtons connectionId={connectionId} />
          :false}
        </Col>
        <Col xs={9}>
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
    </Container>
  );
}

export default POCReader;
