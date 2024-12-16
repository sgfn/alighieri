import Config

config :alighieri_controller,
  netaudio_path: System.get_env("ALI_NETAUDIO_PATH", "netaudio") |> Path.expand(),
  node: System.get_env("ALI_DIST_NODE", "alicontroller@controller") |> String.to_atom(),
  dist_cookie: System.get_env("ALI_DIST_COOKIE", "alighieri-cookie") |> String.to_atom(),
  dhcp_iface: System.get_env("ALI_DHCP_IFACE", "eth0")
