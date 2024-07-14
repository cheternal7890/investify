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