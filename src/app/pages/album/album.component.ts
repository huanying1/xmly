import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AlbumService, AlbumTrackArgs} from "../../services/apis/album.service";
import {combineLatest, forkJoin, Subject} from "rxjs";
import {AlbumInfo, Anchor, RelateAlbum, Track} from "../../services/apis/types";
import {CategoryService} from "../../services/business/category.service";
import {IconType} from "../../share/directives/icon/types";
import {first, takeUntil} from "rxjs/operators";
import {PlayerService} from "../../services/business/player.service";
import {MessageService} from "../../share/components/message/message.service";

interface MoreState {
  full: boolean,
  label: string,
  icon: IconType
}

@Component({
  selector: 'xm-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumComponent implements OnInit, OnDestroy {
  selectedTracks: Track[] = []
  albumInfo: AlbumInfo
  score: number
  anchor: Anchor
  relateAlbums: RelateAlbum[]
  tracks: Track[] = []
  total = 0
  trackParams: AlbumTrackArgs = {
    albumId: '',
    sort: 0,
    pageNum: 1,
    pageSize: 30
  }
  moreState: MoreState = {
    full: false,
    label: '显示全部',
    icon: 'arrow-down-line'
  }
  articleHeight: number
  private destroy$ = new Subject<void>()
  private currentTrack: Track
  private playing: boolean

  constructor(
    private route: ActivatedRoute,
    private albumServe: AlbumService,
    private categoryServe: CategoryService,
    private cdr: ChangeDetectorRef,
    private playerServe: PlayerService,
    private messageServe: MessageService
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.trackParams.albumId = this.route.snapshot.paramMap.get('albumId')
      this.initPageData()
      this.watchPlayer()
    })
  }

  play(needPlay: boolean): void {
    if (this.selectedTracks.length) {
      if (needPlay) {
        this.playerServe.playTracks(this.selectedTracks)
      } else {
        this.playerServe.addTracks(this.selectedTracks)
        this.messageServe.info('已添加')
      }
      this.setAlbumInfo()
      this.checkAllChange(false)
    } else {
      this.messageServe.warning('未选中任何曲目')
    }
  }

  private setAlbumInfo(): void {
    if (!this.currentTrack) {
      this.playerServe.setAlbum(this.albumInfo)
    }
  }

  watchPlayer(): void {
    combineLatest([
      this.playerServe.getCurrentTrack(),
      this.playerServe.getPlaying()
    ]).pipe(takeUntil(this.destroy$)).subscribe(([track, playing]) => {
      this.currentTrack = track
      this.playing = playing
      this.cdr.markForCheck()
    })
  }

  itemCls(id: number): string {
    let result = 'item-name '
    if (this.currentTrack) {
      if (this.playing) {
        if (this.currentTrack.trackId === id) {
          result += 'item-name-playing'
        }
      } else {
        if (this.currentTrack.trackId === id) {
          result += 'item-name-pause'
        }
      }
    }
    return result
  }

  toggleTrack(track: Track, act: 'play' | 'pause'): void {
    if (act === 'pause') {
      this.playerServe.setPlaying(false)
    } else {
      this.setAlbumInfo()
      this.playerServe.playTrack(track)
    }
  }

  playAll(): void {
    this.playerServe.setTracks(this.tracks)
    this.playerServe.setCurrentIndex(0)
    this.playerServe.setAlbum(this.albumInfo)
  }

  checkedChange(checked: boolean, track: Track): void {
    const targetIndex = this.selectedIndex(track.trackId)
    if (checked && targetIndex === -1) {
      this.selectedTracks.push(track)
    } else {
      if (targetIndex > -1) {
        this.selectedTracks.splice(targetIndex, 1)
      }
    }
  }

  isChecked(id: number): boolean {
    return this.selectedIndex(id) > -1
  }

  isCheckedAll(): boolean {
    if (this.selectedTracks.length >= this.tracks.length && this.selectedTracks.length !== 0) {
      return this.tracks.every(item => {
        return this.selectedIndex(item.trackId) > -1
      })
    }
    return false
  }

  private selectedIndex(id: number): number {
    return this.selectedTracks.findIndex(item => item.trackId === id)
  }

  checkAllChange(checked): void {
    this.tracks.forEach(item => {
      const targetIndex = this.selectedIndex(item.trackId)
      if (checked && targetIndex === -1) {
        this.selectedTracks.push(item)
      } else {
        if (targetIndex > -1) {
          this.selectedTracks.splice(targetIndex, 1)
        }
      }
    })
  }

  changePage(page: number): void {
    if (this.trackParams.pageNum !== page) {
      this.trackParams.pageNum = page
      this.updateTracks()
    }
  }

  updateTracks(): void {
    this.albumServe.tracks(this.trackParams).subscribe((res) => {
      this.tracks = res.tracks
      this.total = res.trackTotalCount
      this.cdr.markForCheck()
    })
  }

  toggleMore() {
    this.moreState.full = !this.moreState.full
    if (this.moreState.full) {
      this.moreState.label = '收起'
      this.moreState.icon = 'arrow-up-line'
    } else {
      this.moreState.label = '展开全部'
      this.moreState.icon = 'arrow-down-line'
    }

  }

  private initPageData(): void {
    forkJoin([
      this.albumServe.album(this.trackParams.albumId),
      this.albumServe.albumScore(this.trackParams.albumId),
      this.albumServe.relateAlbums(this.trackParams.albumId)
    ]).pipe(first()).subscribe(([albumInfo, score, relateAlbum]) => {
      this.albumInfo = {...albumInfo.mainInfo, albumId: albumInfo.albumId}
      this.score = score / 2
      this.anchor = albumInfo.anchorInfo
      this.updateTracks()
      this.relateAlbums = relateAlbum.slice(0, 10)
      this.categoryServe.getCategory().pipe(first()).subscribe(category => {
        const {categoryPinyin} = this.albumInfo.crumbs
        if (category !== categoryPinyin) {
          this.categoryServe.setCategory(categoryPinyin)
        }
      })
      this.categoryServe.setSubCategory([this.albumInfo.albumTitle])
      this.cdr.markForCheck()
    })
  }

  trackByTracks(index: number, item: Track): number {
    return item.trackId
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
