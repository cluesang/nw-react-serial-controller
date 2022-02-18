import React, {useEffect, useState} from "react";
import { SerialDeviceController } from "../controllers/SerialDeviceController";
import Terminal, { ColorMode, LineType } from 'react-terminal-ui';

import { 
    ButtonDropdown 
,   DropdownToggle 
,   DropdownMenu 
,   DropdownItem
,   FormGroup
,   Form
,   Input
} from 'reactstrap';

interface iSerialPortList {
    onSelect: (selectedPort:chrome.serial.DeviceInfo)=>void;
    disabled?: boolean;
    onError:  (msg:string)=>void;
}

const SerialPortList = ({ onSelect, disabled=false, onError }:iSerialPortList) =>
{
    const [open, setOpen ] = useState(false);
    const [ports, setPorts] = useState([{path:"Select"}]);
    const [activePort, setActivePort] = useState<chrome.serial.DeviceInfo>();
    const toggleOpen = async () =>
    {
        const ports = await SerialDeviceController.listPorts();
        setPorts(ports);
        setOpen(!open);
    } 
    const selectPort = (port:chrome.serial.DeviceInfo) =>
    {
        setActivePort(port);
        onSelect(port);
    }
    const dropdownClick = () =>
    {
        if(disabled)
        {
            onError("You must disconnect from the current port before you can select a new one.");
        }
        console.log("dropdown click");
    }

    return (
    <span>
        <ButtonDropdown 
            disabled={disabled}
            isOpen={open} 
            toggle={toggleOpen} 
            setActiveFromChild={true}
            onClick={dropdownClick}
            >
            <DropdownToggle caret>
                {(activePort)?activePort.path:"Select Serial Port"}
            </DropdownToggle>
            <DropdownMenu style={{ maxHeight: "150px", overflow: "hidden scroll" }} >
                <DropdownItem 
                    key={0} 
                    header={true}
                    onClick={()=>setActivePort(undefined)}
                >
                    USB Serial Ports
                </DropdownItem>
                {ports.map((port, index)=>{
                    return (
                        <DropdownItem 
                            active={(activePort===port)}
                            key={index+1} 
                            onClick={()=>selectPort(port)}
                        >
                            {port.path}
                        </DropdownItem>
                    );
                })}
            </DropdownMenu>
        </ButtonDropdown>
    </span>
    );
}

interface iSerialPortConnection {
    onConnect: (selectedPort:chrome.serial.ConnectionInfo)=>void;
    onDisconnect: (result:boolean)=>void;
    onError: (msg:string)=>void;
    serialDeviceInfo?: chrome.serial.DeviceInfo;
    serialConnectionInfo?: chrome.serial.ConnectionInfo;
}

const SerialPortConnection = ({ onConnect, onDisconnect, serialDeviceInfo, serialConnectionInfo, onError }:iSerialPortConnection) =>
{
    const [isConnected, setIsConnected ] = useState(false);

    const toggleConnection = async () =>
    {
        if(!isConnected)
        {
            if(serialDeviceInfo !== undefined)
            {
               connect(serialDeviceInfo);
            } else {
                onError("Could not connect. No serial device selected.");
            }
        } else {
            if(serialConnectionInfo !== undefined)
            {
                disconnect(serialConnectionInfo);
            } else {
                onError("Could not disconnect. No connection info provided.");
            }
        }
    } 

    const connect = async (serialDeviceInfo: chrome.serial.DeviceInfo) =>
    {
        try {
            const serialConnectionInfo = await SerialDeviceController.connect(serialDeviceInfo);   
            onConnect(serialConnectionInfo);
            setIsConnected(true);
        } catch (error) {
            console.log(error);
        }
    }

    const disconnect = async (serialConnectionInfo: chrome.serial.ConnectionInfo) =>
    {
        try {
            const result = await SerialDeviceController.disconnect(serialConnectionInfo);   
            onDisconnect(result);
            setIsConnected(false);
        } catch (error) {
            console.log(error);
        }
    }

    return (
    <span>
        <Form inline className={"btn-group m1"}>
            <FormGroup switch>
                <Input 
                    checked={isConnected}
                    style={{ width: "4em", height: "2em"}} 
                    type={"switch"} 
                    onChange={toggleConnection} 
                />
            </FormGroup>
        </Form>
    </span>
    );
}

interface iSerialPortMonitor {
    lineData?: string[]
}

const SerialPortMonitor = ({ lineData }:iSerialPortMonitor) =>
{
    const [terminalLineData, setTerminalLineData] = useState([
        {type: LineType.Output, value: 'Welcome to the React Terminal UI Demo!'},
        {type: LineType.Input, value: 'Some previous input received'},
      ]);

    useEffect(()=>{
        const terminalLines = (lineData||[]).map((line)=>{
            return {type: LineType.Output, value: line}
        });
        setTerminalLineData(terminalLines);
    },[lineData])

    return (
        <Terminal 
        name='React Terminal Usage Example' 
        colorMode={ ColorMode.Light }  
        lineData={ terminalLineData } 
        onInput={ 
          terminalInput => 
          console.log(`New terminal input received: '${ terminalInput }'`) 
        }/>
    );
}

export { SerialPortList, SerialPortConnection, SerialPortMonitor };