import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';

@Component({
    selector: 'app-admin-login-page',
    templateUrl: './admin-login-page.component.html',
    styleUrls: ['./admin-login-page.component.scss'],
})
export class AdminLoginPageComponent {
    loginForm: FormGroup = this.formBuilder.group({
        password: '',
    });

    constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router,
    ) {}

    login() {
        const PASSWORD = this.loginForm.value.password || '';
        this.loginForm.reset();

        this.authService.checkAuthentication(PASSWORD).subscribe((authenticated: boolean) => {
            if (authenticated) {
                this.router.navigate(['home/admin/quizzes']);
            }
        });
    }
}
