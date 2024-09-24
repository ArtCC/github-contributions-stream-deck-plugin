let websocket = null;
let pluginUUID = null;
let globalSettings = {};
let updateIntervals = {};
let debug = false;

const UPDATE_INTERVAL = 30 * 60 * 1000;

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    pluginUUID = inPluginUUID;

    websocket = new WebSocket("ws://127.0.0.1:" + inPort);

    websocket.onopen = function () {
        debugLog("WebSocket connected");
        websocket.send(JSON.stringify({
            event: inRegisterEvent,
            uuid: inPluginUUID
        }));
    };

    websocket.onmessage = function (evt) {
        const jsonObj = JSON.parse(evt.data);
        const { event, action, context, device, payload } = jsonObj;

        debugLog("Received event from Stream Deck", { event, context });

        switch (event) {
            case 'keyUp':
                onKeyUp(context, payload.settings, payload.coordinates, payload.userDesiredState);
                break;
            case 'willAppear':
                onWillAppear(context, payload.settings);
                break;
            case 'willDisappear':
                onWillDisappear(context);
                break;
            case 'didReceiveSettings':
                onDidReceiveSettings(context, payload.settings);
                break;
        }
    };

    websocket.onerror = function (error) {
        debugLog("WebSocket Error", error);
    };

    websocket.onclose = function (event) {
        debugLog("WebSocket Closed", { code: event.code, reason: event.reason });
    };
}

function onWillAppear(context, settings) {
    debugLog("Will Appear", { context });
    globalSettings[context] = settings;
    startUpdateInterval(context);
    getSettings(context);
}

function onWillDisappear(context) {
    debugLog("Will Disappear", { context });
    stopUpdateInterval(context);
    delete globalSettings[context];
}

function onDidReceiveSettings(context, settings) {
    debugLog("Did Receive Settings", { context, settings });
    globalSettings[context] = settings;
    fetchGitHubContributions(settings, context);
}

function startUpdateInterval(context) {
    if (updateIntervals[context]) {
        clearInterval(updateIntervals[context]);
    }
    updateIntervals[context] = setInterval(() => {
        debugLog("Automatic update triggered", { context });
        fetchGitHubContributions(globalSettings[context], context);
    }, UPDATE_INTERVAL);
}

function stopUpdateInterval(context) {
    if (updateIntervals[context]) {
        clearInterval(updateIntervals[context]);
        delete updateIntervals[context];
    }
}

function onKeyUp(context, settings, coordinates, userDesiredState) {
    debugLog("Key Up event", { context, coordinates });
    fetchGitHubContributions(settings, context);
}

function getSettings(context) {
    debugLog("Requesting settings", { context });
    if (websocket) {
        websocket.send(JSON.stringify({
            event: "getSettings",
            context: context
        }));
    }
}

function getFromDate(time) {
    const now = new Date();
    switch (time) {
        case 'year':
            return new Date(now.getFullYear(), 0, 1).toISOString();
        case 'month':
            return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        case 'week':
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return lastWeek.toISOString();
        case 'day':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        default:
            return new Date(now.getFullYear(), 0, 1).toISOString();
    }
}

function fetchGitHubContributions(settings, context) {
    debugLog("Fetching GitHub contributions", { context, username: settings.username, time: settings.time });
    const { username, token, time } = settings;
    if (!username || !token) {
        updateTitle("Config Error", context);
        return;
    }

    const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
    `;

    fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            query,
            variables: { username }
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(async data => {
            if (data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
            }
            if (!data.data || !data.data.user || !data.data.user.contributionsCollection) {
                throw new Error(`Unexpected response structure: ${JSON.stringify(data)}`);
            }
            const contributionCalendar = data.data.user.contributionsCollection.contributionCalendar;
            const totalContributions = contributionCalendar.totalContributions;

            let filteredContributions = filterContributionsByTime(contributionCalendar.weeks, time);

            debugLog("Contributions fetched successfully", { filteredContributions });

            if (time === 'year5' && Array.isArray(contributionCalendar.weeks)) {
                const buttonNumber = settings.buttonNumber ? parseInt(settings.buttonNumber) : 0;
                updateTitleForFiveButtons(contributionCalendar.weeks, buttonNumber, context);
            } else {
                updateTitle(filteredContributions.toString(), context);
            }

            const buttonNumber = settings.buttonNumber ? parseInt(settings.buttonNumber) : 0;
            const svg = generateContributionSVG(contributionCalendar.weeks, time, settings.theme, buttonNumber);
            const pngDataUrl = await svgToPng(svg);
            updateImage(pngDataUrl, context);
        })
        .catch(error => {
            debugLog("Error fetching contributions", { error: error.message });
            updateTitle("Error", context);
        });
}

function filterContributionsByTime(weeks, time) {
    if (!weeks || !Array.isArray(weeks)) {
        return 0;
    }

    const now = new Date();
    let startDate;

    switch (time) {
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'day':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'year':
        case 'year5':
        default:
            startDate = new Date(now.getFullYear(), 0, 1);
    }

    let totalFilteredContributions = 0;

    weeks.forEach(week => {
        if (!week.contributionDays || !Array.isArray(week.contributionDays)) {
            return;
        }
        week.contributionDays.forEach(day => {
            const contributionDate = new Date(day.date);
            if (contributionDate >= startDate && contributionDate <= now) {
                totalFilteredContributions += day.contributionCount;
            }
        });
    });

    return totalFilteredContributions;
}

function updateTitle(title, context) {
    debugLog("Updating title", { title, context });
    if (websocket) {
        const json = {
            "event": "setTitle",
            "context": context,
            "payload": {
                "title": title,
                "target": 0
            }
        };
        websocket.send(JSON.stringify(json));
    } else {
        debugLog("Error: WebSocket not connected");
    }
}

function updateTitleForFiveButtons(weeks, buttonNumber, context) {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const weeksPerButton = Math.ceil(52 / 5);
    const startWeek = buttonNumber * weeksPerButton;
    const endWeek = Math.min(startWeek + weeksPerButton, 52);

    let startMonth, endMonth;

    const getMonthSafely = (weekIndex) => {
        if (weeks[weekIndex] && weeks[weekIndex].contributionDays && weeks[weekIndex].contributionDays.length > 0) {
            return new Date(weeks[weekIndex].contributionDays[0].date).getMonth();
        }
        return null;
    };

    startMonth = getMonthSafely(startWeek);
    if (startMonth === null) {
        for (let i = startWeek; i < endWeek; i++) {
            startMonth = getMonthSafely(i);
            if (startMonth !== null) break;
        }
    }

    endMonth = getMonthSafely(endWeek - 1);
    if (endMonth === null) {
        for (let i = endWeek - 1; i >= startWeek; i--) {
            endMonth = getMonthSafely(i);
            if (endMonth !== null) break;
        }
    }

    if (startMonth === null) startMonth = Math.floor(startWeek / 4);
    if (endMonth === null) endMonth = Math.min(Math.floor((endWeek - 1) / 4), 11);

    let title;
    if (startMonth === endMonth) {
        title = monthNames[startMonth];
    } else {
        title = `${monthNames[startMonth]}-${monthNames[endMonth]}`;
    }

    updateTitle(title, context);
}

function updateImage(newImage, context) {
    if (websocket) {
        const json = {
            "event": "setImage",
            "context": context,
            "payload": {
                "image": newImage,
                "target": 0
            }
        };
        websocket.send(JSON.stringify(json));
    } else {
        debugLog("Error: WebSocket not connected");
    }
}

function generateContributionSVG(weeks, timeOption, theme, buttonNumber) {
    const svgWidth = 144;
    const svgHeight = 144;
    const backgroundColor = theme === 'dark' ? '#1e1e1e' : '#ffffff';
    const textColor = theme === 'dark' ? '#ffffff' : '#333333';
    const dividerColor = theme === 'dark' ? '#ffffff' : '#000000';

    let cellSize, cellSpacing, gridWidth, gridHeight, startX, startY;
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;

    const now = new Date();

    if (timeOption === 'year') {
        const halfYear = 26;

        cellSize = 4;
        cellSpacing = 1;
        gridWidth = 26;
        gridHeight = 7;

        startX = (svgWidth - (gridWidth * (cellSize + cellSpacing))) / 2;
        startY = (svgHeight / 2 - (gridHeight * (cellSize + cellSpacing))) / 2;

        for (let w = 0; w < halfYear; w++) {
            const week = weeks[w];
            if (week) {
                week.contributionDays.forEach((day, d) => {
                    const x = startX + w * (cellSize + cellSpacing);
                    const y = startY + d * (cellSize + cellSpacing);
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${day.color}" rx="1" ry="1"/>`;
                });
            }
        }

        svg += `<line x1="0" y1="${svgHeight / 2}" x2="${svgWidth}" y2="${svgHeight / 2}" stroke="${dividerColor}" stroke-width="1"/>`;

        startY = svgHeight / 2 + (svgHeight / 2 - (gridHeight * (cellSize + cellSpacing))) / 2;

        for (let w = halfYear; w < weeks.length; w++) {
            const week = weeks[w];
            if (week) {
                week.contributionDays.forEach((day, d) => {
                    const x = startX + (w - halfYear) * (cellSize + cellSpacing);
                    const y = startY + d * (cellSize + cellSpacing);
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${day.color}" rx="1" ry="1"/>`;
                });
            }
        }
    } else if (timeOption === 'year5') {
        const totalWeeks = 52;
        const weeksPerButton = Math.ceil(totalWeeks / 5);
        const startWeek = buttonNumber * weeksPerButton;
        const endWeek = Math.min(startWeek + weeksPerButton, totalWeeks);

        gridWidth = weeksPerButton;
        gridHeight = 7;
        cellSize = Math.floor(Math.min(svgWidth / gridWidth, svgHeight / gridHeight)) - 1;
        cellSpacing = 1;

        startX = (svgWidth - (gridWidth * (cellSize + cellSpacing) - cellSpacing)) / 2;
        startY = (svgHeight - (gridHeight * (cellSize + cellSpacing) - cellSpacing)) / 2;

        for (let w = startWeek; w < endWeek; w++) {
            const week = weeks[w];
            if (week) {
                week.contributionDays.forEach((day, d) => {
                    const x = startX + (w - startWeek) * (cellSize + cellSpacing);
                    const y = startY + d * (cellSize + cellSpacing);
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${day.color}" rx="2" ry="2"/>`;
                });
            }
        }
    } else {
        switch (timeOption) {
            case 'month':
                cellSize = 16;
                cellSpacing = 2;
                gridWidth = 7;
                gridHeight = 6;
                break;
            case 'week':
                cellSize = 16;
                cellSpacing = 4;
                gridWidth = 7;
                gridHeight = 1;
                break;
            case 'day':
                cellSize = 144;
                cellSpacing = 0;
                gridWidth = 1;
                gridHeight = 1;
                break;
            default:
                return svg + '</svg>';
        }

        startX = (svgWidth - (gridWidth * (cellSize + cellSpacing) - cellSpacing)) / 2;
        startY = (svgHeight - (gridHeight * (cellSize + cellSpacing) - cellSpacing)) / 2;

        let relevantDays;
        if (timeOption === 'month') {
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            relevantDays = weeks.flatMap(week => week.contributionDays)
                .filter(day => {
                    const date = new Date(day.date);
                    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
                });
        } else if (timeOption === 'week') {
            relevantDays = weeks[weeks.length - 1].contributionDays;
        } else {
            relevantDays = [weeks[weeks.length - 1].contributionDays[weeks[weeks.length - 1].contributionDays.length - 1]];
        }

        relevantDays.forEach((day, index) => {
            const date = new Date(day.date);
            let x, y;

            if (timeOption === 'month') {
                const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                const startDayOfWeek = firstDayOfMonth.getDay();
                const dayOfMonth = date.getDate() - 1;
                x = startX + ((startDayOfWeek + dayOfMonth) % 7) * (cellSize + cellSpacing);
                y = startY + Math.floor((startDayOfWeek + dayOfMonth) / 7) * (cellSize + cellSpacing);
            } else {
                x = startX + index * (cellSize + cellSpacing);
                y = startY;
            }

            svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${day.color}" rx="2" ry="2"/>`;

            if (timeOption === 'week') {
                const dayLabel = ['D', 'L', 'M', 'X', 'J', 'V', 'S'][date.getDay()];
                svg += `<text x="${x + cellSize / 2}" y="${y - 6}" font-family="Arial" font-size="10" fill="${textColor}" text-anchor="middle">${dayLabel}</text>`;
                svg += `<text x="${x + cellSize / 2}" y="${y + cellSize + 14}" font-family="Arial" font-size="10" fill="${textColor}" text-anchor="middle">${day.contributionCount}</text>`;
            }
        });
    }

    svg += '</svg>';
    return svg;
}

function svgToPng(svgString) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
    });
}

function debugLog(message, data = null) {
    if (debug) {
        const logMessage = data ? `${message}: ${JSON.stringify(data)}` : message;
        console.log(`[DEBUG] ${new Date().toISOString()} - ${logMessage}`);

        if (websocket) {
            websocket.send(JSON.stringify({
                event: "logMessage",
                payload: {
                    message: logMessage
                }
            }));
        }
    }
}