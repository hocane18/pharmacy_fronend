import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { MtxGridColumn, MtxGridModule } from '@ng-matero/extensions/grid';
import { TranslateService } from '@ngx-translate/core';

import { PageHeaderComponent } from '@shared';

@Component({
  selector: 'app-table-kitchen-sink',
  templateUrl: './permissionview.component.html',
  styleUrl: './permissionview.component.scss',
  providers: [],
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatRadioModule,
    MtxGridModule,
    PageHeaderComponent,
    MatRadioModule,
    MatCardModule,
  ],
})
export class PermissionViewComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  //private readonly dataSrv = inject(TablesDataService);
  private readonly dialog = inject(MtxDialog);

  columns: MtxGridColumn[] = [
    {
      header: this.translate.stream('name'),
      field: 'name',
      sortable: true,
      disabled: true,
      //   minWidth: 100,
      width: '100px',
    },
    {
      header: this.translate.stream('Description'),
      field: 'weight',
      //   minWidth: 100,
    },
  ];
  list: any[] = [];
  isLoading = true;

  multiSelectable = false;
  rowSelectable = false;
  hideRowSelectionCheckbox = false;
  showToolbar = false;
  columnHideable = true;
  columnSortable = true;
  columnPinnable = true;
  rowHover = false;
  rowStriped = false;
  showPaginator = true;
  expandable = false;
  columnResizable = false;

  ngOnInit() {
    this.list = [];
    this.list = [
      { name: 'View Users', weight: 'Allows viewing user list', operation: '' },
      { name: 'Edit Users', weight: 'Allows editing user details', operation: '' },
      { name: 'Delete Users', weight: 'Allows deleting users', operation: '' },
      { name: 'Manage Roles', weight: 'Allows managing user roles', operation: '' },
    ];
    this.isLoading = false;
  }

  edit(value: any) {}

  delete(value: any) {
    this.dialog.alert(`You have deleted ${value.position}!`);
  }

  changeSelect(e: any) {
    console.log(e);
  }

  changeSort(e: any) {
    console.log(e);
  }

  enableRowExpandable() {
    this.columns[0].showExpand = this.expandable;
  }

  updateCell() {
    this.list = this.list.map(item => {
      item.weight = Math.round(Math.random() * 1000) / 100;
      return item;
    });
  }

  updateList() {
    this.list = this.list.splice(-1).concat(this.list);
  }
}
