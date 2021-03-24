import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
  ElementRef,
  Renderer2,
  ViewChild
} from '@angular/core';
import {empty, merge, of} from "rxjs";
import {first, pluck, switchMap} from "rxjs/operators";
import {OverlayRef, OverlayService} from "../../services/tools/overlay.service";
import {FormBuilder, Validators} from "@angular/forms";


@Component({
  selector: 'xm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit,AfterViewInit {
  private overlayRef:OverlayRef
  formValues = this.fb.group({
    phone: ['', [
      Validators.required,
      Validators.pattern(/^1\d{10}$/)
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(6)
    ]]
  });
  @ViewChild('modalWrap',{static:true}) private modalWrap:ElementRef
  constructor(
    private overlayServe:OverlayService,
    private rd2:Renderer2,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {

  }
  showOverlay() {
    this.overlayRef = this.overlayServe.create({fade: true,center:true,backgroundColor: 'rgba(0,0,0,.32)'})
    merge(
      this.overlayRef.backdropClick(),
      this.overlayRef.backdropKeyUp().pipe(
        pluck('key'),
        switchMap(key => {
          return key.toUpperCase() === 'ESCAPE' ? of(key) : empty()
        })
      )
    ).pipe(first()).subscribe(() => {
      this.hideOverlay()
    })
    this.rd2.appendChild(this.overlayRef.container,this.modalWrap.nativeElement)
  }

  hideOverlay():void {
    this.overlayRef.dispose()
    this.overlayRef = null
  }

  ngAfterViewInit(): void {
    this.showOverlay()
  }
}
