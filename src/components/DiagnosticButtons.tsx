import React, { useEffect, useState } from 'react';
import { 
  Row
, Col
, ListGroup
, ListGroupItem
, Button
, Input
, Form,
FormGroup
} from 'reactstrap';
import {POCReaderController} from '../controllers/POCReaderController';
import {APP_STATE, READER_STATE, READER_ACTION, READER_SITES} from "../controllers/POC_enums";

interface iDiagnosticButton
{
  loc: string;
  pwm: number;
  disabled?: boolean;
  isActive?: boolean;
  manualMode?:boolean;
  isRunningDiagnostic?:boolean;
  onRun: (loc:string)=>void;
}
const DiagnosticButton = ({
  loc, 
  pwm, 
  disabled=false, 
  isActive=false, 
  manualMode=true,
  isRunningDiagnostic=false, 
  onRun
}:iDiagnosticButton) =>
{
  const [enable, setEnable] = useState<boolean>(!disabled);
  const [userPWM, setUserPWM] = useState<number>(pwm);

  // useEffect(()=>setUserPWM(pwm),[pwm]);
  // useEffect(()=>setEnable(!disabled),[disabled]);

  const [coolDowned, setCoolDowned] = useState<boolean>(true);

  const toggleEnable = (event:React.ChangeEvent<HTMLInputElement>) => {
    const enableUpdate = event.target.checked;
    POCReaderController.updateEnable(loc, enableUpdate);
    setEnable(enableUpdate);
  };

  const handlePWMChange = (event:React.ChangeEvent<HTMLInputElement>) =>
  {
    const pwmUpdate = parseInt(event.target.value,10);
    POCReaderController.updatePWM(loc, pwmUpdate);
    setUserPWM(pwmUpdate);
  }

  const runDiagnostic = () =>
  {
    if(isActive)
    {
      POCReaderController.resetBox();
      setCoolDowned(false);
      startCoolDownTimer();
    } else {
      POCReaderController.runDiagnostic(loc,userPWM);
      setCoolDowned(false);
      startCoolDownTimer();
      onRun(loc);
    }
  }

  const startCoolDownTimer = () => setTimeout(()=>setCoolDowned(true),1500);

  return (
    <>
      <Form inline className={"d-flex justify-content-center align-items-center"}>
        <FormGroup switch>
          <Input 
            type={"switch"}
            checked={enable}
            disabled={isActive||!manualMode||!coolDowned||isRunningDiagnostic}
            onChange={(evt)=>toggleEnable(evt)}
            style={{ width: "2.5em", height: "1.5em" }}
            />
        </FormGroup>
        <div className={"btn-group mx-2"}>
          <Button
            className={"btn btn-primary"}
            color={(isActive)?"danger":"primary"}
            onClick={runDiagnostic}
            disabled={!enable||!manualMode||!coolDowned||(isRunningDiagnostic && !isActive)}
          >
            {loc}
          </Button>
          <Input 
            style={{ width: "65px" }}
            className={"text-end"}
            value={userPWM}
            disabled={true}
          />
        </div>
      </Form>
      <div className={"d-flex justify-content-center align-items-center"}>
        <Input
            className={"ml-3"}
            min={0}
            max={255}
            type="range"
            value={userPWM} 
            disabled={(isActive||!manualMode||!coolDowned||!enable||isRunningDiagnostic)}
            onChange={(evt)=>handlePWMChange(evt)} 
          />
      </div>
    </>
    
    )
}


interface iDiagnosticButtons
{
  onSingleSiteRun: (loc:string)=>void;
  disabled?:boolean
}
const DiagnosticButtons = ({onSingleSiteRun,disabled=false}:iDiagnosticButtons) =>
{
 
  const genButtons = () =>
  {
    let buttons = [];
    for (const site in READER_SITES)
    {                      
      const manualMode = (POCReaderController.activeRoutine === undefined
                        && POCReaderController.activeCalibrationRoutine === undefined
                        && !(POCReaderController.state === READER_STATE.DISCONNECTED));
      const pwm = POCReaderController.siteSettings[site].pwm;
      const isActive = POCReaderController.activeSite === site;
      const isRunningDiagnostic = POCReaderController.state === READER_STATE.RUNNING_DIAGNOSTIC;
      buttons.push( 
        <DiagnosticButton 
          key={site+pwm}
          loc={site} 
          pwm={pwm} 
          disabled={!POCReaderController.siteSettings[site].enable}
          manualMode={manualMode}
          isActive={isActive}
          isRunningDiagnostic={isRunningDiagnostic}
          onRun={onSingleSiteRun}
        />
        )
    }
    return buttons;
  }

  let buttons = genButtons();

  return (
    <Row xs={2}>
      {(()=>{
        buttons = genButtons();
      })()}
      <Col className='p-0'>
        <ListGroup flush>
          <ListGroupItem>
            {buttons[3]}
          </ListGroupItem>
          <ListGroupItem>
            {buttons[2]}
          </ListGroupItem>
          <ListGroupItem>
            {buttons[1]}
          </ListGroupItem>
          <ListGroupItem>
            {buttons[0]}
          </ListGroupItem>
        </ListGroup>
      </Col>
      <Col className='p-0'>
        <ListGroup flush>
        <ListGroupItem>
            {buttons[7]}
          </ListGroupItem>
          <ListGroupItem>
            {buttons[6]}
          </ListGroupItem>
          <ListGroupItem>
            {buttons[5]}
          </ListGroupItem>
          <ListGroupItem>
            {buttons[4]}
          </ListGroupItem>
        </ListGroup>
      </Col>
    </Row>
  )
}

export default DiagnosticButtons;