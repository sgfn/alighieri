import Config

if config_env() != :prod do
  if System.get_env("PHX_SERVER") do
    config :alighieri_backend, Alighieri.BackendWeb.Endpoint, server: true
  end
else
  # Force server in production
  config :alighieri_backend, Alighieri.BackendWeb.Endpoint, server: true

  {:ok, address} =
    to_charlist(System.get_env("ALI_LISTEN_ADDRESS") || "0.0.0.0") |> :inet.getaddr(:inet)

  port = String.to_integer(System.get_env("ALI_LISTEN_PORT") || "4000")

  config :alighieri_backend, :dns_cluster_query, System.get_env("DNS_CLUSTER_QUERY")

  config :alighieri_backend, Alighieri.BackendWeb.Endpoint,
    http: [ip: address, port: port],
    # ATM nothing uses the `url` and `secret_key_base`, so we just set them to some constant value
    url: [host: "example.com", port: 443, scheme: "https"],
    secret_key_base: "uIMS8mRiNchnuXwZOLa1YhzLSZXl9R+Sl/LbwjQPxUFBEBN+0LLNiJUc4XHRe021"
end

config :alighieri_controller, start_app: false

config :alighieri_backend,
  controller_node:
    System.get_env("ALI_DIST_CONTROLLER_NODE", "alicontroller@controller") |> String.to_atom(),
  node: System.get_env("ALI_DIST_NODE", "alighieri@backend") |> String.to_atom(),
  dist_cookie: System.get_env("ALI_DIST_COOKIE", "alighieri-cookie") |> String.to_atom(),
  username: System.get_env("ALI_USERNAME", "admin"),
  password: System.get_env("ALI_PASSWORD", "admin"),
  ident_device_name: System.get_env("ALI_IDENT_DEVICE_NAME", "no-such-device"),
  ident_device_channel: System.get_env("ALI_IDENT_DEVICE_CHANNEL", "CH1")
