const toolbar = document.getElementById("positionEntries")

new DataTable('#userPositionTable', {
    layout: {
        topStart: toolbar,
        topEnd: {
            search: {
                placeholder: "Search for position",
            }
        },
        bottom: 'paging',
        bottomStart: null,
        bottomEnd: null
    }
});