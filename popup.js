document.addEventListener('DOMContentLoaded', function() {
  const linksList = document.getElementById('linksList');
  const clearButton = document.getElementById('clearButton');

  function updateList() {
    chrome.storage.local.get("links", function(result) {
      linksList.innerHTML = '';
      if (result.links && result.links.length > 0) {
        result.links.forEach(function(link) {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = link.url;
          a.textContent = link.title;
          a.target = '_blank';
          li.appendChild(a);
          linksList.appendChild(li);
        });
      } else {
        linksList.innerHTML = '<li>No saved links yet.</li>';
      }
    });
  }

  clearButton.addEventListener('click', function() {
    chrome.storage.local.set({links: []}, function() {
      updateList();
    });
  });

  updateList();
});
