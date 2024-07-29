/* ================= Line Chart ================= */

const ctx = document.getElementById('lineGraph');

Chart.defaults.font.size = 13
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.weight = 400

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Earnings in $',
      data: [2050, 900, 300, 500, 600, 400, 700, 1200, 1450, 2450, 1950, 2300],
      borderWidth: 1,
      borderColor: '#0066FF'
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        position: 'right'
      }
    },
    responsive: true
  }
});

/* ================= Doughnut Chart ================= */

var chrt = document.getElementById("doughnutChart").getContext("2d");
var chartId = new Chart(chrt, {
   type: 'doughnut',
   data: {
      labels: ["Stocks", "Securities", "Holdings", "Exchange Traded Funds"],
      datasets: [{
      label: "Percentage of Portfolio",
      data: [25, 25, 15, 35],
      backgroundColor: ['#8ecae6', '#023047', '#ffb703', '#fb8500'],
      hoverOffset: 5
      }],
   },
   options: {
      responsive: true
   },
});





