document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.switcher-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tabId + 'Tab').classList.add('active');
        });
    });
});