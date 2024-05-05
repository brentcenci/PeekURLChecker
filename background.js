chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if (request.type === "doAPICall") {
        console.log("Getting destination for " + request.data);
        getDestination(request.data);
    }
});

function sendAPIResponse(data) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'apiResponse', data: data });
    });
}

function getDestination(url) {
    fetch('https://api.redirect-checker.net/?timeout=5&maxhops=10&meta-refresh=1&format=json&more=1&url=' + encodeURIComponent(url))
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success' && data.data && data.data.length > 0) {
                // Access the redirect_url from the first item in the data array
                var redirect_url = data.data[0].response.info.redirect_url;
                if (redirect_url) {
                    sendAPIResponse(redirect_url)
                } else {
                    console.log("No redirect url found for " + url);
                    sendAPIResponse("No redirect url found for " + url)
                }
            } else {
                console.log("Error occurred while checking URL");
                sendAPIResponse("Error occurred while checking URL");
            }
        })
        .catch(error => {
            console.log("Error occurred while checking URL");
            sendAPIResponse("Error caught while peeking " + error);
        });
}