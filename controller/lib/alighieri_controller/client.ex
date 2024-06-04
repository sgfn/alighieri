defmodule Alighieri.Controller.Client do
  @moduledoc false

  use GenServer

  require Logger

  alias Alighieri.Controller.Netaudio
  alias Alighieri.{ChannelAddress, Subscription}

  @ping_interval_ms 10_000
  @rpc_timeout_ms 5_000

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  @spec list_devices() :: {:ok, term()} | :error
  def list_devices() do
    GenServer.call(__MODULE__, :list_devices)
  end

  @spec subscribe(Subscription.t()) :: :ok | :error
  def subscribe(spec) do
    GenServer.call(__MODULE__, {:subscribe, spec})
  end

  @spec unsubscribe(ChannelAddress.t()) :: :ok | :error
  def unsubscribe(rx_spec) do
    GenServer.call(__MODULE__, {:unsubscribe, rx_spec})
  end

  @impl true
  def init(%{node: node}) do
    true = Node.connect(node)
    :pong = Node.ping(node)

    # Process.send_after(self(), :ping_controller, @ping_interval_ms)

    {:ok, %{node: node}}
  end

  @impl true
  def handle_call(:list_devices, _from, state) do
    result = rpc_call(state.node, Netaudio, :list_devices!)
    {:reply, result, state}
  end

  @impl true
  def handle_call({:subscribe, spec}, _from, state) do
    result = rpc_call(state.node, Netaudio, :subscribe, [spec])
    {:reply, result, state}
  end

  @impl true
  def handle_call({:unsubscribe, rx_spec}, _from, state) do
    result = rpc_call(state.node, Netaudio, :unsubscribe, [rx_spec])
    {:reply, result, state}
  end

  # def handle_info(:ping_controller, state) do
  # def handle_info(:ping_controller, state) do
  #   Process.send_after(self(), :ping_controller, @ping_interval_ms)

  #   case Node.ping(node) do
  #     :pong -> :noop
  #     :pang -> Logger.warning()
  #   end

  #   {:noreply, state}
  # end

  defp rpc_call(node, mod, fun, args \\ [], timeout \\ @rpc_timeout_ms) do
    try do
      {:ok, :erpc.call(node, mod, fun, args, timeout)}
    rescue
      e ->
        Logger.warning("RPC call to node #{node} failed: #{inspect(e)}")
        :error
    end
  end
end
