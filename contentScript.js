console.log("Checking URL for biorxiv or Google Scholar content...");

const currentUrl = window.location.href;
const bioRxivPattern = 'https://www.biorxiv.org/content/10.1101/';
const googleScholarPattern = 'https://scholar.google.com/scholar';

function createButton(isBioRxiv) {
  const button = document.createElement('button');
  button.id = 'overlayButton';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  button.style.padding = '5px 10px';
  button.style.backgroundColor = '#ce471a';
  button.style.fontWeight = 'bold';
  button.style.border = 'none';
  button.style.borderRadius = '50px';
  button.style.cursor = 'pointer';
  button.style.zIndex = '1000';

  if (isBioRxiv) {
    button.style.position = 'relative';
    button.style.marginTop = '45px';
    button.style.marginLeft = '20px';
  } else {
    button.style.marginTop = '5px';
    button.style.fontSize = '12px';
  }

  const logo = document.createElement('img');
  logo.src = 'https://github.com/sciety/sciety/blob/main/static/images/sciety-logo.jpg?raw=true';
  logo.alt = 'Sciety Logo';
  logo.style.width = isBioRxiv ? '30px' : '20px';
  logo.style.marginRight = '10px';

  const buttonText = document.createElement('span');
  buttonText.textContent = 'Add to Sciety';
  buttonText.style.color = '#fff';

  button.appendChild(logo);
  button.appendChild(buttonText);

  return button;
}

function addClickListener(button) {
  button.addEventListener('click', () => {
    const pageUrl = window.location.href;
    const pageTitle = document.title;

    chrome.storage.local.get("links", (result) => {
      let links = result.links || [];
      links.push({ title: pageTitle, url: pageUrl });
      chrome.storage.local.set({ links }, () => {
        alert('Page saved to your list!');
      });
    });
  });
}

// Handle BioRxiv pages
if (currentUrl.startsWith(bioRxivPattern)) {
  console.log("BioRxiv URL matches, injecting button with Sciety logo...");

  if (!document.getElementById('overlayButton')) {
    const button = createButton(true);
    addClickListener(button);

    const widget = document.getElementById('cshl_widget');
    if (widget) {
      widget.parentElement.insertBefore(button, widget.nextSibling);
      console.log("Button injected successfully on BioRxiv.");
    } else {
      console.log("Widget with id 'cshl_widget' not found. Button injection failed on BioRxiv.");
    }
  }
}

// Handle Google Scholar pages
if (currentUrl.startsWith(googleScholarPattern)) {
  console.log("Google Scholar URL matches, injecting buttons for each result...");

  const searchResults = document.querySelectorAll('.gs_r');
  searchResults.forEach((result, index) => {
    if (!result.querySelector('#overlayButton')) {
      const button = createButton(false);
      button.id = `overlayButton_${index}`;
      addClickListener(button);

      const titleElement = result.querySelector('.gs_rt');
      if (titleElement) {
        titleElement.parentElement.insertBefore(button, titleElement.nextSibling);
        console.log(`Button injected successfully for result ${index} on Google Scholar.`);
      } else {
        console.log(`Title element not found for result ${index}. Button injection failed.`);
      }
    }
  });
}
