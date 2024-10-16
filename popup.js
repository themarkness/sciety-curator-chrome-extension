function displayLinks() {
    chrome.storage.local.get("links", (result) => {
      const linkList = document.getElementById("linkList");
      linkList.innerHTML = "";  // Clear previous content
  
      (result.links || []).forEach((link) => {
        const linkElement = document.createElement("div");
        linkElement.innerHTML = `<a href="${link.url}" target="_blank">${link.title}</a>`;
        linkList.appendChild(linkElement);
      });
    });
  }
  
  // Load links when the popup is opened
  displayLinks();
  