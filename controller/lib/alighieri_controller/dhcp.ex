defmodule Alighieri.Controller.DHCP do
  @moduledoc false

  use GenServer

  require Logger

  @default_iface "eth0"

  def start_link(config) do
    GenServer.start_link(__MODULE__, config, name: __MODULE__)
  end

  def apply_config(config) do
    GenServer.call(__MODULE__, {:apply_config, config})
  end

  @impl true
  def init(config) do
    {iface, config} = Keyword.pop(config, :iface, @default_iface)
    config = prep_config(config)

    Logger.debug("Starting DHCP server\nIface: #{inspect(iface)}\nConfig: #{inspect(config)}")
    {:ok, server} = DHCPServer.start_link(iface, config)

    {:ok, %{iface: iface, server: server}}
  end

  @impl true
  def handle_call({:apply_config, config}, _from, state) do
    config = prep_config(config)
    Logger.debug("Restarting DHCP server\nConfig: #{inspect(config)}")
    :ok = DHCPServer.stop(state.server)
    {:ok, server} = DHCPServer.start_link(state.iface, config)

    {:reply, :ok, %{state | server: server}}
  end

  defp prep_config(config) do
    {faux_gateway, range_to} = Keyword.fetch!(config, :range)

    [a, b, c, d] = String.split(faux_gateway, ".")
    d = d |> String.to_integer() |> then(&(&1 + 1)) |> to_string()
    range_from = Enum.join([a, b, c, d], ".")

    [
      netmask: config[:netmask],
      range: {range_from, range_to},
      gateway: faux_gateway,
      domain_servers: []
    ]
  end
end
