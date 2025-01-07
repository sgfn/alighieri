defmodule Alighieri.Controller.Client do
  @moduledoc false

  use GenServer

  require Logger

  alias Alighieri.Controller.{Configurator, DHCP, Identifier, Netaudio}
  alias Alighieri.Device

  @behaviour Alighieri.Client

  @rpc_timeout_ms 18_000

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  @impl Alighieri.Client
  def list_devices() do
    GenServer.call(__MODULE__, :list_devices)
  end

  @impl Alighieri.Client
  def subscribe(spec) do
    GenServer.call(__MODULE__, {:subscribe, spec}, @rpc_timeout_ms)
  end

  @impl Alighieri.Client
  def unsubscribe(rx_spec) do
    GenServer.call(__MODULE__, {:unsubscribe, rx_spec}, @rpc_timeout_ms)
  end

  @impl Alighieri.Client
  def config_device(device, options) do
    GenServer.call(__MODULE__, {:config_device, device, options}, @rpc_timeout_ms)
  end

  def config_dhcp(options) do
    GenServer.call(__MODULE__, {:config_dhcp, options})
  end

  def play_sound() do
    GenServer.call(__MODULE__, :play_sound, @rpc_timeout_ms)
  end

  def get_sample_rates(devices) do
    GenServer.call(__MODULE__, {:get_sample_rates, devices}, @rpc_timeout_ms)
  end

  def set_sample_rate(device, sample_rate) do
    GenServer.call(__MODULE__, {:set_sample_rate, device, sample_rate}, @rpc_timeout_ms)
  end

  @impl true
  def init(%{node: node}) do
    if Node.connect(node) == false,
      do: Logger.warning("Unable to connect to controller node #{inspect(node)}")

    {:ok, %{node: node}}
  end

  @impl true
  def handle_call(:list_devices, _from, state) do
    result =
      case do_rpc_call(state.node, Netaudio, :list_devices!) do
        {:ok, devices} -> {:ok, devices}
        _other -> :error
      end

    {:reply, result, state}
  end

  @impl true
  def handle_call({:get_sample_rates, devices}, _from, state) do
    result =
      case do_rpc_call(state.node, Configurator, :get_sample_rates!, [devices]) do
        {:ok, devices} -> {:ok, devices}
        _other -> :error
      end

    {:reply, result, state}
  end

  @impl true
  def handle_call({:set_sample_rate, device, sample_rate}, _from, state) do
    rpc_call(state, Configurator, :set_sample_rate, [device, sample_rate])
  end

  @impl true
  def handle_call({:subscribe, spec}, _from, state) do
    rpc_call(state, Netaudio, :subscribe, [spec])
  end

  @impl true
  def handle_call({:unsubscribe, rx_spec}, _from, state) do
    rpc_call(state, Netaudio, :unsubscribe, [rx_spec])
  end

  @impl true
  def handle_call({:config_device, device, options}, _from, state) do
    # HACK: normally we'd use netaudio, but it doesn't work
    #       this way, we can at least (maybe) change the sample rate
    # rpc_call(state, Netaudio, :config_device, [device_name, options])
    result =
      with {:ok, sample_rate} <- Keyword.fetch(options, :sample_rate),
           true <- sample_rate in Device.allowed_sample_rates(),
           {:ok, result} <- do_rpc_call(state.node, Configurator, :set_sample_rate, [device, sample_rate]) do
        result
      else
        _other -> :error
      end

    {:reply, result, state}
  end

  @impl true
  def handle_call({:config_dhcp, options}, _from, state) do
    rpc_call(state, DHCP, :apply_config, [options])
  end

  @impl true
  def handle_call(:play_sound, _from, state) do
    rpc_call(state, Identifier, :play_sound)
  end

  defp rpc_call(state, mod, fun, args \\ [], timeout \\ @rpc_timeout_ms) do
    result =
      case do_rpc_call(state.node, mod, fun, args, timeout) do
        {:ok, result} -> result
        _other -> :error
      end

    {:reply, result, state}
  end

  defp do_rpc_call(node, mod, fun, args \\ [], timeout \\ @rpc_timeout_ms) do
    try do
      {:ok, :erpc.call(node, mod, fun, args, timeout)}
    rescue
      e ->
        Logger.warning("RPC call to node #{node} failed: #{inspect(e)}")
        :error
    end
  end
end
