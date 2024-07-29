// Variable to store the access token
let token;

document.getElementById('transactions').addEventListener('click', function() {
    // Fetch transactions from the server using the stored token
    fetch('/get_investments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json()) // Parse the response to JSON
    .then(data => {
        // Display the transactions in a readable format in the 'transactionsList' element
        document.getElementById('transactionsList').textContent = JSON.stringify(data, null, 2);
    });
});

// Event listener for the "plaidButton" button click
document.getElementById('plaidButton').addEventListener('click', async () => {
    // Fetch a link token from the server
    const linkHandler = Plaid.create({
        token: (await $.post('/create_link_token')).link_token,
        onSuccess: (public_token, metadata) => {
            // Send the public_token to your app server.
            $.post('/exchange_public_token', {
                public_token: public_token,
            });
            console.log(public_token)
        },
        onExit: (err, metadata) => {
            // Optionally capture when your user exited the Link flow.
            // Storing this information can be helpful for support.
        },
        onEvent: (eventName, metadata) => {
            // Optionally capture Link flow events, streamed through
            // this callback as your users connect an Item to Plaid.
        },
    });


    // Open the Plaid authentication flow
    linkHandler.open();
});