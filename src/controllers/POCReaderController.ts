import { SerialDeviceController } from "./SerialDeviceController";

interface iSerialMessage
{
   resp: string;
   payload?: {loc?:string};
}

interface iReaderRequest
{
    req:string;
    params?:object;
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
,   PARSE_ERROR = "PARSE ERROR"
,   SEMANTIC_ERROR = "SEMANTIC ERROR"
}

enum APP_STATE {
    START = "START"
,   LOADING = "LOADING"
,   CALIBRATING = "CALIBRATING"
,   RUNNING_DIAGNOSTIC = "RUNNING_DIAGNOSING"
}

enum READER_ACTION {
   INITIALIZE = "initialize" 
,   GET_METADATA = "getMetaData"
,   RUN_DIAGNOSTIC = "runDiagnostic" 
,   BLINK = "blink" 
,   RESET = "reset" 
}

enum READER_SITES {
    A1 = "A1"
,   A2 = "A2"
,   A3 = "A3"
,   A4 = "A4"
,   B1 = "B1"
,   B2 = "B2"
,   B3 = "B3"
,   B4 = "B4"
}

interface iDiagnosticSiteData {
    [key: string]: {
        times:number[];
        voltages:number[];
    }
}

interface iDiagnosticSiteSettings {
    [key: string]: {
       pwm: number;
       enable: boolean;
    }
}

interface diagnosticRoutineStep {
    loc: string;
    pwm: number;
}

const defaultRoutine:diagnosticRoutineStep[] = 
[
    {loc: "A1", pwm: 75}
,   {loc: "A2", pwm: 75}
,   {loc: "A3", pwm: 75}
,   {loc: "A4", pwm: 75}
,   {loc: "B1", pwm: 75}
,   {loc: "B2", pwm: 75}
,   {loc: "B3", pwm: 75}
,   {loc: "B4", pwm: 75}
]

interface iCalibrationRoutineStep {
    prompt: string;
    steps: diagnosticRoutineStep[];
}

const calibrationRoutine:iCalibrationRoutineStep[] = 
[
    {
        prompt: "Place calibration slide 5 into the reader."
    ,   steps: defaultRoutine
    }
,   {
        prompt: "Place calibration slide 4 into the reader."
    ,   steps: defaultRoutine
    }
,   {
        prompt: "Place calibration slide 3 into the reader."
    ,   steps: defaultRoutine
    }
,   {
        prompt: "Place calibration slide 2 into the reader."
    ,   steps: defaultRoutine
    }
,   {
        prompt: "Place calibration slide 1 into the reader."
    ,   steps: defaultRoutine
    }
,   {
        prompt: "Place calibration slide 0 into the reader."
    ,   steps: defaultRoutine
    }
    
]

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

const initDiagnosticBuffer = {
    "A1": {
        times: []
    ,   voltages: []
    }
,   "A2": {
        times: []
    ,   voltages: []
    }
,   "A3": {
        times: []
    ,   voltages: []
    }
,   "A4": {
        times: []
    ,   voltages: []
    }
,   "B1": {
        times: []
    ,   voltages: []
    }
,   "B2": {
        times: []
    ,   voltages: []
    }
,   "B3": {
        times: []
    ,   voltages: []
    }
,   "B4": {
        times: []
    ,   voltages: []
    }
}

const initSiteSettings = {
    "A1": {
        pwm: 25,
        enable: true
    }
,   "A2": {
        pwm: 25,
        enable: true
    }
,   "A3": {
        pwm: 25,
        enable: true
    }
,   "A4": {
        pwm: 25,
        enable: true
    }
,   "B1": {
        pwm: 25,
        enable: true
    }
,   "B2": {
        pwm: 25,
        enable: true
    }
,   "B3": {
        pwm: 25,
        enable: true
    }
,   "B4": {
        pwm: 25,
        enable: true
    }
};


class POCReaderController extends SerialDeviceController {
    
    static state:READER_STATE|APP_STATE = READER_STATE.DISCONNECTED;
    static connectionId:number|undefined;
    static serialBuffer = "";
    static incompleteFlag = false;
    static diagnosticReadingBuffer = "";
    static diagnosticReadingBufferIncompleteFlag = false;
    static diagnosticBuffer: iDiagnosticSiteData = initDiagnosticBuffer;
    static activeSite = "";
    static siteSettings: iDiagnosticSiteSettings = initSiteSettings;
    
    static activeRoutine:diagnosticRoutineStep[]|undefined;
    static activeRoutineIndex = 0;

    static activeCalibrationRoutine:iCalibrationRoutineStep[]|undefined;
    static activeCalibrationRoutineIndex = 0;

    static stateChangeCallback:(state:READER_STATE|APP_STATE, message:string)=>void;
    static diagnosticDataCallback:(siteData:iDiagnosticSiteData)=>void;
    static userPromptCallback:(prompt:string)=>void

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
                    this.activeSite = "";                    
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
                    this.setState(READER_STATE.FINISHED_DIAGNOSTIC);   
                    this.activeSite = "";

                    if(this.activeRoutine)
                    {
                        if(this.activeRoutine.length-1 === this.activeRoutineIndex)
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
                    this.setState(READER_STATE.BLINK);                        
                }
                break;
            case "reset":
                {
                    // console.log(message)
                    this.setState(READER_STATE.RESET);     
                    this.activeSite = "";                     
                }
                break;
            case "parseError":
                {
                    // console.log(message)
                    this.setState(READER_STATE.PARSE_ERROR);   
                    this.activeSite = "";      
                    this.stopRoutine();                   
                }
                break;
            case "semanticError":
                {
                    // console.log(message)
                    this.setState(READER_STATE.SEMANTIC_ERROR);    
                    this.activeSite = "";      
                    this.stopRoutine();                  
                }
                break;
            case "manualReset":
                {
                    // console.log(message)
                    this.setState(READER_STATE.RESET);     
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

    static parseSerialOutput(serialData:string)
    {
        if(this.state === READER_STATE.RUNNING_DIAGNOSTIC)
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

    static setState(state:READER_STATE|APP_STATE)
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

    static onStateChange(callback:(state:READER_STATE|APP_STATE, message:string)=>void)
    {
        this.stateChangeCallback = callback;
    }

    static onDiagnosticData(callback:(diagnosticData:iDiagnosticSiteData)=>void)
    {
        this.diagnosticDataCallback = callback;
    }

    static onUserPrompt(callback:(prompt:string)=>void)
    {
        console.log("attaching user prompt callback");
        this.userPromptCallback = callback;
    }

    static sendUserPrompt(prompt:string)
    {
        console.log(prompt);
        this.userPromptCallback(prompt);
    }

    static genCommand(action:READER_ACTION, params?:object)
    {
        let command:iReaderRequest = {
            req: action
        }

        if(action === READER_ACTION.RUN_DIAGNOSTIC)
        {
            command.params = params;
        }        

        return JSON.stringify(command);
    }

    static runDiagnostic(connectionId:number, loc:string, pwm:number)
    {
        const diagnostic_params = prepDiagnosticRequest(loc,pwm);
        const command = this.genCommand(READER_ACTION.RUN_DIAGNOSTIC, diagnostic_params);
        console.log(command);
        this.send(connectionId,command);
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
        const command = POCReaderController.genCommand(READER_ACTION.RESET);
        POCReaderController.send(connectionId,command);
    }

    static req(command:string)
    {
        if(this.connectionId) super.send(this.connectionId,command)
    }

    static startRoutine(routine:diagnosticRoutineStep[])
    {
       this.activeRoutine = routine;
       this.activeRoutineIndex = 0;
       this.continueRoutine();
    }

    static continueRoutine()
    {
        if(this.activeRoutine && this.connectionId)
        {
            console.log("Running step: "+this.activeRoutineIndex+" of "+this.activeRoutine.length);
            const {loc, pwm} = this.activeRoutine[this.activeRoutineIndex];
            setTimeout(()=>{
                if(this.connectionId) this.runDiagnostic(this.connectionId,loc,pwm);
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
        this.activeRoutineIndex = 0;
    }

    static setConnectionId(connectionId:number|undefined)
    {
        this.connectionId = connectionId;
    }

    static runDefaultRoutine()
    {
        this.startRoutine(defaultRoutine);
    }

    static startCalibration(calibrationRoutine:iCalibrationRoutineStep[])
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
        this.startCalibration(calibrationRoutine);
    }
}

export { 
    POCReaderController, 
    APP_STATE,
    READER_STATE, 
    READER_ACTION,
    READER_SITES
 };