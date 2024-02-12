import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { of } from 'rxjs';
import { AdminLoginPageComponent } from './admin-login-page.component';

describe('AdminLoginPageComponent', () => {
    let component: AdminLoginPageComponent;
    let fixture: ComponentFixture<AdminLoginPageComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['checkAuthentication']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminLoginPageComponent],
            imports: [ReactiveFormsModule],
            providers: [{ provide: AuthService, useValue: authServiceSpy }, { provide: Router, useValue: routerSpy }, FormBuilder],
        });
        fixture = TestBed.createComponent(AdminLoginPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('login should reset form', () => {
        component.loginForm.setValue({ password: 'password' });
        authServiceSpy.checkAuthentication.and.returnValue(of(true));
        component.login();
        expect(component.loginForm.value.password).toBe(null);
        component.loginForm.setValue({ password: null });
        component.login();
        expect(component.loginForm.value.password).toBe(null);
    });

    it('login should navigate to admin quizzes if authenticated', () => {
        component.loginForm.setValue({ password: 'password' });
        authServiceSpy.checkAuthentication.and.returnValue(of(true));
        component.login();
        expect(authServiceSpy.checkAuthentication).toHaveBeenCalledWith('password');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['home/admin/quizzes']);
    });

    it('login should not navigate to admin quizzes if not authenticated', () => {
        component.loginForm.setValue({ password: 'password' });
        authServiceSpy.checkAuthentication.and.returnValue(of(false));
        component.login();
        expect(authServiceSpy.checkAuthentication).toHaveBeenCalledWith('password');
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
});
