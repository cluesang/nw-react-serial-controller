import * as types from "./IPOCReaderController";
import * as enums from "./POC_enums";

export const diagnosticBuffer = {
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


export const routine:types.iDiagnosticRoutineStep[] = 
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

export const calibrationSlide5Prompt:types.userPrompt = {
    dialog:enums.USER_DIALOG.CALIBRATION_SLIDE_5
,   acceptAction:()=>{}
,   cancelAction:()=>{}
}

export const calibrationSlide4Prompt:types.userPrompt = {
    dialog:enums.USER_DIALOG.CALIBRATION_SLIDE_4
,   acceptAction:()=>{}
,   cancelAction:()=>{}
}

export const calibrationSlide3Prompt:types.userPrompt = {
    dialog:enums.USER_DIALOG.CALIBRATION_SLIDE_3
,   acceptAction:()=>{}
,   cancelAction:()=>{}
}

export const calibrationSlide2Prompt:types.userPrompt = {
    dialog:enums.USER_DIALOG.CALIBRATION_SLIDE_2
,   acceptAction:()=>{}
,   cancelAction:()=>{}
}

export const calibrationSlide1Prompt:types.userPrompt = {
    dialog:enums.USER_DIALOG.CALIBRATION_SLIDE_1
,   acceptAction:()=>{}
,   cancelAction:()=>{}
}

export const calibrationSlide0Prompt:types.userPrompt = {
    dialog:enums.USER_DIALOG.CALIBRATION_SLIDE_0
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