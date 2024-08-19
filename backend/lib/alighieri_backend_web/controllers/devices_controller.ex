defmodule Alighieri.BackendWeb.DevicesController do
  use Alighieri.BackendWeb, :controller

  alias Alighieri.Backend.DeviceService

  action_fallback Alighieri.BackendWeb.FallbackController

  def index(conn, _params) do
    case DeviceService.list_devices() do
      {:ok, device_map} ->
        conn
        |> put_resp_content_type("application/json")
        |> render("index.json", device_map: device_map)

      # TODO TODO TODO
      :error ->
        {:error, :service_unavailable, "Unable to communicate with the controller device"}
    end
  end

  def show(conn, %{"device_id" => device_id}) do
    with {id, _rem} <- Integer.parse(device_id),
         {:ok, device} <- DeviceService.get_device(id) do
      conn
      |> put_resp_content_type("application/json")
      |> render("show.json", id: id, device: device)
    else
      :error ->
        {:error, :bad_request, "Invalid device ID: expected integer, got `#{device_id}`"}

      {:error, :device_not_found} ->
        {:error, :not_found, "Device `#{device_id}` does not exist"}
    end
  end
end
