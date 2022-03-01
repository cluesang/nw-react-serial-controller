import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  scales: {},
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Diagnostic Data',
    },
  },
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

let data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 5 })),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    }
  ],
};

interface iDiagnosticSiteData {
  [key: string]: {
      times:number[];
      voltages:number[];
  }
}

interface iLineChart {
  siteData: iDiagnosticSiteData
, activeSite: string
}

interface iGraphData {
  label: string,
  data: number[],
  borderColor: string,
  backgroundColor: string
}

const timeSequence30s = Array.from({length: (30/0.085)}, (_, i) => i*0.085)

const LineChart = ({siteData,activeSite="A1"}:iLineChart) =>
{
  // const [graphData, setGraphData] = useState<iGraphData>();
  const [datasets, setDatasets] = useState<iGraphData[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [voltages, setVoltages] = useState<number[]>([]);
  const [dim, setDim] = useState<string>("0.1");

  useEffect(()=>{

    const times:number[][] = [];
    for (const site in siteData)
    {
      times.push(siteData[site].times);
    }
    
    let longestTime:number[] = timeSequence30s;
    times.map((time:number[])=>{
      longestTime = (time.length > longestTime.length)? time : longestTime;
    });

    const time_lables = longestTime.map(time => time.toFixed(2));
    if(siteData["A1"]) setTimes(time_lables);
  },[siteData]);

  useEffect(()=>{
    setDim((activeSite==="")?"0.85":"0.1");
  },[activeSite]);

  return <Line 
            options={{ 
              maintainAspectRatio: false, 
              animation: false,
              onResize: (ref)=>{ref.render()},
              scales: {
                  yAxis: {
                      min: 0,
                      max: 5
                  }
              }
            }} 
            width={"100%"}
            height={"100%"}
            data={{
              labels:times,
              datasets: [
                {
                  label: 'A1',
                  data: siteData["A1"].voltages,
                  borderColor: 'rgba(13, 110, 253, '+((activeSite==="A1")?"1.0":dim)+')',
                  backgroundColor: 'rgba(13, 110, 253, 0.1)',
                }
              ,{
                  label: 'A2',
                  data: siteData["A2"].voltages,
                  borderColor: 'rgba(102, 16, 242, '+((activeSite==="A2")?"1.0":dim)+')',
                  backgroundColor: 'rgba(102, 16, 242, 0.1)',
                }
              ,{
                  label: 'A3',
                  data: siteData["A3"].voltages,
                  borderColor: 'rgba(255, 99, 132, '+((activeSite==="A3")?"1.0":dim)+')',
                  backgroundColor: 'rgba(255, 99, 132, 0.1)',
                }
              ,{
                  label: 'A4',
                  data: siteData["A4"].voltages,
                  borderColor: 'rgba(214, 51, 132, '+((activeSite==="A4")?"1.0":dim)+')',
                  backgroundColor: 'rgba(214, 51, 132, 0.1)',
                }
              , {
                  label: 'B1',
                  data: siteData["B1"].voltages,
                  borderColor: 'rgba(220, 53, 69, '+((activeSite==="B1")?"1.0":dim)+')',
                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                }
              ,{
                  label: 'B2',
                  data: siteData["B2"].voltages,
                  borderColor: 'rgba(253, 126, 20, '+((activeSite==="B2")?"1.0":dim)+')',
                  backgroundColor: 'rgba(253, 126, 20, 0.1)',
                }
              ,{
                  label: 'B3',
                  data: siteData["B3"].voltages,
                  borderColor: 'rgba(255, 193, 7, '+((activeSite==="B3")?"1.0":dim)+')',
                  backgroundColor: 'rgba(255, 193, 7, 0.1)',
                }
              ,{
                  label: 'B4',
                  data: siteData["B4"].voltages,
                  borderColor: 'rgba(25, 135, 84, '+((activeSite==="B4")?"1.0":dim)+')',
                  backgroundColor: 'rgba(25, 135, 84, 0.1)',
                }
              ],
            }} 
          />;
}

export { LineChart };