defmodule Alighieri.Backend.DeviceService do
  @moduledoc false

  use GenServer

  require Logger

  alias Alighieri.{ChannelAddress, Controller, Subscription}
  alias Alighieri.Backend.DeviceService.State
  alias Alighieri.Backend.DummyClient

  @device_fetch_interval_ms 15_000
  @long_cmd_timeout_ms 20_000

  @my_device "DA11USB-859052"
  @my_channel "CH1"

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
    GenServer.call(__MODULE__, {:subscribe, spec}, @long_cmd_timeout_ms)
  end

  def unsubscribe(rx_spec) do
    GenServer.call(__MODULE__, {:unsubscribe, rx_spec}, @long_cmd_timeout_ms)
  end

  def config_device(id, options) do
    GenServer.call(__MODULE__, {:config_device, id, options}, @long_cmd_timeout_ms)
  end

  def config_dhcp(options) do
    GenServer.call(__MODULE__, {:config_dhcp, options})
  end

  def identify(caddr) do
    GenServer.call(__MODULE__, {:identify, caddr}, @long_cmd_timeout_ms * 2)
  end

  def get_config() do
    GenServer.call(__MODULE__, :get_config)
  end

  def apply_config(config) do
    GenServer.call(__MODULE__, {:apply_config, config}, @long_cmd_timeout_ms * 2)
  end

  @impl true
  def init([%{node: node}]) do
    client =
      if node == :dummy do
        Logger.info("Using dummy client")
        {:ok, _client} = DummyClient.start_link(%{})
        DummyClient
      else
        {:ok, _client} = Controller.Client.start_link(%{node: node})
        Controller.Client
      end

    send(self(), :fetch_devices)

    {:ok, %State{client: client}}
  end

  @impl true
  def handle_call(:list_devices, _from, state) do
    # This lists visible devices only
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
         :ok <- state.client.subscribe(spec) do
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
         :ok <- state.client.unsubscribe(rx_spec) do
      # TODO: UPDATE STATE
      {:reply, :ok, state}
    else
      _other -> {:reply, :error, state}
    end
  end

  @impl true
  def handle_call({:config_device, id, options}, _from, state) do
    with {:ok, device} <- State.get_device(state, id: id),
         # XXX: maybe verify further?
         :ok <- state.client.config_device(device.name, options) do
      # TODO: UPDATE STATE
      {:reply, :ok, state}
    else
      _other -> {:reply, :error, state}
    end
  end

  @impl true
  def handle_call({:config_dhcp, options}, _from, state) do
    with :ok <- state.client.config_dhcp(options) do
      {:reply, :ok, state}
    else
      _other -> {:reply, :error, state}
    end
  end

  @impl true
  # XXX this is ultra long, should it really be a call?
  def handle_call({:identify, caddr}, _from, state) do
    with {:ok, device} <- State.get_device(state, name: caddr.device_name),
         true <- caddr.channel_name in device.channels.receivers do
      {post_identify_hook, state} =
        case maybe_subscription(device.subscriptions, caddr.channel_name) do
          nil ->
            # IO.inspect("SUBSCRIPTION ABSENT, NOOP")
            {fn state -> state end, state}

          subscription ->
            # IO.inspect("SUBSCRIPTION PRESENT, UNSUBSCRIBING")
            # XXX handle not-ok
            {:reply, :ok, state} = handle_call({:unsubscribe, subscription.receiver}, nil, state)

            {
            fn state ->
              {:reply, :ok, state} = handle_call({:subscribe, subscription}, nil, state)
              state
            end,
              state}
        end

      tmp_sub = %Subscription{
        receiver: caddr,
        transmitter: %ChannelAddress{device_name: @my_device, channel_name: @my_channel}
      }
      {:reply, :ok, state} = handle_call({:subscribe, tmp_sub}, nil, state)

      state.client.play_sound()

      {:reply, :ok, state} = handle_call({:unsubscribe, tmp_sub.receiver}, nil, state)

      state = post_identify_hook.(state)

    {:reply, :ok, state}
    else
      _other -> {:reply, :error, state}
    end
  end

  @impl true
  def handle_call(:get_config, _from, state) do
    {:reply, {:ok, subs}, state} = handle_call(:list_subscriptions, nil, state)

    config = %{subs: subs}

    {:reply, {:ok, Jason.encode!(config)}, state}
  end

  @impl true
  def handle_call({:apply_config, config}, _from, state) do
    %{subs: subs} = Jason.decode!(config)

    {:reply, {:ok, current_subs}, state} = handle_call(:list_subscriptions, nil, state)
    state =
      Enum.reduce(current_subs, state, fn sub, state ->
      {:reply, :ok, state} = handle_call({:unsubscribe, sub.receiver}, nil, state)
    end)

    state =
      Enum.reduce(subs, state, fn sub, state ->
        {:reply, :ok, state} = handle_call({:subscribe, sub}, nil, state)
      end)

    {:reply, :ok, state}
  end

  @impl true
  def handle_info(:fetch_devices, state) do
    Logger.debug("Start fetching devices")

    # XXX: consider refactoring into a dedicated fetcher module
    self_pid = self()
    _pid = spawn_link(fn -> fetch_devices(state.client, self_pid) end)
    Process.send_after(self(), :fetch_devices, @device_fetch_interval_ms)

    {:noreply, state}
  end

  @impl true
  def handle_info({:devices, devices}, state) do
    Logger.debug("Fetched device list")

    {visible_devices, state} =
      Enum.reduce(devices, {MapSet.new(), state}, fn device, {visible_devices, state} ->
        {id, state} = State.put_device(state, device)
        {MapSet.put(visible_devices, id), state}
      end)

    tx_subs = Enum.reduce(state.devices, %{}, fn {_id, dev}, tx_subs ->
      Enum.reduce(dev.subscriptions, tx_subs, fn sub, map ->
        # TODO nie jest to lista xd
        Map.put(map, sub.transmitter, sub.receiver)
      end)
    end)

    state =
      state
      |> Map.put(:last_fetch, System.monotonic_time(:millisecond))
      |> Map.put(:visible_devices, visible_devices)
      |> Map.put(:tx_subscriptions, tx_subs)

    # IO.inspect(state)

    {:noreply, state}
  end

  defp fetch_devices(client, pid) do
    case client.list_devices() do
      {:ok, devices} -> send(pid, {:devices, devices})
      error -> Logger.warning("Unable to fetch devices: #{inspect(error)}")
    end
  end

  defp maybe_subscription(subscriptions, rx_channel) do
    Enum.find(subscriptions, fn sub ->
      sub.receiver.channel_name == rx_channel
    end)
  end
end
