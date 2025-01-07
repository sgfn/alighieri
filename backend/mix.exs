defmodule Alighieri.Backend.MixProject do
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
      {:jason, "~> 1.2"},
      {:bandit, "~> 1.2"},
      {:corsica, "~> 2.1"},

      # Dev deps
      {:dialyxir, ">= 0.0.0", only: :dev, runtime: false},
      {:credo, ">= 0.0.0", only: :dev, runtime: false}
    ]
  end

  defp aliases do
    [
      setup: ["deps.get"]
    ]
  end
end
