import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegistrationResponse } from '../../pages/registration/registration';

@Injectable({
  providedIn: 'root'
})
export class Register {
  private api = 'http://84.46.248.252:8080/api/v1';

  constructor(private http: HttpClient) { }

  register(data: any) {
    return this.http.post<RegistrationResponse>(`${this.api}/registrations`, data);
  }

  getStates() {
    return this.http.get(`${this.api}/states`);
  }
}
