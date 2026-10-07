const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");

const statusText = document.getElementById("status");
const weatherResult = document.getElementById("weatherResult");
const cityName = document.getElementById("cityName");
const weatherDescription = document.getElementById("weatherDescription");

const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

// WMO weather-code descriptions.
function getWeatherInfo(code) {
    if (code === 0) {
        return { description: "Clear sky", className: "sunny" };
    }

    if ([1, 2, 3].includes(code)) {
        return { description: "Cloudy", className: "cloudy" };
    }

    if ([45, 48].includes(code)) {
        return { description: "Foggy", className: "cloudy" };
    }

    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return { description: "Rainy", className: "rainy" };
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return { description: "Snowy", className: "snowy" };
    }

    if ([95, 96, 99].includes(code)) {
        return { description: "Thunderstorm", className: "stormy" };
    }

    return { description: "Unknown weather", className: "default" };
}

// DOM manipulation: remove the old weather class and add the new one.
function changeBackground(weatherClass) {
    document.body.classList.remove(
        "default",
        "sunny",
        "cloudy",
        "rainy",
        "snowy",
        "stormy"
    );

    document.body.classList.add(weatherClass);
}

async function getWeather(city) {
    statusText.textContent = "Loading...";
    weatherResult.hidden = true;

    try {
        // Step 1: Convert city name into latitude and longitude.
        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Could not connect to the geocoding service.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Try another city name.");
        }

        const place = geoData.results[0];

        // Step 2: Fetch current weather using the coordinates.
        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}` +
            `&longitude=${place.longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code` +
            `&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Could not retrieve weather data.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        // Step 3: Use the weather code to change the page background.
        const weatherInfo = getWeatherInfo(current.weather_code);
        changeBackground(weatherInfo.className);

        // Step 4: Update the HTML using DOM manipulation.
        cityName.textContent = `${place.name}, ${place.country || ""}`;
        weatherDescription.textContent = weatherInfo.description;
        temperature.textContent = `${current.temperature_2m} Â°C`;
        feelsLike.textContent = `${current.apparent_temperature} Â°C`;
        humidity.textContent = `${current.relative_humidity_2m}%`;
        windSpeed.textContent = `${current.wind_speed_10m} km/h`;

        weatherResult.hidden = false;
        statusText.textContent = "";
    } catch (error) {
        statusText.textContent = error.message;
        changeBackground("default");
    }
}

weatherForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        statusText.textContent = "Please enter a city name.";
        return;
    }

    getWeather(city);
});