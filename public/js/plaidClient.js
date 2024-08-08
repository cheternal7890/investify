// Event listener for the "plaidButton" button click
document.getElementById('linkPlaidButton').addEventListener('click', async () => {
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