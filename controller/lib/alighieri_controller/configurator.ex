defmodule Alighieri.Controller.Configurator do
  @moduledoc false

  alias Alighieri.Device

  require Logger

  @config_listen_mcast_group {224, 0, 0, 231}
  @config_listen_port 8702
  @config_send_port 8700

  @config_sample_rate_msg <<255, 255, 0, 40, 0, 10, 3, 96, 8, 0, 39, 211, 185, 242, 0, 0, 65, 117,
                            100, 105, 110, 97, 116, 101, 7, 52, 0, 129, 0, 0, 0, 100, 0, 0, 0, 1>>

  @spec get_sample_rates!([Device.t()]) :: [Device.t()]
  def get_sample_rates!(devices) do
    {:ok, aaa} = :inet.getifaddrs()
    ifname = Application.fetch_env!(:alighieri_controller, :dhcp_iface) |> String.to_charlist()

    ifaddr =
      Enum.find_value(aaa, fn {k, v} ->
        if k == ifname do
          Keyword.fetch!(v, :addr)
        end
      end)

    {:ok, s} =
      :gen_udp.open(@config_listen_port, [
        :binary,
        active: true,
        reuseaddr: true,
        add_membership: {@config_listen_mcast_group, ifaddr}
      ])

    res =
      Enum.map(devices, fn device ->
        {:ok, addr} = device.ipv4 |> String.to_charlist() |> :inet.getaddr(:inet)
        :gen_udp.send(s, {addr, @config_send_port}, @config_sample_rate_msg <> <<0, 0, 0, 1>>)

        msg =
          receive do
            {:udp, ^s, _addr, _port, msg} -> msg
          end

        sx = :binary.bin_to_list(msg) |> Enum.reverse() |> Enum.chunk_every(4)

        sd =
          Enum.map(sx, fn [d, c, b, a] ->
            <<v::unsigned-integer-big-32>> = <<a, b, c, d>>
            v
          end)

        alls =
          sd |> Enum.filter(&(&1 in Device.allowed_sample_rates())) |> Enum.uniq() |> Enum.sort()

        selected =
          Enum.reduce(alls, sd, fn all, sd -> List.delete(sd, all) end)
          |> Enum.filter(&(&1 in Device.allowed_sample_rates()))
          |> List.first()

        if is_nil(selected) or alls == [] do
          Logger.debug(
            "Failed to fetch selected and supported sample rates of #{inspect(device.name)}"
          )

          device
        else
          %{device | sample_rate: selected, supported_sample_rates: alls}
        end
      end)

    :gen_udp.close(s)
    res
  end

  @spec set_sample_rate(Device.t(), pos_integer()) :: :ok
  def set_sample_rate(device, sample_rate) do
    {:ok, s} = :gen_udp.open(0, [:binary])
    {:ok, addr} = device.ipv4 |> String.to_charlist() |> :inet.getaddr(:inet)

    :gen_udp.send(
      s,
      {addr, @config_send_port},
      @config_sample_rate_msg <> <<sample_rate::unsigned-big-integer-32>>
    )

    :gen_udp.close(s)

    :ok
  end
end
