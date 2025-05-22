import { JsonPipe } from '@angular/common';
import { Component, OnDestroy, ViewChild, OnInit, inject } from '@angular/core';
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

import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-permissions-role-switching',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
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
    MatSelectModule,
    MatOptionModule,
    MtxGridModule,
  ],
})
export class UserComponent implements OnInit, OnDestroy {
  private readonly rolesSrv = inject(NgxRolesService);
  private readonly permissionsSrv = inject(NgxPermissionsService);
  @ViewChild('userDialog') userDialog: any;
  currentRole = '';
  rolesList: string[] = ['Admin', 'User', 'Manager'];
  currentPermissions: string[] = [];
  userModel: any = {}; // Add this line
  permissionsOfRole: Record<string, string[]> = {
    ADMIN: ['canAdd', 'canDelete', 'canEdit', 'canRead'],
    MANAGER: ['canAdd', 'canEdit', 'canRead'],
    GUEST: ['canRead'],
  };

  private readonly _destroy$ = new Subject<void>();
  private readonly translate = inject(TranslateService);
  //private readonly dataSrv = inject(TablesDataService);
  private readonly dialog = inject(MatDialog);
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

  // Add this property to fix the template error
  isEditMode = false; // Add this property to fix the error
  roleForm: any = {}; // Add this property to fix the compile error

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
      header: this.translate.stream('description'),
      field: 'description',
      //   minWidth: 100,
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

    this.rolesSrv.roles$.pipe(takeUntil(this._destroy$)).subscribe(roles => {
      console.log(roles);
    });
    this.permissionsSrv.permissions$.pipe(takeUntil(this._destroy$)).subscribe(permissions => {
      console.log(permissions);
    });
  }
  onProfileSelect(event: any): void {
    // Handle the profile selection here
    const file: File = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        // You can now use base64String as needed
        console.log('Base64:', base64String);
        // For example, assign to a property:
        // this.userModel.profileImage = base64String;
      };
      reader.readAsDataURL(file);
    }

    console.log('Profile selected:', event);
  }

  // Add this method to handle editing a role
  editRole(role: any): void {
    this.isEditMode = true;
    this.roleForm = { ...role };
    // Open the dialog here if needed, e.g.:
    // this.dialog.open(this.roleDialog);
  }
  openAddRoleDialog(): void {
    this.isEditMode = false;
    this.roleForm = {
      name: '',
      description: '',
      permissions: [],
    };

    const dialogRef = this.dialog.open(this.userDialog, {
      width: '500px',
      data: { isEditMode: this.isEditMode, roleForm: this.roleForm },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.saveUser();
      }
    });
  }

  edit(value: any) {
    this.openAddRoleDialog();
  }

  delete(value: any) {
    // this.dialog.alert(`You have deleted ${value.position}!`);
  }

  changeSelect(e: any) {
    console.log(e);
  }

  changeSort(e: any) {
    console.log(e);
  }
  saveUser(): void {
    // Implement your save logic here, e.g., call a service or update the roles array
    // Example:
    // if (this.isEditMode) {
    //   // Update existing role
    // } else {
    //   // Add new role
    // }
    // Close dialog if using MatDialogRef
  }
  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onPermissionChange() {
    this.currentPermissions = this.permissionsOfRole[this.currentRole];
    this.rolesSrv.flushRolesAndPermissions();
    this.rolesSrv.addRoleWithPermissions(this.currentRole, this.currentPermissions);
  }
}
