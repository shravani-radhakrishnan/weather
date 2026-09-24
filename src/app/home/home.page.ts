import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';

const API_URL = environment.API_URL;
const API_KEY = environment.API_KEY;
const API_ICONS = environment.API_ICONS;
const API_UNITS = 'metric';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild('cityInput') cityInput?: ElementRef<HTMLInputElement>;
  @ViewChild('hourlyScroller') hourlyScroller?: ElementRef<HTMLDivElement>;

  weatherInfo: any;
  todayDate = new Date();
  cityName = '';
  lastSearchedCity = '';
  country: any;
  weatherIcon: any;
  weaterDetails: any;
  time: any;
  name: any;
  temprature: any;
  weatherForecast: any[] = [];
  w_data:{[key:string]: any} = {rain:'',humidity:'',wind:''};
  loading = false;
  searching = false;
  searchOpen = false;
  errorMessage = '';

  constructor(public httpClient: HttpClient) {
    this.time = this.formatAMPM(this.todayDate);
  }

  handleSearchClick(event: Event) {
    event.preventDefault();

    if (!this.searchOpen) {
      this.searchOpen = true;
      setTimeout(() => this.cityInput?.nativeElement.focus(), 0);
      return;
    }

    this.loadData();
  }

  scrollForecast(direction: 'left' | 'right') {
    const scroller = this.hourlyScroller?.nativeElement;

    if (!scroller) {
      return;
    }

    scroller.scrollBy({
      left: direction === 'right' ? 180 : -180,
      behavior: 'smooth',
    });
  }

  onForecastWheel(event: WheelEvent) {
    const scroller = this.hourlyScroller?.nativeElement;

    if (!scroller || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      return;
    }

    event.preventDefault();
    scroller.scrollLeft += event.deltaY;
  }

  loadData(event?: Event) {
    event?.preventDefault();
    const city = String(this.cityName || '').trim();

    if (!city) {
      this.errorMessage = 'Please enter a city name.';
      return;
    }

    this.searching = true;
    this.errorMessage = '';

    this.httpClient
      .get(`${API_URL}weather?q=${encodeURIComponent(city)}&units=${API_UNITS}&appid=${API_KEY}`)
      .subscribe((result: any) => {
        this.cityName = city;
        this.lastSearchedCity = city;
        this.getForecast(city);
        this.weatherInfo = result['main'];
        this.name = result['name'];
        this.country = result['sys'].country;
        this.weaterDetails = result['weather'][0];
        this.weatherIcon = `${API_ICONS}${this.weaterDetails?.icon}@4x.png`;
        this.w_data['rain'] = result['clouds']?.all || 0;
        this.w_data['wind'] = result['wind']['speed'];
        this.w_data['humidity'] = result['main']['humidity'];
        this.loading = false;
        this.searching = false;
        this.searchOpen = false;
      }, () => {
        this.searching = false;
        this.loading = false;
        this.searchOpen = true;
        this.errorMessage = `Could not find weather for "${city}".`;
      });
  }
  formatAMPM(date: any) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  getForecast(city: string) {
    this.httpClient
      .get(`${API_URL}forecast?q=${encodeURIComponent(city)}&units=${API_UNITS}&appid=${API_KEY}`)
      .subscribe((result: any) => {
        let data = result['list'];
        data.forEach((element: any, i: number) => {
          let obj = new Date(element.dt_txt);
          let time =  this.formatAMPM(obj);
          data[i]['time'] = time;
          data[i].weather[0].icon = `${API_ICONS}${data[i].weather[0].icon}@4x.png`; 
        });
        this.weatherForecast = data;
      }, () => {
        this.weatherForecast = [];
      });
  }

  get currentTemp() {
    return this.toCelsius(this.weatherInfo?.temp);
  }

  get highTemp() {
    return this.toCelsius(this.weatherInfo?.temp_max);
  }

  get lowTemp() {
    return this.toCelsius(this.weatherInfo?.temp_min);
  }

  get forecastHigh() {
    const values = this.weatherForecast.slice(0, 8).map((item) => item.main.temp_max);
    return values.length ? this.toCelsius(Math.max(...values)) : '--';
  }

  get forecastLow() {
    const values = this.weatherForecast.slice(0, 8).map((item) => item.main.temp_min);
    return values.length ? this.toCelsius(Math.min(...values)) : '--';
  }

  get windSpeed() {
    return Math.round(Number(this.w_data['wind'] || 0) * 3.6);
  }

  get humidity() {
    return this.w_data['humidity'] || 0;
  }

  get rainChance() {
    return this.w_data['rain'] || 0;
  }

  toCelsius(temp: any) {
    if (temp === undefined || temp === null || Number.isNaN(Number(temp))) {
      return '--';
    }

    return Number(temp).toFixed(0);
  }
}
