import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Register {
  private api = 'https://api.example.com/register';

  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get(this.api);
  }
}