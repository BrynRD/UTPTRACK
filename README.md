# 🎓 UTP Track - Sistema de Seguimiento de Egresados

Sistema integral para el seguimiento y análisis de egresados de la Universidad Tecnológica del Perú (UTP).

## 📋 Características Principales

- **Dashboard Ejecutivo** con KPIs en tiempo real
- **Gestión de Egresados** con CRUD completo
- **Reportes y Estadísticas** interactivos
- **Visualizaciones Geográficas** con mapas del Perú
- **Sistema de Encuestas** para seguimiento laboral
- **Autenticación JWT** con roles de usuario
- **Exportación** de datos en PDF y Excel

## 🏗️ Arquitectura

### Frontend
- **Framework**: Next.js 15 con React
- **Lenguaje**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Autenticación**: JWT con Context API

### Backend
- **Framework**: Spring Boot 3
- **Lenguaje**: Java
- **Base de Datos**: MySQL/PostgreSQL
- **ORM**: JPA/Hibernate
- **Seguridad**: Spring Security + JWT

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- Java 17+
- Maven 3.6+
- MySQL/PostgreSQL

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/utptrack.git
cd utptrack
```

### 2. Configurar Backend
```bash
cd backend

# Configurar base de datos en application.properties
# Ejecutar las migraciones SQL (UTPTRACK.sql)

# Instalar dependencias y ejecutar
./mvnw spring-boot:run
```

### 3. Configurar Frontend
```bash
cd frontend

# Instalar dependencias
npm install
# o
pnpm install

# Ejecutar en desarrollo
npm run dev
# o 
pnpm dev
```

### 4. Acceder a la aplicación
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

## 🗂️ Estructura del Proyecto

```
UTPTRACK/
├── frontend/                 # Aplicación Next.js
│   ├── app/                  # App Router de Next.js
│   │   ├── admin/           # Páginas de administración
│   │   ├── dashboard/       # Dashboard del usuario
│   │   └── login/           # Autenticación
│   ├── components/          # Componentes React reutilizables
│   │   ├── admin/           # Componentes de administración
│   │   ├── dashboard/       # Componentes del dashboard
│   │   └── ui/              # Componentes UI base
│   └── hooks/               # Hooks personalizados
├── backend/                 # Aplicación Spring Boot
│   └── src/
│       ├── main/java/com/utp/utptrack/
│       │   ├── Controllers/ # Controladores REST
│       │   ├── Services/    # Lógica de negocio
│       │   ├── Models/      # Entidades JPA
│       │   ├── Repositories/# Repositorios de datos
│       │   └── Security/    # Configuración de seguridad
│       └── resources/       # Configuraciones y SQL
└── docs/                    # Documentación
```

## 🔐 Usuarios por Defecto

### Administrador
- **Usuario**: admin
- **Contraseña**: admin123

### Egresado
- **Usuario**: egresado
- **Contraseña**: egresado123

## 📊 Funcionalidades

### Dashboard Administrativo
- KPIs de empleabilidad en tiempo real
- Gráficos de empleabilidad por carrera
- Mapa geográfico interactivo de distribución de egresados
- Tendencias temporales de empleabilidad
- Lista de encuestas recientes

### Gestión de Egresados
- Crear, editar y eliminar perfiles de egresados
- Búsqueda y filtrado avanzado
- Gestión de roles y permisos
- Activación/desactivación de cuentas

### Reportes y Estadísticas
- Generación de reportes personalizados
- Filtros por carrera, sede, período
- Exportación en múltiples formatos (PDF, Excel)
- Visualizaciones interactivas

### Sistema de Encuestas
- Creación y gestión de encuestas
- Seguimiento de respuestas
- Análisis estadístico de resultados

## 🛠️ Tecnologías Utilizadas

### Frontend
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Lucide Icons

### Backend
- Spring Boot 3
- Spring Security
- Spring Data JPA
- JWT
- MySQL/PostgreSQL
- Maven

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte o consultas:
- 📧 Email: soporte@utptrack.com
- 📱 Teléfono: +51 1 234-5678
- 🌐 Web: https://utptrack.com

---

Desarrollado con ❤️ para la Universidad Tecnológica del Perú
