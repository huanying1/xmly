import {Component, Input, OnChanges, OnInit, Output, SimpleChanges,EventEmitter} from '@angular/core';
import {clamp} from 'lodash'
type PageItemType = 'page' | 'prev' | 'next' | 'prev5'| 'next5'

interface PageItem {
  type:PageItemType
  num?:number
  disabled?:boolean
}

@Component({
  selector: 'xm-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit,OnChanges {
  @Input() total:number = 0
  @Input() pageNum:number = 1
  @Input() pageSize:number = 10
  @Output() changed = new EventEmitter<number>()
  listOfPageItems:PageItem[] = []
  lastNum:number = 0
  constructor() {
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    this.lastNum = Math.ceil(this.total / this.pageSize) || 1
    this.listOfPageItems = this.getListOfPageBtns(this.pageNum,this.lastNum)
  }
  pageClick({disabled,type,num}:PageItem):void {
    if (!disabled) {
      let newPageNum = this.pageNum
      if (type === 'page') {
        newPageNum = num
      }else {
        const diff:object = {
          next:1,
          prev:-1,
          prev5:-5,
          next5:+5
        }
        newPageNum += diff[type]
      }
      this.changed.emit(clamp(newPageNum,1,this.lastNum))
    }
  }
  getListOfPageBtns(pageNum:number,lastNum:number):PageItem[] {
    if (this.lastNum <= 9) {
      return concatWithPrevNext(generatePage(1, lastNum), pageNum, lastNum)
    }else {
      const firstPageItem = generatePage(1,1)
      const lastPageItem = generatePage(lastNum,lastNum)
      const nextFiveItem = {type:'next5'}
      const prevFiveItem = {type:'prev5'}
      let listOfMidPages = []
      if (pageNum < 4) {
        listOfMidPages = [...generatePage(2,5),nextFiveItem]
      }else if(pageNum> lastNum - 4){
        listOfMidPages = [prevFiveItem,...generatePage(lastNum - 4,lastNum - 1)]
      } else {
        listOfMidPages = [prevFiveItem,...generatePage(pageNum - 2, pageNum + 2),nextFiveItem]
      }
      return concatWithPrevNext([
        ...firstPageItem,
        ...listOfMidPages,
        ...lastPageItem
      ],pageNum,lastNum)
    }
  }

  inputVal(num:number):void {
    if (num > 0) {
      this.pageClick({
        type:'page',
        num
      })
    }
  }

}
function generatePage(start:number,end:number):PageItem[] {
  const list = []
  for (let i = start; i <= end; i++) {
    list.push({
      num:i,
      type:'page'
    })
  }
  return list
}

function concatWithPrevNext(listOfPage:PageItem[],pageNum:number,lastName:number):PageItem[] {
  return [
    {
      type: 'prev',
      disabled: pageNum === 1,
    },
    ...listOfPage,
    {
      type: 'next',
      disabled: pageNum === lastName,
    }
  ]
}

