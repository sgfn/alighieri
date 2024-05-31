defmodule Alighieri.Controller.Application do
  @moduledoc false

  use Application

  require Logger

  # in milliseconds
  @epmd_timeout 5_000
  @epmd_pgrep_interval 500

  @impl true
  def start(_type, _args) do
    Logger.info("Starting Alighieri controller")

    children =
      [
        # {Registry, keys: :unique, name: Alighieri.Controller.Registry},
      ]

    System.get_env("ALIGHIERI_NETAUDIO_PATH", "netaudio")
    |> then(&Application.put_env(:alighieri_controller, :netaudio_path, &1))

    config_distribution()

    opts = [strategy: :one_for_one, name: Alighieri.Controller.Supervisor]

    Supervisor.start_link(children, opts)
  end

  defp config_distribution() do
    :ok = ensure_epmd_started!()

    if Node.alive?() do
      Logger.info("Node #{Node.self()} already alive")
    else
      System.get_env("ALIGHIERI_NODE_NAME", "controller@controller")
      |> String.to_atom()
      |> Node.start(:longnames)
      |> case do
        {:ok, _} ->
          :ok

        {:error, reason} ->
          raise "Couldn't start node, reason: #{inspect(reason)}"
      end

      Node.set_cookie(:"test-cookie")
    end

    []
  end

  defp ensure_epmd_started!() do
    try do
      {_output, 0} = System.cmd("epmd", ["-daemon"])
      :ok = Task.async(&ensure_epmd_running/0) |> Task.await(@epmd_timeout)

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
        Process.sleep(@epmd_pgrep_interval)
        ensure_epmd_running()

      {:epmd, _other} ->
        :error
    end
  end
end
