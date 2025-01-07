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
	tar czf build/alighieri_backend.tgz backend/_build/prod/rel/alighieri_backend/

build_ctr:
	mkdir -p build/
	cd controller/ && MIX_ENV=prod mix deps.get
	cd controller/ && MIX_ENV=prod mix release
	tar czf build/alighieri_controller.tgz controller/_build/prod/rel/alighieri_controller/

clean: clean_bins clean_fe clean_be clean_ctr

clean_bins:
	rm -rf build/alighieri_*

clean_fe:
	rm -rf frontend/node_modules/ frontend/build/ backend/priv/static/

clean_be:
	rm -rf backend/deps/ backend/_build/

clean_ctr:
	rm -rf controller/deps/ controller/_build/
