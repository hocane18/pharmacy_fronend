import { JsonPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-permissions-role-switching',
  templateUrl: './role.component.html',
  styleUrl: './role.component.scss',
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
    MatTableModule,
  ],
})
export class PermissionsRoleComponent implements OnInit, OnDestroy {
  private readonly rolesSrv = inject(NgxRolesService);
  private readonly permissionsSrv = inject(NgxPermissionsService);

  currentRole = '';

  currentPermissions: string[] = [];

  permissionsOfRole: Record<string, string[]> = {
    ADMIN: ['canAdd', 'canDelete', 'canEdit', 'canRead'],
    MANAGER: ['canAdd', 'canEdit', 'canRead'],
    GUEST: ['canRead'],
  };

  private readonly _destroy$ = new Subject<void>();
  roles: any[] = []; // Add this property to fix the template error
  isEditMode = false; // Add this property to fix the error
  roleForm: any = {}; // Add this property to fix the compile error

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

  // Add this method to handle editing a role
  editRole(role: any): void {
    this.isEditMode = true;
    this.roleForm = { ...role };
    // Open the dialog here if needed, e.g.:
    // this.dialog.open(this.roleDialog);
  }
  openAddRoleDialog(): void {
    // Implement dialog opening logic here, e.g. using MatDialog
    // Example:
    // this.dialog.open(this.roleDialog);
  }
  saveRole(): void {
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
