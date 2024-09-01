document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
  
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchTerm = searchInput.value.trim();
      if (searchTerm) {
        console.log('Searching for:', searchTerm);
        window.location.href = `/search?search=${encodeURIComponent(searchTerm)}`;
      } else {
        console.log('Search term is empty');
      }
    });
  });