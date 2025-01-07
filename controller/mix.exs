defmodule Alighieri.Controller.MixProject do
  defmodule FixDhcpServerCompilationStep do
    def execute(ctx) do
      path =
        Mix.Project.compile_path()
        |> Path.join("../../../rel/alighieri_controller/lib/dhcp_server-0.7.0/ebin")
        |> Path.expand()

      System.put_env("MIX_COMPILE_PATH", path)

      ctx
    end
  end


  use Mix.Project

  def project do
    [
      app: :alighieri_controller,
      version: "1.0.0-rc0",
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      releases: releases()
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

      # Building binary releases
      {:burrito, "~> 1.0"},

      # Dev deps
      {:dialyxir, ">= 0.0.0", only: :dev, runtime: false},
      {:credo, ">= 0.0.0", only: :dev, runtime: false}
    ]
  end

  defp releases do
    [
      alighieri_controller: [
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
end
