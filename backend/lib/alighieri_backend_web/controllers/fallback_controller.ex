defmodule Alighieri.BackendWeb.FallbackController do
  use Alighieri.BackendWeb, :controller

  def call(conn, {:error, status, reason}) do
    conn
    |> put_resp_content_type("application/json")
    |> put_status(status)
    |> json(%{error: reason})
  end
end
