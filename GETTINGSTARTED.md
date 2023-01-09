## Install Campfire from scratch (for local development)
We use [Tlon's Bouncer](https://github.com/tloncorp/bouncer) to automate our installs.

When in the root of the repository run
```
cd campfire
./install-to-ship.sh
```
and follow the instructions. This script assumes that bouncer is available on your machine at `~/dev/urbit/bouncer/`, that your fakezod lives at `~/dev/urbit/ships/zod/`, that this repo is at `~/dev/urbit/holium/campfire`, and that you have the [urbit repo](https://github.com/urbit/urbit) at `~/dev/urbit/urbit`. The script and its corresponding bouncer config can be modified.

Now the desk (with all it's glorious hoon) is installed, but you need to add the frontend to the app
Run:
```
cd campfire/ui && npm run build
```
Upload the built UI to ~zod by going to [localhost:8080/docket/upload](http://localhost:8080/docket/upload) and uploading the `campfire/ui/dist` folder to the %campfire desk.
On ~zod run `:treaty|publish %campfire` to make the desk findable by other fake ships on your machine.


## How to test a video call between two ships
* Boot the fake ships (~zod and ~bus)
* install the desk on ~zod (using the above section)
* On ~bus' Grid, search for ~zod, then install Campfire from him

## Enabling CORS for dev mode testing
Currently need to approve some origin so that the `@urbit/http-api` works in dev mode.
On zod, run `+cor-registry` to see what's an approved request.
`|pass [%e [%approve-origin 'http://localhost:8080']]`
`|pass [%e [%approve-origin 'http://localhost:3000']]`

# Extras + Troubleshooting
## testing icepond
1. Install icepond (manually) on fake zod

2. Run icepond-test: 
    - `npm start`
3. The web app should launch, just click the button
## Running your own coturn server
* [Coturn](https://github.com/coturn/coturn) - `sudo dnf -y install coturn`
* Configure and test that your coturn server is working
* Follow the [docs](campfire/urbit/doc/iceservers.udon) to use this server in Icepond instead of the defaults

There's also some nice public/free servers:
* https://www.metered.ca/tools/openrelay/


