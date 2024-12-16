defmodule Alighieri.BackendWeb.Router do
  use Alighieri.BackendWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Alighieri.BackendWeb do
    pipe_through :api

    post "/dhcp", DhcpController, :config

    scope "/devices" do
      get "/", DevicesController, :index
      get "/:device_id", DevicesController, :show
      post "/:device_id/config", DevicesController, :config
    end
    post "/identify", DevicesController, :identify

    scope "/subscriptions" do
      resources("/", SubscriptionsController, only: [:show, :create, :delete], singleton: true)
    end

    scope "/channels" do
      get "/", ChannelsController, :show
    end

    scope "/config" do
      resources("/", ConfigController, only: [:show, :create], singleton: true)
    end
  end
end
