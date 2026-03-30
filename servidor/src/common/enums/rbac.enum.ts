export enum RoleName {
  ADMIN = 'ADMIN',
  USUARIO = 'USUARIO',
}

export enum PermissionSlug {
  VER_USUARIOS = 'ver:usuarios',
  CREAR_USUARIOS = 'crear:usuarios',
  ACTUALIZAR_USUARIOS = 'actualizar:usuarios',
  ELIMINAR_USUARIOS = 'eliminar:usuarios',

  VER_CLIENTES = 'ver:clientes',
  CREAR_CLIENTES = 'crear:clientes',
  ACTUALIZAR_CLIENTES = 'actualizar:clientes',
  ELIMINAR_CLIENTES = 'eliminar:clientes',

  VER_PROYECTOS = 'ver:proyectos',
  VER_PROYECTOS_ASIGNADOS = 'ver:proyectos:asignados',
  CREAR_PROYECTOS = 'crear:proyectos',
  ACTUALIZAR_PROYECTOS = 'actualizar:proyectos',
  ELIMINAR_PROYECTOS = 'eliminar:proyectos',

  VER_TAREAS = 'ver:tareas',
  CREAR_TAREAS = 'crear:tareas',
  ACTUALIZAR_TAREAS = 'actualizar:tareas',
  ELIMINAR_TAREAS = 'eliminar:tareas',
}
