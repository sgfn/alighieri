defmodule Alighieri.Backend.DummyClient do
  @moduledoc false

  @behaviour Alighieri.Client

  use GenServer
  alias Alighieri.{Channels, Device}

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  @impl true
  def list_devices() do
    GenServer.call(__MODULE__, :list_devices)
  end

  @impl true
  def subscribe(spec) do
    GenServer.call(__MODULE__, {:subscribe, spec})
  end

  @impl true
  def unsubscribe(rx_spec) do
    GenServer.call(__MODULE__, {:unsubscribe, rx_spec})
  end

  @impl true
  def init(_args) do
    devices = [
      %Device{
        name: "DANTE-MALY-ZBUJ",
        channels: %Channels{
          receivers: ["CH1", "CH2"],
          transmitters: ["CH1", "CH2"]
        },
        ipv4: "10.0.21.37",
        mac_address: "DE:AD:BE:EF:CA:FE",
        sample_rate: 69420,
        subscriptions: []
      },
      %Device{
        name: "GLOSNIK",
        channels: %Channels{
          receivers: ["CH1", "CH2"],
          transmitters: []
        },
        ipv4: "10.0.21.38",
        mac_address: "AA:BB:CC:DD:EE:FF",
        sample_rate: 48000,
        subscriptions: []
      },
      %Device{
        name: "MIKROFON",
        channels: %Channels{
          receivers: [],
          transmitters: ["CH1", "CH2"]
        },
        ipv4: "10.0.21.39",
        mac_address: "AA:BB:CC:DD:EE:01",
        sample_rate: 48000,
        subscriptions: []
      },
      %Device{
        name: "DANTE-WIELKI-ZBUJ",
        channels: %Channels{
          receivers: ["CH1", "CH2", "CH3", "CH4"],
          transmitters: ["CH1", "CH2", "CH3", "CH4"]
        },
        ipv4: "10.0.21.40",
        mac_address: "DE:AD:BE:EF:CA:FF",
        sample_rate: 69420,
        subscriptions: []
      }
    ]

    dmap = Map.new(devices, &{&1.name, &1})

    {:ok, %{devices: dmap}}
  end

  @impl true
  def handle_call(:list_devices, _from, state) do
    {:reply, {:ok, Map.values(state.devices)}, state}
  end

  @impl true
  def handle_call({:subscribe, spec}, _from, state) do
    rx_name = spec.receiver.device_name

    with {:ok, receiver} <- Map.fetch(state.devices, rx_name),
         {:ok, transmitter} <- Map.fetch(state.devices, spec.transmitter.device_name),
         true <- spec.receiver.channel_name in receiver.channels.receivers,
         true <- spec.transmitter.channel_name in transmitter.channels.transmitters,
         true <- receiver.sample_rate == transmitter.sample_rate,
         false <- subscription_present?(receiver.subscriptions, spec) do
      state = update_in(state.devices[rx_name].subscriptions, & [spec | &1])

      {:reply, :ok, state}
    else
      _other -> {:reply, :error, state}
    end
  end

  @impl true
  def handle_call({:unsubscribe, rx_spec}, _from, state) do
    rx_name = rx_spec.device_name

    with {:ok, receiver} <- Map.fetch(state.devices, rx_name),
         true <- rx_spec.channel_name in receiver.channels.receivers,
         true <- subscription_present?(receiver.subscriptions, rx_spec) do
      state = update_in(state.devices[rx_name].subscriptions, &Enum.reject(&1, fn sub ->
        sub.receiver.channel_name == rx_spec.channel_name
      end))

      {:reply, :ok, state}
    else
      _other -> {:reply, :error, state}
    end
  end

  defp subscription_present?(subscriptions, spec) do
    Enum.any?(subscriptions, fn sub ->
      sub.receiver.channel_name == spec.receiver.channel_name
    end)
  end
end
