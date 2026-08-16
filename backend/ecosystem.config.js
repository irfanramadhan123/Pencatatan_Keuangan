module.exports = {
  apps: [
    {
      name: "backend-pencatatan-keuangan",
      script: "src/server.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
