const fs = require('fs');
const path = require('path');

// Create a simple static build for Docker
const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ScholarTrack - Student Management System</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.3.67/css/materialdesignicons.css" />
    <style>
      body {
        font-family: 'Roboto', sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        text-align: center;
      }
      h1 {
        color: #1976D2;
        margin-bottom: 20px;
      }
      .status {
        padding: 20px;
        background: #E3F2FD;
        border-radius: 4px;
        margin: 20px 0;
      }
      .warning {
        background: #FFF3E0;
        border-left: 4px solid #FF9800;
        padding: 15px;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>ScholarTrack</h1>
      <div class="status">
        <h2>🚧 Under Construction</h2>
        <p>The ScholarTrack application is currently being deployed.</p>
        <p>Please check back in a few minutes.</p>
      </div>
      <div class="warning">
        <strong>Note:</strong> This is a temporary page while the full application is being built.
      </div>
      <p>Student Management System with Vue 3, Vuetify, and TypeScript</p>
    </div>
  </body>
</html>`;

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the static HTML file
fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);

console.log('Static build completed successfully!');
console.log('Created:', path.join(distDir, 'index.html'));
