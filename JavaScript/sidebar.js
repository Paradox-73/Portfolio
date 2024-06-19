document.getElementById('hover-area').addEventListener('mouseover', expandSidebar);
        document.getElementById('sidebar').addEventListener('mouseleave', collapseSidebar);

        function expandSidebar() {
            document.body.classList.add('expanded');
        }

        function collapseSidebar() {
            document.body.classList.remove('expanded');
        }

        function keepSidebarOpen() {
            document.body.classList.add('expanded');
        }