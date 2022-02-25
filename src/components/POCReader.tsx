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
import { LineChart } from './charts/Charts';

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
  const [diagnosticSiteData, setDiagnosticSiteData] = useState<iDiagnosticSiteData>({"SITE":{times:[],voltages:[]}});
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");

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
    POCReaderController.runDefaultRoutine()
  }

  const runCalibration = () =>
  {
    console.log("run calibration");
    POCReaderController.runCalibration();
  }

  const promptUser = (prompt:string) =>
  {
    console.log("user prompt: "+prompt);
    setPrompt(prompt);
    setOpenModal(true);
  }
  POCReaderController.onUserPrompt(promptUser);

  const stopCalibration = () =>
  {
    console.log("Stop calibration");
    setOpenModal(false);
    // POCReaderController.runDefaultRoutine()
  }
  
  return (
    <Container>
      <Row>
        <Col xs={6} className={"text-start"} >
          <POCSerialPortConnection
             onConnect={onConnect}
             onDisconnect={onDisconnect}
             onError={onError}
          />
          <span className={"m-3 text-start"}>
            {readerState}
          </span>
        </Col>
        <Col xs={6} className={"btn btn-group"}>
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
                prompt={prompt} 
                onNext={runCalibration} 
                onCancel={stopCalibration} 
                open={openModal}
                />
              <Button onClick={runRoutine}>
                Default Routine
              </Button>            
            </div>
          : false}
          {(connectionId)?
            <DiagnosticButtons connectionId={connectionId} />
          :false}
        </Col>
        <Col xs={9}>
          {/* <LineChart siteData={diagnosticSiteData} /> */}
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
