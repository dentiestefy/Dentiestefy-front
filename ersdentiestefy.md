# **Documento de Especificación de Requerimientos (ERS) \- MVP DentiEstefy**

## **1\. Introducción**

**DentiEstefy** es una plataforma SaaS odontológico-clínica orientada a la administración y organización eficiente de los flujos de trabajo diarios de una clínica. Este documento define los requerimientos para el Producto Mínimo Viable (MVP), basándose en un diseño estandarizado por componentes (creado previamente).

## **2\. Descripción de Usuarios (Roles)**

El sistema operará bajo un modelo de Control de Acceso Basado en Roles (RBAC) con tres perfiles principales:

* **Administrador (Admin):** Acceso global a la plataforma. Puede ver, editar y gestionar todos los módulos sin restricciones.  
* **Doctor:** Enfoque clínico y financiero personal. Accede a su agenda, evoluciones de sus pacientes y su contabilidad individual.  
* **Secretaria:** Enfoque administrativo. Gestiona la agenda general de la clínica y tiene permisos de visualización en el módulo de usuarios.

---

## **3\. Requerimientos Funcionales por Módulo (Basados en Diseño UI/UX)**

### **3.1. Módulo: Agenda**

* **RF-AG-01 (Vista Principal):** El sistema debe mostrar una interfaz de calendario interactivo.  
* **RF-AG-02 (Creación):** Debe existir un botón "Nueva Cita" que despliegue un Modal de creación. Al guardar, la cita debe renderizarse visualmente en la franja horaria correspondiente del calendario.  
* **RF-AG-03 (Interacción y Edición):** Al hacer clic sobre una cita renderizada, se abrirá un Modal con el detalle. Este Modal debe contener opciones para "Editar" (cambiando la vista a modo formulario) y "Eliminar".  
* **RF-AG-04 (Permisos):** Las secretarias y administradores pueden crear, editar y eliminar. Los doctores solo pueden visualizar sus citas y sus detalles.

### **3.2. Módulo: Perfil**

* **RF-PE-01 (Tarjeta de Perfil):** Debe mostrar la información del usuario en sesión. Debe incluir botones para "Editar" (modificar datos/contraseña) y "Ver Detalle" (abre un Modal expandido).  
* **RF-PE-02 (Tabla de Actividad Diaria):** Debajo de la tarjeta, una tabla estandarizada mostrará:  
  * *Para Doctores:* Sus citas programadas para el día actual.  
  * *Para Secretarias:* Las citas que ella agendó en el día actual.

### **3.3. Módulo: Evoluciones (Exclusivo Doctor/Admin)**

* **RF-EV-01 (Buscador y Listado):** Vista con un buscador superior y una tabla que lista los pacientes del doctor en sesión. Columnas: *Nombre, Última Atención, Estado, Acción ("Ver evoluciones")*.  
* **RF-EV-02 (Filtros):** Un filtro de estado que muestre "Activo" por defecto, con opción a cambiar a "Finalizado".  
* **RF-EV-03 (Vista de Detalle del Paciente):** Al hacer clic en "Ver evoluciones", la pantalla se divide en:  
  * **Perfil del Paciente:** Muestra info personal/médica, botón para editar y un selector para cambiar el estado (Activo/Finalizado).  
  * **Historial (Cards):** Tarjetas iterables con atenciones pasadas. Cada tarjeta tiene un botón "Ver detalle" que abre un Modal con el trabajo realizado.  
  * **Nueva Evolución:** Botón para "Agregar evolución" en una nueva atención.

### **3.4. Módulo: Contabilidad (Exclusivo Doctor/Admin)**

* **RF-CO-01 (Métricas):** Parte superior con KPIs dinámicos: Monto total acumulado y Cantidad de atenciones, filtrables mediante un selector de periodo (Mes/Semana).  
* **RF-CO-02 (Tabla de Ingresos):** Tabla que lista los pacientes atendidos, con fecha y monto.  
* **RF-CO-03 (Ingreso Manual):** Si una atención tiene el monto en blanco, la celda correspondiente debe renderizar un *input* para que el doctor ingrese y guarde el valor manualmente.

### **3.5. Módulo: Usuarios (Secretaria visualiza, Admin gestiona)**

* **RF-US-01 (Gestión):** Tabla que lista a los usuarios del sistema. Permite ver detalles, editar roles y cambiar contraseñas (acciones exclusivas del Admin).

---

## **4\. Requerimientos de Datos y Backend (Relaciones)**

El diseño de la base de datos se basa en documentos intercomunicados para alimentar las interfaces fluidamente:

* **Lógica de Citas y Pacientes:** \* Al crear una `Cita`, el sistema verifica si el `Paciente` existe.  
  * Si NO existe: Crea un documento nuevo en la colección de `Pacientes` y vincula la cita.  
  * Si SÍ existe: Empuja (push) la nueva cita al array de atenciones del paciente existente.  
* **Alimentación de Vistas:**  
  * El documento general de `Paciente` alimenta directamente la tabla principal del módulo *Evoluciones*.  
  * Los documentos únicos de `Citas` son la fuente de verdad que alimenta la tabla inferior del módulo *Perfil* (citas del día) y la tabla del módulo *Contabilidad*.

---

## **5\. Requerimientos No Funcionales (Estándares de Diseño)**

* **RNF-01 (Consistencia UI):** Todas las tablas, modales, tarjetas, botones y campos de búsqueda deben consumir una única librería de componentes internos normalizados (Button, Modal, Table, etc.) para evitar discrepancias visuales.  
* **RNF-02 (Responsividad):** Las vistas principales (Agenda, Evoluciones) deben ser navegables en resoluciones de escritorio y tablet (enfoque de uso clínico en consultorio).

