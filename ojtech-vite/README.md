# OJTech Vite Migration

This project is a migration of the OJTech application from Next.js to Vite with React class components.

## Project Overview

OJTech is an AI-driven OJT (On-the-Job Training) Management Portal designed to connect Computer Studies students with relevant job opportunities through advanced matching algorithms. The platform serves three primary user groups: Students, Employers, and Administrators, with tailored experiences for each.

## Technology Stack

- **Frontend Framework**: Vite + React 18.2
- **Component Structure**: Class-based React components
- **Styling**: Tailwind CSS
- **State Management**: Class component state + React Context API
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **File Storage**: Cloudinary

## Migration Status

We're in the process of migrating the application from Next.js with functional components to Vite with class components. The current migration status can be found in [MIGRATION_STATUS.md](./src/MIGRATION_STATUS.md).

### Key Differences From Original App

1. **Class-Based Components**: All React components are now class-based instead of functional components.
2. **Routing**: Using React Router v6 instead of Next.js App Router.
3. **State Management**: Using class state instead of React hooks.
4. **Build Tool**: Using Vite instead of Next.js.
5. **API Handling**: Using direct API calls instead of Next.js's server actions.

### Migrated Features

- Basic authentication flow
- Job browsing interface
- Job detail page
- Core UI components

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Navigate to the project directory:
```bash
cd ojtech-vite
```

3. Install dependencies:
```bash
npm install --legacy-peer-deps
```

4. Create a `.env.local` file in the root directory and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
ojtech-vite/
├── public/             # Static assets
├── src/
│   ├── assets/         # Project assets (images, fonts, etc.)
│   ├── components/     # Reusable components
│   │   ├── ui/         # UI components
│   │   ├── jobs/       # Job-related components
│   │   └── auth/       # Authentication components
│   ├── lib/
│   │   └── utils/      # Utility functions
│   ├── pages/          # Page components
│   ├── providers/      # Context providers
│   ├── hooks/          # Custom hooks (for compatibility)
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Entry point
├── .env.local.example  # Example environment variables
├── index.html          # HTML template
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.ts      # Vite configuration
```

## Working with Class Components

If you're used to functional components with hooks, here's a quick guide to transitioning to class components:

| Functional Component Pattern | Class Component Equivalent                            |
|------------------------------|------------------------------------------------------|
| `useState`                   | Class state with `this.state` and `this.setState`    |
| `useEffect`                  | `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` |
| `useContext`                 | `static contextType` or `<Context.Consumer>`         |
| `useRef`                     | Create refs in constructor with `React.createRef()`  |
| `useMemo`                    | Implement caching patterns in class methods          |
| Custom hooks                 | Helper methods within the class or utility classes   |

## Development

### Building for Production

```bash
npm run build
```

### Previewing the Production Build

```bash
npm run preview
```

## Contributing to the Migration

If you want to help with the migration process:

1. Check the [MIGRATION_STATUS.md](./src/MIGRATION_STATUS.md) to see what needs to be migrated
2. Pick a component or page from the original Next.js app
3. Convert it to a class component following the pattern in existing files
4. Test the component thoroughly
5. Update the migration status document

## License

[MIT](LICENSE)
