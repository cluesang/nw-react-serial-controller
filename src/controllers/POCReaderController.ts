import { SerialDeviceController } from "./SerialDeviceController";

interface iSerialMessage
{
    resp: string
,   payload: string
}

enum READER_STATE {
    DISCONNECTED = "DISCONNECTED"
,   CONNECTED = "CONNECTED"
,   BOOTED = "BOOTED" 
,   INITIALIZED = "INITIALIZED" 
,   GETTING_METADATA = "GETTING META DATA"
,   RUNNING_DIAGNOSTIC = "RUNNING DIAGNOSTIC" 
,   FINISHED_DIAGNOSTIC = "FINISHED DIAGNOSTIC" 
,   BLINK = "BLINK" 
,   RESET = "RESET" 
,   ERROR = "ERROR"
}

enum READER_ACTION {
   INITIALIZE = "initialize" 
,   GET_METADATA = "getMetaData"
,   RUN_DIAGNOSTIC = "runDiagnostic" 
,   BLINK = "blink" 
,   RESET = "reset" 
}

class POCReaderController extends SerialDeviceController {
    
    static state = READER_STATE.DISCONNECTED;
    static stateChangeCallback:(state:READER_STATE)=>void;

    static parseMessages(message:iSerialMessage)
    {
        // console.log(message);
        switch (message.resp) 
        {
            case "boot":
                {
                    // console.log(message)
                    this.setState(READER_STATE.BOOTED);                        
                }
                break;
            case "initialize":
                {
                    // console.log(message)
                    this.setState(READER_STATE.INITIALIZED);                        
                }
                break;
            case "getMetaData":
                // payload
                {
                    // console.log(message)
                    this.setState(READER_STATE.GETTING_METADATA);                        
                }
                break;
            case "runDiagnostic":
                {
                    // console.log(message)
                    this.setState(READER_STATE.RUNNING_DIAGNOSTIC);                    
                }
                break;
            case "finishedDiagnostic":
                {
                    // console.log(message)
                    this.setState(READER_STATE.FINISHED_DIAGNOSTIC);                    
                }
                break;
            case "blink":
                {
                    // console.log(message)
                    this.setState(READER_STATE.BLINK);                        
                }
                break;
            case "reset":
                {
                    // console.log(message)
                    this.setState(READER_STATE.RESET);                        
                }
                break;
            case "parseError":
                {
                    // console.log(message)
                    this.setState(READER_STATE.ERROR);                    
                }
                break;
            case "semanticError":
                {
                    // console.log(message)
                    this.setState(READER_STATE.ERROR);                    
                }
                break;
            case "manualReset":
                {
                    // console.log(message)
                    this.setState(READER_STATE.RESET);                    
                }
                break;
            // case "reading":
            //     {
            //         // console.log(message)
            //         this.setState(READER_STATE.BOOTED);                    
            //     }
            //     // payload
            //     break;
            case "undefined":
                // payload
                break;
            default:
                break;
        }
    }

    static buffer = "";
    static incompleteFlag = false;

    static parseSerialOutput(serialData:string)
    {
        if(this.incompleteFlag) serialData = this.buffer+serialData;

        const lineEnding = serialData.substring(serialData.length-3);
        
        // we have an incomplete input. store data and wait for rest of input
        // on the next on data event.
        if (lineEnding !== "}\r\n")
        {
            this.buffer = serialData;
            this.incompleteFlag = true;
            return
        } else {
            this.buffer = "";
            this.incompleteFlag = false;
        }

        console.log(serialData);
        const messages = serialData.split("\r\n")
                    .filter(line => line.length > 0)
                    .map((line) => {
                        let parsed = undefined;
                        try {
                            parsed = JSON.parse(line);
                        } catch (error) {
                            
                        }
                        return parsed
                    }).filter(parsed => parsed !== undefined);

        messages.map(msg => this.parseMessages(msg));
    }

    static setState(readerState:READER_STATE)
    {
        this.state = readerState;
        this.stateChangeCallback(readerState);
    }

    static onStateChange(callback:(state:READER_STATE)=>void)
    {
        this.stateChangeCallback = callback;
    }

    static genCommand(action:READER_ACTION)
    {
        let command = {
            req: action
        }

        return JSON.stringify(command);
    }
}

export { POCReaderController, READER_STATE, READER_ACTION };