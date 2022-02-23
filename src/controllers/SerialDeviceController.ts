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

export function arrayBufferToString(buf:ArrayBuffer):string
{
    const charArray = new Uint8Array(buf) as unknown as number[];
    return String.fromCharCode.apply(null, charArray);
};

export function stringToArrayBuffer(str:string):ArrayBuffer
{
    if (str === undefined) {
        str = "";
    }
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
};

class SerialDeviceController 
{
    #port:chrome.serial.DeviceInfo;
    #connectionInfo:chrome.serial.ConnectionInfo|undefined;

    constructor(serialPort:chrome.serial.DeviceInfo) 
    {
        this.#port = serialPort;
    }

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
                return reject(new Error(<string>error));
            }
        });
    }

    static async connect(serialDevice:chrome.serial.DeviceInfo):Promise<chrome.serial.ConnectionInfo>
    {
        return new Promise<chrome.serial.ConnectionInfo>((resolve, reject)=>{
            try {
                chrome.serial.connect(serialDevice.path, connectionOptions, (connectionInfo)=>{
                    if(connectionInfo === undefined) reject("Could not establish a connection. \
                    Check that your OS has drivers installed \
                    and/or has granted the user permission to connect to the serial device. ");
                    if(chrome.runtime.lastError?.message === "Failed to connect to the port")
                    {
                        console.log(chrome.runtime.lastError?.message);
                        throw new Error(chrome.runtime.lastError?.message);
                    } else {
                        resolve(connectionInfo);
                    }
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

    static addListener(callback:(successStatus:boolean,id:number,message:string)=>void)
    {
        chrome.serial.onReceive.addListener(({connectionId,data})=>{
            const read = arrayBufferToString(data);
            callback(true,connectionId,read);
        });

        const device_lost_buffer_msg = stringToArrayBuffer("device_lost");
        chrome.serial.onReceiveError.addListener(({connectionId, error})=>{
            if(error as unknown as string === "device_lost")
            {
                setTimeout(()=>{
                    chrome.serial.setPaused(connectionId,false,()=>
                    {
                    //    console.log("polled");
                    });
                },1000);
            } else {
                const error_msg = arrayBufferToString(error)
                callback(false,connectionId,error_msg);
            }
        })
        
    }

    static async send(connectionId:number,message:string):Promise<object>
    {
        const sendBuffer = stringToArrayBuffer(message);
        return new Promise<object>((resolve,reject)=>{
            try {
                chrome.serial.send(connectionId,sendBuffer,(sendInfo)=>
                {
                   resolve(sendInfo);
                });
            } catch (error) {
                reject(error);
            }
           
        });        
    }
};

export { SerialDeviceController };

