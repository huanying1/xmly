import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {AlbumArgs, AlbumService, AlbumsInfo, CategoryInfo} from "../../services/apis/album.service";
import {Album, AlbumInfo, MetaValue, SubCategory} from "../../services/apis/types";
import {ActivatedRoute} from "@angular/router";
import {CategoryService} from "../../services/business/category.service";
import {withLatestFrom} from "rxjs/operators";
import {forkJoin} from "rxjs";
import {WindowService} from "../../services/tools/window.service";
import {storageKeys} from "../../config";
import {PlayerService} from "../../services/business/player.service";
import {main} from "@angular/compiler-cli/src/main";

interface CheckedMeta {
  metaRowId: number
  metaRowName: string
  metaId: number
  metaName: string
}

@Component({
  selector: 'xm-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumsComponent implements OnInit {
  searchParams: AlbumArgs = {
    category: '',
    subcategory: '',
    meta: '',
    sort: 0,
    page: 1,
    perPage: 30
  };
  total = 300
  categoryInfo: CategoryInfo
  checkedMetas: CheckedMeta[] = []
  albumsInfo: AlbumsInfo
  sorts: string[] = ['综合排序', '最近更新', '播放最多']

  constructor(
    private albumsServe: AlbumService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private categoryServe: CategoryService,
    private windowServe: WindowService,
    private playerServe: PlayerService
  ) {
  }

  ngOnInit(): void {
    //监听路由和分类，使路由和分类一至
    this.route.paramMap.pipe(withLatestFrom(this.categoryServe.getCategory()))
      .subscribe(([paramsMap, category]) => {
        const pinyin = paramsMap.get('pinyin')
        this.searchParams.category = pinyin
        this.searchParams.page !== 1 ? this.searchParams.page = 1 : ''
        let needSetStatus: boolean = false
        if (category !== pinyin) {
          this.categoryServe.setCategory(pinyin)
          this.clearSubCategory()
          this.unCheckMeta('clear')
        } else {
          const cacheSubCategory = this.windowServe.getStorage(storageKeys.subcategoryCode)
          const cacheMetas = this.windowServe.getStorage(storageKeys.metas)
          if (cacheSubCategory) {
            needSetStatus = true
            this.searchParams.subcategory = cacheSubCategory
          } else {
            this.clearSubCategory()
          }
          if (cacheMetas) {
            needSetStatus = true
            this.searchParams.meta = cacheMetas
          }
        }
        this.updatePageData(needSetStatus)
      })
  }

  playAlbum(event: MouseEvent, albumId: number): void {
    event.stopPropagation()
    this.albumsServe.album(albumId.toString()).subscribe(({mainInfo, tracksInfo}) => {
      this.playerServe.setTracks(tracksInfo.tracks)
      this.playerServe.setCurrentIndex(0)
      this.playerServe.setAlbum({...mainInfo, albumId})
    })

  }

  changeSubCategory(subCategory?: SubCategory): void {
    //点击回全部时清空子分类
    if (subCategory) {
      this.searchParams.subcategory = subCategory.code
      this.categoryServe.setSubCategory([subCategory.displayValue])
      this.windowServe.setStorage(storageKeys.subcategoryCode, this.searchParams.subcategory)
    } else {
      this.clearSubCategory()
    }
    this.searchParams.page = 1
    this.unCheckMeta('clear')
    this.updatePageData()
  }

  changeMeta(row, meta): void {
    this.checkedMetas.push({
      metaRowId: row.id,
      metaRowName: row.name,
      metaId: meta.id,
      metaName: meta.displayName
    })
    this.searchParams.meta = this.getMetaParams()
    this.searchParams.page = 1
    this.windowServe.setStorage(storageKeys.metas, this.searchParams.meta)
    this.updateAlbums()
  }

  getMetaParams(): string {
    let result = ''
    if (this.checkedMetas.length) {
      this.checkedMetas.forEach(item => {
        result += `${item.metaRowId}_${item.metaId}-`
      })
    }
    return result.slice(0, -1)
  }

  showMetaRow(name: string): boolean {
    if (this.checkedMetas.length) {
      return this.checkedMetas.findIndex(item => item.metaRowName === name) === -1
    }
    return true
  }

  unCheckMeta(meta: CheckedMeta | 'clear'): void {
    if (meta === 'clear') {
      this.checkedMetas = []
      this.searchParams.meta = ''
      this.windowServe.removeStorage(storageKeys.metas)
    } else {
      const targetIndex = this.checkedMetas.findIndex(item => {
        return (item.metaRowId === meta.metaRowId) && (item.metaId === meta.metaId)
      })
      if (targetIndex > -1) {
        this.checkedMetas.splice(targetIndex, 1)
        this.searchParams.meta = this.getMetaParams()
        this.windowServe.setStorage(storageKeys.metas, this.searchParams.meta)
      }
    }
    this.updateAlbums()
  }

  private updatePageData(needSetStatus: boolean = false): void {
    forkJoin([
      this.albumsServe.albums(this.searchParams),
      this.albumsServe.detailCategoryPageInfo(this.searchParams)
    ]).subscribe(([albumsInfo, categoryInfo]) => {
      this.albumsInfo = albumsInfo
      this.categoryInfo = categoryInfo
      if (needSetStatus) {
        this.setStatus(categoryInfo)
      }
      this.cdr.markForCheck()
    })
  }

  private updateAlbums(): void {
    this.albumsServe.albums(this.searchParams).subscribe(albumsInfo => {
      this.albumsInfo = albumsInfo
      this.total = albumsInfo.total
      this.cdr.markForCheck()
    })
  }

  changeSort(index: number): void {
    if (this.searchParams.sort !== index) {
      this.searchParams.sort = index
      this.updateAlbums()
    }
  }

  private clearSubCategory(): void {
    this.searchParams.subcategory = ''
    this.categoryServe.setSubCategory([])
    this.windowServe.removeStorage(storageKeys.subcategoryCode)
  }

  private setStatus({metadata, subcategories}): void {
    const subCategory = subcategories.findIndex(item => item.code === this.searchParams.subcategory)
    if (subCategory) {
      this.categoryServe.setSubCategory([subCategory.displayValue])
    }
    if (this.searchParams.meta) {
      const metasMap = this.searchParams.meta.split('-').map(item => item.split('_'))
      metasMap.forEach(meta => {
        const targetRow = metadata.find(row => row.id === Number(meta[0]))
        //从详情导航过来的标签不一定存在
        const {id: metaRowId, name, metaValues} = targetRow || metadata[0]
        const targetMeta = metaValues.find(item => item.id === Number(meta[1]))
        const {id, displayName} = targetMeta || metaValues[0]
        this.checkedMetas.push({
          metaRowId,
          metaRowName: name,
          metaId: id,
          metaName: displayName
        })
      })
    }
  }

  changePage(newPageNum: number): void {
    if (this.searchParams.page !== newPageNum) {
      this.searchParams.page = newPageNum
      this.updateAlbums()
    }
  }

  trackBySubCategories(index: number, item: SubCategory): string {
    return item.code
  }

  trackByMetas(index: number, item: MetaValue): number {
    return item.id
  }

  trackByAlbums(index: number, item: Album): number {
    return item.albumId
  }
}
