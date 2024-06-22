const username = document.querySelector("#username");

const settledCash = document.getElementById("settledCash");
const buyingPower = document.getElementById("buyingPower");
const dividends = document.getElementById("dividends");
const totalBalance = document.getElementById("balance");

 // Retrieves balance information
 const getBalance = async function () {
    const response = await fetch("/api/data", {
      method: "GET",
    });
    const data = await response.json();

    //Render response data
    const pre = document.getElementById("response");
    pre.textContent = JSON.stringify(data, null, 2);
    pre.style.background = "#F6F6F6";

    console.log(data);
  };

  // Check whether account is connected
  const getStatus = async function () {
    const account = await fetch("/api/is_account_connected");
    const connected = await account.json();
    if (connected.status == true) {
      getBalance();
    }
  };

  getStatus();

