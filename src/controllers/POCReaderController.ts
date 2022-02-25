import { SerialDeviceController } from "./SerialDeviceController";
import * as types from "./IPOCReaderController";
import * as enums from "./POC_enums";
import * as defaults from "./POC_defaults";
import { TIMEOUT } from "dns";

function prepDiagnosticRequest(loc:string, pwmValue:number)
{
    let params = { loc: loc, pwm_x: 0, pwm_y: 0, pwm_z: 0 };

    switch (loc) {
        case "A1":
        case "A4":
        case "B3":
            {
                params.pwm_y = pwmValue;
            }
            break;
        case "A2":
        case "B2":
            {
                params.pwm_x = pwmValue;
            }
            break;
        case "A3":
        case "B1":
        case "B4":
            {
                params.pwm_z = pwmValue;
            }
            break;
        default:
            break;
    };

    return params;
};

class POCReaderController extends SerialDeviceController {
    
    static state:enums.READER_STATE|enums.APP_STATE = enums.READER_STATE.DISCONNECTED;
    static connectionId:number|undefined;
    static serialBuffer = "";
    static incompleteFlag = false;
    static diagnosticReadingBuffer = "";
    static diagnosticReadingBufferIncompleteFlag = false;
    static diagnosticBuffer: types.iDiagnosticSiteData = defaults.diagnosticBuffer;
    static activeSite = "";
    static siteSettings: types.iDiagnosticSiteSettings = defaults.siteSettings;
    
    static activeRoutine:types.iDiagnosticRoutineStep[]|undefined;
    static activeRoutineIndex = 0;

    static activeCalibrationRoutine:types.iCalibrationRoutineStep[]|undefined;
    static activeCalibrationRoutineIndex = 0;

    static stateChangeCallback:(state:enums.READER_STATE|enums.APP_STATE, message:string)=>void;
    static diagnosticDataCallback:(siteData:types.iDiagnosticSiteData)=>void;
    static userPromptCallback:(prompt:string)=>void
    static lastReq: string;

    static parseMessages(message:types.iSerialMessage)
    {
        // console.log(message);
        switch (message.resp) 
        {
            case "boot":
                {
                    // console.log(message)
                    this.setState(enums.READER_STATE.BOOTED);                        
                }
                break;
            case "initialize":
                {
                    // console.log(message)
                    this.setState(enums.READER_STATE.INITIALIZED);       
                    this.activeSite = "";                    
                }
                break;
            case "getMetaData":
                // payload
                {
                    // console.log(message)
                    this.setState(enums.READER_STATE.GETTING_METADATA);                        
                }
                break;
            case "runDiagnostic":
                {
                    // console.log(message)
                    this.setState(enums.READER_STATE.RUNNING_DIAGNOSTIC);  
                    console.log(message);  
                    if (message.payload)
                    {
                        if (message.payload.loc)
                        {
                            this.activeSite = message.payload.loc;
                        }
                    }
                }
                break;
            case "finishedDiagnostic":
                {
                    // console.log(message)
                    this.setState(enums.READER_STATE.FINISHED_DIAGNOSTIC);   
                    this.activeSite = "";

                    if(this.activeRoutine)
                    {
                        if(this.activeRoutine.length === this.activeRoutineIndex)
                        {
                            this.stopRoutine();
                        } else {
                            this.continueRoutine();
                        }
                    }           
                }
                break;
            case "blink":
                {
                    // console.log(message)
                    this.setState(enums.READER_STATE.BLINK);                        
                }
                break;
            case "reset":
                {
                    // console.log(message)
                    this.setState(enums.READER_STATE.RESET);     
                    this.activeSite = "";                     
                }
                break;
            case "parseError":
                {
                    // console.log(message)
                    this.setState(enums.READER_STATE.PARSE_ERROR); 
                    if(this.activeRoutine) this.pauseRoutine();
                    this.retryLastReq();  
                    // this.activeSite = "";      
                    // this.stopRoutine();                   
                }
                break;
            case "semanticError":
                {
                    // console.log(message)
                    this.setState(enums.READER_STATE.SEMANTIC_ERROR);    
                    this.activeSite = "";      
                    this.stopRoutine();                  
                }
                break;
            case "manualReset":
                {
                    // console.log(message)
                    this.setState(enums.READER_STATE.RESET);     
                    this.activeSite = "";      
                    // this.stopRoutine();            
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
    static retryLastReq() {
        setTimeout(()=>{
            this.setState(enums.APP_STATE.RETRYING_REQUEST);
            this.req(this.lastReq);
        },2000);
    }

    static parseSerialOutput(serialData:string)
    {
        if(this.state === enums.READER_STATE.RUNNING_DIAGNOSTIC)
        {
            this.parseDiagnosticReadings(serialData);
        }

        if(this.incompleteFlag) serialData = this.serialBuffer+serialData;

        const lineEnding = serialData.substring(serialData.length-3);
        
        // we have an incomplete input. store data and wait for rest of input
        // on the next on data event.
        if (lineEnding !== "}\r\n")
        {
            this.serialBuffer = serialData;
            this.incompleteFlag = true;
            return
        } else {
            this.serialBuffer = "";
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

    static setState(state:enums.READER_STATE|enums.APP_STATE)
    {
        this.state = state;
        let userStateMessage:string = state;
        if(this.activeRoutine)
        {
            const routineMessage = "ROUTINE STEP: "+this.activeRoutineIndex+" of "+this.activeRoutine.length;
            userStateMessage = routineMessage+" / "+userStateMessage;
        } 
        this.stateChangeCallback(state,userStateMessage);
    }

    static onStateChange(callback:(state:enums.READER_STATE|enums.APP_STATE, message:string)=>void)
    {
        this.stateChangeCallback = callback;
    }

    static onDiagnosticData(callback:(diagnosticData:types.iDiagnosticSiteData)=>void)
    {
        this.diagnosticDataCallback = callback;
    }

    static onUserPrompt(callback:(prompt:string)=>void)
    {
        // console.log("attaching user prompt callback");
        this.userPromptCallback = callback;
    }

    static sendUserPrompt(prompt:string)
    {
        console.log(prompt);
        this.userPromptCallback(prompt);
    }

    static genCommand(action:enums.READER_ACTION, params?:object)
    {
        let command:types.iReaderRequest = {
            req: action
        }

        if(action === enums.READER_ACTION.RUN_DIAGNOSTIC)
        {
            command.params = params;
        }        

        return JSON.stringify(command);
    }

    static runDiagnostic(loc:string, pwm:number)
    {
        const diagnostic_params = prepDiagnosticRequest(loc,pwm);
        const command = this.genCommand(enums.READER_ACTION.RUN_DIAGNOSTIC, diagnostic_params);
        this.req(command);
    }

    static parseDiagnosticReadings(serialData:string)
    {
        if(this.diagnosticReadingBufferIncompleteFlag) {
            serialData = this.diagnosticReadingBuffer+serialData;
        }

        const lineEnding = serialData.substring(serialData.length-2);

        if(lineEnding !== "\r\n")
        {
            this.diagnosticReadingBuffer = serialData;
            this.diagnosticReadingBufferIncompleteFlag = true
            return
        } else {
            this.diagnosticReadingBuffer = "";
            this.diagnosticReadingBufferIncompleteFlag = false
        }

        let times:number[] = []; 
        let voltages:number[] = [];
        // console.log(serialData);
        serialData.split("\r\n")
                  .filter(line => line.length > 0)
                  .map(line => line.split("\t"))
                  .map(([time,voltage])=>{
                    console.log(time,voltage);
                    const fTime = parseFloat(time);
                    const fVoltage = parseFloat(voltage);
                    if(!(Number.isNaN(fTime) || Number.isNaN(fVoltage)))
                    {
                        times.push(fTime);
                        voltages.push(fVoltage);
                    }
                  });
        
        const currentSiteData = this.diagnosticBuffer[this.activeSite];  
        const newSiteData = 
        {
            [this.activeSite]: 
            {
                ...currentSiteData
            ,   times: [...currentSiteData.times,...times]
            ,   voltages: [...currentSiteData.voltages,...voltages]
            }
        }  

        this.diagnosticBuffer = 
        {
            ...this.diagnosticBuffer
        ,   ...newSiteData
        }
        // console.log(this.diagnosticBuffer);
        this.diagnosticDataCallback(this.diagnosticBuffer);
    }

    static resetBox(connectionId:number)
    {
        const command = POCReaderController.genCommand(enums.READER_ACTION.RESET);
        POCReaderController.send(connectionId,command);
    }

    static req(command:string)
    {
        this.lastReq = command;
        if(this.connectionId) super.send(this.connectionId,command)
    }

    static startRoutine(routine:types.iDiagnosticRoutineStep[])
    {
       this.activeRoutine = routine;
       this.activeRoutineIndex = 0;
       this.continueRoutine();
    }

    static continueRoutine()
    {
        if(this.activeRoutine && this.connectionId)
        {
            console.log("Running step: "+(this.activeRoutineIndex+1)+" of "+this.activeRoutine.length);
            const {loc, pwm} = this.activeRoutine[this.activeRoutineIndex];
            setTimeout(()=>{
                if(this.connectionId) this.runDiagnostic(loc,pwm);
                this.activeRoutineIndex += 1;
            },1000);
        }
    }

    static stopRoutine()
    {
        this.activeRoutine = undefined;
        this.activeRoutineIndex = 0;
    }

    static pauseRoutine()
    {
        this.activeRoutine = undefined;
        this.activeRoutineIndex -= 1;
    }

    static setConnectionId(connectionId:number|undefined)
    {
        this.connectionId = connectionId;
    }

    static runDefaultRoutine()
    {
        this.startRoutine(defaults.routine);
    }

    static startCalibration(calibrationRoutine:types.iCalibrationRoutineStep[])
    {
        this.activeCalibrationRoutine = calibrationRoutine;
        this.activeCalibrationRoutineIndex = 0;
        this.continueCalibration();
    }

    static continueCalibration()
    {
        // send out prompt
        // waint for user okay
        // send routine to start routine.
        if(this.activeCalibrationRoutine)
        {
            const {prompt, steps} = this.activeCalibrationRoutine[this.activeCalibrationRoutineIndex];
            this.sendUserPrompt(prompt);
        }
    }

    static stopCalibration()
    {
        this.activeCalibrationRoutine = undefined;
        this.activeCalibrationRoutineIndex = 0;
    }

    static runCalibration()
    {
        this.startCalibration(defaults.calibrationRoutine);
    }
}

export { 
    POCReaderController
 };