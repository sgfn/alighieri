defmodule Alighieri.BackendWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :alighieri_backend

  @session_options [
    store: :cookie,
    key: "_alighieri_backend_key",
    signing_salt: "S034Sr3r",
    same_site: "Lax"
  ]

  plug Corsica,
    origins: "*",
    allow_headers: :all,
    allow_methods: :all

  plug :default_page

  plug Plug.Static,
    at: "/",
    from: :alighieri_backend,
    gzip: false

  if code_reloading? do
    plug Phoenix.CodeReloader
  end

  plug Plug.RequestId

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug Alighieri.BackendWeb.Router

  defp default_page(conn, _opts) do
    if conn.request_path == "/" do
      %{conn | request_path: "/alighieri/index.html", path_info: ["alighieri", "index.html"]}
    else
      conn
    end
  end
end
