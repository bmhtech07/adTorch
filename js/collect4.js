/*
* Set variables.
*/
let emailFields = {};
let outputData = {
  url: '',
  email_1: '',
  ip_address: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_term: '',
  utm_content: '',
};

/*
* This is the Proxy target for outputData. Allows a 'clone' of outputData, and then allows monitoring for changes before
* mutating outputData itself via the setter method.
 */
let outputDataWatch = { // T
  set: function (outputData, prop, value) { // Initiate a setter
    outputData[prop] = value; // Do the setting.
    if (prop.includes('email_')) { // Does the prop include email?
      if (validateEmail(value)) { // Check fo validity, to stop lots of requests. If true...
        postData('https://adtorch.co/api/collect', outputData)
          .then(response => {
            console.log(response); // JSON data parsed by `data.json()` call.
          });
      } else {
        console.log(outputData, "Don't post");
      }
    }
  }
};
let outputDataProxy = new Proxy(outputData, outputDataWatch); // Proxy creates a copy of outputData and accesses via outputDataWatch



/*
 * Check to ensure document is ready before trying findFields(). Otherwise, might be missed.
 */
if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
  setTimeout(() => {findFields()}, 3000); // If ready, go and find fields.
} else { // If not, set a listener on the document to wait until DOM content is loaded, then findFields
  document.addEventListener("DOMContentLoaded", findFields);
}



/*
 * This is for SPAs. It re-runs findFields every time a window.location href change is detected.
 */
let oldHref = document.location.href;

window.onload = () => {
  let bodyList = document.querySelector("body");
  let observer = new MutationObserver((mutations) => {
    mutations.forEach( () => {
      if (oldHref != document.location.href) {
        oldHref = document.location.href;
        findFields();
      }
    });
  });

  observer.observe(bodyList, {childList: true, subtree: true});

};

/*
* This function finds the fields by looking for any input field with 'email'. The first block adds a listener to disable
* the 'enter' functionality because (We don't want form submitting without validating it's an actual email address, or
* we'll receive too many requests.)
* The second block adds 'onblur' where we capture the email address.
* Finally, we store the data in sessionStorage to be submitted now or later in session (if required)
*/
function findFields(settings) {
  let reset = settings && settings.reset ? settings.reset : false;
  emailFields = document.querySelectorAll("input[id*='email'], input[type*='email'], input[name*='email']");
  emailFields.forEach((field, index) => {
    field.addEventListener('keypress', (event) => {
      if (event.keyCode === 13) { // keyCode 13 is 'enter
        event.preventDefault(); // Remove default behaviour
      }
    });
  });
  emailFields.forEach((field, index) => {
    field.addEventListener('blur', () => {
      outputDataProxy['email_' + parseInt(index + 1)] = field.value; // Pass to Proxy to do validation and spot change.
      sessionStorage.setItem(('email_' + parseInt(index + 1)), field.value); // Update sessionStorage with latest email
    })
  });
  console.log(emailFields);
  console.log(outputData);
  console.log(sessionStorage);
}

/*
* This function grabs the URL and params.
* It passes the params to outputData object ready for posting, and saves the data in sessionStorage to be posted
* later in session if required.
*/
findParams();

function findParams(settings) {
  let reset = settings && settings.reset ? settings.reset : false;
  let self = window.location.href.toString(); // Get the URL
  let querystring = self.split("?"); // Look for the '?' and splits the string above.
  outputData.url = querystring[0]; // Pass first part of string as landing URL
  sessionStorage.setItem('url', decodeURIComponent(querystring[0])); // Add url to session storage
  if (querystring.length > 1) {
    let pairs = querystring[1].split("&"); // Split at existing string at next param.
    for (let i in pairs) { // Repeat for the new truncated string, and loop
      let keyVal = pairs[i].split("="); // foreach, split the key from the value
      outputData[keyVal[0]] = keyVal[1]; // Pass key / value pairs to outputData
      if (reset || sessionStorage.getItem(keyVal[0]) === null) { // if storage settings reset OR we don't yet have a key value pair saved...
        sessionStorage.setItem(keyVal[0], decodeURIComponent(keyVal[1]));
      }
    }
  }
}

findIp();

function findIp(settings) {
  let reset = settings && settings.reset ? settings.reset : false;
  let ipAddress = '';
  fetch('https://api.ipify.org/?format=json')
    .then(results => results.json())
    .then(data => ipAddress = data.ip)
    .catch((error) => {
      ipAddress = null;
    });
  // console.log(ipAddress);
  outputData.ip_address = ipAddress;
  if (reset || sessionStorage.getItem('ip_address') === null) { // if storage settings reset OR we don't yet have a key with value 'ip_address'
    sessionStorage.setItem('ip_address', ipAddress);
  }
}


/*
* Validate the email address input
*/
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/*
* Standard FETCH setup
*/
async function postData(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {'Content-Type': 'application/json'},
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  });
  return response; // append with .json() if returning JSON object to parse JSON response into native JavaScript objects
}


