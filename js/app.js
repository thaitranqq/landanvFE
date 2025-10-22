document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar Navigation --- //
    const navItems = document.querySelectorAll('.sidebar-nav li');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Prevent default anchor behavior
            e.preventDefault();

            // Remove active class from all items
            navItems.forEach(i => i.classList.remove('active'));

            // Add active class to the clicked item
            item.classList.add('active');

            // --- Placeholder for future functionality ---
            const linkText = item.querySelector('a').textContent.trim();
            if (linkText === 'Quét mã sản phẩm') {
                alert('Chức năng quét mã vạch sẽ được triển khai!');
            }
        });
    });

    console.log('LADANV Dashboard Initialized!');

    // Future functionalities can be added here:
    // - Fetching data from API
    // - Handling search input
    // - Opening modals
    // - Updating charts and tables dynamically
});
