const userPositions = document.getElementById("userPositionsTable");

const positionsData = [
    {
        identifier: "NYSE:S",
        name: "SentinelOne Inc.",
        price: "17.50",
        type: "Equity",
        unrealizedGains: "+1.25",
        realizedGains: "+5.67",
    },
    {
        identifier: "NASDAQ:AAPL",
        name: "Apple Inc.",
        price: "150.25",
        type: "Equity",
        unrealizedGains: "+2.34",
        realizedGains: "+8.45",
    },
    {
        identifier: "NYSE:JNJ",
        name: "Johnson & Johnson",
        price: "165.30",
        type: "Equity",
        unrealizedGains: "+1.78",
        realizedGains: "+7.89",
    },
    {
        identifier: "NASDAQ:GOOGL",
        name: "Alphabet Inc.",
        price: "2750.00",
        type: "Equity",
        unrealizedGains: "+5.89",
        realizedGains: "+15.67",
    },
    {
        identifier: "NYSE:VFIAX",
        name: "Vanguard 500 Index Fund",
        price: "400.50",
        type: "Mutual Fund",
        unrealizedGains: "+3.22",
        realizedGains: "+9.34",
    },
    {
        identifier: "DAX:ADS",
        name: "Adidas AG",
        price: "295.00",
        type: "Equity",
        unrealizedGains: "+2.45",
        realizedGains: "+12.78",
    },
    {
        identifier: "USD:001",
        name: "Cash Holdings",
        price: "10000.00",
        type: "Cash",
        unrealizedGains: "0.00",
        realizedGains: "0.00",
    }
];

// const openModal = document.getElementById("modal")
// const closeModal = document.getElementById("closeModal")

// function actionModal() {
//     openModal.showModal();
// }

// closeModal.addEventListener("click", () => {
//     openModal.close();
// })


const renderPositions = (array) => {
    const positionsHTML = array.map((position) => {
        return `
<tr id="positionRow" onclick="actionModal()">
  <td data-cell="identifier" id="identifier"><a href="">${position.identifier}</a></td>
  <td data-cell="name" id="name">${position.name}</td>
  <td data-cell="price" id="price">${position.price}</td>
  <td data-cell="type" id="type">${position.type}</td>
  <td data-cell="unrealized" id="unrealized">${position.unrealizedGains}</td>
  <td data-cell="realized" id="realized">${position.realizedGains}</td>
  <td data-cell="actions" id="action">
      <button id="actionButton"><i class="fa-solid fa-square-caret-down"></i></button>
  </td>
</tr>
  `;
    }).join("");
    userPositions.innerHTML =
        document.querySelector("#userPositionsTable tr").outerHTML + positionsHTML;
};


renderPositions(positionsData);

