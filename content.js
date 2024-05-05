
function checkIfBlacklisted(url) {
  console.log("Checking url " + url);
  const listOfUrls = ["bit.ly", "tinyurl", "shorturl"];
  return listOfUrls.some(element => url.includes(element));
}


function checkURL(url) {
  fetch('https://api.redirect-checker.net/?timeout=5&maxhops=10&meta-refresh=1&format=json&more=1&url=' + encodeURIComponent(url))
      .then(response => response.json())
      .then(data => {
        if (data.result === 'success' && data.data && data.data.length > 0) {
          // Access the redirect_url from the first item in the data array
          var redirect_url = data.data[0].response.info.redirect_url;
          if (redirect_url) {
            console.log(redirect_url);
            return redirect_url;
          } else {
            console.log("No redirect URL found");
          }
        } else {
          console.log("Error while fetching URL");
        }
      })
      .catch(error => {
        console.log("Error caught");
      });
  return null;
}

function showModal(url) {
  const modal = document.createElement("dialog");
  modal.setAttribute("style", `
    font-family: sans-serif;
    border: none;
    top: 150px;
    border-radius: 20px;
    background-color: #121212;
    color: white;
    position: fixed;
    box-shadow: 0px 12px 48px rgba(29, 5, 64, 0.32);
  `);
  modal.innerHTML = `
<div id="popup-content" style="height:100%; margin:20px;">
    <style>
        /* Add your CSS styles here */
        h2 {
            font-size: xx-large;
            margin-bottom: 10px;
        }
        p {
            font-size: medium;
            color: #a0a0a0;
            margin-bottom: 20px;
        }
        button {
            padding: 8px 16px;
            border: none;
            border-radius: 2px;
            margin-right: 10px;
            cursor: pointer;
            background-color: #ff5a00;
            font-size: medium;
            color: white;
        }
        button:hover {
            background-color: #c94a04;
        }
        #destination {
            padding: 10px;
            background-color: #303030;
            border-radius: 2px;
            display: none;
            color: white;    
        }
        #credit {
            font-size: small;
            color: #a0a0a0;
        }
        .shadow {
            box-shadow: 0 2px 2px 0 rgba(255, 255, 255, 0.2), 0 2px 10px 0 rgba(255, 255, 255, 0.19);
        }
        
    </style>
    <h2>Peek URL Checker</h2>
    <p>You are trying to access: ${url}</p>
    <p>Are you sure you want to connect to this site?</p>
    <br>
    <div class="shadow" id="destination"></div>
    <br>
    <button id="confirmBtn">Connect</button> <button id="denyBtn">Block</button>
    <hr>
    <p id="credit">An extension by <span style="color:#ff5a00">Brent Cenci</span>. <br>Disable automatic blocking of shortened URLs in your extension pop-up.</p>
</div>
`;

  document.body.appendChild(modal);
  const dialog = document.querySelector("dialog");
  dialog.showModal();

  // Add event listeners after buttons are added to the DOM
  document.getElementById("confirmBtn").addEventListener("click", () => {
    document.getElementById('destination').style.display = "none";
    dialog.close();
    window.open(url, "_blank");
  });
  document.getElementById("denyBtn").addEventListener("click", () => {
    document.getElementById('destination').style.display = "none";
    dialog.close();
  });
  chrome.runtime.sendMessage({type: "doAPICall", data: url});
}

function updateDestination(destinationURL) {
  console.log(destinationURL);
  document.getElementById('destination').style.display = "block";
  document.getElementById('destination').innerHTML = `<p style="color: white"><span style="font-size: large">Destination:</span><br>` + destinationURL + `</p>`;
}

function checkToggledAutomaticBlocking() {
    chrome.storage.sync.get({
      toggled: false,
    }, function(options) {
      isToggled = (options.toggled);
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // Check if the message is about updating the toggled state
  if (message.type === 'updateToggledState') {
    // Update the toggled state
    isToggled = message.newState;
  } else if (message.type === 'apiResponse') {
    updateDestination(message.data);
  }
});

/*function checkToggledAutomaticBlocking() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({
      toggled: false,
    }, function(options) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(options.toggled);
      }
    });
  })
}
*/


document.addEventListener('click', function(event) {

  if (!isToggled) {
    console.log("Toggled off.");
    return;
  }

  const targetLinkElement = event.target.closest('a');
  if (!targetLinkElement) return;

  const url = targetLinkElement.href;

  if (checkIfBlacklisted(url)) {
    //HREF IS BLACKLISTED, PROCESS URL HERE
    console.log("Blocking nav to " + url);
    event.preventDefault();
    event.stopPropagation();

    showModal(url);
    //call function to display overlay here

  } else {
    //HREF NOT BLACKLISTED, ALLOW CONNECTION AS NORMAL
    console.log("Navigating to " + url);
  }
}, true);



console.log("Working");
var isToggled = false;
checkToggledAutomaticBlocking()
