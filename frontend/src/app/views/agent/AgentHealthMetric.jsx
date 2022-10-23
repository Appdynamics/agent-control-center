import { useTheme } from "@mui/system";
import ReactApexChart from "react-apexcharts";

const AgentHealthMetric = (props) => {
  const { palette } = useTheme();
  const { colors, chartData, height } = props;
  const series = chartData;

  const options = {
    chart: {
      type: "area",
      background: "transparent",
      zoom: { enabled: false },
      toolbar: { show: false },
    },

    colors: colors,

    dataLabels: { enabled: false },
    
    // legend: { show: true, position: "top", horizontalAlign: "left" },
    legend: { show: false },
    
    // stroke: { curve: "smooth", width: 2 },
    stroke: { curve: "smooth", width: 3 },

    tooltip: { 
      x: { format: "dd/MM/yy HH:mm" },
      enabled: true,
      followCursor: true,
      marker: { show: true },
    },
    // tooltip: {
    //   enabled: true,
    //   followCursor: true,
    //   marker: { show: true },
    // },
    
    markers: {
      size: 4,
      colors: "rgba(102, 51, 153)",
      strokeColors: "white",
      hover: { size: 6 },
    },
        
    theme: { mode: palette.type },

    grid: {
      show: true,
      borderColor: palette.grey[300],
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },

    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        offsetY: 0,
      },
      tickAmount: 20,
      tooltip: {
        enabled: false,
      },
      type: "datetime",
    },    
    // xaxis: { categories: ["00.00", "01.00", "02.00", "03.00", "04.00", "05.00", "06.00"] },
    // xaxis: {
    //   show: true,
    //   categories: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ],
    // },    

    yaxis: {
      // axisTicks: {
      //   show: false,
      // },
      // axisBorder: {
      //   show: false,
      // },
      min: (min) => 0,
      max: (max) => 100,
      // tickAmount: 1,
      // show: true,
    },

  };

  return (
    <ReactApexChart options={options} series={series} height={height} width={"100%"} type={options.chart.type} />
  );
};

export default AgentHealthMetric;
