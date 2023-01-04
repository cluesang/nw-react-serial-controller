import * as types from './controllers/IPOCReaderController';
import { iExponentialFits } from './Types';
import regression from "regression";

export const expoFitCalibrations = (calibrations:types.iCalibrationResults) =>
{
  let dataPoints:{ [site:string]:regression.DataPoint[] } = {};
    // let expCoefs:{}
    Object.entries(calibrations).map(([slide, results])=>{
      Object.entries(results).map(([site, result])=>{
        const {slope, intercept, r2, testDuration, pwm} = result;
        const stopIndex = slide.substring(slide.length-1);
        const stopLevel = parseInt(stopIndex,10);
        if(slope && testDuration)
        {
          const dataPoint:regression.DataPoint = [stopLevel, testDuration];
          if(!dataPoints[site]) dataPoints[site] = [];
          console.log(dataPoint);
          dataPoints[site].push(dataPoint);
        }
      });
    });
    console.log(dataPoints);
    const fits:iExponentialFits[] = Object.entries(dataPoints).map(([site, points])=>{
      const fit = regression.exponential(points);
      console.log(fit);
      return {
        site: site,
        coeff: {
          a: fit.equation[0],
          b: fit.equation[1]
        },
        r2: fit.r2
      }
    });
    return fits
}

export const flattenCalibrationObjectData = (calibrations:types.iCalibrationResults) =>
{    
  const flattenedResults = Object.entries(calibrations).map(([slide, results])=>{
    return Object.entries(results).map(([site, result])=>{
      const stopIndex = slide.substring(slide.length-1);
      const stopLevel = parseInt(stopIndex,10);
      return {
        slide_no: slide,
        stop_Level: stopLevel,
        site_id: site,
        ...result
      }
    });
  });
  return flattenedResults;
}