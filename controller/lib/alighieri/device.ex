defmodule Alighieri.Device do
  @moduledoc false

  alias Alighieri.{Channels, Subscription}

  @type option ::
          {:encoding, non_neg_integer()}
          | {:gain_level, non_neg_integer()}
          | {:latency, non_neg_integer()}
          | {:sample_rate, non_neg_integer()}
  @type options :: [option()]

  @type t :: %__MODULE__{
          name: String.t(),
          channels: Channels.t(),
          ipv4: String.t(),
          mac_address: String.t(),
          sample_rate: pos_integer(),
          subscriptions: [Subscription.t()]
        }

  @enforce_keys [
    :name,
    :channels,
    :ipv4,
    :mac_address,
    :sample_rate,
    :subscriptions
  ]

  @derive Jason.Encoder
  defstruct @enforce_keys

  @spec from_json!(map()) :: t() | no_return()
  def from_json!(data) do
    case data do
      %{
        "name" => name,
        "channels" => channels,
        "ipv4" => ipv4,
        "mac_address" => mac_address,
        # "sample_rate" => sample_rate,
        "subscriptions" => subscriptions
      } ->
        %__MODULE__{
          name: name,
          channels: Channels.from_json!(channels),
          ipv4: ipv4,
          mac_address: mac_address,
          # XXX handle unknown sample rate
          sample_rate: Map.get(data, "sample_rate", 48_000),
          subscriptions: Enum.map(subscriptions, &Subscription.from_json!/1)
        }

      other ->
        raise "Invalid device JSON structure: #{inspect(other)}"
    end
  end
end
