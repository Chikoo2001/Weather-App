const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");

const weatherContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const loadingContainer = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const formContainer = document.querySelector(".form-container");
const errorContainer = document.querySelector(".errorContainer");
const errorText = document.querySelector(".error-text");
const retryBtn = document.querySelector("[data-retryBtn]")

const API_KEY = "168771779c71f3d64106d8a88376808a";

let currentTab = userTab;
currentTab.classList.add("current-tab");
getFromSessionStorage();

function switchTab(clickedTab) {
    if(clickedTab !== currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!formContainer.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            errorContainer.classList.remove("active");
            formContainer.classList.add("active");
        } else {
            formContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
            errorContainer.classList.remove("active");
            getFromSessionStorage();
        }
    }
}


userTab.addEventListener("click", () => {
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});

function getFromSessionStorage() {
    errorContainer.classList.remove("active");
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(localCoordinates) {
       const coordinates = JSON.parse(localCoordinates);
       fetchUserWeatherInfo(coordinates); 
    } else {
        grantAccessContainer.classList.add("active");
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    grantAccessContainer.classList.remove("active");
    loadingContainer.classList.add("active");

    // api call
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        loadingContainer.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch(err) {
        loadingContainer.classList.remove("active");
        errorContainer.classList.add("active");
        document.querySelector("[data-errorText]").innerText = `${err?.message}`;
    }
}

retryBtn.addEventListener("click", getFromSessionStorage);

function renderWeatherInfo(data) {
    const cityName = document.querySelector("[data-cityName]");
    const contryIcon = document.querySelector("[data-contryIcon]");
    const weatherDesc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloud = document.querySelector("[data-cloud]");

    cityName.innerHTML = data?.name;
    contryIcon.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    weatherDesc.innerText = data?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
    temp.innerText = `${data?.main?.temp} °C`;
    windSpeed.innerText = `${data?.wind?.speed} m/s`;
    humidity.innerText = `${data?.main?.humidity} %`;
    cloud.innerText = `${data?.clouds?.all} %`;
}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("No geolocation support available");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccess = document.querySelector("[data-grantAccess]");
grantAccess.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

formContainer.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "") {
        return;
    } else {
        fetchSearchWeatherInfo(cityName);
    }
});

async function fetchSearchWeatherInfo(city) {
    grantAccessContainer.classList.remove("active");
    userInfoContainer.classList.remove("active");
    loadingContainer.classList.add("active");
    // api call
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        if(!data.sys) {
            throw data;
        }
        
        loadingContainer.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch(err) {
        loadingContainer.classList.remove("active");
        errorContainer.classList.add("active");
        document.querySelector("[data-errorText]").innerText = `${err?.message}`;
        retryBtn.style.display = "none";
    }
}
