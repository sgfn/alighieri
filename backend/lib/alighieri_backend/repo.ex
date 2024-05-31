defmodule Alighieri.Backend.Repo do
  use Ecto.Repo,
    otp_app: :alighieri_backend,
    adapter: Ecto.Adapters.SQLite3
end
