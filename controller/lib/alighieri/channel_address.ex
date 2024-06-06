defmodule Alighieri.ChannelAddress do
  @moduledoc false

  @type t :: %__MODULE__{
          device_name: String.t(),
          channel_name: String.t()
        }

  @enforce_keys [
    :device_name,
    :channel_name
  ]

  @derive Jason.Encoder
  defstruct @enforce_keys
end
