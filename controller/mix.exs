defmodule Alighieri.Controller.MixProject do
  use Mix.Project

  def project do
    [
      app: :alighieri_controller,
      version: "0.1.0-dev",
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      mod: {Alighieri.Controller.Application, []},
      extra_applications: [:logger]
    ]
  end

  defp deps do
    [
      {:jason, "~> 1.4"},
      {:dhcp_server, "~> 0.7"},

      # Dev deps
      {:dialyxir, ">= 0.0.0", only: :dev, runtime: false},
      {:credo, ">= 0.0.0", only: :dev, runtime: false}
    ]
  end
end
