import React, { useEffect, useState } from 'react';
import { SerialManager, SerialPortConnection, SerialPortList } from './SerialUIComponents';

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

export default POCSerialPortConnection;