# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with hot reload (port 8000)
- `npm run prod` - Start production mode server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run host` - Start development server accessible from network
- `npm run server` - Run the build and deploy server (port 9000)

### Development Server Details
- Development server runs on port 8000 (`localhost:8000`)
- Deploy server runs on port 9000 for build automation
- Hot reload is enabled for all modes
- Network access available via `--host` flag

### Testing & Deployment
- The project includes an automated build and deployment system via `buildAndDeploy.js`
- Deployment creates a zip archive of the `dist` folder and uploads to a remote server
- API endpoint: `GET http://localhost:9000/api/deploy` triggers build and deploy process

## Architecture Overview

### Tech Stack
- **Frontend**: Vue 3 with Composition API
- **Build Tool**: Vite 6.3.3
- **Styling**: Tailwind CSS 4.1.5 with custom SCSS
- **UI Library**: Naive UI 2.39.0
- **State Management**: Pinia 2.2.2
- **Routing**: Vue Router 4.4.3
- **HTTP Client**: Axios 1.11.0
- **Internationalization**: Vue I18n 9.14.0

### Application Modules
The application is organized into distinct business modules:
- **Admin** (`/admin`) - Administrative functions, user management, system configuration
- **HRM** (`/hrm`) - Human Resource Management core functionality
- **Chat** (`/chat`) - Internal communication system
- **Attestation** (`/attestation`) - Employee certification and examination system
- **Docflow** (`/docflow`) - Document workflow and management
- **LMS** (`/lms`) - Learning Management System
- **Accountant** (`/accountant`) - Financial and accounting operations
- **Turnstile** (`/turnstile`) - Time tracking and access control
- **Hospital** (`/hospital`) - Medical services management

### Key Architecture Patterns

#### Service Layer Architecture
The application uses a comprehensive service layer pattern:
- Each business module has dedicated API services in `src/service/v1/[module]/`
- Central API service aggregation in `src/service/ApiService.js`
- Global `$ApiService` available throughout the application

#### Store Management
- Pinia stores organized by business domain in `src/store/modules/[domain]/`
- Custom reset store plugin for state management
- Stores follow domain-driven design principles

#### Routing Structure
- Modular routing with permission-based access control
- Route modules correspond to business modules
- Authentication guards on all protected routes
- Permission metadata attached to routes from navigation configuration

#### Component Organization
- Atomic design principles with reusable UI components in `src/components/ui/`
- Feature-specific components grouped by functionality
- Layout components for different application contexts
- Auto-imported Vue Composition API functions

### Key Features & Integrations

#### Document Management
- OnlyOffice integration for document editing
- PDF signature capabilities with `vue-signature-pad`
- Document viewer supporting multiple formats (PDF, DOCX, images)
- File upload and media viewer components

#### Internationalization
- Multi-language support (Uzbek, Russian, English)
- Naive UI locale integration
- Language-specific date formatting

#### Advanced UI Features
- Chart.js integration for data visualization
- ECharts for advanced charting
- Virtual scrolling for large datasets
- Pan/zoom functionality for images
- Signature pad for digital signatures
- Advanced cropping tools

### Environment Configuration
Environment variables are configured via `.env` files:
- `VITE_API_URL` - Backend API URL
- `VITE_APP_MODE` - Application mode (development/production)
- `VITE_OTP_EXPIRE_TIME` - OTP expiration time
- `VITE_OFFICE_SERVER` - OnlyOffice server URL
- `VITE_CALLBACK_URL` - Document callback URL

### Development Patterns

#### Auto-imports
- Vue Composition API functions auto-imported
- Vue Router functions auto-imported
- Pinia `defineStore` auto-imported

#### Styling Approach
- Tailwind CSS for utility-first styling
- Custom SCSS variables and mixins in `src/assets/scss/`
- Component-specific styling when needed
- Theme system with Naive UI integration

#### Permission System
The application implements a comprehensive permission system:
- Route-level permissions defined in navigation configuration
- Permission metadata automatically attached to router
- Role-based access control throughout the application

This HRM system is a comprehensive enterprise application handling multiple business domains with sophisticated document management, user authentication, and modular architecture designed for scalability and maintainability.