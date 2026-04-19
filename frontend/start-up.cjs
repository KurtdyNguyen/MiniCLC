const { spawn } = require("child_process");
const path = require("path");

console.log("Starting MiniCLC servers");

//run Python in virtual environment with libraries in that dir
const backend = spawn(".\\Scripts\\python.exe", ["app.py"], {
  cwd: path.join(__dirname, "../backend"),
  stdio: "inherit",
  shell: true
});

console.log("Backend starting on http://localhost:5000");

setTimeout(() => {
  console.log(" Starting frontend");
  
  const frontend = spawn("npm", ["run", "dev"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  process.on("SIGINT", () => {
    console.log("\nShutting down server...");
    backend.kill();
    frontend.kill();
    process.exit();
  });

}, 3000);