const themeSwitcher = document.getElementById('themeSwitcher');
themeSwitcher.addEventListener('click', function(event) {
    event.preventDefault();
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// On page load, check local storage for theme preference
window.addEventListener('load', function() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
});
