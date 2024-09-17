defmodule Alighieri.Client do
  @moduledoc false

  @callback list_devices() :: {:ok, term()} | :error
  @callback subscribe(Alighieri.Subscription.t()) :: :ok | :error
  @callback unsubscribe(Alighieri.ChannelAddress.t()) :: :ok | :error
end
