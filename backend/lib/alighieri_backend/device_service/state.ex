defmodule Alighieri.Backend.DeviceService.State do
  @moduledoc false

  alias Alighieri.Device

  @type device_id :: integer()
  @type devices :: %{device_id() => Device.t()}

  @type t :: %__MODULE__{
          client: term(),
          devices: devices(),
          device_mac_to_id: %{String.t() => device_id()},
          device_name_to_id: %{String.t() => device_id()},
          next_device_id: device_id(),
          last_fetch: integer()
        }

  @enforce_keys [:client]

  defstruct @enforce_keys ++
              [
                devices: %{},
                device_mac_to_id: %{},
                device_name_to_id: %{},
                next_device_id: 1,
                last_fetch: System.monotonic_time(:millisecond)
              ]

  @spec devices(t()) :: devices()
  def devices(state), do: state.devices

  @spec add_device(t(), Device.t()) :: t()
  def add_device(%__MODULE__{next_device_id: id} = state, device) do
    %__MODULE__{
      state
      | devices: Map.put(state.devices, id, device),
        device_mac_to_id: Map.put(state.device_mac_to_id, device.mac_address, id),
        device_name_to_id: Map.put(state.device_name_to_id, device.name, id),
        next_device_id: id + 1
    }
  end

  @spec put_device(t(), Device.t()) :: t()
  def put_device(state, device) do
    case Map.get(state.device_mac_to_id, device.mac_address) do
      nil -> add_device(state, device)
      id -> %{state | devices: Map.put(state.devices, id, device)}
    end
  end

  @spec remove_device(t(), device_id()) :: t()
  def remove_device(state, id) do
    case Map.get(state.devices, id) do
      nil ->
        state

      device ->
        %__MODULE__{
          state
          | devices: Map.delete(state.devices, id),
            device_mac_to_id: Map.delete(state.device_mac_to_id, device.mac_address),
            device_name_to_id: Map.delete(state.device_name_to_id, device.name)
        }
    end
  end

  @spec get_device(t(), [{:id, device_id()} | {:mac | :name, String.t()}]) ::
          {:ok, Device.t()} | {:error, :device_not_found}
  def get_device(state, kwl)

  def get_device(state, id: id) do
    case Map.get(state.devices, id) do
      nil -> {:error, :device_not_found}
      device -> {:ok, device}
    end
  end

  def get_device(state, mac: mac) do
    case Map.get(state.device_mac_to_id, mac) do
      nil -> {:error, :device_not_found}
      id -> {:ok, Map.fetch!(state.devices, id)}
    end
  end

  def get_device(state, name: name) do
    case Map.get(state.device_name_to_id, name) do
      nil -> {:error, :device_not_found}
      id -> {:ok, Map.fetch!(state.devices, id)}
    end
  end
end
