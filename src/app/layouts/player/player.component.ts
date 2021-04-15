import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  OnChanges, SimpleChanges, Inject, Renderer2, AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import {AlbumInfo, Track} from "../../services/apis/types";
import {PlayerService} from "../../services/business/player.service";
import {animate, style, transition, trigger} from "@angular/animations";
import {DOCUMENT} from "@angular/common";
import set = Reflect.set;

const PANEL_HEIGHT = 280 //播放器的列表最大高度
const THUMBNAIL_WIDTH = 50 //播放器的专辑封面宽度

@Component({
  selector: 'xm-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('playerPanel', [
      transition(':enter', [
        style({
          opacity: 0,
          height: 0
        }),
        animate('.2s', style({
          opacity: 1,
          height: '*'
        }))
      ]),
      transition(':leave', [
        style({overflow: 'hidden'}),
        animate('.2s', style({
          opacity: 0,
          height: 0
        }))
      ])
    ])
  ]
})
export class PlayerComponent implements OnInit, OnChanges {
  private canPlay = false
  private audioEl: HTMLAudioElement
  showPanel = false
  isDown = false
  putAway = false //播放器是否收起在侧边
  private hostEL: HTMLElement
  isProsody = false //是否禁音
  isShow = false //是否显示音量控制面板
  currentVolume = 0
  private prevVolume: number = 0
  barHeight: number
  @Input() trackList: Track[] = []
  @Input() currentIndex = 0
  @Input() currentTrack: Track
  @Input() album: AlbumInfo
  @Input() playing = false
  @ViewChild('player', {static: true}) readonly playerRef: ElementRef
  @ViewChild('audio', {static: true}) readonly audioRef: ElementRef
  @Output() closed = new EventEmitter<void>()

  constructor(
    private playerServe: PlayerService,
    @Inject(DOCUMENT) private doc: Document,
    private rd2: Renderer2,
  ) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const {playing} = changes
    //playing发生了变化并且不是第一次变化才进入
    if (playing && !playing.firstChange) {
      if (playing.currentValue) {
        this.audioEl.play()
      } else {
        this.audioEl.pause()
      }
    }
  }

  isShowVolumeBar(event: MouseEvent): void {
    event.preventDefault()
    event.stopPropagation()
    const reg = /icon/g
    if (reg.test(event.target['className'])) {
      this.isShow = !this.isShow
      this.showPanel && !this.isDown ? this.showPanel = false : ''
    }
  }

  changeVolume(event: MouseEvent): void {
    event.preventDefault()
    event.stopPropagation()
    const target = event.target['nodeName']
    if (target === 'I') {
      //当前是否禁音
      if (this.isProsody) {
        this.isProsody = false
        this.prevVolume !== 0 ? this.setVolume(this.prevVolume) : this.setVolume(0.1)
      } else {
        this.isProsody = true
        this.prevVolume = this.currentVolume
        this.setVolume(0)
      }
    }
  }

  setVolume(volume: number): void {
    this.audioEl.volume = volume
    this.currentVolume = volume
    this.currentVolume === 0 ? this.isProsody = true : this.isProsody = false
  }

  play() {
    if (!this.audioEl) {
      this.audioEl = this.audioRef.nativeElement
    }
    this.audioEl.play()
    this.playerServe.setPlaying(true)
  }

  next(index: number): void {
    if (this.trackList.length === 1) {
      this.loop()
    } else {
      const newIndex = index > this.trackList.length - 1 ? 0 : index
      this.updateIndex(newIndex)
    }
  }

  prev(index: number): void {
    if (this.trackList.length === 1) {
      this.loop()
    } else {
      const newIndex = index < 0 ? this.trackList.length - 1 : index
      this.updateIndex(newIndex)
    }
  }

  //单曲循环
  private loop() {
    this.audioEl.currentTime = 0
    this.play()
  }

  changePlay(index: number): void {
    if (this.currentIndex !== index) {
      this.updateIndex(index)
    }
  }

  delete(delIndex: number): void {
    let newTracks = this.trackList.slice()
    let canPlay = true
    let newIndex = this.currentIndex
    if (newTracks.length <= 1) {
      newIndex = -1
      newTracks = []
    } else {
      if (delIndex < this.currentIndex) {
        newIndex--
      }
      if (delIndex === this.currentIndex) {
        if (this.playing) {
          if (!this.trackList[delIndex + 1]) {
            newIndex--
            canPlay = false
          }
        } else {
          newIndex = -1
          canPlay = false
        }
      }
      newTracks.splice(delIndex, 1)
    }
    this.playerServe.setTracks(newTracks)
    this.updateIndex(newIndex, canPlay)
  }

  togglePlay(): void {
    if (this.currentTrack) {
      if (this.canPlay) {
        const playing = !this.playing
        this.playerServe.setPlaying(playing)
        if (playing) {
          this.audioEl.play()
        } else {
          this.audioEl.pause()
        }
      }
    } else {
      if (this.trackList.length) {
        this.updateIndex(0)
      }
    }
  }

  togglePanel(show: boolean) {
    if (show) {
      const {top} = this.playerRef.nativeElement.getBoundingClientRect()
      this.isDown = top < (PANEL_HEIGHT - 10)
    }
    this.showPanel = show
    this.isShow && !this.isDown ? this.isShow = false : ''

  }

  private updateIndex(index: number, canPlay = false): void {
    this.playerServe.setCurrentIndex(index)
    this.canPlay = canPlay
  }

  canplay(): void {
    this.canPlay = true
    this.play()
  }

  ended(): void {
    this.playerServe.setPlaying(false)
    this.next(this.currentIndex + 1)
  }

  error(): void {
    this.playerServe.setPlaying(false)
  }

  trackByTracks(index: number, item: Track): number {
    return item.trackId
  }

  dragEnd(hostEl: HTMLElement): void {
    this.hostEL = hostEl
    const {width, height, left, top} = hostEl.getBoundingClientRect()
    const clientWidth = this.doc.documentElement.clientWidth
    const maxTop = this.doc.documentElement.clientHeight - height
    this.rd2.setStyle(hostEl, 'transition', 'all .2s')
    if (top < 0) {
      this.rd2.setStyle(hostEl, 'top', 0)
    }
    if (top > maxTop) {
      this.rd2.setStyle(hostEl, 'top', maxTop + 'px')
    }

    if (clientWidth - left <= width / 2) {
      this.rd2.setStyle(hostEl, 'left', (clientWidth - THUMBNAIL_WIDTH) + 'px')
      this.putAway = true
    }
  }

  hoverHost(): void {
    if (this.putAway) {
      const maxLeft = this.doc.documentElement.clientWidth - this.hostEL.getBoundingClientRect().width
      this.rd2.setStyle(this.hostEL, 'left', maxLeft + 'px')
      this.putAway = false
    }
  }
}
