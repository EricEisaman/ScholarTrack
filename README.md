# ScholarTrack

A local-first student tracking application built with Vue 3, Vuetify 3.9, TypeScript, and Node.js with SQLite backend. Designed for teachers to manage student status tracking and behavioral events in real-time.

## Features

### 🎯 Core Functionality
- **Student Grid Interface**: Visual grid of student squares with rounded corners
- **Status Management**: Students can update their status (RESTROOM, OFFICE, COUNSELOR, LIBRARY, TEACHER VISIT)
- **Teacher Events**: Record behavioral incidents and rule violations
- **Local-First Architecture**: IndexedDB for offline functionality with sync capabilities
- **Multi-Class Support**: Manage multiple classes with easy switching

### 📊 Six Application Modes
1. **STANDARD**: Main student tracking interface
2. **ADD CLASS**: Create new classes
3. **ADD STUDENT**: Add students with unique labels and codes
4. **EDIT STUDENT**: Modify existing student information
5. **REMOVE STUDENT**: Delete students from the system
6. **REPORTS**: Generate PDF reports for student transactions and teacher events

### 🔐 Security Features
- Teacher code required for mode switching and class changes
- Student-specific 4-digit codes for status updates
- Secure modal interfaces for all administrative actions

### 📱 User Experience
- Responsive design optimized for iPad and desktop use
- Real-time status updates with color-coded student squares
- Toast notifications for successful actions
- Intuitive modal interfaces for all interactions

## Technology Stack

### Frontend
- **Vue 3** with Composition API
- **Vuetify 3.9** for Material Design components
- **TypeScript** for type safety
- **Pinia** for state management
- **IndexedDB** for local data storage
- **Vite** for fast development and building
- **ESLint** with Microsoft-endorsed rules

### Backend
- **Node.js 24** with Express
- **SQLite** for data persistence
- **TypeScript** for type safety
- **PDFKit** for report generation
- **CORS** and **Helmet** for security
- **ESLint** with Microsoft-endorsed rules

## Prerequisites

- Node.js 24 or higher
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ScholarTrack
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (client and server)
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in the root directory
   echo "NODE_ENV=development" > .env
   ```

## Development

### Start Development Servers
```bash
# Start both client and server in development mode
npm run dev
```

This will start:
- Client: http://localhost:3000 (Vite dev server)
- Server: http://localhost:5000 (Express API server)

### Development Scripts
```bash
# Start only the client
npm run client:dev

# Start only the server
npm run server:dev

# Type checking (after installing dependencies)
npm run type-check

# Linting
npm run lint:check

# Linting with auto-fix
npm run lint
```

## Building for Production

### Build the Application
```bash
# Build both client and server
npm run build
```

This will:
- Compile TypeScript server code to `dist/server/`
- Build Vue client to `client/dist/`
- Optimize assets for production

### Start Production Server
```bash
npm start
```

The production server will serve the built client files and handle API requests.

## Usage Guide

### For Teachers

#### Setting Up Classes
1. Switch to **ADD CLASS** mode (requires teacher code)
2. Enter a class name (e.g., "Math 101")
3. Confirm the creation

#### Adding Students
1. Switch to **ADD STUDENT** mode (requires teacher code)
2. Fill in student details:
   - **Label**: 2 letters (e.g., "JD", "SM")
   - **Code**: 4 digits (e.g., "1234")
   - **Emoji**: 1-2 characters (e.g., "😊", "🏃")
   - **Classes**: Select one or more classes
3. Preview the student square and confirm

#### Managing Student Status
1. In **STANDARD** mode, click on any student square
2. Enter the student's 4-digit code
3. Select a status (RESTROOM, OFFICE, etc.)
4. Click "Apply Status" to update

#### Recording Events
1. In **STANDARD** mode, click on a student square
2. Enter the teacher code (default: "1234")
3. Select an event type (PHONE OUT IN CLASS, BAD LANGUAGE, etc.)
4. Click "Record Event" to save

#### Generating Reports
1. Switch to **REPORTS** mode (requires teacher code)
2. Select report type (Student Transactions or Teacher Events)
3. Choose date range and optional class filter
4. Click "Generate Report" to download PDF

### For Students

#### Updating Status
1. Tap your student square on the iPad
2. Enter your 4-digit code
3. Select your destination (RESTROOM, OFFICE, etc.)
4. Click "Apply Status"
5. When returning, repeat the process and select "DEFAULT"

## Data Structure

### Student Object
```typescript
interface Student {
  id: string
  label: string        // 2 letters (e.g., "JD")
  code: string         // 4 digits (e.g., "1234")
  emoji: string        // 1-2 characters (e.g., "😊")
  classes: string[]    // Array of class names
  createdAt: string    // ISO timestamp
}
```

### Transaction Object
```typescript
interface Transaction {
  id?: number
  studentLabel: string
  status: StudentStatus
  timestamp: string
  className: string
  eventType?: TeacherEventType
}
```

### Status Types
- `DEFAULT`: Default student status (blue)
- `RESTROOM`: Student in restroom (orange)
- `OFFICE`: Student in office (red)
- `COUNSELOR`: Student with counselor (purple)
- `LIBRARY`: Student in library (green)
- `TEACHER VISIT`: Student visiting teacher (grey)

### Teacher Event Types
- `PHONE OUT IN CLASS`
- `BAD LANGUAGE`
- `OUT OF ASSIGNED SEAT`
- `HORSE PLAY`

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class

### Transactions
- `GET /api/transactions` - Get transactions with filters
- `POST /api/transactions` - Create new transaction

### Reports
- `POST /api/reports` - Generate PDF report

### Sync
- `POST /api/sync` - Sync local data with server

## Local-First Architecture

The application uses a local-first approach:
1. **IndexedDB** stores all data locally for offline functionality
2. **Real-time updates** work without internet connection
3. **Sync capabilities** when connection is available
4. **Automatic conflict resolution** for data consistency

## Security Considerations

- Teacher codes should be set via VITE_TEACHER_CODE environment variable
- Student codes should be unique and kept private
- All administrative actions require teacher authentication
- Data is stored locally with encryption capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript typing
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository.