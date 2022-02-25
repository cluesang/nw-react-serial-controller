import React, { useEffect, useState } from 'react';
import { 
  Row
, Col
, ListGroup
, ListGroupItem
, Button
, Container
} from 'reactstrap';
import { SerialManager, SerialPortConnection, SerialPortList } from './SerialUIComponents';
import {POCReaderController, READER_STATE, READER_ACTION, READER_SITES} from '../controllers/POCReaderController';
import { LineChart } from './charts/Charts';

interface iDiagnosticSiteData {
  [key: string]: {
      times:number[];
      voltages:number[];
  }
}

interface iReaderAction {
  connectionId: number;
  action: READER_ACTION;
}
const ReaderAction = ({connectionId, action}:iReaderAction) =>
{
  const sendAction = () =>
  {
    const command = POCReaderController.genCommand(action);
    console.log(command);
    POCReaderController.send(connectionId,command);
  }

  return (
    <Button
      onClick={sendAction}
    >
      {action}
    </Button>
    )
}

interface iDiagnosticButton
{
  connectionId: number;
  loc: string;
  pwm: number;
  disabled?: boolean;
  reset?: boolean;
}
const DiagnosticButton = ({connectionId, loc, pwm, disabled=false, reset=false}:iDiagnosticButton) =>
{
  const runDiagnostic = () =>
  {
    if(reset)
    {
      POCReaderController.resetBox(connectionId);
    } else {
      POCReaderController.runDiagnostic(connectionId,loc,pwm);
    }
  }

  return (
    <Button
      color={(reset)?"danger":"primary"}
      onClick={runDiagnostic}
      disabled={disabled}
    >
      {loc}
    </Button>
    )
}


interface iDiagnosticButtons
{
  connectionId: number;
  // sites: {loc:string, pwm:number}[];
}
const DiagnosticButtons = ({connectionId}:iDiagnosticButtons) =>
{
  let Buttons = []
  for (const site in READER_SITES)
  {
    const disable = (POCReaderController.state === READER_STATE.RUNNING_DIAGNOSTIC
                    && POCReaderController.activeSite !== site)
                    || !POCReaderController.siteSettings[site].enable;
    Buttons.push( 
    <DiagnosticButton 
      connectionId={connectionId} 
      loc={site} 
      pwm={POCReaderController.siteSettings[site].pwm} 
      disabled={disable}
      reset={POCReaderController.activeSite === site}
    /> )
  }
 
  return (
    <Row xs={2}>
      <Col className='p-0'>
        <ListGroup flush>
          <ListGroupItem>
            {Buttons[0]}
          </ListGroupItem>
          <ListGroupItem>
            {Buttons[1]}
          </ListGroupItem>
          <ListGroupItem>
            {Buttons[2]}
          </ListGroupItem>
          <ListGroupItem>
            {Buttons[3]}
          </ListGroupItem>
        </ListGroup>
      </Col>
      <Col className='p-0'>
        <ListGroup flush>
        <ListGroupItem>
            {Buttons[4]}
          </ListGroupItem>
          <ListGroupItem>
            {Buttons[5]}
          </ListGroupItem>
          <ListGroupItem>
            {Buttons[6]}
          </ListGroupItem>
          <ListGroupItem>
            {Buttons[7]}
          </ListGroupItem>
        </ListGroup>
      </Col>
    </Row>
  )
}

interface iPOCSerialPortConnection
{
  onConnect?: (connectionInfo: chrome.serial.ConnectionInfo) => void;
  onDisconnect?: (result: boolean) => void;
  onError?:(msg:string)=>void;
}
const POCSerialPortConnection = ({onConnect, onDisconnect, onError}:iPOCSerialPortConnection) =>
{
  const [isConnected, setIsConnected] = useState(false);
  const [serialDeviceInfo, setSerialDeviceInfo] = useState<chrome.serial.DeviceInfo | undefined>();
  const [connectionId, setConnectionId] = useState<number>();
  const [serialConnectionInfo, setSerialConnectionInfo] = useState<chrome.serial.ConnectionInfo | undefined>();

  useEffect(()=>{
    if(serialConnectionInfo)
    {
        setConnectionId(serialConnectionInfo.connectionId);
    } else {
        setConnectionId(undefined);
    }
  },[serialConnectionInfo])

  const onSerialPortSelect = (deviceInfo: chrome.serial.DeviceInfo) => {
      setSerialDeviceInfo(deviceInfo);
  }

  const onSerialPortConnect = (connectionInfo: chrome.serial.ConnectionInfo) => {
      setSerialConnectionInfo(connectionInfo);
      setIsConnected(true);
      if(onConnect) onConnect(connectionInfo);
  }

  const onSerialPortDisconnect = (result: boolean) => {
      console.log(result);
      setSerialConnectionInfo(undefined);
      setIsConnected(false);
      if(onDisconnect) onDisconnect(result);
  }

  return (
    <>
      <SerialPortConnection
          onConnect={onSerialPortConnect}
          onDisconnect={onSerialPortDisconnect}
          onError={onError}
          serialDeviceInfo={serialDeviceInfo}
          serialConnectionInfo={serialConnectionInfo}
      />
      <SerialPortList
          onSelect={onSerialPortSelect}
          isConnected={isConnected}
          onError={onError}
      />
    </>
  )
}

interface iPOCReader
{
  onError:(msg:string)=>void;
}
const POCReader = ({ onError }:iPOCReader) => {

  const [readerState, setReaderState] = useState(POCReaderController.state);
  const [connectionId, setConnectionId] = useState<number>();
  const [diagnosticSiteData, setDiagnosticSiteData] = useState<iDiagnosticSiteData[]>([]);

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

  const onReaderStateChange = (state:READER_STATE) =>
  {
    setReaderState(state);
  }
  POCReaderController.onStateChange(onReaderStateChange);

  const onDiagnosticData = (siteData:iDiagnosticSiteData) =>
  {
    setDiagnosticSiteData(diagnosticSiteData => [...diagnosticSiteData,siteData]);
  }
  POCReaderController.onDiagnosticData(onDiagnosticData);

  const runRoutine = () =>
  {
    POCReaderController.runDefaultRoutine()
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
        <Col xs={6}>
          {/* <SerialManager 
            enableSend={false}
            enableMonitor={false}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            onData={onData}
            onError={onError}
            /> */}
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          {(connectionId)?
            <div className='d-flex m-2 p-2 justify-content-between'>
              <Button onClick={runRoutine}>
                Default Routine
              </Button>
              {/* <ReaderAction connectionId={connectionId} action={READER_ACTION.INITIALIZE} /> */}
              <ReaderAction connectionId={connectionId} action={READER_ACTION.BLINK} />
              {/* <ReaderAction connectionId={connectionId} action={READER_ACTION.GET_METADATA} /> */}
              <ReaderAction connectionId={connectionId} action={READER_ACTION.RESET} />
            </div>
          : false}
          {(connectionId)?
            <DiagnosticButtons connectionId={connectionId} />
          :false}
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
    </Container>
  );
}

export default POCReader;
