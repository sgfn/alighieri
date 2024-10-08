defmodule Alighieri.BackendWeb.ErrorJSONTest do
  use Alighieri.BackendWeb.ConnCase, async: true

  test "renders 404" do
    assert Alighieri.BackendWeb.ErrorJSON.render("404.json", %{}) == %{
             error: "Not Found"
           }
  end

  test "renders 500" do
    assert Alighieri.BackendWeb.ErrorJSON.render("500.json", %{}) ==
             %{error: "Internal Server Error"}
  end
end
