import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {AlbumArgs, AlbumService, CategoryInfo} from "../../services/apis/album.service";
import {MetaValue, SubCategory} from "../../services/apis/types";
import {ActivatedRoute, Router} from "@angular/router";
import {CategoryService} from "../../services/business/category.service";
import {withLatestFrom} from "rxjs/operators";

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
  categoryInfo: CategoryInfo;
  checkedMetas: CheckedMeta[] = []

  constructor(
    private albumsServe: AlbumService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private categoryServe: CategoryService,
    private router: Router
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
        this.updatePageData()
      })
  }

  changeSubCategory(subCategory?: SubCategory): void {
    if (this.searchParams.subcategory !== subCategory?.code) {
      this.searchParams.subcategory = subCategory?.code || ''
      //点击回全部时清空子分类
      subCategory?.displayValue ? this.categoryServe.setSubCategory([subCategory.displayValue]) : this.categoryServe.setSubCategory([])
      this.updatePageData()
    }
  }

  changeMeta(row, meta): void {
    console.log('row', row)
    console.log('item', meta)
    this.checkedMetas.push({
      metaRowId:row.id,
      metaRowName:row.name,
      metaId:meta.id,
      metaName:meta.displayName
    })
  }

  showMetaRow(name:string):boolean {
    if (this.checkedMetas.length) {
      return this.checkedMetas.findIndex(item => item.metaRowName === name) === -1
    }
    return true
  }
  unCheckMeta(meta:CheckedMeta | 'clean'):void  {
    if (meta === 'clean') {
      this.checkedMetas = []
    } else {
      const targetIndex = this.checkedMetas.findIndex(item => {
        return (item.metaRowId === meta.metaRowId) && (item.metaId === meta.metaId)
      })
      if (targetIndex > -1) {
        this.checkedMetas.splice(targetIndex,1)
      }
    }
  }
  private updatePageData(): void {
    this.albumsServe.detailCategoryPageInfo(this.searchParams).subscribe(categoryInfo => {
      this.categoryInfo = categoryInfo
      this.cdr.markForCheck()
    })
  }

  trackBySubCategories(index: number, item: SubCategory): string {
    return item.code
  }

  trackByMetas(index: number, item: MetaValue): number {
    return item.id
  }

}
