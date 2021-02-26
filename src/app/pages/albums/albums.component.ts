import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {AlbumArgs, AlbumService, CategoryInfo} from "../../services/apis/album.service";
import {MetaValue, SubCategory} from "../../services/apis/types";
import {ActivatedRoute, Router} from "@angular/router";
import {CategoryService} from "../../services/business/category.service";
import {combineLatest} from "rxjs";
import {withLatestFrom} from "rxjs/operators";


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
