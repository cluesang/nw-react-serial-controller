import React, { useEffect } from 'react';
import { SerialDeviceController } from './controllers/SerialDeviceController';
import logo from './logo.svg';
import './App.css';
import { inheritInnerComments } from '@babel/types';

console.log(SerialDeviceController.listPorts());

const App = () => {
  
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
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
