let emailFields = {};
let firstNameFields = {};
let lastNameFields = {};
let fullNameFields = {};
let outputData = {
  url: '',
  email: '',
  first_name: '',
  last_name: '',
  full_name: '',
  ip_address: '',
  utm_source: '',
  utm_medium: '',
  utm_campaign: '',
  utm_term: '',
  utm_content: '',
};
let postCount = 0;
let childListenerCount = 0;
let parentListenerCount = 0;


let docBody = document.body || document.documentElement; // document.body might not be ready when on initial load
let timer;
const observer = new MutationObserver(() => {
  if (!docBody) {
    window.setTimeout(observer, 500);
    return;
  }
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    selfInquiry();
  }, 500);

});
// call `observe()` on that MutationObserver instance ,
// passing it the element to observe, and the options object
observer.observe(docBody, {subtree: true, childList: true});



let oldHref = document.location.href;
window.onload = () => {
  let bodyList = document.querySelector("body");
  let observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      if (oldHref != document.location.href) {
        oldHref = document.location.href;
        selfInquiry();
      }
    });
  });
  observer.observe(bodyList, {childList: true, subtree: true});
};





function selfInquiry() {
  if (window.self == window.top) { // This script is in the outer-most element (not an iFrame)...
    findParams();
    // if (document.body.querySelectorAll('script[data-adTorch="set"]').length === 0) { // ... and there are no other adTorch scripts in the DOM
    if (document.querySelectorAll('iframe[src*="clickfunnels"]').length === 0) { // ... and there are no other adTorch scripts in the DOM
      console.log('We are the outer - simple');
      findFields();
    } else { // ... and there IS another adTorch script in the DOM
      console.log('We are the outer WITH an inner');
      setParentListener(); // Set the parent listener, and in
    }
  } else { // Window != top and therefore this script is within an iFrame.
    console.log('We are the INNER');
    // signalPresence();
    setChildListener(); // Set listener to receive data parsed in findParams();
    findFields();
  }
}
selfInquiry();




let outputDataWatch = { // T
  set: function (outputData, prop, value) { // Initiate a setter
    outputData[prop] = value; // Do the setting.
    if (prop.includes('email')) { // Does the prop include email?
      if (validateEmail(value)) { // Check fo validity, to stop lots of requests. If true...
        postData('https://adtorch.co/api/collect', outputData)
          .then(response => {
            postCount++;
            console.log(postCount); // JSON data parsed by `data.json()` call.
          })
          .catch(err => {
            console.log(err);
          });
      }
    }
  }
};
let outputDataProxy = new Proxy(outputData, outputDataWatch); // Proxy creates a copy of outputData and accesses via outputDataWatch



function findFields(settings) {
  let reset = settings && settings.reset ? settings.reset : false;
  emailFields = document.querySelectorAll("input[id*='email'], input[type*='email'], input[name*='email']");
  firstNameFields = document.querySelectorAll("input[name*='first_name'], input[name*='firstName'], input[name*='firstname'], input[id*='first_name'], input[id*='firstName'], input[id*='firstname']");
  lastNameFields = document.querySelectorAll("input[name*='last_name'], input[name*='lastName'], input[name*='lastname'], input[id*='last_name'], input[id*='lastName'], input[id*='lastname']");
  fullNameFields = document.querySelectorAll("input[name*='full_name'], input[name*='fullName'], input[name*='fullname'], input[id*='full_name'], input[id*='fullName'], input[id*='fullname']");
  emailFields.forEach((field) => {
    localStorage.setItem('adTorch_email', field.value);
    var parentForm = field.form;
    if (parentForm) {
      if (parentForm.getAttribute('atSubmitAdded') !== 'true') {
        parentForm.setAttribute('atSubmitAdded', 'true');
        parentForm.addEventListener('submit', () => {
          console.log("We've got one with a parent listener");
          grabAndDispatch();
        });
      }
      parentForm.onsubmit = (e) => {
        console.log("We've got one with a parent onSubmit");
        grabAndDispatch();
      }
    }
  });
}



function grabAndDispatch() {
  if (postCount === 0) {
    postCount++; // This is to ensure that we don't post the data twice (ie., onsubmit and via 'submit' listener.
    firstNameFields.forEach((field) => {
      field.value != '' ? outputData.first_name = field.value : false;
    });
    lastNameFields.forEach((field) => {
      field.value != '' ? outputData.last_name = field.value : false;
    });
    fullNameFields.forEach((field) => {
      field.value != '' ? outputData.full_name = field.value : false;
    });
    emailFields.forEach((field) => {
      field.value != '' ? outputData.email = field.value : false;
    });
    postData('https://adtorch.co/api/collect', outputData)
      .then(response => {
        console.log(postCount);
      })
      .catch(err => {
        console.log(err);
      });
  }
}



findParams();

function findParams(settings) {
  let reset = settings && settings.reset ? settings.reset : false;
  let self = window.location.href.toString(); // Get the URL
  let querystring = self.split("?"); // Look for the '?' and splits the string above.
  outputData.url = querystring[0]; // Pass first part of string as landing URL
  sessionStorage.setItem('url', decodeURIComponent(querystring[0])); // Add url to session storage
  localStorage.setItem('url', decodeURIComponent(querystring[0])); // Add url to local storage
  if (querystring.length > 1) {
    let pairs = querystring[1].split("&"); // Split at existing string at next param.
    for (let i in pairs) { // Repeat for the new truncated string, and loop
      let keyVal = pairs[i].split("="); // foreach, split the key from the value
      outputData[keyVal[0]] = keyVal[1]; // Pass key / value pairs to outputData
      if (reset || sessionStorage.getItem(keyVal[0]) === null) { // if storage settings reset OR we don't yet have a key value pair saved...
        sessionStorage.setItem('adTorch_' + keyVal[0], decodeURIComponent(keyVal[1]));
      }
    }
  }
}


// function signalPresence() {
//   let scriptTag = document.getElementsByTagName('script');
//   scriptTag = scriptTag[scriptTag.length - 1];
//   let parentTag = window.parent.document.body;
//   let previouslyTagged = document.querySelectorAll('[atScriptEmbedded="true"]');
//   previouslyTagged.forEach((el) => {
//     el.removeAttribute('atScriptEmbedded');
//   })
//   parentTag.setAttribute('atScriptEmbedded', 'true');
// }


function setParentListener() {
  window.addEventListener('message', (event) => {
    if (event.data === 'adTorch listener Ready') {
      event.source.postMessage(outputData, '*');
    }
  },false);
}


function setChildListener() {
  if (childListenerCount === 0) { // Only set the listener once.
    window.addEventListener('message', (event) => {
      console.log(event.data);
      outputData = event.data;
    });
    childListenerCount ++;
    setTimeout(() => {
      window.parent.postMessage('adTorch listener Ready', '*');
    }, 2000);
    console.log('Reported as ready. Listener count: ', childListenerCount, );
  }
}



// function passData() {
//   let iframe = document.body.querySelectorAll('iframe[src*="clickfunnels"]')[0].contentWindow;
//   iframe.postMessage(outputData, '*');
//   console.log('outputData Sent');
// }



function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


async function postData(url, data) {
  return await fetch(url, {
    method: 'POST',
    keepalive: true, // Required for Safari
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {'Content-Type': 'application/json'},
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  }); // append with .json() if returning JSON object to parse JSON response into native JavaScript objects
}
