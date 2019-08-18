"strict mode";

// Do a CORS request to get Davis weather hourly forecast

// Create the XHR object.
function createCORSRequest(method, url) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);  // call its open method
    return xhr;
}

function slides() {
    let body = document.getElementById("Body");
    if (slides.status == "search") {
    	slides.status = "weather";
        body.setAttribute("class", "Slide-Up-Animation");
    }
    else if (slides.status == "weather") {
    	slides.status = "search";
        body.setAttribute("class", "Slide-Down-Animation");
    }
}

slides.status = "search";

function animationEndEvent(event) {
    let body = document.getElementById("Body");
    body.setAttribute("class", "");
    if (slides.status == "search") {
        body.style.top = "0%";
    }
    else {
        body.style.top = "-100%";
    }
}

// Make the actual CORS request.
function makeCorsRequest() {
    let location = document.getElementById("SearchItem").value.replace("CA", "US");
    let url = "https://api.openweathermap.org/data/2.5/forecast?q=" + location + "&units=imperial&APPID=28bbca9f363f53f6b22844be1acb89ea";
    console.log(url);
    let xhr = createCORSRequest('GET', url);

    // checking if browser does CORS
    if (!xhr) {
        alert('CORS not supported');
        return;
    }

    // Load some functions into response handlers.
    xhr.onload = function () {
        let responseStr = xhr.responseText;  // get the JSON string
        let object = JSON.parse(responseStr);  // turn it into an object

        updatePage(object);
    };

    xhr.onerror = function () {
        alert('Woops, there was an error making the request.');
    };

    // Actually send request to server
    xhr.send();
}

function updatePage(data) {
    if (data.message == "city not found") {
        alert("Not Found");
        return;
    }
    //check distance
    let log1 = data.city.coord.lon;
    let lat1 = data.city.coord.lat;
    let dist = distance(lat1, log1, 38.5816, -121.4944, "M");
    console.log(dist);
    if (dist > 150) {
        alert("Not Found");
        return;
    }

    let weathers = document.getElementById("Main").children;
    let time = new Date();
    let currentHour = time.getHours();
    let AMPM;
    let wheatherIcon = data.list[0].weather[0].icon;

    if (currentHour >= 6 && currentHour < 18) {
        wheatherIcon = wheatherIcon.substr(0, 2) + "d" + wheatherIcon.substr(3);
    }
    else {
        wheatherIcon = wheatherIcon.substr(0, 2) + "n" + wheatherIcon.substr(3);
    }

    if (currentHour > 0 && currentHour < 12) AMPM = "AM";
    else {
        AMPM = "PM";
        currentHour -= 12;
    }
    let i;

    let iconPath = getIconPath(wheatherIcon);

    document.getElementById("Current-Time").innerHTML = currentHour.toString(10) + "" + AMPM;
    document.getElementById("Current-Temperature").innerHTML = Math.round(data.list[0].main.temp.toString(10)) + "&#176";
    document.getElementById("Current-Weather-Image").src = iconPath;
    currentHour = time.getHours();
    for (i = 2; i < weathers.length + 1; i++) {

        let weatherData = data.list[i-1];
        let hour = currentHour + i - 1;

        //icon
        wheatherIcon = weatherData.weather[0].icon;
        if (hour >= 6 && hour < 18) {
            wheatherIcon = wheatherIcon.substr(0, 2) + "d" + wheatherIcon.substr(3);
        }
        else {
            wheatherIcon = wheatherIcon.substr(0, 2) + "n" + wheatherIcon.substr(3);
        }

        //convert
        if (hour > 0 && hour < 12) AMPM = "AM";
        else {
            AMPM = "PM";
            hour -= 12;
        }

        let iconPath = getIconPath(wheatherIcon);

        weathers[i-1].children[0].children[0].innerHTML = hour.toString(10) + ":00" + AMPM;
        weathers[i-1].children[1].src = iconPath;
        weathers[i-1].children[2].children[0].innerHTML = Math.round(weatherData.main.temp).toString(10) + "&#176";
    }
}

function getIconPath(wheatherIcon) {
    let wheatherInconPath;
    if (wheatherIcon == "01d") wheatherInconPath = "./assets/clearsky.svg";
    else if (wheatherIcon == "01n") wheatherInconPath = "./assets/clear-night.svg";
    else if (wheatherIcon == "02d") wheatherInconPath = "./assets/fewclouds-day.svg";
    else if (wheatherIcon == "02n") wheatherInconPath = "./assets/fewclouds-night.svg";
    else if (wheatherIcon == "03d") wheatherInconPath = "./assets/scatteredclouds.svg";
    else if (wheatherIcon == "03n") wheatherInconPath = "./assets/scatteredclouds.svg";
    else if (wheatherIcon == "04d") wheatherInconPath = "./assets/brokencloud.svg";
    else if (wheatherIcon == "04n") wheatherInconPath = "./assets/brokencloud.svg";
    else if (wheatherIcon == "09d") wheatherInconPath = "./assets/showerrain.svg";
    else if (wheatherIcon == "09n") wheatherInconPath = "./assets/showerrain.svg";
    else if (wheatherIcon == "10d") wheatherInconPath = "./assets/rain-day.svg";
    else if (wheatherIcon == "10n") wheatherInconPath = "./assets/rain-night.svg";
    else if (wheatherIcon == "11d") wheatherInconPath = "./assets/thunderstorms.svg";
    else if (wheatherIcon == "11n") wheatherInconPath = "./assets/thunderstorms.svg";
    else if (wheatherIcon == "13d") wheatherInconPath = "./assets/snow.svg";
    else if (wheatherIcon == "13n") wheatherInconPath = "./assets/snow.svg";
    else if (wheatherIcon == "50d") wheatherInconPath = "./assets/mist.svg";
    else if (wheatherIcon == "50n") wheatherInconPath = "./assets/mist.svg";
    return wheatherInconPath;
}

function distance(lat1, lon1, lat2, lon2, unit) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d / 0.621371;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

function addEvent() {
    document.getElementById("Body").addEventListener("animationend", animationEndEvent, false);
}
