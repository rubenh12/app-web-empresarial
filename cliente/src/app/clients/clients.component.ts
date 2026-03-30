import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsService, Client } from '../core/services/clients.service';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { Router } from '@angular/router';
import { SharedButtonComponent } from '../shared/components/button/button';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { ClientFormComponent } from './client-form.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, SharedButtonComponent, ModalComponent, ClientFormComponent],
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Clientes</h1>
        <app-shared-button 
          *ngIf="canCreateClients"
          label="Nuevo Cliente" 
          (click)="openCreateModal()"
          type="button"
          variant="secondary"
        />
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div *ngIf="isLoading()" class="p-6 text-center">
          <div class="text-gray-500">Cargando clientes...</div>
        </div>
        
        <div *ngIf="!isLoading() && clients().length === 0" class="p-6 text-center">
          <div class="text-gray-500">No hay clientes registrados</div>
        </div>

        <div class="overflow-x-auto">
          <table *ngIf="!isLoading() && clients().length > 0" class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let client of clients()" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ client.name }}</div>
                  <div class="text-sm text-gray-500">{{ client.company || 'Sin Empresa' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ client.email }}</div>
                  <div class="text-sm text-gray-500">{{ client.phone || 'Sin Teléfono' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    [ngClass]="client.status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ client.status | titlecase }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <!-- Escritorio -->
                  <div class="hidden md:flex justify-end gap-3">
                    <button 
                      *ngIf="canUpdateClients"
                      (click)="openEditModal(client.id)"
                      class="text-blue-600 hover:text-blue-900 font-semibold"
                    >
                      Editar
                    </button>
                    <button 
                      *ngIf="canDeleteClients"
                      (click)="deleteClient(client.id)"
                      class="text-red-600 hover:text-red-900 font-semibold"
                    >
                      Eliminar
                    </button>
                  </div>

                  <!-- Móvil -->
                  <button 
                    (click)="openActionsModal(client)" 
                    class="md:hidden p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <svg class="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal para confirmar eliminación -->
      <app-modal #deleteModal>
        <div class="text-center">
          <p class="mb-6">¿Estás seguro de que deseas eliminar este cliente?</p>
          <div class="flex justify-center gap-4">
            <app-shared-button label="Cancelar" type="button" (click)="closeDeleteModal()" />
            <app-shared-button label="Eliminar" type="button" (click)="confirmDelete()" variant="danger" />
          </div>
        </div>
      </app-modal>

      <!-- Modal para crear/editar clientes -->
      <app-modal #modal>
        <app-client-form 
          *ngIf="modal.isOpen()"
          [clientId]="editingClientId()"
          (onSuccess)="onFormSuccess()"
          (onCancel)="closeModal()"
        ></app-client-form>
      </app-modal>

      <!-- Modal para acciones móviles -->
      <app-modal #actionsModal>
        <div class="flex flex-col gap-4 p-2">
          <h3 class="text-lg font-bold text-slate-800 border-b pb-2 mb-2">{{ selectedClient()?.name }}</h3>
          <app-shared-button 
            *ngIf="canUpdateClients"
            label="Editar Cliente" 
            variant="secondary"
            (click)="closeActionsAndEdit()"
          />
          <app-shared-button 
            *ngIf="canDeleteClients"
            label="Eliminar Cliente" 
            variant="danger"
            (click)="closeActionsAndDelete()"
          />
          <app-shared-button 
            label="Cerrar" 
            variant="secondary"
            (click)="actionsModal.close()"
          />
        </div>
      </app-modal>
    </div>
  `
})
export class ClientsComponent implements OnInit {
  clients = signal<Client[]>([]);
  isLoading = signal(true);
  editingClientId = signal<string | null>(null);
  clientToDelete = signal<string | null>(null);
  selectedClient = signal<Client | null>(null);

  @ViewChild('modal') modal!: ModalComponent;
  @ViewChild('deleteModal') deleteModal!: ModalComponent;
  @ViewChild('actionsModal') actionsModal!: ModalComponent;

  constructor(
    private clientsService: ClientsService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadClients();
  }

  get canCreateClients() { return this.authService.hasPermission('CREAR_CLIENTES'); }
  get canUpdateClients() { return this.authService.hasPermission('ACTUALIZAR_CLIENTES'); }
  get canDeleteClients() { return this.authService.hasPermission('ELIMINAR_CLIENTES'); }

  loadClients() {
    this.isLoading.set(true);
    this.clientsService.findAll().subscribe({
      next: (data) => {
        this.clients.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openCreateModal() {
    this.editingClientId.set(null);
    this.modal.open({ title: 'Nuevo Cliente', size: 'md' });
  }

  openEditModal(id: string) {
    this.editingClientId.set(id);
    this.modal.open({ title: 'Editar Cliente', size: 'md' });
  }

  closeModal() {
    this.modal.close();
  }

  onFormSuccess() {
    this.closeModal();
    this.loadClients();
  }

  deleteClient(id: string) {
    this.clientToDelete.set(id);
    this.deleteModal.open({ title: 'Confirmar Eliminación', size: 'sm' });
  }

  closeDeleteModal() {
    this.deleteModal.close();
    this.clientToDelete.set(null);
  }

  confirmDelete() {
    const id = this.clientToDelete();
    if (id) {
      this.clientsService.remove(id).subscribe({
        next: () => {
          this.toastService.success('Cliente eliminado correctamente');
          this.closeDeleteModal();
          this.loadClients();
        },
        error: () => {
          this.toastService.error('Error al eliminar el cliente');
          this.closeDeleteModal();
        }
      });
    }
  }

  openActionsModal(client: Client) {
    this.selectedClient.set(client);
    this.actionsModal.open({ title: 'Acciones de Cliente', size: 'sm' });
  }

  closeActionsAndEdit() {
    const client = this.selectedClient();
    this.actionsModal.close();
    if (client) {
      this.openEditModal(client.id);
    }
  }

  closeActionsAndDelete() {
    const client = this.selectedClient();
    this.actionsModal.close();
    if (client) {
      this.deleteClient(client.id);
    }
  }
}
