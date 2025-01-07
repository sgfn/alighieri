import Config

config :logger, :console,
  format: "$time $metadata[$level] $message"

import_config "#{config_env()}.exs"
