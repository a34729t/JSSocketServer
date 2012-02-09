#!/usr/bin/python

import sys
import json
import httplib, urllib, urllib2

# Get parameters
if len(sys.argv) < 3:
    sys.stderr.write('Usage: python post.py [SessionId] [JSON Message]\n')
    sys.exit(1)

SessionId = sys.argv[1]
Message = sys.argv[2]

# Open up http connection

values = {'id' : '123',
          'a' : 'used_to_handle_undefined',
          'm' : 'connect' }
headers = {"Content-type": "application/json"}

#data = urllib.urlencode(values)
#url = 'http://127.0.0.1:9002'
#req = urllib2.Request(url, data, headers)
#response = urllib2.urlopen(req)
#print response.data


conn = httplib.HTTPConnection('127.0.0.1', 9002)
headers = {"Content-type": "application/json"}
conn.request("POST", "", json.dumps(values), headers)
response = conn.getresponse()

print "response.status: "+response.status
print "response.reason: "+response.reason
data = response.read()
conn.close()#print "response.data: "+data
