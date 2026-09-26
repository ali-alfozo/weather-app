//   SELECTORS
const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const notFoundSection = document.querySelector(".not-found");
const searchcitySection = document.querySelector(".search-city");
const weatherinfoSection = document.querySelector(".weather-info");
const countryTxt = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const HumidityValueTxt = document.querySelector(".humidity-value-txt");
const WindValueTxt = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDateTxt = document.querySelector(".current-date-txt");
const forecastItemsContainer = document.querySelector(".forecast-items-container");
const loadingSpinner = document.getElementById("loadingSpinner");

const apikey = '9ac6edd4f63ba1f942a02bdbb8cc830d';

//   EVENT LISTENERS
searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value.trim());
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' && cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value.trim());
    }
});

//  FETCH DATA
async function getFetchData(endpoint, city) {
    try {
        const apiurl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apikey}&units=metric`;
        const response = await fetch(apiurl);
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return { cod: 500 };
    }
}

//  WEATHER ICON MAPPING
function getweatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';
    if (id <= 321) return 'drizzle.svg';
    if (id <= 531) return 'rain.svg';
    if (id <= 622) return 'snow.svg';
    if (id <= 781) return 'atmosphere.svg';
    if (id == 800) return 'clear.svg';
    else return 'clouds.svg';
}

//   GET CURRENT DATE
function getCurrentDate() {
    const currentData = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    };
    return currentData.toLocaleDateString('en-US', options);
}

//   UPDATE WEATHER INFO
async function updateWeatherInfo(city) {
    try {
        //   إظهار مؤشر التحميل
        loadingSpinner.style.display = 'block';
        showDisplaySection(null); // إخفاء كل الأقسام مؤقتاً

        const weatherData = await getFetchData('weather', city);
        
        //  إخفاء مؤشر التحميل
        loadingSpinner.style.display = 'none';

        //   معالجة أخطاء الشبكة
        if (weatherData.cod === 500) {
            alert("⚠️ Network error. Please check your connection.");
            showDisplaySection(searchcitySection);
            return;
        }

        //   معالجة "المدينة غير موجودة"
        if (weatherData.cod !== 200) {
            showDisplaySection(notFoundSection);
            return;
        }

        const {
            name: country,
            main: { temp, humidity },
            weather: [{ id, main }],
            wind: { speed }
        } = weatherData;

        countryTxt.textContent = country;
        tempTxt.textContent = Math.round(temp) + '°C';
        conditionTxt.textContent = main;
        HumidityValueTxt.textContent = humidity + '%';
        WindValueTxt.textContent = (speed * 3.6).toFixed(1) + ' km/h';
        currentDateTxt.textContent = getCurrentDate();
        weatherSummaryImg.src = `weather/${getweatherIcon(id)}`;

        await updateForecastInfo(city);
        showDisplaySection(weatherinfoSection);
        
        cityInput.value = '';
        cityInput.blur();
        
    } catch (error) {
        console.error("Weather update error:", error);
        loadingSpinner.style.display = 'none';
        showDisplaySection(notFoundSection);
    }
}

// UPDATE FORECAST INFO
async function updateForecastInfo(city) {
    try {
        const forecastData = await getFetchData('forecast', city);
        
        if (!forecastData.list) {
            console.warn("Forecast data not available");
            return;
        }
        
        const timeTaken = '12:00:00';
        const todayDate = new Date().toISOString().split('T')[0];

        forecastItemsContainer.innerHTML = '';

        const forecasts = forecastData.list
            .filter(f => f.dt_txt.includes(timeTaken) && !f.dt_txt.includes(todayDate))
            .slice(0, 5);

        forecasts.forEach(updateForecastItems);
        
    } catch (error) {
        console.error("Forecast error:", error);
    }
}

//   UPDATE FORECAST ITEMS
function updateForecastItems(WeatherData) {
    const {
        dt_txt: date,
        weather: [{ id, main }],
        main: { temp }
    } = WeatherData;

    const dateTaken = new Date(date);
    const dateoption = {
        day: '2-digit',
        month: 'short',
    };
    const dateResult = dateTaken.toLocaleDateString('en-US', dateoption);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="weather/${getweatherIcon(id)}" class="forecast-item-img" alt="Forecast icon">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;
    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

//   SHOW / HIDE SECTIONS
function showDisplaySection(section) {
    [weatherinfoSection, notFoundSection, searchcitySection].forEach((sec) => {
        if (sec === section) {
            sec.style.display = 'flex';
        } else {
            sec.style.display = 'none';
        }
    });
}

//  THEME TOGGLE
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.material-symbols-outlined');

// استرجاع الوضع المحفوظ
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeIcon.textContent = 'dark_mode';
} else {
    themeIcon.textContent = 'light_mode';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeIcon.textContent = isLight ? 'dark_mode' : 'light_mode';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

//   INITIAL STATE
showDisplaySection(searchcitySection);