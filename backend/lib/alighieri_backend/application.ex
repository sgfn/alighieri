defmodule Alighieri.Backend.Application do
  @moduledoc false

  use Application

  require Logger

  @epmd_timeout_ms 5_000
  @epmd_pgrep_interval_ms 500

  @impl true
  def start(_type, _args) do
    Logger.info("Starting Alighieri backend")

    :ok = setup_distribution()

    children = [
      {Alighieri.Backend.DeviceService,
       [
         %{
           node: Application.fetch_env!(:alighieri_backend, :controller_node),
           ident_device_name: Application.fetch_env!(:alighieri_backend, :ident_device_name),
           ident_device_channel: Application.fetch_env!(:alighieri_backend, :ident_device_channel)
         }
       ]},
      Alighieri.BackendWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: Alighieri.Backend.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    Alighieri.BackendWeb.Endpoint.config_change(changed, removed)
    :ok
  end

  defp setup_distribution() do
    :ok = ensure_epmd_started!()

    if Node.alive?() do
      Logger.info("Node #{Node.self()} already alive")
    else
      Application.fetch_env!(:alighieri_backend, :node)
      |> Node.start(:longnames)
      |> case do
        {:ok, _} ->
          Logger.info("Started node #{Node.self()}")
          :ok

        {:error, reason} ->
          raise "Couldn't start node, reason: #{inspect(reason)}"
      end
    end

    Application.fetch_env!(:alighieri_backend, :dist_cookie) |> Node.set_cookie()
    :ok
  end

  defp ensure_epmd_started!() do
    try do
      {_output, 0} = System.cmd("epmd", ["-daemon"])
      :ok = Task.async(&ensure_epmd_running/0) |> Task.await(@epmd_timeout_ms)

      :ok
    catch
      _exit_or_error, _e ->
        raise "Unable to start the Erlang Port Mapper Daemon (EPMD)"
    end

    :ok
  end

  defp ensure_epmd_running() do
    with {:pgrep, {_output, 0}} <- {:pgrep, System.cmd("pgrep", ["epmd"])},
         {:epmd, {_output, 0}} <- {:epmd, System.cmd("epmd", ["-names"])} do
      :ok
    else
      {:pgrep, _other} ->
        Process.sleep(@epmd_pgrep_interval_ms)
        ensure_epmd_running()

      {:epmd, _other} ->
        :error
    end
  end
end
