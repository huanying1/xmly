import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef, Output, EventEmitter
} from '@angular/core';
import {User} from "../../services/apis/types";
import {DOCUMENT} from "@angular/common";
import {fromEvent} from "rxjs";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {ContextService} from "../../services/business/context.service";

@Component({
  selector: 'xm-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, AfterViewInit {
  user: User
  fix: boolean = false
  @Output() login = new EventEmitter<void>()
  @Output() logout = new EventEmitter<void>()

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private contextServe:ContextService,
  ) {
  }

  ngOnInit(): void {
    this.contextServe.getUser().subscribe(user => {
      this.user = user
      this.cdr.markForCheck()
    })
  }

  ngAfterViewInit(): void {
    fromEvent(this.doc, 'scroll')
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        const top = this.doc.documentElement.scrollTop
        const clientHeight = this.el.nativeElement.clientHeight
        if (top > clientHeight) {
          this.fix = true
        } else if (top === 0) {
          this.fix = false
        }
        this.cdr.markForCheck()
      })
  }
}
