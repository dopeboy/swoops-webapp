This code powered Swoops, a new age fantasy sports league where the fans were also owners. It has now been open sourced, and you can read more about that [here](https://blog.playswoops.com/swoops-open-source-announcement/).

#  Swoops

## Local development
The Swoops application can run within either a Docker container or locally on one host computer.

## Via Docker Container

### System dependencies
 * Install docker
 * Install docker-compose

### Setup using docker-compose to run locally
With running Docker in local development, Any updates that you make to the source code will be reflected in the application running within the container.


__**Step 1: Copy the env file from the backend folder**__
```
    cd backend
    cp .env.docker.example .env
```

__**Step 2: Within the frontend folder create `.babelrc` file and insert the following contents:**__
```
{
  "presets": ["next/babel"]
}
```
Note: This is a temporary solution to solve the issue `SWC Failed to Load`. Not quite sure how to solve this issue.

__**Step 3:  To build the application type the command in the console**__
```
docker-compose -f docker-compose.local.yml build
```

__**Step 4: To launch the application type the command in the console**__
```
docker-compose -f docker-compose.local.yml up
```

...or launch as a daemon:
```
docker-compose -f docker-compose.local.yml up -d
```

## Within Local Host Computer
### System dependencies

* Install python 3.9.10
* Install node >= 16.0.0
* Install poetry
* Install postgres
* Install redis
* [Install miniconda](https://docs.conda.io/en/latest/miniconda.html)



### Setup local db

```
sudo -u postgres psql
```

Or if you're into docker:

```
docker run --name swoops.db -p 5432:5432/tcp -e POSTGRES_PASSWORD=mysecretpassword -d postgres:14.1
```

And then in the postgres CLI:

```
drop database if exists swoops;
create database swoops;
drop user if exists dev;
create user dev;
alter user dev with encrypted password 'dev';
grant all privileges on database swoops to dev;
alter user dev createdb;
```

### Setup redis
If you're into docker:

```
docker run --name redis -p 6379:6379/tcp -d redis:alpine
```

Otherwise, install and run redis yourself.


### Setup environemnt
This step will place the webapp within a conda virtual environment using the
python version that poetry is configured to run. Once the conda environment is active there is no need to activate the poetry environment within a shell
```
conda create -n swoops-webapp -c conda-forge --override-channels python=3.9.10 poetry=1.5.1
```

To activate App
```
conda activate swoops-webapp
```

To deactivate app
```
conda deactivate
```

### Setup backend

```
cd backend
cp .env.example .env
poetry env use /usr/bin/python3.9
poetry install
```

Now you should be inside your virtual environment.

```
python manage.py migrate
cat ./sqls/views/*.sql | python manage.py dbshell
python manage.py generate_test_data
python manage.py runserver
```

### Data Fixtures

A base fixture setup can be attained by running `python manage.py generate_test_data`. See `Management commands` for more information.

There is also one (django) superuser. NOTE: the superuser login form asks for a wallet address, but it's really email it accepts.

- `admin@admin.com` // `admin`


### Management commands

`generate_test_data` - this creates a testbed of data for provided users, generating accounts, teams, games, game histories, etc.

Parameters:
- -w, --wallet *address*: **Required**, the address of the base user to generate data for.
- -o, --opponent *address*: **Optional**, the address of the user who will be the opponent in game data generated. If not provided, a placeholder address of `0xffffffffffffffffffffffffffffffffffffffff` is used.
- --generate-players or --no-generate-players: **Required**, when `--generate-players` is passed, any required players for the data set will be generated and written to the database. When `--no-generate-players` is passed, no new players are generated, but existing players that are not owned by any user will be reassigned to the addresses provided. If there are not enough free players to assign, the command will fail. USAGE NOTE: **YOU DO NOT** want to generate players in an environment that is hooked up to the simulator (e.g. staging) because the players generated will exist only in the webapp, and if you call the simulator with those players, it will fail.

Example:

> `python manage.py generate_test_data --wallet 0xf407dF7897ADa7B18Be503f6E45b992a682c3906 --opponent 0xe9e6CAD692c46FDBC61b8cF1665f5597C440aC95 --generate-players`

To run via docker:

> `docker exec -it <container_name> python manage.py generate_test_data --wallet 0xf407dF7897ADa7B18Be503f6E45b992a682c3906 --generate-players`

<br><br>

`create_games` - this creates a specified number of games.

Parameters:
- number_of_games *int*: **Required**, the number of games to create
- --kind *str*: **Optional**, (defaults to `HEAD_TO_HEAD`), the type of contest to create. Choose one of `game.models.Contest.Kind`.

Example:

> `python manage.py create_games 4`

> `python manage.py create_games 5 --kind HEAD_TO_HEAD`

<br><br>

`set_ownership` - this sets the application state to have provided pairs of wallets to own the players under the corresponding token ids.

Parameters:
- comma-delimited-pairs *str*: **Required**, a comma separated set of tuples to set the ownership of. Ex. `wallet1,token1,wallet2,token2,wallet3,token3,...`

Example:

> `python manage.py set_ownership 0xf407dF7897ADa7B18Be503f6E45b992a682c3906,3,0xf407dF7897ADa7B18Be503f6E45b992a682c3906,2,0xe9e6CAD692c46FDBC61b8cF1665f5597C440aC95,4,0xe9e6CAD692c46FDBC61b8cF1665f5597C440aC95,6`

<br><br>

### Setup frontend

Navigate to root

```
yarn
```

Navigate to `frontend/`

```
yarn
```

```
yarn dev
```

Open http://127.0.0.1:3000

### Setup pre commit hooks

Go to project root in your poetry shell

```
pre-commit install --hook-type pre-commit --hook-type pre-push
```

### Setup django admin (optional but encouraged)
```
python manage.py createsuperuser
```
*NOTE:* it asks for a wallet address, but it actually accepts only emails.

Then navigate to http://127.0.0.1:8000/secret-room/


### Debug django via poetry in VSCode
**Poetry support for VScode is in GA, but incase of issues, check [this guide to enable the dev branch of the python plugin](https://devblogs.microsoft.com/python/python-in-visual-studio-code-april-2021-release/)**

Without configuring the python interpretter for poetry, there are weird hoops to jump through to make debugging work with poetry.
To make it work:

in `{swoops_root}/backend/`:

`poetry env info`

Yields something like:

```
Virtualenv
Python:         3.9.9
Implementation: CPython
Path:           /Users/matthewgale/Development/git/swoops/swoops/backend/.venv
Valid:          True

System
Platform: darwin
OS:       posix
Python:   /Users/matthewgale/.pyenv/versions/3.9.9
```

Copy the "Path" from the output.

In VSCode: Command pallette -> "python: select interpretter"
Click "Enter interpretter path..."

Paste the value of the path into the textfield and hit enter

In the bottom left corner, VSCode should show the python interpretter selected and have a reference to poetry. something like `Python 3.9.9 64-bit ('.venv': poetry)`

When you spawn new terminals, VSCode will now automatically use `poetry shell` to launch the app.

## Frontend API Client Generation

You can generate a frontend client from the API with a few commands.

In `backend/`, generate a `swagger.json` from the backend by running:

`python manage.py generate_swagger -o swagger.json`

The frontend can consume this file using the [openapi-typescript-codegen](https://www.npmjs.com/package/openapi-typescript-codegen) project.
(`yarn global add openapi-typescript-codegen@0.17.0`)

In `frontend/`:

`openapi  --input ../backend/swagger.json --output ./src/lib/api --client axios`

This will generate and update typescript sources for the API endpoints as well as generate API clients the frontend can directly consume.

### psycopg2 on apple silicon
https://github.com/psycopg/psycopg2/issues/1216#issuecomment-767892042

```
$ brew install libpq --build-from-source
$ brew install openssl

$ export LDFLAGS="-L/opt/homebrew/opt/libpq/lib -I/opt/homebrew/opt/openssl/include -L/opt/homebrew/opt/openssl/lib"

$ pip install psycopg2-binary
```


### Error: socket.gaierror: [Errno 8] nodename nor servname provided, or not known
While running locally you may encounter this error with Django not correctly finding your computer hostname
To fix this problem, complete the following steps
1) Open a python terminal, and type the commands
```
import socket
socket.gethostname() ----> [hostname]
```
2) Open hostname file /etc/hosts
3) Insert the following command
```
127.0.0.1 [hostname]
```
4) Test within python terminal by open another python terminal
```
import socket
socket.gethostbyname_ex(socket.gethostname()) ---->
(hostname, [], ['127.0.0.1'])
```
