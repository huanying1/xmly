import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer2,
  ViewChild,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import {empty, merge, of} from "rxjs";
import {first, pluck, switchMap} from "rxjs/operators";
import {OverlayRef, OverlayService} from "../../services/tools/overlay.service";
import {AbstractControl, FormBuilder, ValidationErrors, Validators} from "@angular/forms";
import {isPlatformBrowser} from "@angular/common";
import {animate, style, transition, trigger, AnimationEvent} from "@angular/animations";

interface FormControls {
  [key: string]: {
    control: AbstractControl
    showErr: boolean
    error: ValidationErrors
  }
}

@Component({
  selector: 'xm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('modalAnimate', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(100%)'
        }),
        animate('.3s', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ]),
      transition(':leave', [
        style({
          opacity: 1,
          transform: 'translateY(0)'
        }),
        animate('.4s', style({
          opacity: 0,
          transform: 'translateY(-100%)'
        }))
      ])
    ])
  ]
})
export class LoginComponent implements OnChanges {
  @Input() show = false
  @Output() hide = new EventEmitter<void>()
  private overlayRef: OverlayRef
  visible = false
  formValues = this.fb.group({
    phone: ['', [
      Validators.required,
      Validators.pattern(/^1\d{10}$/)
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(6)
    ]]
  })
  @ViewChild('modalWrap', {static: false}) private modalWrap: ElementRef

  constructor(
    private overlayServe: OverlayService,
    private rd2: Renderer2,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (this.show) {
      this.create()
    } else {
      this.visible = false
    }
  }

  submit() {
    console.log('submit')
  }

  create() {
    if (isPlatformBrowser(this.platformId)) {
      this.overlayRef = this.overlayServe.create({fade: true, center: true, backgroundColor: 'rgba(0,0,0,.32)'})
      merge(
        this.overlayRef.backdropClick(),
        this.overlayRef.backdropKeyUp().pipe(
          pluck('key'),
          switchMap(key => {
            return key.toUpperCase() === 'ESCAPE' ? of(key) : empty()
          })
        )
      ).pipe(first()).subscribe(() => {
        this.hide.emit()
      })
      this.visible = true
      setTimeout(() => {
        this.rd2.appendChild(this.overlayRef.container, this.modalWrap.nativeElement)
      }, 0)
    }
  }

  animationDone(event: AnimationEvent) {
    if (event.toState === 'void') {
      if (this.overlayRef) {
        this.overlayRef.dispose()
        this.overlayRef = null
      }
    }
  }

  get formControls(): FormControls {
    const {phone, password} = {
      phone: this.formValues.get('phone'),
      password: this.formValues.get('password')
    }
    return {
      phone: {
        control: phone,
        showErr: phone.touched && phone.invalid,
        error: phone.errors
      },
      password: {
        control: password,
        showErr: password.touched && password.invalid,
        error: password.errors
      }
    }
  }

}
