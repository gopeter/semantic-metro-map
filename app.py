import os
import networkx as nx
import mimetypes
import json
import urllib
from urlparse import urlparse
from flask import Flask, jsonify, render_template, request
from bs4 import BeautifulSoup

mimetypes.add_type('image/svg+xml', '.svg')

################################################################################
# Init
################################################################################

app = Flask(__name__)

################################################################################
# Parse metro map and return shortest path
################################################################################

@app.route('/', methods = ['POST'])
def parseData():
  g = nx.MultiDiGraph()
  
  # store post data
  p_map = request.form['map']
  p_start = request.form['start']
  p_end = request.form['end']    
  
  check = urlparse(p_map)
  if (check.scheme):
    filename = 'static/maps/own.svg'  
    ownmap = urllib.URLopener()
    ownmap.retrieve(p_map,filename)
  else:
    filename = 'static/maps/' + p_map
  
  # open SVG file and extract RDF
  with open(filename, 'r') as metro:
    data = metro.read()
    xml = BeautifulSoup(data)
    metadata = xml.find('metadata')

    # convert RDF/XML triples into networkx paths
    for item in metadata.findAll('rdf:description'):

      # get start node and strip 'http://example.com/' from string
      start = (item['rdf:about'])[19:]

      # get connectsd nodes/objects
      for node in item.findAll('ex:via'):
        stop = (node.find('ex:stop')['rdf:resource'])[19:]
        line = (node.find('ex:line')['rdf:resource'])[19:]
        duration = float(node.find('ex:duration').string)

        # add edge to graph
        g.add_edges_from([(start, stop, {'duration': duration, 'line': line})])

  # get shortest path
  path = nx.dijkstra_path(g, p_start[4:], p_end[4:], 'duration')

  # get total duration
  length = nx.dijkstra_path_length(g, p_start[4:], p_end[4:], 'duration')

  # get egdes to the shortest path and return as JSON
  details = []
  for edge in zip(path, path[1:]):
    data = g.get_edge_data(*edge)
    details.append({
      'edges': edge,
      'meta': min(data.iteritems(), key = lambda x: x[1]['duration'])
    });

  # return path and edges + metadata (duration, line) as details object
  data = {
    'path': path,
    'details': details
  }
  
  # return object as JSON
  return json.dumps(data)

################################################################################
# Serve maps
################################################################################

@app.route('/maps/<filename>', methods = ['GET'])
def maps(filename):
  return app.send_static_file('maps/' + filename)

################################################################################
# Serve index file
################################################################################

@app.route('/', methods = ['GET'])
def index():
  return render_template('index.html')
  
################################################################################
# Start app
################################################################################
 
if __name__ == '__main__':
  app.run(debug=True)