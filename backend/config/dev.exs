import Config

config :alighieri_backend, Alighieri.BackendWeb.Endpoint,
  http: [ip: {0, 0, 0, 0}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "9uyyLcmB/g468dpjS5NWmokpbZG8icSDFNLM8HbVGw2Kg1RyqnpzkiC3fEX8xPK/",
  watchers: []

config :alighieri_backend, dev_routes: true
config :logger, :console, format: "[$level] $message\n"
config :phoenix, :stacktrace_depth, 20
config :phoenix, :plug_init_mode, :runtime
