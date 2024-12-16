defmodule Alighieri.BackendWeb.ConfigController do
  use Alighieri.BackendWeb, :controller

  alias Alighieri.Backend.DeviceService
  alias Alighieri.{ChannelAddress, Subscription}

  action_fallback Alighieri.BackendWeb.FallbackController

  def show(conn, _params) do
    case DeviceService.get_config() do
      {:ok, config} ->
        conn
        |> put_resp_content_type("application/json")
        |> render("show.json", config: config)

      # TODO TODO TODO
      :error ->
        {:error, :service_unavailable, "Unable to fetch config"}
    end
  end

  def create(conn, params) do
    with {:ok, config} <- Map.fetch(params, "config"),
         :ok <- DeviceService.apply_config(config) do
      send_resp(conn, :no_content, "")
    else
      # TODO TODO TODO
      :error ->
        {:error, :service_unavailable, "Unable to apply config"}
    end
  end
end
