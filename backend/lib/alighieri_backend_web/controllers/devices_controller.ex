defmodule Alighieri.BackendWeb.DevicesController do
  use Alighieri.BackendWeb, :controller

  alias Alighieri.Backend.DeviceService
  alias Alighieri.ChannelAddress

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

  def config(conn, %{"device_id" => device_id} = params) do
    device_options =
      [
        encoding: params["encoding"],
        gain_level: params["gain_level"],
        sample_rate: params["sample_rate"],
        latency: params["latency"]
      ]
      |> Keyword.reject(fn {_k, v} -> is_nil(v) end)

    with {:id, {id, _rem}} <- {:id, Integer.parse(device_id)},
         {:ok, _device} <- DeviceService.get_device(id),
         false <- Enum.empty?(device_options),
         :ok <- DeviceService.config_device(id, device_options) do
      send_resp(conn, :no_content, "")
    else
      {:id, :error} ->
        {:error, :bad_request, "Invalid device ID: expected integer, got `#{device_id}`"}

      {:error, :device_not_found} ->
        {:error, :not_found, "Device `#{device_id}` does not exist"}

      true ->
        {:error, :bad_request, "Invalid request body structure"}

      # TODO TODO TODO
      :error ->
        {:error, :service_unavailable, "Unable to configure device"}
    end
  end

  def identify(conn, params) do
    name = params["device_name"]
    channel = params["channel_name"]

    with false <- is_nil(name) or is_nil(channel) do
      DeviceService.identify(%ChannelAddress{device_name: name, channel_name: channel})
      send_resp(conn, :no_content, "")
    else
      :error ->
        {:error, :bad_request, "Invalid device ID: expected integer, got `#{device_id}`"}

      {:error, :device_not_found} ->
        {:error, :not_found, "Device `#{device_id}` does not exist"}
    end
  end
end
