import json

def modelPredictor(bfst, lnch, snks, dinr):
    data = {
        "breakfast" : 100,
        "lunch" : 100,
        "snack" : 100,
        "dinner" : 100
    }

    return json.dumps(data)