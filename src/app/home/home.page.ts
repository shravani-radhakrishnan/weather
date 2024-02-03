import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { W_FORECAST, CURRENT_WEATHER } from '../misc/mockup';

const API_URL = environment.API_URL;
const API_KEY = environment.API_KEY;
const API_ICONS = environment.API_ICONS;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  weatherInfo: any;
  todayDate = new Date();
  cityName: any;
  country: any;
  weatherIcon: any;
  weaterDetails: any;
  time: any;
  name:any;
  temprature: any;
  weatherForecast: any;
  w_data:{[key:string]: any} = {rain:'',humidity:'',wind:''};
  loading = true;

  constructor(public httpClient: HttpClient) {
    this.time = this.formatAMPM(this.todayDate);
  }

  loadData() {
    this.httpClient
      .get(`${API_URL}weather?q=${this.cityName}&APPID=${API_KEY}`)
      .subscribe((result: any) => {
        console.log(result);
        this.getForecast();
        this.weatherInfo = result['main'];
        this.name = result['name'];
        this.country = result['sys'].country;
        this.weaterDetails = result['weather'][0];
        this.weatherIcon = `${API_ICONS}${this.weaterDetails?.icon}@4x.png`;
        this.w_data['rain'] = 22;
        this.w_data['wind'] = result['wind']['speed']
        this.w_data['humidity'] = result['main']['humidity'];
        this.loading = false
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

  getForecast() {
    this.httpClient
      .get(`${API_URL}forecast?q=${'Dallas'}&APPID=${API_KEY}`)
      .subscribe((result: any) => {
        console.log(result);
        let data = result['list'];
        data.forEach((element: any, i: number) => {
          let obj = new Date(element.dt_txt);
          let time =  this.formatAMPM(obj);
          data[i]['time'] = time;
          data[i].weather[0].icon = `${API_ICONS}${data[i].weather[0].icon}@4x.png`; 
        });
        this.weatherForecast = data;
      });
  }
}
