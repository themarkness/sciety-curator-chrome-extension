console.log("Checking URL for biorxiv or Google Scholar content...");

const currentUrl = window.location.href;
const bioRxivPattern = 'https://www.biorxiv.org/content/10.1101/';
const googleScholarPattern = 'https://scholar.google.com/scholar';

// Add this list of preprint server domains at the top of your file
const preprintDomains = [
  'arxiv.org',
  'biorxiv.org',
  'medrxiv.org',
  'chemrxiv.org',
  'psyarxiv.org',
  'osf.io/preprints',
  'preprints.org',
  'ssrn.com',
  'researchsquare.com',
  'zenodo.org'
  // Add more preprint server domains as needed
];

// Function to check if a URL is from a preprint server
function isPreprintUrl(url) {
  return preprintDomains.some(domain => url.includes(domain));
}

function createButton(isBioRxiv, evaluationCount) {
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

  const evaluationBadge = document.createElement('span');
  evaluationBadge.textContent = evaluationCount;
  evaluationBadge.style.backgroundColor = '#fff';
  evaluationBadge.style.color = '#ce471a';
  evaluationBadge.style.borderRadius = '50%';
  evaluationBadge.style.padding = '2px 6px';
  evaluationBadge.style.marginLeft = '10px';
  evaluationBadge.style.fontSize = '12px';

  button.appendChild(logo);
  button.appendChild(buttonText);
  button.appendChild(evaluationBadge);

  return button;
}

function addClickListener(button, doi) {
  button.addEventListener('click', () => {
    if (doi) {
      const scietyUrl = `https://sciety.org/articles/activity/${doi}`;
      chrome.storage.local.get("links", (result) => {
        let links = result.links || [];
        links.push({ title: document.title, url: scietyUrl, doi: doi });
        chrome.storage.local.set({ links }, () => {
          alert('Article saved to your list!');
        });
      });
    } else {
      alert('Unable to save this article. No DOI found.');
    }
  });
}

async function getEvaluationCount(doi) {
  try {
    const scietyUrl = `https://sciety.org/articles/activity/${doi}`;
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({action: "fetchScietyData", url: scietyUrl}, response => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(response.data, 'text/html');
    const activityItems = doc.querySelectorAll('.activity-feed__item');
    
    let evaluationCount = 0;
    let versionCount = 0;

    activityItems.forEach(item => {
      if (item.querySelector('.activity-feed__item__title a[href*="biorxiv.org"]')) {
        versionCount++;
      } else {
        evaluationCount++;
      }
    });

    console.log(`Evaluations: ${evaluationCount}, Versions: ${versionCount}`);
    return evaluationCount;
  } catch (error) {
    console.error('Error fetching evaluation count:', error);
    return 0;
  }
}

async function injectButton(isBioRxiv, doi) {
  if (!document.getElementById('overlayButton')) {
    const evaluationCount = await getEvaluationCount(doi);
    const button = createButton(isBioRxiv, evaluationCount);
    addClickListener(button, doi);

    if (isBioRxiv) {
      const widget = document.getElementById('cshl_widget');
      if (widget) {
        widget.parentElement.insertBefore(button, widget.nextSibling);
        console.log("Button injected successfully on BioRxiv.");
      } else {
        console.log("Widget with id 'cshl_widget' not found. Button injection failed on BioRxiv.");
      }
    }
  }
}

// Handle BioRxiv pages
if (currentUrl.startsWith(bioRxivPattern)) {
  console.log("BioRxiv URL matches, injecting button with Sciety logo...");
  const match = currentUrl.match(/10\.1101\/(.+)$/);
  if (match) {
    const doi = match[0];
    injectButton(true, doi);
  }
}

// Handle Google Scholar pages
if (currentUrl.startsWith(googleScholarPattern)) {
  console.log("Google Scholar URL matches, checking for preprint results...");
  const searchResults = document.querySelectorAll('.gs_r');
  console.log(`Number of search results found: ${searchResults.length}`);

  searchResults.forEach(async (result, index) => {
    console.log(`Processing result ${index + 1}`);
    if (!result.querySelector('#overlayButton')) {
      const titleElement = result.querySelector('.gs_rt');
      if (titleElement) {
        console.log(`Title element found for result ${index + 1}`);
        const link = titleElement.querySelector('a');
        if (link) {
          const href = link.getAttribute('href');
          console.log(`Link found for result ${index + 1}: ${href}`);
          
          if (isPreprintUrl(href)) {
            console.log(`Preprint detected for result ${index + 1}`);
            const doiMatch = href.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
            if (doiMatch) {
              const doi = doiMatch[0];
              console.log(`DOI found: ${doi}`);
              try {
                const evaluationCount = await getEvaluationCount(doi);
                console.log(`Evaluation count for ${doi}: ${evaluationCount}`);
                const button = createButton(false, evaluationCount);
                button.id = `overlayButton_${index}`;
                addClickListener(button, doi);
                titleElement.parentElement.insertBefore(button, titleElement.nextSibling);
                console.log(`Button injected for preprint result ${index + 1} on Google Scholar.`);
              } catch (error) {
                console.error(`Error processing result ${index + 1}:`, error);
              }
            } else {
              console.log(`No DOI found for preprint result ${index + 1}`);
            }
          } else {
            console.log(`Result ${index + 1} is not a preprint, skipping button injection.`);
          }
        } else {
          console.log(`No link found for result ${index + 1}`);
        }
      } else {
        console.log(`No title element found for result ${index + 1}`);
      }
    } else {
      console.log(`Button already exists for result ${index + 1}`);
    }
  });
}
