// *==> These are all of the of the HTML DOM Elements needed to generate the cards and populate the information we retrieve
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

// *==> All of our Global Variables
let weatherApiUrl = "https://api.openweathermap.org"
let weatherApiKey = "&appid=b9b309bf3915b3e8918a8262a111d19f"
let oneCallEndpoint = '/data/2.5/onecall?';
let defaultSearch = ['New York', 'Chicago', 'Austin', 'San Francisco', 'Seattle', 'Denver', 'Atlanta', 'San Diego'];
let today = moment().format('M/DD/YYYY')
let searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
let cityName;

// *==> This a function that goes through and gets the DATA from the the Weather API
// *==> it then runs it through a set of functions to Generate the information displayed

// *==> The Below function is grabbing the information put in from the input/event listener on the bottom of the page
// * It follows the exact rules required by the WeatherAPI to search for the LAT and LONG for the next function
fetchWeatherData = () => {
    let geocodingEndpoint = '/geo/1.0/direct?'
    let apiParam = `q=${cityName}`;

    // *==> This fetch puts all those parameters together for the fetch request
    fetch(`${weatherApiUrl}${geocodingEndpoint}${apiParam}${weatherApiKey}`)
    .then(function (response) {
        return response.json();
    })
    // *==> This grabs the data from the request and passes it through a new function so we can drill into the object to retrieve the information we need
    .then(function (data) {
        fetchWeather(data);
    })
    // *==> This just kicks back a UI element to give the user the information needed to re-enter city names
    .catch(function (error) {
        alert('please enter a valid city name');
    })
}

// *==> This function is called inside of the above function, it takes out the Lat and Long from the returned data from the Geocoding API
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

// * ==> The top part of this function is dynamically adding date pulled from the API to fill in the information on the Main Card on the weather dashboard
showWeather = (coordinatesData, openWeatherData) => {
    mainCity.textContent = coordinatesData[0].name;
    mainIcon.src = `http://openweathermap.org/img/wn/${openWeatherData.current.weather[0].icon}@2x.png`
    mainTemp.textContent = `${Math.trunc(openWeatherData.current.temp)}\xB0F`;
    mainWind.textContent = `${openWeatherData.current.wind_speed} mph`;
    mainHumidity.textContent = `${openWeatherData.current.humidity}%`;
    mainUv.textContent = Math.trunc(openWeatherData.current.uvi);

    // * ==> This just makes sure to remove the class on the card to make sure that when i set the UV in the next if else statement we dont have conflicting information
    mainUv.parentElement.classList.remove('low');
    mainUv.parentElement.classList.remove('moderate');
    mainUv.parentElement.classList.remove('high');
    mainUv.parentElement.classList.remove('very-high');
    mainUv.parentElement.classList.remove('severe');
    
    // * ==> This if else statement goes through and checks the number given back from the Weather API and changes the background of the Card Element to match the colors
    // * associated with it that i got from the Wikipedia page defining UV levels
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

// * ==> This function creates the future Forecast cards dynamically and uses a for loop to change the elements on the card 
showForecast = (openWeatherData) => {
    for (let i = 0; i < futureCard.length; i++) {
        futureCardDate[i].textContent = moment().add((i+1), 'days').format('M/DD/YYYY');
        futureCardIcon[i].src = `http://openweathermap.org/img/wn/${openWeatherData.daily[i].weather[0].icon}@2x.png`;
        futureCardTemp[i].textContent = `${Math.trunc(openWeatherData.daily[i].temp.day)}\xB0F`;
        futureCardWind[i].textContent = `${openWeatherData.daily[i].wind_speed} mph`;
        futureCardHumidity[i].textContent = `${openWeatherData.daily[i].humidity}%`;
    }
};

// * ==> this function adds the new name once its been searched to the City list and removes the last name on the list. Keeping the list the same size while also dynamically changing the list
addToSearchHistory = (weatherData) => {
    let city = weatherData[0].name;
    let searchArray = JSON.parse(localStorage.getItem('searchHistory'));

    // *==>  includes makes sure that the city name isnt already in the city array by adding the bang to it, Unshift adds the new name to the front of the array, and pop removes the last item in the array
    if (!searchArray.includes(city)) {
        searchArray.unshift(city);
        searchArray.pop();
        localStorage.setItem('searchHistory', JSON.stringify(searchArray));
        searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
    }
    showSearchHistory();
};

// * ==> This function goes through and creates the buttons for the previous search
showSearchHistory = () => {
    previousLocationsBtn.textContent = '';

    // * ==> this is checking to see if the local storage has anything in it at all or any data. If it doesn't use the list created above as a start point
    if (searchHistory === undefined || searchHistory === null) {
        localStorage.setItem('searchHistory', JSON.stringify(defaultSearch));
    }

    searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
    cityName = searchHistory[0];

    // * ==> this for loop creates the buttons and adds the classes to make them look the same and add the event listener to it
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



// *==> this is the event listener for the search button
search.addEventListener('click', function (event) {
    event.preventDefault();
    
    cityName = searchInput.value.toLowerCase().trim();
    fetchWeatherData();
    
    searchInput.value = '';
});

// * ==> this init function is to run at the once the page loads to populate the page with data and set the date
init = () => {
    mainDate.textContent = ` ${today}`
    showSearchHistory();
    fetchWeatherData();
}

init();