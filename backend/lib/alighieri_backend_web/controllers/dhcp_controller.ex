defmodule Alighieri.BackendWeb.DhcpController do
  use Alighieri.BackendWeb, :controller

  alias Alighieri.Backend.DeviceService

  action_fallback Alighieri.BackendWeb.FallbackController

  def config(conn, params) do
    with {:ok, netmask} <- Map.fetch(params, "netmask"),
         {:ok, range_from} <- Map.fetch(params, "range_from"),
         {:ok, range_to} <- Map.fetch(params, "range_to"),
         :ok <- DeviceService.config_dhcp(netmask: netmask, range: {range_from, range_to}) do
      send_resp(conn, :no_content, "")
    else
      # TODO TODO TODO
      :error ->
        {:error, :service_unavailable, "Unable to configure DHCP server"}
    end
  end
end
