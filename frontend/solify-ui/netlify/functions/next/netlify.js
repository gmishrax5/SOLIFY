// netlify/functions/next/netlify.js
const { builder } = require('@netlify/functions');

async function handler(event, context) {
  // Return a simple response for health checks
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Solify Music Platform</title>
          <meta http-equiv="refresh" content="0;url=/" />
        </head>
        <body>
          <p>Redirecting to homepage...</p>
        </body>
      </html>
    `,
  };
}

exports.handler = builder(handler);
