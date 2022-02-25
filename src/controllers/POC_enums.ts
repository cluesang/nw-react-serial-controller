
export enum READER_STATE {
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
,   UNDEFINED = "UNDEFINED INPUT"
}

export enum APP_STATE {
    START = "START"
,   LOADING = "LOADING"
,   CALIBRATING = "CALIBRATING"
,   RUNNING_ROUTINE = "RUNNING_ROUTINE"
,   FINISHED_ROUTINE = "FINISHED_ROUTINE"
,   RETRYING_REQUEST = "RETRYING_REQUEST"
}

export enum READER_ACTION {
    INITIALIZE = "initialize" 
,   GET_METADATA = "getMetaData"
,   RUN_DIAGNOSTIC = "runDiagnostic" 
,   BLINK = "blink" 
,   RESET = "reset" 
}

export enum READER_SITES {
    A1 = "A1"
,   A2 = "A2"
,   A3 = "A3"
,   A4 = "A4"
,   B1 = "B1"
,   B2 = "B2"
,   B3 = "B3"
,   B4 = "B4"
}

export enum USER_DIALOG {
    CALIBRATION_SLIDE_5 = "CALIBRATION_SLIDE_5"
,   CALIBRATION_SLIDE_4 = "CALIBRATION_SLIDE_4"
,   CALIBRATION_SLIDE_3 = "CALIBRATION_SLIDE_3"
,   CALIBRATION_SLIDE_2 = "CALIBRATION_SLIDE_2"
,   CALIBRATION_SLIDE_1 = "CALIBRATION_SLIDE_1"
,   CALIBRATION_SLIDE_0 = "CALIBRATION_SLIDE_0"
}