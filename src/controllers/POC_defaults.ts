import * as types from "./IPOCReaderController";

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

export const calibrationRoutine:types.iCalibrationRoutineStep[] = 
[
    {
        prompt: "Place calibration slide 5 into the reader."
    ,   steps: routine
    }
,   {
        prompt: "Place calibration slide 4 into the reader."
    ,   steps: routine
    }
,   {
        prompt: "Place calibration slide 3 into the reader."
    ,   steps: routine
    }
,   {
        prompt: "Place calibration slide 2 into the reader."
    ,   steps: routine
    }
,   {
        prompt: "Place calibration slide 1 into the reader."
    ,   steps: routine
    }
,   {
        prompt: "Place calibration slide 0 into the reader."
    ,   steps: routine
    }
]