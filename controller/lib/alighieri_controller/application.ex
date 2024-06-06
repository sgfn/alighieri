defmodule Alighieri.Controller.Application do
  @moduledoc false

  use Application

  require Logger

  @epmd_timeout_ms 5_000
  @epmd_pgrep_interval_ms 500

  @impl true
  def start(_type, _args) do
    Logger.info("Starting Alighieri controller")

    :ok = setup_distribution()
    Alighieri.Controller.Netaudio.version!() |> Logger.info()

    children = [
      # {Registry, keys: :unique, name: Alighieri.Controller.Registry},
    ]

    opts = [strategy: :one_for_one, name: Alighieri.Controller.Supervisor]

    Supervisor.start_link(children, opts)
  end

  defp setup_distribution() do
    :ok = ensure_epmd_started!()

    if Node.alive?() do
      Logger.info("Node #{Node.self()} already alive")
    else
      Application.fetch_env!(:alighieri_controller, :node)
      |> Node.start(:longnames)
      |> case do
        {:ok, _} ->
          Logger.info("Started node #{Node.self()}")
          :ok

        {:error, reason} ->
          raise "Couldn't start node, reason: #{inspect(reason)}"
      end

      Application.fetch_env!(:alighieri_controller, :dist_cookie) |> Node.set_cookie()
    end

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
