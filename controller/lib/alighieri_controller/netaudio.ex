defmodule Alighieri.Controller.Netaudio do
  @moduledoc false

  def list_channels!(), do: run_netaudio_cmd!(["channel", "list"])
  def list_devices!(), do: run_netaudio_cmd!(["device", "list"])
  def list_subscriptions!(), do: run_netaudio_cmd!(["subscription", "list"])

  def config_channel!() do
    raise "Not implemented"
  end

  def config_device!() do
    raise "Not implemented"
  end

  defp run_netaudio_cmd!(args) do
    {result, 0} =
      Application.fetch_env!(:alighieri_controller, :netaudio_path)
      |> System.cmd(args ++ ["-n", "--json"])

    Jason.decode!(result)
  end
end
