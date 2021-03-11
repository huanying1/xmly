import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path:'album/:albumId',
    loadChildren:() => import('./pages/album/album.module').then(m => m.AlbumModule),
    data:{title:'专辑详情'}
  },
  {path: '', redirectTo: '/albums/youshengshu', pathMatch: 'full'},
  {path: '**', redirectTo: '/albums/youshengshu'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
