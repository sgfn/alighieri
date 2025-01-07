all: build_fe build_be build_ctr

build_fe:
	cd frontend/ && npm ci
	cd frontend/ && npm run build
	mkdir -p backend/priv/static/
	cp -r frontend/build/* backend/priv/static/

build_be:
	mkdir -p build/
	cd backend/ && MIX_ENV=prod mix deps.get
	cd backend/ && MIX_ENV=prod mix release
	cp backend/burrito_out/alighieri_server_linux build/alighieri_server

build_ctr:
	mkdir -p build/
	cd controller/ && MIX_ENV=prod mix deps.get
	cd controller/ && MIX_ENV=prod mix release
	cp controller/burrito_out/alighieri_controller_linux build/alighieri_controller

clean:
	rm -rf build/ frontend/build/ backend/priv/static/ backend/_build/ backend/burrito_out/ controller/_build/ controller/burrito_out/
