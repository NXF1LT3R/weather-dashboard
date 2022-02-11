console.log("Hello")
let dailyForecast = (dailyWeather)=> {
    console.log(dailyWeather)
    for(let i=0; i<5; i++) {
        setDailyWeather(i, dailyWeather)
    }
}

function getSearchHistory() {
    let result = localStorage.getItem("search-history")
    if (result == null) {
        return []
    }

    return result.split(",")
}

function setHistoryHTML() {
    let history = getSearchHistory()
    let HTML = ""
    history.forEach(searchValue => {
        let button = "<div><button onClick=submitSearchValue('"+searchValue+"')>" + searchValue + "</button></div>"
        HTML = HTML + button
    })
    document.getElementById("search-history").innerHTML=HTML
}

function addToSearchHistory(searchValue) {
    let history = getSearchHistory()
    history.unshift(searchValue)
    localStorage.setItem("search-history", history.join(","))
}

function setDailyWeather(position, dailyWeather) {
    let weather = dailyWeather[position]
    let temperature = weather["temp"]["day"]
    let windSpeed = weather["wind_speed"]
    let humidity = weather["humidity"]
    document.getElementById("temp-value-" + position).innerHTML=temperature+"°F"
    document.getElementById("wind-value-" + position).innerHTML=windSpeed+"MPH"
    document.getElementById("humidity-value-" + position).innerHTML=humidity+"%"
}

let submitSearch = async(event)=> {
    event.preventDefault()
    let searchValue = document.getElementById("search-city").value
    await submitSearchValue(searchValue)
}

let submitSearchValue = async(searchValue)=> {
    console.log(searchValue)
    if (searchValue == "") {
        return
    }
    let citySearchURL = "http://api.openweathermap.org/geo/1.0/direct?q="+searchValue+"&limit=1&appid=b9b309bf3915b3e8918a8262a111d19f"
    let cityResponse = await fetch(citySearchURL)
    let cityResult = await cityResponse.json()
    console.log(cityResult)
    if (cityResult.length == 0) {
        return
    }
    addToSearchHistory(searchValue)
    setHistoryHTML()
    let lat = cityResult[0]["lat"]
    let long = cityResult[0]["lon"]
    let fetchURL = "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+long+"&appid=b9b309bf3915b3e8918a8262a111d19f&units=imperial"
    console.log("fetching weather data from " + fetchURL)
    let response = await fetch(fetchURL)
    let result = await response.json()
    let currentWeather = result["current"]
    let dailyWeather = result["daily"]
        console.log(currentWeather)
        let temperature = currentWeather["temp"]
        let uvi = currentWeather["uvi"]
        let windSpeed = currentWeather["wind_speed"]
        let humidity = currentWeather["humidity"]
        document.getElementById("temp-value").innerHTML=temperature+"°F"
        document.getElementById("uv-value").innerHTML=uvi
        document.getElementById("wind-value").innerHTML=windSpeed+"MPH"
        document.getElementById("humidity-value").innerHTML=humidity+"%"
    dailyForecast(dailyWeather)
}
document.getElementById("search-form").addEventListener("submit", submitSearch)
console.log(getSearchHistory())
setHistoryHTML()


