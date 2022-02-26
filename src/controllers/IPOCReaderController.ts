import * as enums from "./POC_enums";

export interface iSerialMessage
{
   resp: string;
   payload?: {loc?:string};
}

export interface iReaderRequest
{
    req:string;
    params?:object;
}

export interface iDiagnosticSiteData {
    [key: string]: {
        times:number[];
        voltages:number[];
    }
}

export interface iDiagnosticSiteSettings {
    [key: string]: {
       pwm: number;
       enable: boolean;
       slope: number|undefined;
       intercept: number|undefined;
       r2: number|undefined;
    }
}

export interface iDiagnosticResults {
    [key: string]: {
       slope: number|undefined;
       intercept: number|undefined;
       r2: number|undefined;
    }
}

export interface iDiagnosticRoutineStep {
    loc: string;
    pwm: number;
}
export interface iCalibrationRoutineStep {
    prompt: userPrompt;
    steps: iDiagnosticRoutineStep[];
}

export interface userPrompt {
    dialog: enums.USER_DIALOG;
    acceptAction: ()=>void;
    cancelAction: ()=>void;
}