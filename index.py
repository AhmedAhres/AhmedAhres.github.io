from flask import Flask, render_template


app = Flask(__name__)
 
@app.route("/")
def index():
    """
	Runs the main index template which links to all the other D3 files.
	Automatically finds the templates folder and look for the fole param
	passed in the render_template function.
    """
    return render_template('index.html')
 
if __name__ == "__main__":
    app.run(debug=True)
