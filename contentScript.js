console.log("Checking URL for biorxiv content...");

const currentUrl = window.location.href;
const urlPattern = 'https://www.biorxiv.org/content/10.1101/';

// Only inject the button if the URL matches the specified pattern
if (currentUrl.startsWith(urlPattern)) {
  console.log("URL matches, injecting button with Sciety logo...");

  if (!document.getElementById('overlayButton')) {
    // Create the button
    const button = document.createElement('button');
    button.id = 'overlayButton';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#ce471a';
    button.style.fontWeight = 'bold';
    button.style.border = 'none';
    button.style.borderRadius = '50px';
    button.style.cursor = 'pointer';
    button.style.position = 'relative'; // Use relative positioning
    button.style.zIndex = '1000';
    button.style.marginTop = '45px'; // Add space above the button
    button.style.marginLeft = '20px'; // Add space to the left  the button

    // Add the Sciety logo image
    const logo = document.createElement('img');
    logo.src = 'https://github.com/sciety/sciety/blob/main/static/images/sciety-logo.jpg?raw=true'; // Ensure URL points to raw image
    logo.alt = 'Sciety Logo';
    logo.style.width = '30px';  // Adjust the size as needed
    logo.style.marginRight = '10px';  // Add spacing between the logo and text

    // Add text to the button
    const buttonText = document.createElement('span');
    buttonText.textContent = 'Add to Sciety';
    buttonText.style.color = '#fff';

    // Append the logo and text to the button
    button.appendChild(logo);
    button.appendChild(buttonText);

    // Find the widget and insert the button directly beneath it
    const widget = document.getElementById('cshl_widget');
    if (widget) {
      widget.parentElement.insertBefore(button, widget.nextSibling); // Insert button after the widget
      console.log("Button injected successfully.");
    } else {
      console.log("Widget with id 'cshl_widget' not found. Button injection failed.");
    }

    // Add click event listener
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
} else {
  console.log("Current URL does not match the specified pattern.");
}
