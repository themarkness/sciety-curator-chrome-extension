chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchScietyData") {
    fetch(request.url)
      .then(response => response.text())
      .then(data => {
        sendResponse({data: data});
      })
      .catch(error => {
        console.error('Error:', error);
        sendResponse({error: error.toString()});
      });
    return true;  // Will respond asynchronously
  }
});

