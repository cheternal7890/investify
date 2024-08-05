// Line Chart Options
var lineChartOptions = {
  stroke: {
    width: 1
  },
  series: [{
    name: 'Average Per Month in USD',
    data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 70, 90, 110]
  }],
  chart: {
    type: 'area',
    fontFamily: "'Inter', sans-serif",
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  yaxis: {
    opposite: true
  },
  zoom: {
    enabled: true,
    autoScaleYaxis: true
  },
};

// Donut Chart Options
var donutChartOptions = {
  series: [44, 55, 13, 43],
  chart: {
    type: 'donut',
    height: 350,
    fontFamily: "'Inter', sans-serif"
  },
  legend: {
    position: 'top',
    horizontalAlign: 'center'
  },
  labels: ['Stocks', 'Holdings', 'Securities', 'Exchange Traded Funds'],
  colors: ['#8ecae6', '#023047', '#ffb703', '#fb8500'],
};

// Render Line Chart
var lineChart = new ApexCharts(document.querySelector("#lineChart"), lineChartOptions);
lineChart.render();

// Render Donut Chart
var donutChart = new ApexCharts(document.querySelector("#donutChart"), donutChartOptions);
donutChart.render();
