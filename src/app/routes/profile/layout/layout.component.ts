import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService, User } from '@core';
import { PageHeaderComponent } from '@shared';

@Component({
  selector: 'app-profile-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    TranslateModule,
    PageHeaderComponent,
    RouterOutlet,
  ],
})
export class ProfileLayoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  user: Partial<User> = {
    name: '',
    avatar: '',
  };

  ngOnInit() {
    this.authService.user().subscribe(user => {
      if (user) {
        this.user.name = user.name;
        this.user.avatar = user.avatar;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Create a FileReader to read the image
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          // Update the avatar preview
          this.user.avatar = e.target.result as string;
          
          // Here you would typically upload the file to your server
          // For example:
          // this.authService.updateProfilePicture(file).subscribe(
          //   response => {
          //     // Handle successful upload
          //     console.log('Profile picture updated successfully');
          //   },
          //   error => {
          //     // Handle error
          //     console.error('Error uploading profile picture:', error);
          //   }
          // );
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
