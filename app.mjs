// app.js

import { fetchWeather } from './api.mjs';
import { paginateData, updatePaginationControls } from './pagination.mjs';

let weatherData = [];
let currentPage = 1;
const itemsPerPage = 3;

document.getElementById('get-weather').addEventListener('click', fetchWeatherForCities);
document.getElementById('prev-btn').addEventListener('click', () => changePage(-1));
document.getElementById('next-btn').addEventListener('click', () => changePage(1));

async function fetchWeatherForCities() {
    const cities = document.getElementById('city-input').value.split(',').map(city => city.trim());
    
    try {
       
        const requests = cities.map(city => fetchWeather(city));
        const results = await Promise.all(requests);

    
        weatherData = results.filter(result => result && result.cod === 200);
        
        if (weatherData.length === 0) {
            displayErrorMessage('No valid weather data found.');
            return;
        }

        currentPage = 1;
        displayWeather();
        updatePaginationControls(weatherData.length, currentPage, itemsPerPage);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        displayErrorMessage('An error occurred while fetching weather data.');
    }
}

function displayWeather() {
    const weatherContainer = document.getElementById('weather-container');
    weatherContainer.innerHTML = '';

    const paginatedData = paginateData(weatherData, currentPage, itemsPerPage);

    paginatedData.forEach(data => {
        const card = document.createElement('div');
        card.classList.add('weather-card');
        
        // This is to determine the background class based on weather condition
        let weatherBackgroundClass = '';
        const weatherCondition = data.weather[0].main.toLowerCase();

        if (weatherCondition.includes('sunny') || weatherCondition.includes('clear')) {
            weatherBackgroundClass = 'sunny';
        } else if (weatherCondition.includes('rain')) {
            weatherBackgroundClass = 'rainy';
        } else if (weatherCondition.includes('cloud')) {
            weatherBackgroundClass = 'cloudy';
        } else if (weatherCondition.includes('snow')) {
            weatherBackgroundClass = 'snowy';
        }

        card.classList.add(weatherBackgroundClass);

        card.innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
            <p><strong>Weather:</strong> ${data.weather[0].description}</p>
            <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
        `;
        weatherContainer.appendChild(card);
    });
}

function changePage(direction) {
    const totalPages = Math.ceil(weatherData.length / itemsPerPage);
    if ((direction === -1 && currentPage === 1) || (direction === 1 && currentPage === totalPages)) {
        return;
    }
    
    currentPage += direction;
    displayWeather();
    updatePaginationControls(weatherData.length, currentPage, itemsPerPage);
}

function displayErrorMessage(message) {
    const weatherContainer = document.getElementById('weather-container');
    weatherContainer.innerHTML = `<p>${message}</p>`;
}
