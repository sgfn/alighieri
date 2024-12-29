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
          sample_rate: pos_integer() | nil,
          supported_sample_rates: [pos_integer()] | nil,
          subscriptions: [Subscription.t()]
        }

  @enforce_keys [
    :name,
    :channels,
    :ipv4,
    :mac_address,
    :subscriptions
  ]

  @derive Jason.Encoder
  defstruct @enforce_keys ++ [sample_rate: nil, supported_sample_rates: nil]

  @spec from_json!(map()) :: t() | no_return()
  def from_json!(data) do
    case data do
      %{
        "name" => name,
        "channels" => channels,
        "ipv4" => ipv4,
        "mac_address" => mac_address,
        "subscriptions" => subscriptions
      } ->
        d = %__MODULE__{
          name: name,
          channels: Channels.from_json!(channels),
          ipv4: ipv4,
          mac_address: mac_address,
          subscriptions: Enum.map(subscriptions, &Subscription.from_json!/1)
        }

        %{
          d
          | sample_rate: data["sample_rate"],
            supported_sample_rates: data["supported_sample_rates"]
        }

      other ->
        raise "Invalid device JSON structure: #{inspect(other)}"
    end
  end
end
