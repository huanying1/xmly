import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private category$ = new BehaviorSubject<string>('youshengshu')
  private subCategory$ = new BehaviorSubject<string[]>([])
  constructor() { }

  setCategory(category: string): void {
    this.category$.next(category);
  }

  getCategory(): Observable<string> {
    return this.category$.asObservable();
  }

  setSubCategory(category: string[]): void {
    this.subCategory$.next(category);
  }

  getSubCategory(): Observable<string[]> {
    return this.subCategory$.asObservable();
  }
}
