import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {WindowService} from "../tools/window.service";
import {storageKeys} from "../../config";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private category$ = new BehaviorSubject<string>('youshengshu')
  private subCategory$ = new BehaviorSubject<string[]>([])
  constructor(private windowServe:WindowService) {
    const cacheCategory = this.windowServe.getStorage(storageKeys.categoryPinyin)
    if (cacheCategory) {
      this.category$.next(cacheCategory)
    }
  }

  setCategory(category: string): void {
    this.windowServe.setStorage(storageKeys.categoryPinyin,category)
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
