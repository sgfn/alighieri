defmodule Alighieri.BackendWeb.SubscriptionsController do
  use Alighieri.BackendWeb, :controller

  alias Alighieri.Backend.DeviceService
  alias Alighieri.{ChannelAddress, Subscription}

  action_fallback Alighieri.BackendWeb.FallbackController

  def show(conn, _params) do
    case DeviceService.list_subscriptions() do
      {:ok, subscriptions} ->
        conn
        |> put_resp_content_type("application/json")
        |> render("show.json", subscriptions: subscriptions)

      # TODO TODO TODO
      :error ->
        {:error, :service_unavailable, "Unable to communicate with the controller device"}
    end
  end

  def create(conn, params) do
    rx_name = params["receiver"]["device_name"]
    rx_channel = params["receiver"]["channel_name"]
    tx_name = params["transmitter"]["device_name"]
    tx_channel = params["transmitter"]["channel_name"]

    with false <- is_nil(rx_name) or is_nil(rx_channel) or is_nil(tx_name) or is_nil(tx_channel),
         spec <- %Subscription{
           receiver: %ChannelAddress{
             device_name: rx_name,
             channel_name: rx_channel
           },
           transmitter: %ChannelAddress{
             device_name: tx_name,
             channel_name: tx_channel
           }
         },
         :ok <- DeviceService.subscribe(spec) do
      conn
      |> put_resp_content_type("application/json")
      |> put_status(:created)
      |> render("create.json", subscription: spec)
    else
      true ->
        {:error, :bad_request, "Invalid request body structure"}

      # TODO TODO TODO
      :error ->
        {:error, :service_unavailable, "Unable to add subscription"}
    end
  end

  def delete(conn, params) do
    rx_name = params["receiver"]["device_name"]
    rx_channel = params["receiver"]["channel_name"]

    with false <- is_nil(rx_name) or is_nil(rx_channel),
         :ok <-
           DeviceService.unsubscribe(%ChannelAddress{
             device_name: rx_name,
             channel_name: rx_channel
           }) do
      send_resp(conn, :no_content, "")
    else
      true ->
        {:error, :bad_request, "Invalid request body structure"}
      {:error, :device_not_found} ->
        {:error, :not_found, "There is no device named `#{rx_name}`"}
      {:error, :channel_not_found} ->
        {:error, :not_found, "Device `#{rx_name}` has no channel `#{rx_channel}`"}
      # TODO TODO TODO
      _other ->
        {:error, :service_unavailable, "Unable to remove subscription"}
    end
  end
end
