import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { 
  Sun, Cloud, CloudRain, CloudLightning, CloudSun, 
  CloudSnow, Cloud as CloudFog, CloudDrizzle, Cloudy 
} from 'lucide-react';
import './WeatherApp.css';

Chart.register(...registerables);

const API_KEY = "741e720453b34bfda0735900250802";
const LOCATIONS = ["Tokyo", "Osaka", "Nagoya", "Fukuoka"];

const WeatherIcon = ({ condition, size = 48, className = "" }) => {
  const getIcon = () => {
    switch (condition.code) {
      case 1000: 
        return <Sun size={size} className={`weather-icon sunny ${className}`} />;
      case 1003:
        return <Cloud size={size * 0.8} className={`weather-icon cloud-partial ${className}`} />
      case 1006: 
      case 1009: 
        return <Cloud size={size} className={`weather-icon cloudy ${className}`} />;
      case 1030: 
      case 1135: 
      case 1147:
        return <CloudFog size={size} className={`weather-icon foggy ${className}`} />;
      case 1063:
      case 1150:
      case 1153:
      case 1168:
      case 1171: 
        return <CloudDrizzle size={size} className={`weather-icon drizzle ${className}`} />;
      case 1180:
      case 1183:
      case 1186:
      case 1189:
      case 1192:
      case 1195: 
        return <CloudRain size={size} className={`weather-icon rainy ${className}`} />;
      case 1087:
      case 1273:
      case 1276:
        return <CloudLightning size={size} className={`weather-icon thunder ${className}`} />;
      case 1066:
      case 1114:
      case 1210:
      case 1213:
      case 1216:
      case 1219:
      case 1222:
      case 1225: 
        return <CloudSnow size={size} className={`weather-icon snowy ${className}`} />;
      default:
        return <Cloudy size={size} className={`weather-icon default ${className}`} />;
    }
  };

  return getIcon();
};

const WeatherApp = () => {
  const [location, setLocation] = useState("Tokyo");
  const [forecast, setForecast] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=7&aqi=no&alerts=no`)
      .then((response) => response.json())
      .then((data) => {
        setForecast(data.forecast.forecastday);
        setSelectedDate(data.forecast.forecastday[0]);
      });
  }, [location]);

  if (!forecast || !selectedDate) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-800 text-xl">Loading...</p>
      </div>
    );
  }

  const avgTemp = ((selectedDate.day.mintemp_c + selectedDate.day.maxtemp_c) / 2).toFixed(1);
  const windSpeed = selectedDate.day.maxwind_kph;
  const windDir = selectedDate.hour[0].wind_dir;

  const tempData = {
    labels: selectedDate.hour.map((hour) => hour.time.split(" ")[1]),
    datasets: [{
      label: "Temperature (°C)",
      data: selectedDate.hour.map((hour) => hour.temp_c),
      fill: false,
      borderColor: "white",
      tension: 0.1,
      borderWidth: 2,
    }],
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <div className="content-container">
          {/* Location Selector */}
          <div className="location-selector">
            <select 
              onChange={(e) => setLocation(e.target.value)} 
              value={location}
              className="location-select"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
  
          {/* Main Weather Card */}
          <div className="weather-card">
            <div className="weather-content">
              <h2 className="date-header">
                {selectedDate.date}
              </h2>
  
              <div className="current-weather">
                <div className="weather-main">
                  <WeatherIcon 
                    condition={selectedDate.day.condition} 
                    size={80}
                  />
                  <div className="temperature-main">
                    {avgTemp}°C
                  </div>
                </div>
                <div className="temperature-range">
                  <div className="max-temp">
                    最高 {selectedDate.day.maxtemp_c}°C
                  </div>
                  <div className="min-temp">
                    最低 {selectedDate.day.mintemp_c}°C
                  </div>
                </div>
              </div>
  
              {/* Weather Details */}
              <div className="weather-details">
                <div className="detail-card">
                  <div className="detail-label">降水確率</div>
                  <div className="detail-value">
                    {selectedDate.day.daily_chance_of_rain}%
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">風速</div>
                  <div className="detail-value">
                    {windSpeed} kph<br />
                    {windDir}
                  </div>
                </div>
              </div>
  
              {/* Temperature Chart */}
              <div className="bg-white/5 rounded-xl p-4">
                <Line 
                  data={tempData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        labels: { color: 'white' }
                      }
                    },
                    scales: {
                      y: { 
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { 
                          color: 'white',
                          font: { size: 12 }
                        }
                      },
                      x: {
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { 
                          color: 'white',
                          font: { size: 12 }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
  
          {/* Forecast Cards */}
          <div className="forecast-grid">
            {forecast.map((day) => (
              <div
                key={day.date}
                onClick={() => setSelectedDate(day)}
                className={`forecast-card ${
                  selectedDate.date === day.date ? 'selected' : ''
                }`}
              >
                <p className="forecast-date">{day.date}</p>
                <WeatherIcon 
                  condition={day.day.condition} 
                  size={40}
                  className="forecast-icon"
                />
                <p className="forecast-temp">{day.day.avgtemp_c}°C</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;