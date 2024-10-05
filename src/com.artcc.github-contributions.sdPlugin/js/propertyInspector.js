var websocket = null;
var pluginUUID = null;

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    pluginUUID = inPluginUUID;

    websocket = new WebSocket("ws://127.0.0.1:" + inPort);

    websocket.onopen = function () {
        var json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };
        websocket.send(JSON.stringify(json));

        requestSettings();
    };

    websocket.onmessage = function (evt) {
        var jsonObj = JSON.parse(evt.data);
        var event = jsonObj['event'];
        var payload = jsonObj['payload'];

        if (event === "didReceiveSettings") {
            var settings = payload['settings'];

            document.getElementById('username').value = settings['username'] || "";
            document.getElementById('token').value = settings['token'] || "";
            document.getElementById('time').value = settings['time'] || "year";
            document.getElementById('buttonNumber').value = settings['buttonNumber'] || "0";
            document.getElementById('theme').value = settings['theme'] || "light";

            toggleButtonNumberVisibility();
        } else if (event === "didReceiveGlobalSettings") {
            showMessage("Settings saved successfully!", "success");
        }
    };

    websocket.onerror = function (evt) {
        showMessage("Error connecting to Stream Deck", "error");
    };
}

function requestSettings() {
    if (websocket) {
        var json = {
            "event": "getSettings",
            "context": pluginUUID
        };
        websocket.send(JSON.stringify(json));
    }
}

function saveSettings() {
    var saveButton = document.getElementById('save');
    saveButton.disabled = true;

    if (websocket) {
        var username = document.getElementById('username').value;
        var token = document.getElementById('token').value;
        var time = document.getElementById('time').value;
        var buttonNumber = document.getElementById('buttonNumber').value;
        var theme = document.getElementById('theme').value;

        if (!username || !token) {
            showMessage("Please fill in all required fields", "error");
            saveButton.disabled = false;
            return;
        }

        var json = {
            "event": "setSettings",
            "context": pluginUUID,
            "payload": {
                "username": username,
                "token": token,
                "time": time,
                "buttonNumber": buttonNumber,
                "theme": theme
            }
        };
        websocket.send(JSON.stringify(json));

        showMessage("Saving settings...", "information");

        setTimeout(function () {
            saveButton.disabled = false;
    
            showMessage("Settings saved successfully!", "success");
        }, 1500);
    }
}

function showMessage(message, type) {
    var messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = "sdpi-item-value " + type;

    setTimeout(function () {
        messageElement.textContent = "";
        messageElement.className = "sdpi-item-value";
    }, 1500);
}

function toggleButtonNumberVisibility() {
    var timeSelect = document.getElementById('time');
    var buttonNumberContainer = document.getElementById('buttonNumberContainer');
    
    if (timeSelect.value === 'year5') {
        buttonNumberContainer.style.display = 'flex';
    } else {
        buttonNumberContainer.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('save').addEventListener('click', saveSettings);
    document.getElementById('time').addEventListener('change', toggleButtonNumberVisibility);

    toggleButtonNumberVisibility();
});