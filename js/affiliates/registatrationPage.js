/*
* Set variables.
*/
let emailFields = {};
let outputData = {
  url: '',
  email: '',
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
    if (prop.includes('email')) { // Does the prop include email?
      if (validateEmail(value)) { // Check fo validity, to stop lots of requests. If true...
        postData('https://adtorch.co/api/collect', outputData)
          .then(response => {
            console.log("Lol"); // JSON data parsed by `data.json()` call.
          });
      } /* else {
        console.log(outputData, "Don't post");
      } */
    }
  }
};
let outputDataProxy = new Proxy(outputData, outputDataWatch); // Proxy creates a copy of outputData and accesses via outputDataWatch


/*
* This checks to see if any new elements have been added to the DOM body. If so, it re-runs findFields.
*
 */
let docBody = document.body || document.documentElement; // document.body might not be ready when on initial load
const observer = new MutationObserver(() => {
  if(! docBody) {
    window.setTimeout(observer, 500);
    return;
  }
  findFields();
});
// call `observe()` on that MutationObserver instance ,
// passing it the element to observe, and the options object
observer.observe(docBody, {subtree: true, childList: true});




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
* In BOTH blocks we add a customer attribute to the field, in order to recognise if we've already added the respective
* listerner. This IS necessary - otherwise we add repeated listeners to the field each time we run findFieldsand end up
* with multiple events for the same field onBlur.
*/
function findFields(settings) {
  let reset = settings && settings.reset ? settings.reset : false;
  emailFields = document.querySelectorAll("input[id*='email'], input[type*='email'], input[name*='email']");
  emailFields.forEach((field, index) => {
    if(field.getAttribute('keydownAdded') !== 'true') { // Has this custom attribute already been set?
      field.setAttribute('keydownAdded', 'true'); // Set the custom attribute.
      field.addEventListener('keydown', (event) => {
        if (event.keyCode == 13 || event.keyCode == 'Enter') { // keyCode 13 is 'enter
          outputDataProxy.email = field.value; // Pass to Proxy to do validation and spot change.
          sessionStorage.setItem(('email'), field.value); // Update sessionStorage with latest email
          // event.preventDefault(); // Remove default behaviour if desired.
        }
      });
    }
  });
  emailFields.forEach((field, index) => {
    if(field.getAttribute('blurAdded') !== 'true') {
      field.setAttribute('blurAdded', 'true');
      field.addEventListener('blur', () => {
        outputDataProxy.email = field.value; // Pass to Proxy to do validation and spot change.
        sessionStorage.setItem(('email'), field.value); // Update sessionStorage with latest email
      })
    }
  });
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
