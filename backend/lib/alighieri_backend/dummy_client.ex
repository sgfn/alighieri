defmodule Alighieri.Backend.DummyClient do
  @moduledoc false

  @behaviour Alighieri.Client

  @allowed_encodings [16, 24, 32]
  @allowed_gain_levels [1, 2, 3, 4, 5]
  @allowed_sample_rates [44_100, 48_000, 88_200, 96_000, 176_400, 192_000]

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
  def config_device(device_name, options) do
    GenServer.call(__MODULE__, {:config_device, device_name, options})
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
        sample_rate: 44_100,
        subscriptions: []
      },
      %Device{
        name: "GLOSNIK1",
        channels: %Channels{
          receivers: ["CH1"],
          transmitters: []
        },
        ipv4: "10.0.21.38",
        mac_address: "AA:BB:CC:DD:EE:FF",
        sample_rate: 48_000,
        subscriptions: []
      },
      %Device{
        name: "MIKROFON",
        channels: %Channels{
          receivers: [],
          transmitters: ["CH1"]
        },
        ipv4: "10.0.21.39",
        mac_address: "AA:BB:CC:DD:EE:01",
        sample_rate: 48_000,
        subscriptions: []
      },
      %Device{
        name: "DANTE-WIELKI-ZBUJ",
        channels: %Channels{
          receivers: ["CH1", "CH2", "CH3", "CH4"],
          transmitters: ["CH1", "CH2", "CH3", "CH4"]
        },
        ipv4: "10.0.21.40",
        mac_address: "AA:BB:CC:DD:EE:02",
        sample_rate: 44_100,
        subscriptions: []
      },
      %Device{
        name: "GLOSNIK2",
        channels: %Channels{
          receivers: ["CH1"],
          transmitters: []
        },
        ipv4: "10.0.21.41",
        mac_address: "AA:BB:CC:DD:EE:03",
        sample_rate: 44_100,
        subscriptions: []
      },
      %Device{
        name: "KOMPUTER1",
        channels: %Channels{
          receivers: ["CH1", "CH2"],
          transmitters: ["CH1", "CH2"]
        },
        ipv4: "10.0.21.42",
        mac_address: "AA:BB:CC:DD:EE:04",
        sample_rate: 44_100,
        subscriptions: []
      },
      %Device{
        name: "KOMPUTER2",
        channels: %Channels{
          receivers: ["CH1", "CH2"],
          transmitters: ["CH1", "CH2"]
        },
        ipv4: "10.0.21.43",
        mac_address: "AA:BB:CC:DD:EE:05",
        sample_rate: 44_100,
        subscriptions: []
      },
      %Device{
        name: "GLOSNIK3",
        channels: %Channels{
          receivers: ["CH1"],
          transmitters: []
        },
        ipv4: "10.0.21.44",
        mac_address: "AA:BB:CC:DD:EE:06",
        sample_rate: 44_100,
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
    rx_channel = spec.receiver.channel_name

    with {:ok, receiver} <- Map.fetch(state.devices, rx_name),
         {:ok, transmitter} <- Map.fetch(state.devices, spec.transmitter.device_name),
         true <- spec.receiver.channel_name in receiver.channels.receivers,
         true <- spec.transmitter.channel_name in transmitter.channels.transmitters,
         true <- receiver.sample_rate == transmitter.sample_rate,
         false <- subscription_present?(receiver.subscriptions, rx_channel) do
      state = update_in(state.devices[rx_name].subscriptions, &[spec | &1])

      {:reply, :ok, state}
    else
      _other -> {:reply, :error, state}
    end
  end

  @impl true
  def handle_call({:unsubscribe, rx_spec}, _from, state) do
    rx_name = rx_spec.device_name
    rx_channel = rx_spec.channel_name

    with {:ok, receiver} <- Map.fetch(state.devices, rx_name),
         true <- rx_spec.channel_name in receiver.channels.receivers,
         true <- subscription_present?(receiver.subscriptions, rx_channel) do
      state =
        update_in(
          state.devices[rx_name].subscriptions,
          &Enum.reject(&1, fn sub ->
            sub.receiver.channel_name == rx_spec.channel_name
          end)
        )

      {:reply, :ok, state}
    else
      _other -> {:reply, :error, state}
    end
  end

  @impl true
  def handle_call({:config_device, device_name, options}, _from, state) do
    with {:ok, device} <- Map.fetch(state.devices, device_name),
         new_device when not is_atom(new_device) <-
           Enum.reduce_while(options, device, fn option, device ->
             case validate_option(option, device) do
               {:ok, device} -> {:cont, device}
               :error -> {:halt, :error}
             end
           end) do
      {:reply, :ok, put_in(state.devices[device_name], new_device)}
    else
      _other -> {:reply, :error, state}
    end
  end

  defp subscription_present?(subscriptions, rx_channel) do
    Enum.any?(subscriptions, fn sub ->
      sub.receiver.channel_name == rx_channel
    end)
  end

  defp validate_option({:encoding, v}, device) when v in @allowed_encodings, do: {:ok, device}
  defp validate_option({:gain_level, v}, device) when v in @allowed_gain_levels, do: {:ok, device}

  defp validate_option({:sample_rate, v}, device) when v in @allowed_sample_rates,
    do: {:ok, %Device{device | sample_rate: v}}

  defp validate_option({:latency, v}, device) when is_integer(v) and v >= 0, do: {:ok, device}
  defp validate_option(_other, _state), do: :error
end
