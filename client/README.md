# Intelligence RAG Frontend

This is the frontend application for the Intelligence RAG (Retrieval Augmented Generation) system. It provides a user interface for uploading, searching, and analyzing intelligence documents using advanced AI techniques.

## Features

- **Document Management**: Upload, view, and manage intelligence documents
- **Semantic Search**: Search documents using natural language queries
- **Entity Extraction**: View and explore entities extracted from documents
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **React**: Frontend library for building user interfaces
- **TypeScript**: Type-safe JavaScript
- **Material UI**: Component library for consistent design
- **React Router**: For navigation between pages
- **Webpack**: For bundling and building the application

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory:
   ```
   cd client
   ```
3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

### Development

To start the development server:

```
npm start
```

or

```
yarn start
```

This will start the application in development mode at [http://localhost:3001](http://localhost:3001).

### Building for Production

To build the application for production:

```
npm run build
```

or

```
yarn build
```

This will create a `dist` directory with the compiled assets.

## Project Structure

```
client/
├── public/             # Static assets
├── src/                # Source code
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── App.tsx         # Main App component
│   └── index.tsx       # Entry point
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── webpack.config.js   # Webpack configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 