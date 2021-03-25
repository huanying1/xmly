import { Injectable } from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {WindowService} from "../tools/window.service";
import {storageKeys} from "../../config";

interface CustomHttpConfig {
  headers?: HttpHeaders;
}

const ERR_MSG = '请求失败'

@Injectable()
export class InterceptorService implements HttpInterceptor {
  constructor(private windowServe: WindowService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth = this.windowServe.getStorage(storageKeys.auth);
    const needToken = req.headers.get(storageKeys.needToken)
    let httpConfig: CustomHttpConfig = {};
    if (needToken) {
      httpConfig = { headers: req.headers.set(storageKeys.auth, auth || '') };
    }
    const copyReq = req.clone(httpConfig);
    return next.handle(copyReq).pipe(catchError(error => InterceptorService.handleError(error)));
  }

  private static handleError(error: HttpErrorResponse): Observable<never> {
    if (typeof error.error?.ret === 'number') { // 后台拒绝请求
      alert(error.error.message || ERR_MSG);
    } else {
      alert(ERR_MSG);
    }
    return throwError(error);
  }
}
