import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {AlbumService, AlbumTrackArgs} from "../../services/apis/album.service";
import {forkJoin} from "rxjs";
import {AlbumInfo, Anchor, RelateAlbum, Track} from "../../services/apis/types";
import {CategoryService} from "../../services/business/category.service";
import {IconType} from "../../share/directives/icon/types";

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
export class AlbumComponent implements OnInit {
  checked: boolean
  albumInfo: AlbumInfo
  score: number
  anchor: Anchor
  relateAlbums: RelateAlbum[]
  tracks: Track[] = []
  total = 0
  trackParams: AlbumTrackArgs = {
    albumId: '',
    sort: 1,
    pageNum: 1,
    pageSize: 30
  }
  moreState: MoreState = {
    full: false,
    label: '显示全部',
    icon: 'arrow-down-line'
  }
  articleHeight: number

  constructor(
    private route: ActivatedRoute,
    private albumServe: AlbumService,
    private categoryServe: CategoryService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.trackParams.albumId = this.route.snapshot.paramMap.get('albumId')
      this.initPageData()
    })

  }

  changePage(page: number): void {
    if (this.trackParams.pageNum !== page) {
      this.trackParams.pageNum = page
      this.updateTracks()
    }
  }

  updateTracks(): void {
    this.albumServe.tracks(this.trackParams).subscribe(({tracks,trackTotalCount}) => {
      this.tracks = tracks
      this.total = trackTotalCount
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
    ]).subscribe(([albumInfo, score, relateAlbum]) => {
      this.albumInfo = {...albumInfo.mainInfo, albumId: albumInfo.albumId}
      this.score = score
      this.anchor = albumInfo.anchorInfo
      this.tracks = albumInfo.tracksInfo.tracks
      this.total = albumInfo.tracksInfo.trackTotalCount
      this.relateAlbums = relateAlbum.slice(0, 10)
      this.categoryServe.getCategory().subscribe(category => {
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
}
