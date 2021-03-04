import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {AlbumArgs, AlbumService, AlbumsInfo, CategoryInfo} from "../../services/apis/album.service";
import {Album, MetaValue, SubCategory} from "../../services/apis/types";
import {ActivatedRoute, Router} from "@angular/router";
import {CategoryService} from "../../services/business/category.service";
import {withLatestFrom} from "rxjs/operators";
import {forkJoin} from "rxjs";

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
  categoryInfo: CategoryInfo
  checkedMetas: CheckedMeta[] = []
  albumsInfo: AlbumsInfo
  sorts: string[] = ['综合排序', '最近更新', '播放最多']

  constructor(
    private albumsServe: AlbumService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private categoryServe: CategoryService,
  ) {
  }

  ngOnInit(): void {
    //监听路由和分类，使路由和分类一至
    this.route.paramMap.pipe(withLatestFrom(this.categoryServe.getCategory()))
      .subscribe(([paramsMap, category]) => {
        const pinyin = paramsMap.get('pinyin')
        if (category !== pinyin) {
          this.categoryServe.setCategory(pinyin)
        }
        this.searchParams.category = pinyin
        this.searchParams.subcategory = ''
        this.categoryServe.setSubCategory([])
        this.unCheckMeta('clear')
        this.updatePageData()
      })
  }

  changeSubCategory(subCategory?: SubCategory): void {
    if (this.searchParams.subcategory !== subCategory?.code) {
      this.searchParams.subcategory = subCategory?.code || ''
      //点击回全部时清空子分类
      subCategory?.displayValue ? this.categoryServe.setSubCategory([subCategory.displayValue]) : this.categoryServe.setSubCategory([])
      this.unCheckMeta('clear')
      this.updatePageData()
    }
  }

  changeMeta(row, meta): void {
    this.checkedMetas.push({
      metaRowId: row.id,
      metaRowName: row.name,
      metaId: meta.id,
      metaName: meta.displayName
    })
    this.searchParams.meta = this.getMetaParams()
    this.updateAlbums()
  }

  getMetaParams(): string {
    let result = ''
    if (this.checkedMetas.length) {
      this.checkedMetas.forEach(item => {
        result += `${item.metaRowId}_${item.metaId}-`
      })
    }
    console.log(result.slice(0, -1))
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
    } else {
      const targetIndex = this.checkedMetas.findIndex(item => {
        return (item.metaRowId === meta.metaRowId) && (item.metaId === meta.metaId)
      })
      if (targetIndex > -1) {
        this.checkedMetas.splice(targetIndex, 1)
        this.searchParams.meta = this.getMetaParams()
      }
    }
    this.updateAlbums()
  }

  private updatePageData(): void {
    forkJoin([
      this.albumsServe.albums(this.searchParams),
      this.albumsServe.detailCategoryPageInfo(this.searchParams)
    ]).subscribe(([albumsInfo, categoryInfo]) => {
      this.albumsInfo = albumsInfo
      this.categoryInfo = categoryInfo
      console.log(albumsInfo)
      this.cdr.markForCheck()
    })
  }

  private updateAlbums(): void {
    this.albumsServe.albums(this.searchParams).subscribe(albumsInfo => {
      this.albumsInfo = albumsInfo
      this.cdr.markForCheck()
    })
  }

  changeSort(index: number): void {
    if (this.searchParams.sort !== index) {
      this.searchParams.sort = index
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
