import React, { useEffect, useState } from 'react';
import { 
  Row
, Col
, ListGroup
, ListGroupItem
, Button
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
      POCReaderController.resetBox(connectionId);
    } else {
      POCReaderController.runDiagnostic(loc,pwm);
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