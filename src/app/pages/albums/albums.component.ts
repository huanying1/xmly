import {Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {AlbumArgs, AlbumService, CategoryInfo} from "../../services/apis/album.service";

@Component({
  selector: 'xm-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumsComponent implements OnInit {
  searchParams: AlbumArgs = {
    category: 'youshengshu',
    subcategory: '',
    meta: '',
    sort: 0,
    page: 1,
    perPage: 30
  };
  categoryInfo: CategoryInfo;
  constructor(
      private albumsServe: AlbumService,
      private cdr:ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.updatePageData()
  }

  private updatePageData(): void {
    this.albumsServe.detailCategoryPageInfo(this.searchParams).subscribe(categoryInfo => {
      this.categoryInfo = categoryInfo
      console.log(this.categoryInfo)
      this.cdr.markForCheck()
    })
  }
}
