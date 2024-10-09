defmodule Alighieri.Controller.Netaudio do
  @moduledoc false

  require Logger

  alias Alighieri.{ChannelAddress, Channels, Device, Subscription}

  @allowed_encodings [16, 24, 32]
  @allowed_gain_levels [1, 2, 3, 4, 5]
  @allowed_sample_rates [44_100, 48_000, 88_200, 96_000, 176_400, 192_000]

  @spec version!() :: String.t() | no_return()
  def version!(), do: run_netaudio_cmd!(["-V"], false)

  @spec list_channels!() :: %{String.t() => Channels.t()} | no_return()
  def list_channels!() do
    run_netaudio_cmd!(["channel", "list"])
    |> Map.new(fn {k, v} -> {k, Channels.from_json!(v)} end)
  end

  @spec list_devices!() :: [Device.t()] | no_return()
  def list_devices!() do
    run_netaudio_cmd!(["device", "list"])
    |> Enum.map(fn {_k, v} -> Device.from_json!(v) end)
  end

  @spec list_subscriptions!() :: [Subscription.t()] | no_return()
  def list_subscriptions!() do
    run_netaudio_cmd!(["subscription", "list"])
    |> Enum.map(&Subscription.from_json!/1)
  end

  @spec subscribe(Subscription.t()) :: :ok | :error
  def subscribe(%Subscription{receiver: receiver, transmitter: transmitter}) do
    case run_netaudio_cmd(
           [
             "subscription",
             "add",
             "--rx-channel-name",
             receiver.channel_name,
             "--rx-device-name",
             receiver.device_name,
             "--tx-channel-name",
             transmitter.channel_name,
             "--tx-device-name",
             transmitter.device_name
           ],
           false
         ) do
      {:ok, _result} ->
        :ok

      :error ->
        :error
    end
  end

  @spec unsubscribe(ChannelAddress.t()) :: :ok | :error
  def unsubscribe(%ChannelAddress{device_name: device_name, channel_name: channel_name}) do
    case run_netaudio_cmd(
           [
             "subscription",
             "remove",
             "--rx-channel-name",
             channel_name,
             "--rx-device-name",
             device_name
           ],
           false
         ) do
      {:ok, _result} ->
        :ok

      :error ->
        :error
    end
  end

  @spec config_device(String.t(), Device.options()) :: :ok | :error
  def config_device(device_name, options) do
    with flags when is_list(flags) <- validate_options(options),
         {:ok, _result} <-
           run_netaudio_cmd(["config", "--device-name", device_name] ++ flags, false) do
      :ok
    else
      _other -> :error
    end
  end

  defp run_netaudio_cmd!(args, json? \\ true) do
    case run_netaudio_cmd(args, json?) do
      {:ok, result} -> result
      :error -> raise "netaudio command failed"
    end
  end

  defp run_netaudio_cmd(args, json?) do
    start_time = System.monotonic_time(:millisecond)
    Logger.debug("Execute: netaudio #{Enum.join(args, " ")}")

    {result, exit_code} =
      Application.fetch_env!(:alighieri_controller, :netaudio_path)
      |> System.cmd(args ++ ["-n"] ++ if(json?, do: ["--json"], else: []))

    end_time = System.monotonic_time(:millisecond)
    Logger.debug("netaudio exited with code #{exit_code} in #{end_time - start_time} ms")

    if exit_code == 0 do
      {:ok, if(json?, do: Jason.decode!(result), else: result)}
    else
      :error
    end
  end

  defp validate_options(options) do
    Enum.reduce_while(options, [], fn option, acc ->
      case validate_option(option) do
        {:ok, flags} -> {:cont, acc ++ flags}
        :error -> {:halt, :error}
      end
    end)
  end

  defp validate_option({:encoding, v}) when v in @allowed_encodings,
    do: {:ok, ["--set-encoding", to_string(v)]}

  defp validate_option({:gain_level, v}) when v in @allowed_gain_levels,
    do: {:ok, ["--set-gain-level", to_string(v)]}

  defp validate_option({:sample_rate, v}) when v in @allowed_sample_rates,
    do: {:ok, ["--set-sample-rate", to_string(v)]}

  defp validate_option({:latency, v}) when is_integer(v) and v >= 0,
    do: {:ok, ["--set-latency", to_string(v)]}

  defp validate_option(_other), do: :error
end
