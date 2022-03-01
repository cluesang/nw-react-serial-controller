import { SerialDeviceController } from "./SerialDeviceController";
import * as types from "./IPOCReaderController";
import * as enums from "./POC_enums";
import * as defaults from "./POC_defaults";
import regression from "regression";
import structuredClone from '@ungap/structured-clone';

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
    static diagnosticBuffer: types.iDiagnosticSiteData = structuredClone(defaults.diagnosticBuffer);
    static activeSite = "";
    static siteSettings: types.iDiagnosticSiteSettings = structuredClone(defaults.siteSettings);
    static siteResults: types.iDiagnosticResults = structuredClone(defaults.siteResults);
    
    static activeRoutine:types.iDiagnosticRoutineStep[]|undefined;
    static activeRoutineIndex = 0;

    static activeCalibrationRoutine:types.iCalibrationRoutineStep[]|undefined;
    static activeCalibrationRoutineIndex = 0;
    static lastReq: string;
    static alreadyRetrying: boolean;
    static enableDiagnosticDataCallback:boolean = true;
    static diagnosticDataCallbackPeriod:number = 400;

    static onDiagnosticResultsCallback: (results: types.iDiagnosticResults) => void;
    static onCalibrationCallback: (results: types.iCalibrationResults) => void;
    static stateChangeCallback:(state:enums.READER_STATE|enums.APP_STATE, message:string)=>void;
    static diagnosticDataCallback:(siteData:types.iDiagnosticSiteData)=>void;
    static userPromptCallback:(prompt:types.iUserPrompt)=>void

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
                    // console.log(message);  
                    if (message.payload)
                    {
                        if (message.payload.loc)
                        {
                            this.activeSite = message.payload.loc;
                            this.diagnosticBuffer[this.activeSite] = 
                            structuredClone(defaults.diagnosticBuffer[this.activeSite]);
                        }
                    }
                }
                break;
            case "finishedDiagnostic":
                {
                    // console.log(message)
                    this.setState(enums.READER_STATE.FINISHED_DIAGNOSTIC);   
                    this.fitData();
                    if(this.activeCalibrationRoutine)
                    {
                        const calibration_step = this.activeCalibrationRoutine[this.activeCalibrationRoutineIndex-1];
                        const calibration_slide = calibration_step.prompt.dialog as string;
                        const calibration_result = {
                            [calibration_slide]: this.siteResults
                        }
                        this.onCalibrationCallback(calibration_result);
                    } else {
                        this.onDiagnosticResultsCallback(this.siteResults);
                    }
                    
                    this.activeSite = "";
                    if(this.activeRoutine)
                    {
                        this.continueRoutine();
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
                    this.stopRoutine();    
                    this.stopCalibration();                 
                }
                break;
            case "parseError":
                {
                    if(this.state !== enums.READER_STATE.RUNNING_DIAGNOSTIC)
                    {
                        this.retryLastReq();     
                    } else {
                        this.setState(enums.READER_STATE.PARSE_ERROR);
                    }
                }
                break;
            case "semanticError":
                {
                    if(this.state !== enums.READER_STATE.RUNNING_DIAGNOSTIC)
                    {
                        this.retryLastReq();   
                    } else {
                        this.setState(enums.READER_STATE.SEMANTIC_ERROR); 
                    }   
                }
                break;
            case "manualReset":
                {
                    // console.log(message)
                    this.setState(enums.READER_STATE.RESET);     
                    this.activeSite = "";      
                    this.stopRoutine();   
                    this.stopCalibration();            
                }
                break;
            case "undefined":
                // payload
                {
                    if(this.state !== enums.READER_STATE.RUNNING_DIAGNOSTIC)
                    {
                        this.retryLastReq();
                    } else {
                        this.setState(enums.READER_STATE.UNDEFINED);  
                    }
                }                
                break;
            default:
                break;
        }
    }

    static fitData()
    {
        const data = this.diagnosticBuffer[this.activeSite];
        const pairs = data.times.map((time, index) => {
            const dataPoint:regression.DataPoint = [time, data.voltages[index]];
            return dataPoint;
        });
        const results = regression.linear(pairs);
        const [slope, intercept] = results.equation;
        this.siteResults[this.activeSite].slope = slope;
        this.siteResults[this.activeSite].intercept = intercept;
        this.siteResults[this.activeSite].r2 = results.r2;
        this.siteResults[this.activeSite].testDuration = data.times[data.times.length-1];
        this.siteResults[this.activeSite].pwm = this.siteSettings[this.activeSite].pwm;
    }

    static retryLastReq() 
    {
        if(this.alreadyRetrying) return
        this.alreadyRetrying = true;
        setTimeout(()=>{
            this.setState(enums.APP_STATE.RETRYING_REQUEST);
            this.req(this.lastReq);
            // console.log("Retrying last request.");
            this.alreadyRetrying = false;
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
        if(this.activeCalibrationRoutine)
        {
            const calibrationRoutineMessage = "CALIBRATE STEP: "+this.activeCalibrationRoutineIndex+" of "
                                                +this.activeCalibrationRoutine.length;
            userStateMessage = calibrationRoutineMessage+" / "+userStateMessage;
        }
        // console.log("new state: "+state);
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

    static onDiagnosticResults(callback:(results:types.iDiagnosticResults)=>void)
    {
        this.onDiagnosticResultsCallback = callback;
    }

    static onCalibrationResults(callback:(results:types.iCalibrationResults)=>void)
    {
        this.onCalibrationCallback = callback;
    }

    static onUserPrompt(callback:(prompt:types.iUserPrompt)=>void)
    {
        this.userPromptCallback = callback;
    }

    static sendUserPrompt(prompt:types.iUserPrompt)
    {
        // console.log(prompt);
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
                    // console.log(time,voltage);
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
        
        // We're gonna rate limit the diagnosticDataCallbackupdate.
        if(this.enableDiagnosticDataCallback) 
        {
            this.diagnosticDataCallback(this.diagnosticBuffer);
            this.enableDiagnosticDataCallback = false;
            setTimeout(()=>{
                this.enableDiagnosticDataCallback = true;
            },this.diagnosticDataCallbackPeriod);
        }
    }

    static resetBox()
    {
        if(this.connectionId) {
            const command = POCReaderController.genCommand(enums.READER_ACTION.RESET);
            POCReaderController.send(this.connectionId,command);
        }
    }

    static reset()
    {
        this.activeSite = "";
        this.stopRoutine();
        this.stopCalibration();
        this.resetBox();
    }

    static req(command:string)
    {
        this.lastReq = command;
        if(this.connectionId) super.send(this.connectionId,command)
    }

    static startRoutine(routine:types.iDiagnosticRoutineStep[])
    {
        this.siteResults = structuredClone(defaults.siteResults);
       console.log("Defaults:")
       console.log(defaults.siteResults);
       console.log("Controller Values:")
       console.log(this.siteResults);

       this.activeRoutine = routine;
       this.activeRoutineIndex = 0;
       this.diagnosticBuffer = structuredClone(defaults.diagnosticBuffer);
       this.setState(enums.APP_STATE.STARTING_ROUTINE);
       this.continueRoutine();
    }

    static continueRoutine()
    {
        if(this.activeRoutine && this.connectionId)
        {
            if(this.activeRoutine.length === this.activeRoutineIndex)
            {
                this.stopRoutine();
                if(this.activeCalibrationRoutine) this.continueCalibration();
                return
            }

            const {loc} = this.activeRoutine[this.activeRoutineIndex];
            const {pwm, enable} = this.siteSettings[loc];

            if(!enable)
            {
                // console.log("Skipping step: "+(this.activeRoutineIndex+1)+" of "+this.activeRoutine.length);
                this.activeRoutineIndex += 1;
                setTimeout(()=>{
                    this.continueRoutine();
                },1000);                
            } else {
                // console.log("Running step: "+(this.activeRoutineIndex+1)+" of "+this.activeRoutine.length);
                setTimeout(()=>{
                    if(this.connectionId) this.runDiagnostic(loc,pwm);
                    // console.log("Running site: "+loc+" at a pwm of: "+pwm);
                    this.activeRoutineIndex += 1;
                },1000);
            }
        }
    }

    static stopRoutine()
    {
        if(this.activeRoutine)
        {
            if(this.activeRoutine.length === this.activeRoutineIndex) 
            {
                this.setState(enums.APP_STATE.FINISHED_ROUTINE);
            } else {
                this.setState(enums.APP_STATE.CANCELED_ROUTINE);
            }
        }
        this.activeRoutine = undefined;
        this.activeRoutineIndex = 0;
        if(this.activeCalibrationRoutine === undefined) this.resetBox();
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
        this.setState(enums.APP_STATE.STARTING_CALIBRATION);
        this.continueCalibration();
    }

    static continueCalibration()
    {
        // send out prompt
        // waint for user okay
        // send routine to start routine.
        if(this.activeCalibrationRoutine)
        {
            if(this.activeCalibrationRoutine.length === this.activeCalibrationRoutineIndex)
            {
                this.stopCalibration();
                return
            }

            // We've finished the first calibration step just now.
            // so we should adjustPWMValues.
            if(this.activeCalibrationRoutineIndex === 1) this.adjustAllPWMValues();

            let {prompt, steps} = this.activeCalibrationRoutine[this.activeCalibrationRoutineIndex];
            prompt.acceptAction = ()=>{
                this.startRoutine(steps);
                this.activeCalibrationRoutineIndex += 1;
            }
            prompt.cancelAction = ()=>{
                this.stopCalibration();
                this.setState(enums.APP_STATE.CANCELED_CALIBRATION);
            }
            this.sendUserPrompt(prompt);
        }
    }

    static stopCalibration()
    {
        if(this.activeCalibrationRoutine)
        {
            if(this.activeCalibrationRoutineIndex === this.activeCalibrationRoutine.length)
            {
                this.setState(enums.APP_STATE.FINISHED_CALIBRATION);
            }
        }
        this.activeCalibrationRoutine = undefined;
        this.activeCalibrationRoutineIndex = 0;
        this.stopRoutine();
       
        this.resetBox();
    }

    static runCalibration()
    {
        this.startCalibration(defaults.calibrationRoutine);
    }

    static adjustSitePWMValue(site:string,targetTime:number):number|undefined
    {
        const currentTime = this.siteResults[site].testDuration;
        if(currentTime)
        {
            const currentPWM = this.siteSettings[site].pwm;
            const newPWM = Math.round(currentPWM*(currentTime/targetTime));
            // console.log("current runtime: "+currentTime+" target runtime: "+targetTime
            //             +" current pwm: "+currentPWM+" new pwm: "+newPWM);
            return newPWM;
        } else {
            return undefined;
        }
    }

    static adjustAllPWMValues()
    {
        this.setState(enums.APP_STATE.ADJUSTING_PWM_VALUES);
        for(const site in enums.READER_SITES)
        {
            if(this.siteSettings[site].enable)
            {
                const newPWM = this.adjustSitePWMValue(site,enums.TARGET_TIME.t30);
                if(newPWM) this.siteSettings[site].pwm = newPWM;
            }
        }
    }

    static updatePWM(loc:string, newPWM:number)
    {
        this.siteSettings[loc].pwm = newPWM;
    }

    static updateEnable(loc:string, enable:boolean)
    {
        this.siteSettings[loc].enable = enable;
    }
}

export { 
    POCReaderController
 };
