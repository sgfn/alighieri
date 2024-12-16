defmodule Alighieri.Controller.DHCP do
  @moduledoc false

  use GenServer

  require Logger

  @default_iface "eth0"

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, @default_config, name: __MODULE__)
  end

  def apply_config(config) do
    GenServer.call(__MODULE__, {:apply_config, config})
  end

  @impl true
  def init(config) do
    {iface, config} = Keyword.pop(config, :iface, @default_iface)
    Logger.debug("Starting DHCP server\nIface: #{inspect(iface)}\nConfig: #{inspect(config)}")
    {:ok, server} = DHCPServer.start_link(iface, config)

    {:ok, %{iface: iface, server: server}}
  end

  @impl true
  def handle_call({:apply_config, config}, _from, state) do
    Logger.debug("Restarting DHCP server\nConfig: #{inspect(config)}")
    :ok = DHCPServer.stop(state.server)
    {:ok, server} = DHCPServer.start_link(state.iface, config)

    {:reply, :ok, %{state | server: server}}
  end
end
