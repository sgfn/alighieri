defmodule Alighieri.Backend.DeviceService do
  @moduledoc false

  use GenServer

  require Logger

  alias Alighieri.{ChannelAddress, Subscription}
  alias Alighieri.Backend.DeviceService.State
  alias Alighieri.Controller.Client

  @device_fetch_interval_ms 15_000

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  def list_devices() do
    GenServer.call(__MODULE__, :list_devices)
  end

  def list_channels() do
    GenServer.call(__MODULE__, :list_channels)
  end

  def list_subscriptions() do
    GenServer.call(__MODULE__, :list_subscriptions)
  end

  def get_device(id) do
    GenServer.call(__MODULE__, {:get_device, id})
  end

  def subscribe(spec) do
    GenServer.call(__MODULE__, {:subscribe, spec})
  end

  def unsubscribe(rx_spec) do
    GenServer.call(__MODULE__, {:unsubscribe, rx_spec})
  end

  @impl true
  def init([%{node: node}]) do
    {:ok, _client} = Client.start_link(%{node: node})
    send(self(), :fetch_devices)

    {:ok, %State{}}
  end

  @impl true
  def handle_call(:list_devices, _from, state) do
    {:reply, {:ok, State.devices(state)}, state}
  end

  @impl true
  def handle_call(:list_channels, _from, state) do
    channels =
      state
      |> State.devices()
      |> Map.new(fn {_id, device} -> {device.name, device.channels} end)

    {:reply, {:ok, channels}, state}
  end

  @impl true
  def handle_call(:list_subscriptions, _from, state) do
    subscriptions =
      state
      |> State.devices()
      |> Map.values()
      |> Enum.flat_map(&Map.fetch!(&1, :subscriptions))

    {:reply, {:ok, subscriptions}, state}
  end

  @impl true
  def handle_call({:get_device, id}, _from, state) do
    {:reply, State.get_device(state, id: id), state}
  end

  @impl true
  def handle_call({:subscribe, %Subscription{} = spec}, _from, state) do
    with {:ok, receiver} <- State.get_device(state, name: spec.receiver.device_name),
         {:ok, transmitter} <- State.get_device(state, name: spec.transmitter.device_name),
         true <- spec.receiver.channel_name in receiver.channels.receivers,
         true <- spec.transmitter.channel_name in transmitter.channels.transmitters,
         # XXX: maybe verify further? e.g. is subscription already present?
         :ok <- Client.subscribe(spec) do
      # TODO: UPDATE STATE
      {:reply, :ok, state}
    else
      _other ->
        {:reply, :error, state}
    end
  end

  @impl true
  def handle_call({:unsubscribe, %ChannelAddress{} = rx_spec}, _from, state) do
    with {:ok, receiver} <- State.get_device(state, name: rx_spec.device_name),
         true <- rx_spec.channel_name in receiver.channels.receivers,
         # XXX: maybe verify further?
         :ok <- Client.unsubscribe(rx_spec) do
      # TODO: UPDATE STATE
      {:reply, :ok, state}
    else
      _other -> {:reply, :error, state}
    end
  end

  @impl true
  def handle_info(:fetch_devices, state) do
    Logger.debug("Start fetching devices")

    # XXX: consider refactoring into a dedicated fetcher module
    self_pid = self()
    _pid = spawn_link(fn -> fetch_devices(self_pid) end)
    Process.send_after(self(), :fetch_devices, @device_fetch_interval_ms)

    {:noreply, state}
  end

  @impl true
  def handle_info({:devices, devices}, state) do
    Logger.debug("Fetched device list")

    # TODO: remove nonexistent devices!
    state =
      Enum.reduce(devices, state, fn device, state ->
        State.put_device(state, device)
      end)
      |> Map.put(:last_fetch, System.monotonic_time(:millisecond))

    {:noreply, state}
  end

  defp fetch_devices(pid) do
    case Client.list_devices() do
      {:ok, devices} -> send(pid, {:devices, devices})
      error -> Logger.warning("Unable to fetch devices: #{inspect(error)}")
    end
  end
end
