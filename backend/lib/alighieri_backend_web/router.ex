defmodule Alighieri.BackendWeb.Router do
  use Alighieri.BackendWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", Alighieri.BackendWeb do
    pipe_through :api

    scope "/devices" do
      get "/", DevicesController, :index
      get "/:device_id", DevicesController, :show
    end

    scope "/subscriptions" do
      resources("/", SubscriptionsController, only: [:show, :create, :delete], singleton: true)
    end

    scope "/channels" do
      get "/", ChannelsController, :show
    end
  end
end
