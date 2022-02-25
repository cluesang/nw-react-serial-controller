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