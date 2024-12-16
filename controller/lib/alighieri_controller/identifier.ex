defmodule Alighieri.Controller.Identifier do
  @moduledoc false

  def play_sound() do
    System.cmd("aplay", [
      "-D",
      "iec958:CARD=Device,DEV=0",
      "-f",
      "S16_LE",
      "-r",
      "48000",
      "-c",
      "2",
      "chemia.s16le.48000.2.raw"
    ])
  end
end
