
export interface iExponentialFits {
    site:string;
    coeff: {
      a: number;
      b: number;
    },
    r2:number;
  }
  
export interface iDxResult {
    PatientID:string;
    timeStamp:string;
    Box_ID:string;
    recommendation:string;
  
    A1:number|undefined;
    A2:number|undefined;
    A3:number|undefined;
    A4:number|undefined;
    B1:number|undefined;
    B2:number|undefined;
    B3:number|undefined;
    B4:number|undefined;

    A1_r2:number|undefined;
    A2_r2:number|undefined;
    A3_r2:number|undefined;
    A4_r2:number|undefined;
    B1_r2:number|undefined;
    B2_r2:number|undefined;
    B3_r2:number|undefined;
    B4_r2:number|undefined;
  
    Calibration_A1_pwm:number|undefined;
    Calibration_A2_pwm:number|undefined;
    Calibration_A3_pwm:number|undefined;
    Calibration_A4_pwm:number|undefined;
    Calibration_B1_pwm:number|undefined;
    Calibration_B2_pwm:number|undefined;
    Calibration_B3_pwm:number|undefined;
    Calibration_B4_pwm:number|undefined;
  
    Calibration_A1_coeff_a:number|undefined;
    Calibration_A2_coeff_a:number|undefined;
    Calibration_A3_coeff_a:number|undefined;
    Calibration_A4_coeff_a:number|undefined;
    Calibration_B1_coeff_a:number|undefined;
    Calibration_B2_coeff_a:number|undefined;
    Calibration_B3_coeff_a:number|undefined;
    Calibration_B4_coeff_a:number|undefined;
    
    Calibration_A1_coeff_b:number|undefined;
    Calibration_A2_coeff_b:number|undefined;
    Calibration_A3_coeff_b:number|undefined;
    Calibration_A4_coeff_b:number|undefined;
    Calibration_B1_coeff_b:number|undefined;
    Calibration_B2_coeff_b:number|undefined;
    Calibration_B3_coeff_b:number|undefined;
    Calibration_B4_coeff_b:number|undefined;

    Calibration_A1_r2:number|undefined;
    Calibration_A2_r2:number|undefined;
    Calibration_A3_r2:number|undefined;
    Calibration_A4_r2:number|undefined;
    Calibration_B1_r2:number|undefined;
    Calibration_B2_r2:number|undefined;
    Calibration_B3_r2:number|undefined;
    Calibration_B4_r2:number|undefined;
  }