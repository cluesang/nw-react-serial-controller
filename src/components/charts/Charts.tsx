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
  siteData: iDiagnosticSiteData[]
}

interface iGraphData {
  labels: string[]
  datasets: {
    label: string,
    data: number[],
    borderColor: string,
    backgroundColor: string
  }[]
}

const LineChart = ({siteData}:iDiagnosticSiteData) =>
{
  const [graphData, setGraphData] = useState<iGraphData>();
  const [times, setTimes] = useState<string[]>([]);
  const [voltages, setVoltages] = useState<number[]>([]);

  useEffect(()=>{

    // let labels:string[] = [];
    // let data:number[] = [];
    // const datasets = siteData.map((site) => {
    //   const loc = Object.keys(site)[0];
    //   // console.log(site);
    //   labels = site[loc].times.map(time => time.toFixed(2));
    //   return {
    //     label: loc,
    //     data: site[loc].voltages,
    //     borderColor: 'rgb(255, 99, 132)',
    //     backgroundColor: 'rgba(255, 99, 132, 0.5)',
    //   }
    // });
    // setTimes(labels);
    // setVoltages()
    // // setGraphData({
    // //   labels,
    // //   datasets: datasets
    // // });
  },[siteData])

  // return <Line options={options} data={(graphData)?graphData:data} />;
  return <Line 
            options={options} 
            data={{
              labels,
              datasets: [
                {
                  label: 'Dataset 1',
                  data: labels.map(() => faker.datatype.number({ min: 0, max: 5 })),
                  borderColor: 'rgb(255, 99, 132)',
                  backgroundColor: 'rgba(255, 99, 132, 0.5)',
                }
              ],
            }} 
          />;
}
export { LineChart };