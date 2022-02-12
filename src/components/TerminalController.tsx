import React, { useEffect, useState } from 'react';
import Terminal, { ColorMode, LineType } from 'react-terminal-ui';

const TerminalController = (props = {}) => {
  const [terminalLineData, setTerminalLineData] = useState([
    {type: LineType.Output, value: 'Welcome to the React Terminal UI Demo!'},
    {type: LineType.Input, value: 'Some previous input received'},
  ]);
  // Terminal has 100% width by default so it should usually be wrapped in a container div
  return (
    <Terminal 
      name='React Terminal Usage Example' 
      colorMode={ ColorMode.Dark }  
      lineData={ terminalLineData } 
      onInput={ 
        terminalInput => 
        console.log(`New terminal input received: '${ terminalInput }'`) 
      }/>
  )
};

export default TerminalController;