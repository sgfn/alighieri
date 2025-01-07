defmodule Alighieri.Backend.MixProject do
  defmodule FixDhcpServerCompilationStep do
    def execute(ctx) do
      path =
        Mix.Project.compile_path()
        |> Path.join("../../../rel/alighieri_backend/lib/dhcp_server-0.7.0/ebin")
        |> Path.expand()

      System.put_env("MIX_COMPILE_PATH", path)

      ctx
    end
  end

  use Mix.Project

  def project do
    [
      app: :alighieri_backend,
      version: "1.0.0-rc0",
      elixir: "~> 1.14",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      releases: releases(),
      dialyzer: [plt_add_apps: [:alighieri_controller]]
    ]
  end

  def application do
    [
      mod: {Alighieri.Backend.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      # Alighieri deps
      {:alighieri_controller, path: "../controller/"},

      # Regular deps
      {:phoenix, "~> 1.7.11"},
      {:phoenix_ecto, "~> 4.4"},
      {:ecto_sql, "~> 3.10"},
      {:ecto_sqlite3, ">= 0.0.0"},
      {:telemetry_metrics, "~> 0.6"},
      {:telemetry_poller, "~> 1.0"},
      {:jason, "~> 1.2"},
      {:dns_cluster, "~> 0.1.1"},
      {:bandit, "~> 1.2"},
      {:corsica, "~> 2.1"},

      # Building binary releases
      {:burrito, "~> 1.0"},

      # Dev deps
      {:dialyxir, ">= 0.0.0", only: :dev, runtime: false},
      {:credo, ">= 0.0.0", only: :dev, runtime: false}
    ]
  end

  defp releases do
    [
      alighieri_server: [
        steps: [:assemble, &Burrito.wrap/1],
        burrito: [
          targets: [
            linux: [os: :linux, cpu: :x86_64]
          ],
          extra_steps: [
            patch: [pre: [FixDhcpServerCompilationStep]]
          ]
        ]
      ]
    ]
  end

  defp aliases do
    [
      setup: ["deps.get", "ecto.setup"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"]
    ]
  end
end
