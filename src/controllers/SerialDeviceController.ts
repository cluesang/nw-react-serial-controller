let connectionOptions: chrome.serial.ConnectionOptions = {
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
    static async listPorts():Promise<chrome.serial.DeviceInfo[]>
    {
        return new Promise<chrome.serial.DeviceInfo[]>((resolve, reject)=>{
            try {
                chrome.serial.getDevices((ports)=>{
                    return resolve(ports);
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    #port:chrome.serial.DeviceInfo;
    #connectionInfo:chrome.serial.ConnectionInfo|undefined;

    constructor(serialPort:chrome.serial.DeviceInfo) 
    {
        this.#port = serialPort;
    }

    static async connect(serialDevice:chrome.serial.DeviceInfo):Promise<chrome.serial.ConnectionInfo>
    {
        return new Promise<chrome.serial.ConnectionInfo>((resolve, reject)=>{
            try {
                chrome.serial.connect(serialDevice.path, connectionOptions, (connectionInfo)=>{
                    resolve(connectionInfo);
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

    static async disconnect(connectionInfo:chrome.serial.ConnectionInfo):Promise<boolean>
    {        
        const connectionId = connectionInfo.connectionId;

        if (connectionId === undefined) return true

        return new Promise<boolean>((resolve, reject)=>{
            try {
                chrome.serial.disconnect(connectionId, (result)=>{
                    resolve(result);
                });
            } catch (error) {
                return reject(error);
            }
        });
    }

};

export { SerialDeviceController };

