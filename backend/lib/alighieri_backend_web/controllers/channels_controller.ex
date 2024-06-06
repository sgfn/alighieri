defmodule Alighieri.BackendWeb.ChannelsController do
  use Alighieri.BackendWeb, :controller

  alias Alighieri.Backend.DeviceService

  action_fallback Alighieri.BackendWeb.FallbackController

  def show(conn, _params) do
    case DeviceService.list_channels() do
      {:ok, channels} ->
        conn
        |> put_resp_content_type("application/json")
        |> render("show.json", channels: channels)

      # TODO TODO TODO
      :error ->
        {:error, :service_unavailable, "Unable to communicate with the controller device"}
    end
  end
end
