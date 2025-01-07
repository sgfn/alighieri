build:
	cd frontend/ && npm ci
	cd frontend/ && npm run build
	cp -r frontend/build/* backend/priv/static
	cd backend/ && MIX_ENV=prod mix deps.get
	cd backend/ && MIX_ENV=prod mix release
	cd controller/ && MIX_ENV=prod mix deps.get
	cd controller/ && MIX_ENV=prod mix release
