defmodule Alighieri.Client do
  @moduledoc false

  @callback list_devices() :: {:ok, term()} | :error
  @callback subscribe(Alighieri.Subscription.t()) :: :ok | :error
  @callback unsubscribe(Alighieri.ChannelAddress.t()) :: :ok | :error
  @callback config_device(String.t(), Alighieri.Device.options()) :: :ok | :error
end
