const ctx = document.getElementById('lineGraph');

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Earnings in $',
      data: [2050, 900, 300, 500, 600, 400, 700, 1200, 1450, 2450, 1950, 2300],
      borderWidth: 1
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