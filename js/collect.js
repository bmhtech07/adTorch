let emailFields = {};
let outputData = {
  email_1: '',
  ip_address: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_term: '',
  utm_content: '',
};

let outputDataWatch = {
  set: function (outputData, prop, value) { // Initiate a setter
    outputData[prop] = value; // This does the setting.
    if (prop.includes('email_')) { // Check to see if actually an email address
      if (validateEmail(value)) {
        postData('http://127.0.0.1:8000/api/collect', outputData)
          .then(data => {
            console.log(data); // JSON data parsed by `data.json()` call
          });
      } else {
        console.log("Don't post");
      }
    }
  }
};

let outputDataProxy = new Proxy(outputData, outputDataWatch); // Proxy creates a copy of outputData and accesses via outputDataWatch


// Check to ensure document is ready. This is equivalent to jQuery document.ready.
if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
  findFields(); // If ready, go and find fields.
} else { // If not, set a listener on the document to wait until DOM content is loaded, then findFields
  document.addEventListener("DOMContentLoaded", findFields);
}


function findFields(settings) {
  let reset = settings && settings.reset ? settings.reset : false;
  emailFields = document.querySelectorAll("input[id*='email'], input[type*='email'], input[name*='email']");
  emailFields.forEach((field, index) => {
    field.addEventListener('blur', () => {
      outputDataProxy['email_' + parseInt(index + 1)] = field.value;

      if (reset || sessionStorage.getItem(('email_' + parseInt(index + 1))) === null) { // if storage settings reset OR we don't yet have a key with value 'email_index'
        sessionStorage.setItem(('email_' + parseInt(index + 1)), field.value);
      }
    });
  })
  // Console log the key-value pairs saved in sessionStorage. NOT important and CAN be removed.
  // let archive = [],
  //     keys = Object.keys(sessionStorage),
  //     i = 0, key;
  //
  // for (; key = keys[i]; i++) {
  //     archive.push( key + '=' + sessionStorage.getItem(key));
  // }
  // console.log(archive);
}


findParams();

function findParams(settings) {
  let reset = settings && settings.reset ? settings.reset : false;
  let self = window.location.toString(); // Get the URL
  let querystring = self.split("?"); // Look for the '?' and splits the string above.
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
  console.log(outputData);
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
  console.log(ipAddress);
  outputData.ip_address = ipAddress;
  if (reset || sessionStorage.getItem('ip_address') === null) { // if storage settings reset OR we don't yet have a key with value 'ip_address'
    sessionStorage.setItem('ip_address', ipAddress);
  }
  // Console log the key-value pairs saved in sessionStorage. NOT important and CAN be removed.
  // let archive = [],
  //     keys = Object.keys(sessionStorage),
  //     i = 0, key;
  //
  // for (; key = keys[i]; i++) {
  //     archive.push( key + '=' + sessionStorage.getItem(key));
  // }
  // console.log(archive);
  // console.log(outputData);
}


function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


// Example POST method implementation:
async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
