import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {map} from "rxjs/operators";
import {Base, User} from "./types";
import {storageKeys} from "../../config";

interface LoginType {
  user:User
  token:string
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private prefix = '/xmly/'
  private needToken = new HttpHeaders().set(storageKeys.needToken,'true')
  constructor(private http: HttpClient) {
  }

  login(params: Exclude<User, 'name'>): Observable<LoginType> {
    return this.http.post(`${environment.baseUrl}${this.prefix}login`, params)
      .pipe(map((res: Base<LoginType>) => res.data))
  }

  userInfo():Observable<LoginType> {
    return this.http.get(`${environment.baseUrl}${this.prefix}account`,{
      headers: this.needToken
    }).pipe(map((res: Base<LoginType>) => res.data))
  }

  logout():Observable<void> {
    return this.http.get(`${environment.baseUrl}${this.prefix}logout`,{
      headers: this.needToken
    }).pipe(map((res: Base<void>) => res.data))
  }
}
