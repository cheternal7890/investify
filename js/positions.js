const userPositions = document.getElementById("userPositions");

const positionsData = [
  {
    name: "Buzzfeed",
    price: "2.00",
    unrealizedGains: "+0.57",
    realizedGains: "-10.23",
  },

  {
    name: "NVIDIA Corporation",
    price: "1,134.63",
    unrealizedGains: "153.23",
    realizedGains: "-24.3",
  },

  {
    name: "AMD Advanced Micro Devices",
    price: "test",
    unrealizedGains: "test",
    realizedGains: "test",
  },

  {
    name: "AST Space Mobile",
    price: "test",
    unrealizedGains: "test",
    realizedGains: "test",
  },
];

const renderPositions = (array) => {
  const positionsHTML = array
    .map((position) => {
      return `
    <tr>
        <td data-cell="Name" id="name">${position.name}</td>
        <td data-cell="Price" id="price">${position.price}</td>
        <td data-cell="unrealized" id="unrealized">${position.unrealizedGains}</td>
        <td data-cell="realized" id="realized">${position.realizedGains}</td>
    </tr>
        `;
    })
    .join("");
  userPositions.innerHTML =
    document.querySelector("#userPositions tr").outerHTML + positionsHTML;
};

renderPositions(positionsData);
