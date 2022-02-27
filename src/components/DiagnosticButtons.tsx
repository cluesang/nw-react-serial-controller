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
            style={{ width: "2.5em", height: "1.5em" }}
            />
        </FormGroup>
        <div className={"btn-group mx-2"}>
          <Button
            className={"btn btn-primary"}
            color={(reset)?"danger":"primary"}
            onClick={runDiagnostic}
            disabled={disabled}
          >
            {loc}
          </Button>
          <Input 
            style={{ width: "65px" }}
            className={"text-end"}
            value={pwm}
            disabled={true}
          />
        </div>
      </Form>
      <div className={"d-flex justify-content-center align-items-center"}>
        <Input
            className={"ml-3"}
            id="exampleRange"
            name="range"
            type="range"
            value={(pwm/255)*100}
          />
      </div>
    </>
    
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
    const pwm = POCReaderController.siteSettings[site].pwm;
    const isActive = POCReaderController.activeSite === site;

    Buttons.push( 
      <>
        <DiagnosticButton 
          connectionId={connectionId} 
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