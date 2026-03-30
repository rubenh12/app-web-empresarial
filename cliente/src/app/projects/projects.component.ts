import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsService, Project } from '../core/services/projects.service';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { SharedButtonComponent } from '../shared/components/button/button';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { ProjectFormComponent } from './project-form.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, SharedButtonComponent, ModalComponent, ProjectFormComponent],
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Proyectos</h1>
        <app-shared-button 
          *ngIf="canCreateProjects"
          label="Nuevo Proyecto" 
          (click)="openCreateModal()"
          type="button"
          variant="secondary"
        />
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div *ngIf="isLoading()" class="p-6 text-center">
          <div class="text-gray-500">Cargando proyectos...</div>
        </div>
        
        <div *ngIf="!isLoading() && projects().length === 0" class="p-6 text-center text-gray-500">
          No hay proyectos registrados
        </div>

        <div class="overflow-x-auto">
          <table *ngIf="!isLoading() && projects().length > 0" class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto / Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let p of projects()" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ p.name }}</div>
                  <div class="text-sm text-gray-500">{{ p.client?.name || 'Sin Cliente' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">Inicio: {{ p.startDate | date:'dd/MM/yyyy' }}</div>
                  <div class="text-sm text-gray-500">Fin: {{ p.endDate ? (p.endDate | date:'dd/MM/yyyy') : 'Abierto' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="getStatusClasses(p.status)"
                  >
                    {{ getStatusLabel(p.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    *ngIf="canUpdateProjects"
                    (click)="openEditModal(p.id)"
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Editar
                  </button>
                  <button 
                    *ngIf="canDeleteProjects"
                    (click)="deleteProject(p.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <app-modal #deleteModal>
        <div class="text-center">
          <p class="mb-6">¿Estás seguro de que deseas eliminar este proyecto?</p>
          <div class="flex justify-center gap-4">
            <app-shared-button label="Cancelar" type="button" (click)="closeDeleteModal()" />
            <app-shared-button label="Eliminar" type="button" (click)="confirmDelete()" variant="danger" />
          </div>
        </div>
      </app-modal>

      <app-modal #modal>
        <app-project-form 
          *ngIf="modal.isOpen()"
          [projectId]="editingProjectId()"
          (onSuccess)="onFormSuccess()"
          (onCancel)="closeModal()"
        ></app-project-form>
      </app-modal>
    </div>
  `
})
export class ProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);
  isLoading = signal(true);
  editingProjectId = signal<string | null>(null);
  projectToDelete = signal<string | null>(null);

  @ViewChild('modal') modal!: ModalComponent;
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  constructor(
    private projectsService: ProjectsService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() { this.loadProjects(); }

  get canCreateProjects() { return this.authService.hasPermission('crear:proyectos'); }
  get canUpdateProjects() { return this.authService.hasPermission('actualizar:proyectos'); }
  get canDeleteProjects() { return this.authService.hasPermission('eliminar:proyectos'); }

  loadProjects() {
    this.isLoading.set(true);
    this.projectsService.findAll().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openCreateModal() {
    this.editingProjectId.set(null);
    this.modal.open({ title: 'Gestión de Proyecto', size: 'lg' });
  }

  openEditModal(id: string) {
    this.editingProjectId.set(id);
    this.modal.open({ title: 'Gestión de Proyecto', size: 'lg' });
  }

  closeModal() { this.modal.close(); }

  onFormSuccess() {
    this.closeModal();
    this.loadProjects();
  }

  deleteProject(id: string) {
    this.projectToDelete.set(id);
    this.deleteModal.open({ title: 'Confirmar Eliminación', size: 'sm' });
  }

  closeDeleteModal() {
    this.deleteModal.close();
    this.projectToDelete.set(null);
  }

  confirmDelete() {
    const id = this.projectToDelete();
    if (id) {
      this.projectsService.remove(id).subscribe({
        next: () => {
          this.toastService.success('Proyecto eliminado');
          this.closeDeleteModal();
          this.loadProjects();
        },
        error: () => this.toastService.error('Error al eliminar')
      });
    }
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Proceso',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };
    return map[status] || status;
  }

  getStatusClasses(status: string): string {
    const map: any = {
      'pendiente': 'bg-slate-100 text-slate-500',
      'en_progreso': 'bg-blue-100 text-blue-600',
      'completado': 'bg-green-100 text-green-600',
      'cancelado': 'bg-red-100 text-red-500'
    };
    return map[status] || 'bg-gray-100';
  }
}
