import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { iCalibrationResults, iDiagnosticResults } from '../../controllers/IPOCReaderController';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Bar Chart',
    },
  },
};

const labels = [
    'Calibration Slide 0', 
    'Calibration Slide 0', 
    'Calibration Slide 0', 
    'April', 
    'May', 'June', 'July'];

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

interface iBarChart {
    calibrationData: iCalibrationResults|undefined
}

const CalibrationChart = ({calibrationData}:iBarChart) =>
{
    const [labels, setLabels] = useState<string[]>();
    const [slopes, setSlopes] = useState<{ [key:string]:(number|undefined)[] }>();

    useEffect(()=>{
        if(calibrationData)
        {
            const calibration_slide_labels = Object.keys(calibrationData);
            setLabels(calibration_slide_labels);
            const siteKeys = Object.keys(calibrationData[calibration_slide_labels[0]]);
            const tempKeyedSlopes:{ [key:string]:(number|undefined)[] } = {}
            siteKeys.map((site)=>{
                const slopes = calibration_slide_labels.map((label)=>{
                    return calibrationData[label][site].slope
                });
                return { [site]: slopes }
            }).map((entry)=>{
                const site = Object.keys(entry)[0];
                if(entry[site])
                {
                    tempKeyedSlopes[site] = entry[site];
                }
            });
            setSlopes(tempKeyedSlopes);
            console.log(tempKeyedSlopes);
        }
    },[calibrationData]);

    return <Bar 
                options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Calibration Results',
                      },
                    }
                  }} 
                data={{
                    labels,
                    datasets: [
                      {
                        label: 'A1',
                        data: (slopes)?slopes["A1"]:[],
                        backgroundColor: 'rgba(13, 110, 253, 0.5)',
                      },
                      {
                        label: 'A2',
                        data: (slopes)?slopes["A2"]:[],
                        backgroundColor: 'rgba(102, 16, 242, 0.5)',
                      },
                      {
                        label: 'A3',
                        data: (slopes)?slopes["A3"]:[],
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                      },
                      {
                        label: 'A4',
                        data: (slopes)?slopes["A4"]:[],
                        backgroundColor: 'rgba(214, 51, 132, 0.5)',
                      },
                      {
                        label: 'B1',
                        data: (slopes)?slopes["B1"]:[],
                        backgroundColor:  'rgba(220, 53, 69, 0.5)',
                      },
                      {
                        label: 'B2',
                        data: (slopes)?slopes["B2"]:[],
                        backgroundColor: 'rgba(253, 126, 20, 0.5)',
                      },
                      {
                        label: 'B3',
                        data: (slopes)?slopes["B3"]:[],
                        backgroundColor:  'rgba(255, 193, 7, 0.5)',
                      },
                      {
                        label: 'B4',
                        data: (slopes)?slopes["B4"]:[],
                        backgroundColor:  'rgba(25, 135, 84, 0.5)',
                      },
                    ],
                  }} 
            />;
}


interface iResultsChart {
    diagnosticResults: iDiagnosticResults|undefined
}

const DiagnosticResultsChart = ({diagnosticResults}:iResultsChart) =>
{
    const [labels, setLabels] = useState<string[]>();
    const [slopes, setSlopes] = useState<(number|undefined)[]>([]);

    useEffect(()=>{
        if(diagnosticResults)
        {
            const siteKeys = Object.keys(diagnosticResults);
            setLabels(siteKeys);
            // const siteKeys = Object.keys(calibrationData[calibration_slide_labels[0]]);
            const tempKeyedSlopes:{ [key:string]:(number|undefined)[] } = {}
            const slopes = siteKeys.map(site => diagnosticResults[site].slope);
            setSlopes(slopes);
        }
    },[diagnosticResults]);

    return <Bar 
                options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: 'Results',
                      },
                    },
                  }} 
                data={{
                    labels,
                    datasets: [
                      {
                        label: 'Results',
                        data: slopes,
                        backgroundColor: 'rgba(13, 110, 253, 0.5)',
                      }
                    ],
                  }} 
            />;
}

export { CalibrationChart, DiagnosticResultsChart };