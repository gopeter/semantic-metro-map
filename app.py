import networkx as nx
import matplotlib.pyplot as plt
import mimetypes
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
	# open SVG file and extract RDF
	with open ("metro.svg", "r") as metro:
		data = metro.read()
		xml = BeautifulSoup(data)
		metadata = xml.find('metadata')
		
		# convert RDF/XML triples into networkx paths
		for item in metadata.findAll('rdf:description'):
		
			# get start node and strip 'http://example.com/' from string
			start = item['rdf:about'][19:]
			nodes = {}
			
			# get connectsd nodes/objects
			for node in item.findAll('ex:via'):
				stop = node.find('ex:stop')['rdf:resource'][19:]
				line = node.find('ex:line')['rdf:resource'][19:]
				duration = float(node.find('ex:duration').string)
				
				# add edge to graph
				g.add_edges_from([
					(start, stop, {'duration': duration, 'line': line})
				])
	
	# get total duration
	length = nx.dijkstra_path_length(g,'StopD','StopC', 'duration')

	# get egdes to the shortest path
	for edge in zip(path,path[1:]):                                                 
	    data = g.get_edge_data(*edge)                                              
	    print edge,min(data.iteritems(), key = lambda x : x[1]['duration'])

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

if __name__ == "__main__":
    app.run(debug=True)