defmodule Alighieri.BackendWeb.DevicesJSON do
  @moduledoc false

  def index(%{device_map: device_map}) do
    devices =
      Enum.map(device_map, fn {id, device} ->
        device |> Map.from_struct() |> Map.put(:id, id)
      end)

    %{devices: devices}
  end

  def show(%{id: id, device: device}) do
    %{device: device |> Map.from_struct() |> Map.put(:id, id)}
  end
end
