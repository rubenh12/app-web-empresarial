import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  @Input() set hasPermission(permission: string | string[]) {
    this.updateView(permission);
  }

  constructor() {
    effect(() => {
      const currentPermissions = this.authService.permissions();
    });
  }

  private updateView(permission: string | string[]) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    const hasPerm = permissions.some(p => this.authService.hasPermission(p));

    if (hasPerm) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }
}
