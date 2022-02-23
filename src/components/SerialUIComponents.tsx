import React, { useEffect, useState } from "react";
import { SerialDeviceController } from "../controllers/SerialDeviceController";
import Terminal, { ColorMode, LineType } from 'react-terminal-ui';

import {
    ButtonDropdown
    , DropdownToggle
    , DropdownMenu
    , DropdownItem
    , FormGroup
    , Form
    , Input
    , Row
    , Col
    , Button
    , Offcanvas
    , OffcanvasHeader
    , OffcanvasBody 
    , Container
    , Alert
} from 'reactstrap';

interface iSerialPortList {
    onSelect: (selectedPort: chrome.serial.DeviceInfo) => void;
    isConnected?: boolean;
    onError?: (msg: string) => void;
}

const SerialPortList = ({ onSelect, isConnected = false, onError }: iSerialPortList) => {
    const [open, setOpen] = useState(false);
    const [ports, setPorts] = useState([{ path: "Select" }]);
    const [activePort, setActivePort] = useState<chrome.serial.DeviceInfo>();
    const toggleOpen = async () => {
        const ports = await SerialDeviceController.listPorts();
        setPorts(ports);
        setOpen(!open);
    }
    const selectPort = (port: chrome.serial.DeviceInfo) => {
        setActivePort(port);
        onSelect(port);
    }
    const dropdownClick = () => {
        if (isConnected) {
            if(onError) onError("You must disconnect from the current port before you can select a new one.");
        }
        console.log("dropdown click");
    }

    return (
        <ButtonDropdown
            className="btn"
            disabled={isConnected}
            isOpen={open}
            toggle={toggleOpen}
            setActiveFromChild={true}
            onClick={dropdownClick}
        >
            <DropdownToggle
                className={(isConnected) ? "bg-success text-white" : "bg-secondary text-white"}
                caret>
                {(activePort) ? activePort.path : "Select Serial Port"}
            </DropdownToggle>
            <DropdownMenu style={{ maxHeight: "150px", overflow: "hidden scroll" }} >
                <DropdownItem
                    key={0}
                    header={true}
                    onClick={() => setActivePort(undefined)}
                >
                    USB Serial Ports
                </DropdownItem>
                {ports.map((port, index) => {
                    return (
                        <DropdownItem
                            active={(activePort === port)}
                            key={index + 1}
                            onClick={() => selectPort(port)}
                        >
                            {port.path}
                        </DropdownItem>
                    );
                })}
            </DropdownMenu>
        </ButtonDropdown>
    );
}

interface iSerialPortConnection {
    onConnect: (selectedPort: chrome.serial.ConnectionInfo) => void;
    onDisconnect: (result: boolean) => void;
    onError?: (msg: string) => void;
    serialDeviceInfo?: chrome.serial.DeviceInfo;
    serialConnectionInfo?: chrome.serial.ConnectionInfo;
}

const SerialPortConnection = ({ onConnect, onDisconnect, serialDeviceInfo, serialConnectionInfo, onError }: iSerialPortConnection) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        toggleConnection();
    }, [serialDeviceInfo])

    const toggleConnection = async () => {
        if (!isConnected) {
            if (serialDeviceInfo !== undefined) {
                connect(serialDeviceInfo);
            } else {
                // onError("Could not connect. No serial device selected.");
            }
        } else {
            if (serialConnectionInfo !== undefined) {
                disconnect(serialConnectionInfo);
            } else {
                if(onError) onError("Could not properly disconnect. No previous connection info found.");
                onDisconnect(true);
                setIsConnected(false);
            }
        }
    }

    const connect = async (serialDeviceInfo: chrome.serial.DeviceInfo) => {
        try {
            const serialConnectionInfo = await SerialDeviceController.connect(serialDeviceInfo);
            onConnect(serialConnectionInfo);
            setIsConnected(true);
        } catch (error) {
            console.log(error);
            const message: string = error as string;
            if(onError) onError(message);
        }
    }

    const disconnect = async (serialConnectionInfo: chrome.serial.ConnectionInfo) => {
        try {
            const result = await SerialDeviceController.disconnect(serialConnectionInfo);
            onDisconnect(result);
            setIsConnected(false);
        } catch (error) {
            console.log(error);
            const message: string = error as string;
            if(onError) onError(message);
        }
    }

    return (
        <Form inline className={"btn-group p-2"}>
            <FormGroup switch={true}>
                <Input
                    checked={isConnected}
                    style={{ width: "4em", height: "2em" }}
                    type={"switch"}
                    onChange={toggleConnection}
                />
            </FormGroup>
        </Form>
    );
}

interface iSerialPortMonitor {
    connectionId?: number;
    onSerialInput: (output: string) => void;
    onError?: (output: string) => void;
}

const SerialPortMonitor = ({ connectionId, onSerialInput, onError }: iSerialPortMonitor) => {
    const connectionName = (connectionId) ? connectionId : "All"
    const [terminalLineData, setTerminalLineData] = useState([
        { type: LineType.Output, value: 'Listening to connection: ' + connectionName }
    ]);

    // on connectionId update.
    useEffect(() => {
        setTerminalLineData([]);
        SerialDeviceController.addListener((successStatus, connectionId, message) => {
            // console.log(successStatus,connectionId,message);
            if (!successStatus) if(onError) onError(message);
            let newLine = { type: LineType.Output, value: "" };
            if (connectionId) {
                newLine.value = message
            } else {
                if (connectionId === connectionId) {
                    newLine.value = message;
                    onSerialInput(message);
                }
            }
            setTerminalLineData(terminalLineData => [...terminalLineData, newLine]);
        });
    }, [connectionId]);

    const send = async (input: string) => {
        try {
            if (connectionId) {
                const sendInfo = await SerialDeviceController.send(connectionId, input);
                let newLine = { type: LineType.Input, value: input };
                setTerminalLineData(terminalLineData => [...terminalLineData, newLine]);
                // onSerialSend(sendInfo);
            } else {
                if(onError) onError("Can't send. Serial connection must exist.");
            }
        } catch (error) {
            console.log(error);
            const message: string = error as string;
            if(onError) onError(message);
        }
    }

    return (
        <Terminal
            name='Serial Monitor'
            colorMode={ColorMode.Dark}
            lineData={terminalLineData}
            prompt={">"}
            onInput={send} />
    );
}

interface iSerialReader {
    connectionId?: number;
    onSerialInput: (reading: string) => void;
    onError?: (output: string) => void;
}

const SerialReader = ({ connectionId, onSerialInput, onError }: iSerialReader) => {
    const [readingBuffer, setReadingBuffer] = useState<string>("");

    // on connectionId update.
    useEffect(() => {
        setReadingBuffer("");
        SerialDeviceController.addListener((successStatus, incommingConnectionId, message) => {
            // console.log(successStatus,connectionId,message);
            console.log(connectionId, incommingConnectionId);
            if (!successStatus) if(onError) onError(message);
            if (connectionId === incommingConnectionId) {
                onSerialInput(message);
                setReadingBuffer(readingBuffer => readingBuffer + message);
            }
        });
    }, [connectionId]);

    const output = readingBuffer.split("\r\n").filter(line => line.length > 0);
    const lastReading = output[output.length - 1];
    return (
        <Row className="my-3">
            {lastReading}
        </Row>
    );
}

interface iSerialSender {
    connectionId?: number;
    onSerialSend: (sendInfo: object) => void;
    onError?: (output: string) => void;
}

const SerialSender = ({ connectionId, onSerialSend, onError }: iSerialSender) => {
    const [sendMessage, setSendMessage] = useState<string>("");

    const send = async () => {
        try {
            if (connectionId) {
                const sendInfo = await SerialDeviceController.send(connectionId, sendMessage);
                onSerialSend(sendInfo);
            } else {
                if(onError) onError("Can't send. Serial connection must exist.");
            }
        } catch (error) {
            console.log(error);
            const message: string = error as string;
            if(onError) onError(message);
        }
    }

    // on connectionId update.
    useEffect(() => {
        setSendMessage("");
    }, [connectionId]);

    return (
        <div className="input-group my-2">
            <Input
                id="sendMessage"
                className={"form-control"}
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                placeholder="Send"
                value={sendMessage}
                onChange={e => setSendMessage(e.target.value)}
                type="text"
            />
            <div className="input-group-append">
                <Button
                    className={(connectionId) ? "btn btn-primary" : "btn btn-secondary"}
                    onClick={send}
                    disabled={!connectionId}
                >
                    Submit
                </Button>
            </div>
        </div>
    );
}

interface iSerialManager {
    enableSend?: boolean;
    enableMonitor?: boolean;
    onConnect?: (connectionInfo: chrome.serial.ConnectionInfo) => void;
    onDisconnect?: (result: boolean) => void;
    onData?: (connectionId:number, output: string) => void;
    onError?: (output: string) => void;
}

const SerialManager = (
    {
        enableSend=true
    ,   enableMonitor=true
    ,   onConnect
    ,   onDisconnect
    ,   onData
    ,   onError
    }:iSerialManager) => {
    const [openCanvas, setOpenCanvas] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [serialDeviceInfo, setSerialDeviceInfo] = useState<chrome.serial.DeviceInfo | undefined>();
    const [connectionId, setConnectionId] = useState<number>();
    const [serialConnectionInfo, setSerialConnectionInfo] = useState<chrome.serial.ConnectionInfo | undefined>();
    const toggleCanvas = () => setOpenCanvas(!openCanvas);

    useEffect(()=>{
        if(serialConnectionInfo)
        {
            setConnectionId(serialConnectionInfo.connectionId);
        } else {
            setConnectionId(undefined);
        }
    },[serialConnectionInfo])

    const onSerialPortSelect = (deviceInfo: chrome.serial.DeviceInfo) => {
        console.log(deviceInfo);
        setSerialDeviceInfo(deviceInfo);
    }

    const onSerialPortConnect = (connectionInfo: chrome.serial.ConnectionInfo) => {
        console.log(connectionInfo);
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

    const onSerialInput = (input: string) => {
        console.log(input);
        if(onData && connectionId) onData(connectionId,input);
    }

    const onSerialSend = (sendInfo: object) => {
        console.log(sendInfo);
    }

    return (
        <Container>
            <Row xs={"4"}>
                <Col sm={"3"} className={"d-flex justify-content-end"}>
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
                </Col>
                <Col sm={"4"} >
                    <SerialReader
                        connectionId={connectionId}
                        onSerialInput={onSerialInput}
                        onError={onError}
                    />
                </Col>
                <Col sm={"4"} >
                    {(enableSend)?
                        <SerialSender
                            connectionId={connectionId}
                            onSerialSend={onSerialSend}
                            onError={onError}
                        />
                    :false}
                </Col>
                <Col sm={"1"} className={"my-2"} >
                    {(enableMonitor)?
                        <Button
                            color={(isConnected) ? "primary" : "secondary"}
                            className={(!isConnected) ? "muted" : ""}
                            disabled={!isConnected}
                            onClick={toggleCanvas}
                        >
                            Monitor
                        </Button>
                    :false}
                </Col>
            </Row>
            <Offcanvas
                direction="end"
                toggle={toggleCanvas}
                isOpen={openCanvas}
                style={{ width: "50vw" }}
                unmountOnClose={false}
            >
                <OffcanvasHeader toggle={toggleCanvas}>
                    Monitor
                </OffcanvasHeader>
                <OffcanvasBody>
                    <SerialPortMonitor
                        connectionId={connectionId}
                        onSerialInput={onSerialInput}
                        onError={onError}
                    />
                </OffcanvasBody>
            </Offcanvas>
        </Container>
    );
}


export {
    SerialPortList
    , SerialPortConnection
    , SerialPortMonitor
    , SerialReader
    , SerialSender
    , SerialManager
};