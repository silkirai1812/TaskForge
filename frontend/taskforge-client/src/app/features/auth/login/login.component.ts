import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';
  password = '';

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {

    this.errorMessage = '';

    // Validate form
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    this.loading = true;

    // Call backend login API
    this.authService.login(this.email, this.password).subscribe({

      next: (response) => {

        console.log('Login successful:', response);

        // Store authentication information
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId.toString());
        localStorage.setItem('userName', response.name);
        localStorage.setItem('userEmail', response.email);
        localStorage.setItem('userRole', response.role);

        this.loading = false;

        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      },

      error: (error) => {

        console.error('Login failed:', error);

        this.loading = false;

        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage = 'Unable to login. Please try again.';
        }
      }
    });
  }
}