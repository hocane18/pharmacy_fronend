import { Injectable, inject } from '@angular/core';
import { AuthService, User } from '@core/authentication';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { switchMap, tap } from 'rxjs';
import { Menu, MenuService } from './menu.service';

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  private readonly authService = inject(AuthService);
  private readonly menuService = inject(MenuService);
  private readonly permissonsService = inject(NgxPermissionsService);
  private readonly rolesService = inject(NgxRolesService);

  /**
   * Load the application only after get the menu or other essential informations
   * such as permissions and roles.
   */
  load() {
    return new Promise<void>((resolve, reject) => {
      this.authService
        .change()
        .pipe(
          tap(user => this.setPermissions(user)),
          tap(() => this.setMenu())
        )
        .subscribe({
          next: () => resolve(),
          error: () => resolve(),
        });
    });
  }

  private setMenu() {
    const menu: Menu[] = [
      {
        route: 'dashboard',
        name: 'Dashboard',
        type: 'link',
        icon: 'dashboard',
      },
      {
        route: 'sales',
        name: 'Sales',
        type: 'link',
        icon: 'shopping_cart',
      },
      {
        route: 'inventory',
        name: 'Inventory',
        type: 'link',
        icon: 'inventory',
      },
      {
        route: 'customers',
        name: 'Customers',
        type: 'link',
        icon: 'people',
      },
      {
        route: 'prescriptions',
        name: 'Prescriptions',
        type: 'link',
        icon: 'medical_services',
      },
      {
        route: 'reports',
        name: 'Reports',
        type: 'link',
        icon: 'assessment',
      },
      {
        route: 'settings',
        name: 'Settings',
        type: 'link',
        icon: 'settings',
      },
    ];
    this.menuService.set(menu);
  }

  private setPermissions(user: User) {
    // In a real app, you should get permissions and roles from the user information.
    const permissions = ['canAdd', 'canDelete', 'canEdit', 'canRead'];
    
    this.permissonsService.loadPermissions(permissions);
    this.rolesService.flushRoles();
    this.rolesService.addRoles({ ADMIN: permissions });

    // Tips: Alternatively you can add permissions with role at the same time.
    // this.rolesService.addRolesWithPermissions({ ADMIN: permissions });
  }
}
