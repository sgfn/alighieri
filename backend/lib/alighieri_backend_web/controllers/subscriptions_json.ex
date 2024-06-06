defmodule Alighieri.BackendWeb.SubscriptionsJSON do
  @moduledoc false

  def show(%{subscriptions: subscriptions}) do
    %{subscriptions: subscriptions}
  end

  def create(%{subscription: subscription}) do
    %{subscription: subscription |> Map.from_struct() |> Map.delete(:status)}
  end
end
