import { JsonPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PageHeaderComponent } from '@shared';
// import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MtxGridColumn, MtxGridModule } from '@ng-matero/extensions/grid';
import { TranslateService } from '@ngx-translate/core';
import { MtxDialog } from '@ng-matero/extensions/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { environment } from '@env/environment';

@Component({
  selector: 'app-permissions-role-switching',
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
  imports: [
    FormsModule,
    MatButtonToggleModule,
    MatCardModule,
    PageHeaderComponent,
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MtxGridModule,
  ],
})
export class CategoryComponent implements OnInit, OnDestroy {
  @ViewChild('roleDialog') roleDialog: any;
  private readonly _destroy$ = new Subject<void>();

  private readonly rolesSrv = inject(NgxRolesService);
  private readonly permissionsSrv = inject(NgxPermissionsService);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);
  categories: {
    id: string;
    name: string;
    description: string;
    prodcuts: any[];
  }[] = [];
  currentRole = '';
  currentPermissions: string[] = [];
  isEditMode = false;
  roleForm: any = {
    name: '',
    description: '',
    permissions: [],
  };

  availablePermissions = [
    { id: 'canAdd', name: 'Add', description: 'Can add items' },
    { id: 'canDelete', name: 'Delete', description: 'Can delete items' },
    { id: 'canEdit', name: 'Edit', description: 'Can edit items' },
    { id: 'canRead', name: 'Read', description: 'Can read items' },
  ];

  roles: {
    id: string;
    name: string;
    description: string;
    permissions: {
      id: string;
      name: string;
      description: string;
    }[];
  }[] = [
    {
      id: '1',
      name: 'ADMIN',
      description: 'Administrator with full access',
      permissions: [
        { id: 'canAdd', name: 'Add', description: 'Can add items' },
        { id: 'canDelete', name: 'Delete', description: 'Can delete items' },
        { id: 'canEdit', name: 'Edit', description: 'Can edit items' },
        { id: 'canRead', name: 'Read', description: 'Can read items' },
      ],
    },
    {
      id: '2',
      name: 'MANAGER',
      description: 'Manager with limited access',
      permissions: [
        { id: 'canAdd', name: 'Add', description: 'Can add items' },
        { id: 'canEdit', name: 'Edit', description: 'Can edit items' },
        { id: 'canRead', name: 'Read', description: 'Can read items' },
      ],
    },
    {
      id: '3',
      name: 'GUEST',
      description: 'Guest with read-only access',
      permissions: [{ id: 'canRead', name: 'Read', description: 'Can read items' }],
    },
  ];

  columns: MtxGridColumn[] = [
    {
      header: this.translate.stream('name'),
      field: 'name',
      sortable: true,
      disabled: true,
      width: '100px',
    },
    {
      header: this.translate.stream('description'),
      field: 'description',
    },
    {
      header: this.translate.stream('operation'),
      field: 'operation',
      minWidth: 140,
      width: '140px',
      pinned: 'right',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'edit',
          tooltip: this.translate.stream('edit'),
          click: record => this.edit(record),
        },
        {
          type: 'icon',
          color: 'warn',
          icon: 'delete',
          tooltip: this.translate.stream('delete'),
          pop: {
            title: this.translate.stream('confirm_delete'),
            closeText: this.translate.stream('close'),
            okText: this.translate.stream('ok'),
          },
          click: record => this.delete(record),
        },
      ],
    },
  ];

  isLoading = false;
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
    this.currentRole = Object.keys(this.rolesSrv.getRoles())[0];
    this.currentPermissions = Object.keys(this.permissionsSrv.getPermissions());
    this.loadCategories();
  }

  openAddRoleDialog(): void {
    this.isEditMode = false;
    this.roleForm = {
      name: '',
      description: '',
      permissions: [],
    };

    const dialogRef = this.dialog.open(this.roleDialog, {
      width: '500px',
      data: { isEditMode: this.isEditMode, roleForm: this.roleForm },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveRole(result);
      }
    });
  }

  edit(role: any): void {
    this.isEditMode = true;
    this.roleForm = {
      ...role,
      permissions: [...role.permissions],
    };

    const dialogRef = this.dialog.open(this.roleDialog, {
      width: '500px',
      data: { isEditMode: this.isEditMode, roleForm: this.roleForm },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveRole(result);
      }
    });
  }

  delete(role: any): void {
    const index = this.roles.findIndex(r => r.id === role.id);
    if (index > -1) {
      this.roles.splice(index, 1);
    }
  }

  saveRole(roleData: any): void {
    if (this.isEditMode) {
      const index = this.roles.findIndex(r => r.id === roleData.id);
      if (index > -1) {
        this.roles[index] = roleData;
      }
    } else {
      const newRole = {
        ...roleData,
        id: (this.roles.length + 1).toString(),
      };
      this.roles.push(newRole);
    }
  }

  togglePermission(permission: any): void {
    const index = this.roleForm.permissions.findIndex((p: any) => p.id === permission.id);
    if (index > -1) {
      this.roleForm.permissions.splice(index, 1);
    } else {
      this.roleForm.permissions.push(permission);
    }
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.roleForm.permissions.some((p: any) => p.id === permissionId);
  }

  changeSelect(e: any) {
    console.log(e);
  }

  changeSort(e: any) {
    console.log(e);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
  loadCategories() {
    this.isLoading = true;
    const apiUrl = `${environment.apiUrl || ''}ProductAndCategory/categories`;
    const token = localStorage.getItem('ng-matero-token');

    fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token ? JSON.parse(token)['access_token'] || '' : ''}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        this.categories = data || [];
        console.log(this.categories);
        this.isLoading = false;
      })
      .catch(() => {
        this.isLoading = false;
      });
  }

  saveCategory(category: any) {
    this.isLoading = true;
    const apiUrl = `${environment.apiUrl || ''}ProductAndCategory/category`;
    const token = localStorage.getItem('ng-matero-token');

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token ? JSON.parse(token)['access_token'] || '' : ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    })
      .then(res => res.json())
      .then(data => {
        this.isLoading = false;
        this.loadCategories();
      })
      .catch(() => {
        this.isLoading = false;
      });
  }
}
