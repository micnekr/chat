module.exports = {
  apps: [{
    name: "server",
    script: "./server.js",
    ignore_watch: ["log", "data.sql"],
    watch: false,
    watch_options: {
      followSymlinks: false
    },
    error_file: "./log/err.log",
    out_file: "./log/out.log"
  }]
}