import React, { useEffect, useState } from 'react';
import { 
  Button
, Offcanvas
, OffcanvasHeader
, OffcanvasBody } from 'reactstrap';
import TerminalController from './components/TerminalController';
import { SerialDeviceController } from './controllers/SerialDeviceController';
import './App.css';

const App = () => {

  const [openCanvas, setOpenCanvas ] = useState(false);
  const toggleCanvas = () => setOpenCanvas(!openCanvas);
  
  useEffect(()=>{
    init();
  },[]);

  const init = async() => 
  {
    const ports = await SerialDeviceController.listPorts();
    console.log(ports);
  }

  return (
    <div className="App">
      <div>
      <Button
        color="primary"
        onClick={toggleCanvas}
      >
        Open
      </Button>
      <Offcanvas
        direction="bottom"
        toggle={toggleCanvas}
        isOpen={openCanvas}
      >
        <OffcanvasHeader toggle={toggleCanvas}>
          Terminal
        </OffcanvasHeader>
        <OffcanvasBody>
          <TerminalController/>
        </OffcanvasBody>
      </Offcanvas>
    </div>
    </div>
  );
}

export default App;
