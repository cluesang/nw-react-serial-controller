import * as types from "./IPOCReaderController";
import * as enums from "./POC_enums";

export const diagnosticBuffer:types.iDiagnosticSiteData = {
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

export const siteSettings = {
    "A1": {
        pwm: 94,
        enable: true
    }
,   "A2": {
        pwm: 69,
        enable: true
    }
,   "A3": {
        pwm: 139,
        enable: true
    }
,   "A4": {
        pwm: 101,
        enable: true
    }
,   "B1": {
        pwm: 101,
        enable: true
    }
,   "B2": {
        pwm: 101,
        enable: true
    }
,   "B3": {
        pwm: 68,
        enable: true
    }
,   "B4": {
        pwm: 106,
        enable: true
    }
};

export const siteResults = {
    "A1": {
        slope: undefined,
        intercept: undefined,
        r2: undefined,
        testDuration: undefined,
        pwm:undefined
    }
,   "A2": {
        slope: undefined,
        intercept: undefined,
        r2: undefined,
        testDuration: undefined,
        pwm:undefined
    }
,   "A3": {
        slope: undefined,
        intercept: undefined,
        r2: undefined,
        testDuration: undefined,
        pwm:undefined
    }
,   "A4": {
        slope: undefined,
        intercept: undefined,
        r2: undefined,
        testDuration: undefined,
        pwm:undefined
    }
,   "B1": {
        slope: undefined,
        intercept: undefined,
        r2: undefined,
        testDuration: undefined,
        pwm:undefined
    }
,   "B2": {
        slope: undefined,
        intercept: undefined,
        r2: undefined,
        testDuration: undefined,
        pwm:undefined
    }
,   "B3": {
        slope: undefined,
        intercept: undefined,
        r2: undefined,
        testDuration: undefined,
        pwm:undefined
    }
,   "B4": {
        slope: undefined,
        intercept: undefined,
        r2: undefined,
        testDuration: undefined,
        pwm:undefined
    }
}; 

export const routine:types.iDiagnosticRoutineStep[] = 
[
    {loc: "A1"}
,   {loc: "A2"}
,   {loc: "A3"}
,   {loc: "A4"}
,   {loc: "B1"}
,   {loc: "B2"}
,   {loc: "B3"}
,   {loc: "B4"}
]

export const calibrationSlide5Prompt:types.iUserPrompt = {
    dialog:enums.CALIBRATIONS.SLIDE_5
,   acceptAction:()=>{}
,   cancelAction:()=>{}
}

export const calibrationSlide4Prompt:types.iUserPrompt = {
    dialog:enums.CALIBRATIONS.SLIDE_4
,   acceptAction:()=>{}
,   cancelAction:()=>{}
}

export const calibrationSlide3Prompt:types.iUserPrompt = {
    dialog:enums.CALIBRATIONS.SLIDE_3
,   acceptAction:()=>{}
,   cancelAction:()=>{}
}

export const calibrationSlide2Prompt:types.iUserPrompt = {
    dialog:enums.CALIBRATIONS.SLIDE_2
,   acceptAction:()=>{}
,   cancelAction:()=>{}
}

export const calibrationSlide1Prompt:types.iUserPrompt = {
    dialog:enums.CALIBRATIONS.SLIDE_1
,   acceptAction:()=>{}
,   cancelAction:()=>{}
}

export const calibrationSlide0Prompt:types.iUserPrompt = {
    dialog:enums.CALIBRATIONS.SLIDE_0
,   acceptAction:()=>{}
,   cancelAction:()=>{}
}


export const calibrationRoutine:types.iCalibrationRoutineStep[] = 
[
    {
        prompt: calibrationSlide5Prompt
    ,   steps: routine
    }
,   {
        prompt: calibrationSlide4Prompt
    ,   steps: routine
    }
,   {
        prompt: calibrationSlide3Prompt
    ,   steps: routine
    }
,   {
        prompt: calibrationSlide2Prompt
    ,   steps: routine
    }
,   {
        prompt: calibrationSlide1Prompt
    ,   steps: routine
    }
,   {
        prompt: calibrationSlide0Prompt
    ,   steps: routine
    }
]