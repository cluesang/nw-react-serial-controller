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
  reset?: boolean;
}
const DiagnosticButton = ({loc, pwm, disabled=false, reset=false}:iDiagnosticButton) =>
{
  const [enable, setEnable] = useState<boolean>(!disabled);
  const [userPWM, setUserPWM] = useState<number>(pwm);

  const toggleEnable = (event:React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.checked);
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
    if(reset)
    {
      POCReaderController.resetBox();
    } else {
      POCReaderController.runDiagnostic(loc,pwm);
    }
  }

  return (
    <>
      <Form inline className={"d-flex justify-content-center align-items-center"}>
        <FormGroup switch>
          <Input 
            type={"switch"}
            checked={enable}
            disabled={reset}
            onChange={(evt)=>toggleEnable(evt)}
            style={{ width: "2.5em", height: "1.5em" }}
            />
        </FormGroup>
        <div className={"btn-group mx-2"}>
          <Button
            className={"btn btn-primary"}
            color={(reset)?"danger":"primary"}
            onClick={runDiagnostic}
            disabled={!enable}
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
            disabled={reset}
            onChange={(evt)=>handlePWMChange(evt)} 
          />
      </div>
    </>
    
    )
}


// interface iDiagnosticButtons
// {
//   // connectionId: number;
//   // sites: {loc:string, pwm:number}[];
// }
const DiagnosticButtons = ({}) =>
{
  let Buttons = []
  for (const site in READER_SITES)
  {
    const disable = (POCReaderController.state === READER_STATE.RUNNING_DIAGNOSTIC
                    && POCReaderController.activeSite !== site)
                    || !POCReaderController.siteSettings[site].enable;
    const pwm = POCReaderController.siteSettings[site].pwm;
    const isActive = POCReaderController.activeSite === site;

    Buttons.push( 
      <>
        <DiagnosticButton 
          loc={site} 
          pwm={pwm} 
          disabled={disable}
          reset={isActive}
        />
      </>)
  }
 
  return (
    <Row xs={2}>
      <Col className='p-0'>
        <ListGroup flush>
          <ListGroupItem>
            {Buttons[3]}
          </ListGroupItem>
          <ListGroupItem>
            {Buttons[2]}
          </ListGroupItem>
          <ListGroupItem>
            {Buttons[1]}
          </ListGroupItem>
          <ListGroupItem>
            {Buttons[0]}
          </ListGroupItem>
        </ListGroup>
      </Col>
      <Col className='p-0'>
        <ListGroup flush>
        <ListGroupItem>
            {Buttons[7]}
          </ListGroupItem>
          <ListGroupItem>
            {Buttons[6]}
          </ListGroupItem>
          <ListGroupItem>
            {Buttons[5]}
          </ListGroupItem>
          <ListGroupItem>
            {Buttons[4]}
          </ListGroupItem>
        </ListGroup>
      </Col>
    </Row>
  )
}

export default DiagnosticButtons;