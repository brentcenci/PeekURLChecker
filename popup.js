
document.addEventListener('DOMContentLoaded', function() {
    restoreOptions();
    document.getElementById('toggle').addEventListener('click', saveOptions);
    document.getElementById('urlSearchButton').addEventListener('click', function() {
        var url = document.getElementById('urlSearchBar').value;
        checkURL(url);
    });
});

function restoreOptions() {
    chrome.storage.sync.get({
        toggled: false,
    }, function(options) {
        document.getElementById('toggle').checked = options.toggled;
    });
}


function saveOptions() {
    let isChecked = document.getElementById('toggle').checked;
    chrome.storage.sync.set({
        toggled: isChecked
    });
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'updateToggledState', newState: isChecked});
    });
}

function checkURL(url) {
    document.getElementById('destinationResult').style.display = "block";
    document.getElementById('destinationResult').innerHTML = "<div class='loader'></div>";
    fetch('https://api.redirect-checker.net/?timeout=5&maxhops=10&meta-refresh=1&format=json&more=1&url=' + encodeURIComponent(url))
        .then(response => response.json())
        .then(data => {
            if (data.result === 'success' && data.data && data.data.length > 0) {
                // Access the redirect_url from the first item in the data array
                var redirect_url = data.data[0].response.info.redirect_url;
                if (redirect_url) {
                    document.getElementById('destinationResult').innerHTML= "<h2>Destination</h2><p>" + redirect_url + "</p>";
                    document.getElementById('destinationResult').innerHTML += "<a href='" + redirect_url + "' target='_blank'>Open Site</a><br><br>";
                    getSnapshot(redirect_url);
                } else {
                    document.getElementById('destinationResult').textContent = "No redirect URL found.";
                }
            } else {
                document.getElementById('destinationResult').textContent = "Error occurred while checking the URL.";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('destinationResult').textContent = "Error occurred while checking the URL.";
        });
}

function getSnapshot(url) {
    let key = "REPLACE_WITH_YOUR_KEY_HERE"
    fetch("https://api.apiflash.com/v1/" +
        "urltoimage?access_key=" + key +
        "&format=jpeg&url=" + url)
        .then(response => {
            if(response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.startsWith('image/jpeg')) {
                    return response.blob();
                }
            }
            throw new Error('Error found, network connection failed or image not observed');
        })
        .then(data => {
            const imageUrl = URL.createObjectURL(data);
            //document.getElementById('imageContainer').textContent = imageUrl.toString();
            document.getElementById('destinationResult').innerHTML += `<img class="snapshot" src="${imageUrl}" alt="Redirect Image">`
            //document.getElementById('destinationResult').innerHTML += `<p>imageUrl</p>`
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

