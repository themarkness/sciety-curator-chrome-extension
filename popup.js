document.addEventListener('DOMContentLoaded', function() {
  const linksList = document.getElementById('linksList');
  const clearButton = document.getElementById('clearButton');

  function updateList() {
    chrome.storage.local.get("links", function(result) {
      linksList.innerHTML = '';
      if (result.links && result.links.length > 0) {
        result.links.forEach(function(link) {
          const li = document.createElement('li');
          li.className = 'link-item';
          
          // Link container
          const linkContainer = document.createElement('div');
          linkContainer.className = 'link-container';
          
          // Original link
          const a = document.createElement('a');
          a.href = link.url;
          a.textContent = link.title;
          a.target = '_blank';
          a.className = 'original-link';
          linkContainer.appendChild(a);
          
          // Sciety button
          if (link.url.includes('biorxiv.org/content/10.1101/')) {
            const scietyUrl = link.url.replace(
              'https://www.biorxiv.org/content/',
              'https://sciety.org/articles/activity/'
            ).replace(/v\d+$/, ''); // Remove version number
            
            const scietyButton = document.createElement('button');
            scietyButton.textContent = 'View on Sciety';
            scietyButton.className = 'sciety-button';
            scietyButton.onclick = function() {
              window.open(scietyUrl, '_blank');
            };
            linkContainer.appendChild(scietyButton);
          }
          
          li.appendChild(linkContainer);
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
