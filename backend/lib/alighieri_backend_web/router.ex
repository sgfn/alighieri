defmodule Alighieri.BackendWeb.Router do
  use Alighieri.BackendWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", Alighieri.BackendWeb do
    pipe_through :api
  end
end
