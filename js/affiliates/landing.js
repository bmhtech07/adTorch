findParams();

function findParams(settings) {
    let reset = settings && settings.reset ? settings.reset : false;
    let self = window.location.href.toString(); // Get the URL
    let querystring = self.split("?"); // Look for the '?' and splits the string above.
    sessionStorage.setItem('url', decodeURIComponent(querystring[0])); // Add url to session storage
    if (querystring.length > 1) {
        let pairs = querystring[1].split("&"); // Split at existing string at next param.
        for (let i in pairs) { // Repeat for the new truncated string, and loop
            let keyVal = pairs[i].split("="); // foreach, split the key from the value
            if (reset || sessionStorage.getItem(keyVal[0]) === null) { // if storage settings reset OR we don't yet have a key value pair saved...
              sessionStorage.setItem(keyVal[0], decodeURIComponent(keyVal[1]));
            }
        }
    }
}


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
  passData();
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
        passData();
      }
    });
  });
  observer.observe(bodyList, {childList: true, subtree: true});
};



function passData() {
    let iframe = document.querySelectorAll("iframe")[0].contentWindow;
    let getIFrame = document.querySelectorAll("iframe")[0];
    let messageData = document.location.href.toString();
    iframe.postMessage(messageData, 'https://event.webinarjam.com');
    console.log('Sent', getIFrame);
}
