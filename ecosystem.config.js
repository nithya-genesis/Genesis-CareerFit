
module.exports = {
  apps : [{
    name: "genesis-backend",
    script: "./.venv/bin/uvicorn",
    interpreter: "none",
    args: "server:app --host 0.0.0.0 --port 8000",
    cwd: "/home/genesisadmin/CareerFit/Genesis_carrier_fit-develop",
    autorestart: true,
    watch: false,
    env: {
      PYTHONPATH: "."
    }
  }]
}
