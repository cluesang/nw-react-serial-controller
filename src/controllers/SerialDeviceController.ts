import { chrome } from 'jest-chrome'

class SerialDeviceController 
{
    /**
     * returns list of serial ports
     * @param 
     * @returns (async) ports of type DeviceInfo
     */
    static listPorts()
    {
        return new Promise((resolve, reject)=>{
            chrome.serial.getDevices((ports)=>{
                resolve(ports);
            });
        });
    }

    // connect to a port

    // send data to a port


    constructor() {
        
    }
};

export { SerialDeviceController };

