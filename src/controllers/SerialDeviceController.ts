let connectionOptions = {
    bitrate: 115200,
    bufferSize: 4096,
    ctsFlowControl: false,
    dataBits: "eight",
    name: "",
    parityBit: "no",
    persistent: false,
    receiveTimeout: 0, //at 0, no timeout error will be raised.
    sendTimeout: 0 , // at 0 no time out errors will be sent
    stopBits: "one"
}

class SerialDeviceController 
{
    /**
     * returns list of serial ports
     * @param 
     * @returns (async) ports of type DeviceInfo
     */
    static async listPorts()
    {
        // const devices = await navigator.usb.getDevices();
        // return devices;

        return new Promise((resolve, reject)=>{
            try {
                // chrome.serial.getDevices((ports)=>{
                //     resolve(ports);
                // });
                resolve([{path: '/dev/ttyS4'}]);
            } catch (error) {
                reject(error);
            }
        });
    }

    constructor() 
    {
        
    }

    connect()
    {

    }

    disconnect()
    {

    }
};

export { SerialDeviceController };

