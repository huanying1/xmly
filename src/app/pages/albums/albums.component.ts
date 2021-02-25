import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {AlbumArgs, AlbumService, CategoryInfo} from "../../services/apis/album.service";
import {MetaValue, SubCategory} from "../../services/apis/types";
import {ActivatedRoute, Router} from "@angular/router";
import {CategoryService} from "../../services/business/category.service";
import {combineLatest} from "rxjs";


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
    combineLatest(
        this.route.paramMap,
        this.categoryServe.getCategory()
    ).subscribe(([paramsMap,category]) => {
      const pinyin = paramsMap.get('pinyin')
      if (category === pinyin) {
        this.searchParams.category = pinyin
        this.searchParams.subcategory = ''
        this.updatePageData()
      } else {
        //分类和参数不一样的情况，比如后退按钮
        this.categoryServe.setCategory(pinyin)
        this.router.navigateByUrl('/albums/' + pinyin)
      }
    })
    // this.updatePageData()
  }

  changeSubCategory(subCategory?: SubCategory): void {
    if (this.searchParams.subcategory !== subCategory?.code) {
      this.searchParams.subcategory = subCategory?.code || ''
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
