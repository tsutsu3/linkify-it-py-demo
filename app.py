import re

import mdurl
from flask import Flask, render_template, request
from pydantic import BaseModel

from linkify_it import LinkifyIt

linkify = LinkifyIt().set({"fuzzy_ip": True})

app = Flask(__name__)


class Request(BaseModel):
    data: str


class Response(BaseModel):
    data: str


def escape(s: str) -> str:
    # `html.escape` converts the double quotation mark (")
    # return html.escape(str)
    s = s.replace("&", "&amp;")
    s = s.replace("<", "&lt;")
    s = s.replace(">", "&gt;")
    return s


@app.route("/convert", methods=["POST"])
def convert():
    text = Request(**request.get_json())
    escaped_text = escape(text.data)
    matches = linkify.match(text.data)

    if not matches:
        return Response(data=escaped_text).model_dump_json()

    result = []
    last = 0
    for match in matches:
        if last < match.index:
            result.append(
                re.sub(r"\r?\n", "<br>", escape(text.data[last : match.index]))
            )
        result.append('<a target="_blank" href="')
        result.append(escape(match.url))
        result.append('">')
        result.append(escape(match.text))
        result.append("</a>")
        last = match.last_index

    if last < len(text.data):
        result.append(re.sub(r"\r?\n", "<br>", escape(text.data[last:])))
    linked_escaped_text = "".join(result)

    return Response(data=linked_escaped_text).model_dump_json()


@app.route("/permalink", methods=["POST"])
def permalink():
    text = Request(**request.get_json())
    if not text.data:
        return Response(data="").model_dump_json()

    permalink = "#t1=" + mdurl.encode(text.data, mdurl.ENCODE_COMPONENT_CHARS)
    return Response(data=permalink).model_dump_json()


@app.route("/decode", methods=["POST"])
def decode():
    text = Request(**request.get_json())
    decoded = mdurl.decode(text.data, mdurl.ENCODE_COMPONENT_CHARS)
    return Response(data=decoded).model_dump_json()


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")
