all: build_fe build_be build_ctr

build_fe:
	cd frontend/ && npm ci
	cd frontend/ && npm run build
	mkdir -p backend/priv/static/alighieri/
	cp -r frontend/build/* backend/priv/static/alighieri/
	cp backend/priv/static/alighieri/favicon.ico backend/priv/static/
	cp backend/priv/static/alighieri/index.html backend/priv/static/

build_be:
	mkdir -p build/
	cd backend/ && MIX_ENV=prod mix deps.get
	cd backend/ && MIX_ENV=prod mix release
	cd backend/_build/prod/rel/ && tar czf alighieri_backend.tgz alighieri_backend/
	mv backend/_build/prod/rel/alighieri_backend.tgz build/

build_ctr:
	mkdir -p build/
	cd controller/ && MIX_ENV=prod mix deps.get
	cd controller/ && MIX_ENV=prod mix release
	cd controller/_build/prod/rel/ && tar czf alighieri_controller.tgz alighieri_controller/
	mv controller/_build/prod/rel/alighieri_controller.tgz build/

clean: clean_bins clean_fe clean_be clean_ctr

clean_bins:
	rm -rf build/alighieri_*

clean_fe:
	rm -rf frontend/node_modules/ frontend/build/ backend/priv/static/

clean_be:
	rm -rf backend/deps/ backend/_build/

clean_ctr:
	rm -rf controller/deps/ controller/_build/
