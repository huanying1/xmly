import {Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, ElementRef} from '@angular/core';
import {AlbumInfo, Track} from "../../services/apis/types";
import {PlayerService} from "../../services/business/player.service";
import {iif} from "rxjs";

@Component({
  selector: 'xm-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerComponent implements OnInit {
  @Input() trackList: Track[] = []
  @Input() currentIndex = 0
  @Input() currentTrack: Track
  @Input() album: AlbumInfo
  @Input() playing = false
  private canPlay = false
  private audioEl: HTMLAudioElement
  hidePanel = false
  @ViewChild('audio', {static: true}) readonly audioRef: ElementRef

  constructor(private playerServe: PlayerService) {
  }

  ngOnInit(): void {
    console.log(this.currentTrack);
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
      const newIndex = index <  0 ? this.trackList.length - 1 : index
      this.updateIndex(newIndex)
    }
  }

  //单曲循环
  private loop() {
    this.audioEl.currentTime = 0
    this.play()
  }

  changePlay(index:number):void {
    if (this.currentIndex !== index) {
      this.updateIndex(index)
    }
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

  togglePanel(hide: boolean) {
    this.hidePanel = hide
  }

  private updateIndex(index: number): void {
    this.playerServe.setCurrentIndex(index)
    this.canPlay = false
  }

  canplay(): void {
    this.canPlay = true
    this.play()
  }

  ended(): void {

  }

  error(): void {

  }

  trackByTracks(index: number, item: Track): number {
    return item.trackId
  }
}
