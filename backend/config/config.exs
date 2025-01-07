import Config

config :alighieri_backend,
  namespace: Alighieri.Backend,
  generators: [timestamp_type: :utc_datetime]

config :alighieri_backend, Alighieri.BackendWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: Alighieri.BackendWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Alighieri.Backend.PubSub,
  live_view: [signing_salt: "tDfFiM3X"]

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

config :phoenix, :json_library, Jason

import_config "#{config_env()}.exs"
