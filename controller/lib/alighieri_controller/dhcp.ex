defmodule Alighieri.Controller.DHCP do
  @moduledoc false

  use GenServer

  require Logger

  @default_iface "eth0"
  @default_config [
    netmask: "255.255.255.0",
    range: {"10.0.0.100", "10.0.0.199"},
    gateway: "10.0.0.1",
    domain_servers: []
  ]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def apply_config(config) do
    GenServer.call(__MODULE__, {:apply_config, config})
  end

  @impl true
  def init(opts) do
    {:ok, server} = DHCPServer.start_link(@default_iface, @default_config)

    {:ok, %{server: server}}
  end

  @impl true
  def handle_call({:apply_config, config}, _from, %{server: server}) do
    :ok = DHCPServer.stop(server)
    {:ok, server} = DHCPServer.start_link(@default_iface, config)

    {:reply, :ok, %{server: server}}
  end
end
