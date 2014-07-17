# semantic-metro-map

Little web app that let users interact with an interactive metro map. All data are included as triples in RDF/XML in the SVG map.

[Live demo on Heroku](http://semantic-metro-map.herokuapp.com) (runs with 1 dyno so first start could take a while)

Create your own semantic SVG file with the [`semantic-metro-map-generator`](https://github.com/gopeter/semantic-metro-map-generator).

**No database, no unnecessary or redundant files, just one .svg.**

## Installation

1. Clone this repository: `git clone git@github.com:gopeter/semantic-metro-map.git`
2. Create virtual env: `virtualenv venv`
3. Activate virtual env: `source venv/bin/activate` (do this for every new terminal session)
4. Install requirements: `pip install -r requirements.txt`
5. Start app: `foreman start`
6. Visit `http://localhost:5000` and have fun!

Be aware: Just a proof of concept. No validations, no exception handling, no tests.

## Further examples

`semantic-graphics` is part of a series of experiments

- [`semantic-diagrams`](https://github.com/gopeter/semantic-diagrams)
- [`semantic-graphics`](https://github.com/gopeter/semantic-graphics)
- [`semantic-metro-map`](https://github.com/gopeter/semantic-metro-map)
- [`semantic-metro-map-generator`](https://github.com/gopeter/semantic-metro-map-generator)