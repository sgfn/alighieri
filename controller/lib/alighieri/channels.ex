defmodule Alighieri.Channels do
  @moduledoc false

  @type t :: %__MODULE__{
          receivers: [String.t()],
          transmitters: [String.t()]
        }

  @enforce_keys [
    :receivers,
    :transmitters
  ]

  @derive Jason.Encoder
  defstruct @enforce_keys

  @spec from_json!(map()) :: t() | no_return()
  def from_json!(data) do
    case data do
      %{
        "receivers" => receivers,
        "transmitters" => transmitters
      } ->
        %__MODULE__{
          receivers: channels_from_json!(receivers),
          transmitters: channels_from_json!(transmitters)
        }

      other ->
        raise "Invalid channels JSON structure: #{inspect(other)}"
    end
  end

  defp channels_from_json!(channels) do
    channels
    |> Map.values()
    |> Enum.map(&Map.fetch!(&1, "name"))
  end
end
