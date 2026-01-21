# QR Code Attendance System

A full-stack web application that uses QR codes for automated attendance tracking. Lecturers generate unique QR codes for classes, students scan to mark attendance, and the system prevents duplicates with role-based authentication and preventing preventing proxy attendance using location-based verification.

## Features

- QR code generation for class sessions
- Real-time QR code scanning for attendance
- Duplicate attendance prevention
- Role-based authentication (Lecturer & Student)
- Attendance history and reports
- Responsive design (web & mobile)
- Session management and tracking

## Tech Stack

**Frontend**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React

**Backend**
- TBD

**Database**
- TBD

## Project Structure

```
attendance_system/
├── frontend/          # Next.js client application
│   ├── src/
│   │   ├── app/      # App router pages
│   │   └── components/
├── backend/           # API server (TBD)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Installation

1. Clone the repository
```bash
git clone git@github.com:Ama-Nkansah/QR-code-Attendance-system.git
cd QR-code-Attendance-system
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Running the Project

**Development mode:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Production build:**
```bash
npm run build
npm start
```

## Usage

**For Lecturers:**
1. Log in with lecturer credentials
2. Create a new class session
3. Generate QR code for the session
4. Display QR code to students
5. View attendance records

**For Students:**
1. Log in with student credentials
2. Scan the displayed QR code
3. Confirm attendance submission
4. View attendance history

## Screenshots

_Coming soon_

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/feature-name`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/feature-name`)
5. Open a Pull Request

## License

MIT

## Contributors                              
      
     Ama Nkansah  