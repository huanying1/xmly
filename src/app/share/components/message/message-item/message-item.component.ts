import {Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {XmMessageItemData} from "../types";
import {MessageComponent} from "../message.component";
import {Subscription, timer} from "rxjs";
import {animate, style, transition, trigger, AnimationEvent} from "@angular/animations";

@Component({
  selector: 'xm-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('moveUpMotion', [
      transition('* => enter', [
        style({
          opacity: 0,
          transform: 'translateY(-100%)'
        }),
        animate('.2s', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ]),
      transition('* => leave', [
        style({
          opacity: 1,
          transform: 'translateY(0)'
        }),
        animate('.2s', style({
          opacity: 0,
          transform: 'translateY(-100%)'
        }))
      ]),
    ])
  ]
})
export class MessageItemComponent implements OnInit, OnDestroy {
  @Input() message: XmMessageItemData
  @Input() index = 0
  private autoClose = true
  private timerSub: Subscription

  constructor(private parent: MessageComponent, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    const {duration} = this.message.options
    this.autoClose = this.message.options.duration > 0
    if (this.autoClose) {
      this.createTimer(duration)
    }
  }

  close(): void {
    this.message.state = 'leave'
    this.cdr.markForCheck()
  }

  private createTimer(duration: number): void {
    this.timerSub = timer(duration).subscribe(() => {
      this.close()
    })
  }

  animationDone(event: AnimationEvent): void {
    if (event.toState === 'leave') {
      this.parent.removeMessage(this.message.messageId)
    }
  }

  clearTimer(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe()
      this.timerSub = null
    }
  }

  enter(): void {
    if (this.autoClose && this.message.options.pauseOnHover) {
      this.clearTimer()
    }
  }

  leave(): void {
    if (this.autoClose && this.message.options.pauseOnHover) {
      this.createTimer(this.message.options.duration)
    }
  }

  get itemCls(): string {
    return 'xm-message clearfix ' + this.message.options.type
  }

  ngOnDestroy(): void {
    this.clearTimer()
  }
}
