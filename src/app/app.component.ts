import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AlbumService} from "./services/apis/album.service";
import {AlbumInfo, Category, Track} from "./services/apis/types";
import {CategoryService} from "./services/business/category.service";
import {Router} from "@angular/router";
import {combineLatest} from "rxjs";
import {OverlayService} from "./services/tools/overlay.service";
import {WindowService} from "./services/tools/window.service";
import {UserService} from "./services/apis/user.service";
import {ContextService} from "./services/business/context.service";
import {storageKeys} from "./config";
import {MessageService} from "./share/components/message/message.service";
import {PlayerService} from "./services/business/player.service";

@Component({
  selector: 'xm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  currentCategory: Category
  categories: Category[] = []
  categoryPinyin: string = ''
  subCategory: string[] = []
  showLogin = false
  showPlayer = false
  playerInfo: {
    trackList: Track[]
    currentIndex: number
    currentTrack: Track
    album: AlbumInfo
    playing: boolean
  }

  constructor(
    private albumServe: AlbumService,
    private cdr: ChangeDetectorRef,
    private categoryServe: CategoryService,
    private router: Router,
    private overlayServe: OverlayService,
    private windowServe: WindowService,
    private userServe: UserService,
    private contextServe: ContextService,
    private messageServe: MessageService,
    private playerServe: PlayerService
  ) {

  }

  ngOnInit(): void {
    if (this.windowServe.getStorage(storageKeys.remember)) {
      this.userServe.userInfo().subscribe(({user, token}) => {
        this.contextServe.setUser(user)
        this.windowServe.setStorage(storageKeys.auth, token)
      }, error => {
        this.clearStorage()
        throw new Error(error)
      })
    }
    this.init()
    this.watchPlayer()
  }

  private init(): void {
    combineLatest([
      this.categoryServe.getCategory(),
      this.categoryServe.getSubCategory()
    ]).subscribe(([category, subCategory]) => {
      if (category !== this.categoryPinyin) {
        this.categoryPinyin = category
        if (this.categories.length) {
          this.setCurrentCategory()
        }
      }
      this.subCategory = subCategory
    })
    this.getCategories()
  }

  private watchPlayer(): void {
    combineLatest([
      this.playerServe.getTracks(),
      this.playerServe.getCurrentIndex(),
      this.playerServe.getCurrentTrack(),
      this.playerServe.getAlbum(),
      this.playerServe.getPlaying(),
    ]).subscribe(([trackList, currentIndex, currentTrack, album, playing]) => {
      this.playerInfo = {
        trackList,
        currentIndex,
        currentTrack,
        album,
        playing
      }
      if (currentTrack) {
        this.showPlayer = true
        this.cdr.markForCheck()
      }
    })
  }

  changeCategory(category) {
    this.router.navigateByUrl('/albums/' + category.pinyin)
  }

  private getCategories(): void {
    this.albumServe.categories().subscribe(categories => {
      this.categories = categories
      this.setCurrentCategory()
      this.cdr.markForCheck()
    })
  }

  private setCurrentCategory(): void {
    this.currentCategory = this.categories.find(item => item.pinyin === this.categoryPinyin)
  }

  logout(): void {
    this.userServe.logout().subscribe(() => {
      this.contextServe.setUser(null)
      this.clearStorage()
      this.messageServe.success('退出成功')
    })
  }

  clearStorage(): void {
    this.windowServe.removeStorage(storageKeys.remember)
    this.windowServe.removeStorage(storageKeys.auth)
  }
}
