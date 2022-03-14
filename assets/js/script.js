const previousLocationsBtn = document.querySelector('#search-buttons')
const search = document.querySelector('#city-search-button');
const searchInput = document.querySelector('#city-search');
const mainCity = document.querySelector('#main-card-city');
const mainDate = document.querySelector('#main-card-date');
const mainIcon = document.querySelector('#main-card-icon');
const mainTemp = document.querySelector('#main-card-temp');
const mainWind = document.querySelector('#main-card-wind');
const mainHumidity = document.querySelector('#main-card-humidity');
const mainUv = document.querySelector('#main-card-uv');
const futureCard = document.querySelectorAll('.forecast-card');
const futureCardDate = document.querySelectorAll('.forecast-date');
const futureCardIcon = document.querySelectorAll('.forecast-icon');
const futureCardTemp = document.querySelectorAll('.forecast-temp');
const futureCardWind = document.querySelectorAll('.forecast-wind');
const futureCardHumidity = document.querySelectorAll('.forecast-humidity');

let weatherApiUrl = "https://api.openweathermap.org"
let weatherApiKey = "&appid=b9b309bf3915b3e8918a8262a111d19f"
let oneCallEndpoint = '/data/2.5/onecall?';
let defaultSearch = ['New York', 'Chicago', 'Austin', 'San Francisco', 'Seattle', 'Denver', 'Atlanta', 'San Diego'];
let today = moment().format('M/DD/YYYY')
let searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
let cityName;

fetchWeatherData = () => {
    let geocodingEndpoint = '/geo/1.0/direct?'
    let apiParam = `q=${cityName}`;

    fetch(`${weatherApiUrl}${geocodingEndpoint}${apiParam}${weatherApiKey}`)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        fetchWeather(data);
    })
    .catch(function (error) {
        alert('please enter a valid city name');
    })
}

fetchWeather = (weatherData) => {
    let lat = weatherData[0].lat;
    let lon = weatherData[0].lon;

    fetch(`${weatherApiUrl}${oneCallEndpoint}lat=${lat}&lon=${lon}&units=imperial${weatherApiKey}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            addToSearchHistory(weatherData);
            showWeather(weatherData, data);
            showForecast(data);
        })
}

showWeather = (coordinatesData, openWeatherData) => {
    mainCity.textContent = coordinatesData[0].name;
    mainIcon.src = `http://openweathermap.org/img/wn/${openWeatherData.current.weather[0].icon}@2x.png`
    mainTemp.textContent = `${Math.trunc(openWeatherData.current.temp)}\xB0F`;
    mainWind.textContent = `${openWeatherData.current.wind_speed} mph`;
    mainHumidity.textContent = `${openWeatherData.current.humidity}%`;
    mainUv.textContent = Math.trunc(openWeatherData.current.uvi);

    mainUv.parentElement.classList.remove('low');
    mainUv.parentElement.classList.remove('moderate');
    mainUv.parentElement.classList.remove('high');
    mainUv.parentElement.classList.remove('very-high');
    mainUv.parentElement.classList.remove('severe');
    
    if (mainUv.textContent <= 2) {
        mainUv.parentElement.classList.add('low');
    } else if (mainUv.textContent <= 5) {
        mainUv.parentElement.classList.add('moderate')
    } else if (mainUv.textContent <= 7) {
        mainUv.parentElement.classList.add('high')
    }
    else if (mainUv.textContent <= 10) {
        mainUv.parentElement.classList.add('very-high')
    } else {
        mainUv.parentElement.classList.add('severe');
    }
};

showForecast = (openWeatherData) => {
    for (let i = 0; i < futureCard.length; i++) {
        futureCardDate[i].textContent = moment().add((i+1), 'days').format('M/DD/YYYY');
        futureCardIcon[i].src = `http://openweathermap.org/img/wn/${openWeatherData.daily[i].weather[0].icon}@2x.png`;
        futureCardTemp[i].textContent = `${Math.trunc(openWeatherData.daily[i].temp.day)}\xB0F`;
        futureCardWind[i].textContent = `${openWeatherData.daily[i].wind_speed} mph`;
        futureCardHumidity[i].textContent = `${openWeatherData.daily[i].humidity}%`;
    }
};

addToSearchHistory = (weatherData) => {
    let city = weatherData[0].name;
    let searchArray = JSON.parse(localStorage.getItem('searchHistory'));

    if (!searchArray.includes(city)) {
        searchArray.unshift(city);
        searchArray.pop();
        localStorage.setItem('searchHistory', JSON.stringify(searchArray));
        searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
    }
    showSearchHistory();
};

showSearchHistory = () => {
    previousLocationsBtn.textContent = '';

    if (searchHistory === undefined || searchHistory === null) {
        localStorage.setItem('searchHistory', JSON.stringify(defaultSearch));
    }

    searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
    cityName = searchHistory[0];

    for (let i = 0; i < searchHistory.length; i++) {
        let button = document.createElement('button');
        button.textContent = searchHistory[i];

        button.classList.add('btn');
        button.classList.add('btn-secondary');
        button.classList.add('btn-block');
        button.classList.add('mb-2');
        button.classList.add('searched-cities-btn');
        button.addEventListener('click', function(event) {
            cityName = event.target.textContent
            fetchWeatherData();
        })
        previousLocationsBtn.appendChild(button);
    }

};

search.addEventListener('click', function (event) {
    event.preventDefault();
    
    cityName = searchInput.value.toLowerCase().trim();
    fetchWeatherData();
    
    searchInput.value = '';
});

init = () => {
    mainDate.textContent = ` ${today}`
    showSearchHistory();
    fetchWeatherData();
}

init();