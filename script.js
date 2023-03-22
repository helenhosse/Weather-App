
function weatherDashboard() {
  const city = document.getElementById("enter-city");
  const search = document.getElementById("search-button");
  const clearSearch = document.getElementById("clear-history");
  const currentName = document.getElementById("city-name");
  const currentImg = document.getElementById("current-pic");
  const currentTemp = document.getElementById("temperature");
  const currentHumidity = document.getElementById("humidity");
  const currentWind = document.getElementById("wind-speed");
  const currentUV = document.getElementById("UV-index");
  const history = document.getElementById("history");
  var nextFiveDays = document.getElementById("fiveday-header");
  var todayweather = document.getElementById("today-weather");
  let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

  // API Key
  const APIKey = "86471b9902e30b02ffb9cf20ee663d22";

  function getWeather(cityName) {
      // Get request from open weather API
      let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
      axios.get(queryURL)
          .then(function (response) {

              todayweather.classList.remove("d-none");

              // Display current weather
              const currentDate = new Date(response.data.dt * 1000);
              const day = currentDate.getDate();
              const month = currentDate.getMonth() + 1;
              const year = currentDate.getFullYear();
              currentName.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
              let weatherImg = response.data.weather[0].icon;
              currentImg.setAttribute("src", "https://openweathermap.org/img/wn/" + weatherImg + "@2x.png");
              currentImg.setAttribute("alt", response.data.weather[0].description);
              currentTemp.innerHTML = "Temperature: " + k2f(response.data.main.temp) + " &#176F";
              currentHumidity.innerHTML = "Humidity: " + response.data.main.humidity + "%";
              currentWind.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";

              // Get UV Index
              let lat = response.data.coord.lat;
              let lon = response.data.coord.lon;
              let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
              axios.get(UVQueryURL)
                  .then(function (response) {
                      let UVIndex = document.createElement("span");

                      // When UV Index is good, shows green, when ok shows yellow, when bad shows red
                      if (response.data[0].value < 4) {
                          UVIndex.setAttribute("class", "badge badge-success p-2");
                          UVIndex.setAttribute("style", "background-color: #147346;");
                      }
                      else if (response.data[0].value < 8) {
                          UVIndex.setAttribute("class", "badge badge-warning p-2");
                      }
                      else {
                          UVIndex.setAttribute("class", "badge badge-danger p-2");
                      }
                      console.log(response.data[0].value)
                      UVIndex.innerHTML = response.data[0].value;
                      currentUV.innerHTML = "UV Index: ";
                      currentUV.append(UVIndex);
                  });

              // Get 5 day forecast for this city
              let cityID = response.data.id;
              let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey;
              axios.get(forecastQueryURL)
                  .then(function (response) {
                      nextFiveDays.classList.remove("d-none");

                      // display next 5 days conditions
                      const futureConditions = document.querySelectorAll(".forecast");
                      for (i = 0; i < futureConditions.length; i++) {
                          futureConditions[i].innerHTML = "";
                          const futureConditionIndex = i * 8 + 4;
                          const futureDate = new Date(response.data.list[futureConditionIndex].dt * 1000);
                          const futureDay = futureDate.getDate();
                          const futureMonth = futureDate.getMonth() + 1;
                          const futureYear = futureDate.getFullYear();
                          const futureConditionDisplay = document.createElement("p");
                          futureConditionDisplay.setAttribute("class", "mt-3 mb-0 forecast-date");
                          futureConditionDisplay.innerHTML = futureMonth + "/" + futureDay + "/" + futureYear;
                          futureConditions[i].append(futureConditionDisplay);

                          // display icon depends weather
                          const futureWeather = document.createElement("img");
                          futureWeather.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[futureConditionIndex].weather[0].icon + "@2x.png");
                          futureWeather.setAttribute("alt", response.data.list[futureConditionIndex].weather[0].description);
                          futureConditions[i].append(futureWeather);

                          // display future temperature
                          const futureTemp = document.createElement("p");
                          futureTemp.innerHTML = "Temp: " + k2f(response.data.list[futureConditionIndex].main.temp) + " &#176F";
                          futureConditions[i].append(futureTemp);

                          // display future wind speed
                          const futureWind = document.createElement("p");
                          futureWind.innerHTML = "Wind: " + response.data.list[futureConditionIndex].wind.speed + " MPH";
                          futureConditions[i].append(futureWind);

                          // display future humidity
                          const futureHumidity = document.createElement("p");
                          futureHumidity.innerHTML = "Humidity: " + response.data.list[futureConditionIndex].main.humidity + "%";
                          futureConditions[i].append(futureHumidity);
                      }
                  })
          });
  }


  function k2f(K) {
      return Math.floor((K - 273.15) * 1.8 + 32);
  }

  // Get history
  search.addEventListener("click", function () {
      const searchTerm = city.value;
      getWeather(searchTerm);
      searchHistory.push(searchTerm);
      localStorage.setItem("search", JSON.stringify(searchHistory));
      callSearchHistory();
  })

  // Clear History
  clearSearch.addEventListener("click", function () {
      localStorage.clear();
      searchHistory = [];
      callSearchHistory();
  })

  function callSearchHistory() {
      history.innerHTML = "";
      for (let i = 0; i < searchHistory.length; i++) {
          const historyItem = document.createElement("input");
          historyItem.setAttribute("type", "text");
          historyItem.setAttribute("readonly", true);
          historyItem.setAttribute("class", "input-group mb-3 p-2 cityLabel border-0 rounded d-block text-center");
          historyItem.setAttribute("value", searchHistory[i]);
          historyItem.addEventListener("click", function () {
              getWeather(historyItem.value);
          })
          history.append(historyItem);
      }
  }

  callSearchHistory();
  if (searchHistory.length > 0) {
      getWeather(searchHistory[searchHistory.length - 1]);
  }

}

weatherDashboard();