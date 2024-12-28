defmodule Alighieri.Subscription do
  @moduledoc false

  alias Alighieri.ChannelAddress

  @type t :: %__MODULE__{
          receiver: ChannelAddress.t(),
          transmitter: ChannelAddress.t(),
          status: String.t()
        }

  @enforce_keys [
    :receiver,
    :transmitter
  ]

  @derive Jason.Encoder
  defstruct @enforce_keys ++
              [
                status: "Unknown"
              ]

  @spec from_json!(map()) :: t() | no_return()
  def from_json!(data) do
    case data do
      %{
        "rx_channel" => rx_channel,
        "rx_device" => rx_device,
        "tx_channel" => tx_channel,
        "tx_device" => tx_device
        # "status_text" => status
      } ->
        sub = %__MODULE__{
          receiver: %ChannelAddress{
            device_name: rx_device,
            channel_name: rx_channel
          },
          transmitter: %ChannelAddress{
            device_name: tx_device,
            channel_name: tx_channel
          }
        }

        maybe_status = data["status_text"] || data["status"]

        if not is_nil(maybe_status),
          do: %__MODULE__{sub | status: maybe_status},
          else: sub

      other ->
        raise "Invalid subscription JSON structure: #{inspect(other)}"
    end
  end
end
