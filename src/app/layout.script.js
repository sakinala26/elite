document.getElementById('toggleSidebar').addEventListener('click', function () {

    document.body.classList.toggle('collapsed-sidebar');

    document.getElementById('sidebarIcon').style.display = document.body.classList.contains('collapsed-sidebar') ? 'block' : 'none';

});



document.getElementById('sidebarIcon').addEventListener('click', function () {

    document.body.classList.toggle('collapsed-sidebar');

    this.style.display = 'none';

});









document.querySelectorAll('#cardSection .card').forEach(card => {

    card.addEventListener('click', function () {

        document.querySelectorAll('#cardSection .card').forEach(c => c.classList.remove('highlight-card'));

        this.classList.add('highlight-card');



        const selectedCardSection = document.getElementById('selectedCardSection');

        selectedCardSection.innerHTML = this.outerHTML;



        // Show the right sidebar form section

        document.getElementById('rightSidebar').style.display = 'block';

    });

});





