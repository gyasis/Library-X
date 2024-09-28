import importlib
import inspect
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/dist", StaticFiles(directory="dist"), name="dist")
app.mount("/src", StaticFiles(directory="src"), name="src")

class MethodResponse(BaseModel):
    methods: Dict[str, Any]

def get_methods_and_docs(obj) -> Dict[str, Any]:
    members = {}
    for name, member in inspect.getmembers(obj):
        if inspect.isfunction(member) or inspect.isclass(member):
            members[name] = {
                "doc": inspect.getdoc(member) or "No documentation available",
                "type": "class" if inspect.isclass(member) else "function"
            }
    return members

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("index.html") as f:
        return f.read()

@app.get("/methods/{module_name}", response_model=MethodResponse)
async def read_methods(module_name: str):
    try:
        module = importlib.import_module(module_name)
    except ImportError:
        raise HTTPException(status_code=404, detail=f"Module {module_name} not found")
    methods = get_methods_and_docs(module)
    return MethodResponse(methods=methods)

@app.get("/children/{module_name}/{class_name}", response_model=MethodResponse)
async def read_children(module_name: str, class_name: str):
    try:
        module = importlib.import_module(module_name)
        obj = getattr(module, class_name)
    except (ImportError, AttributeError):
        raise HTTPException(status_code=404, detail=f"Class {class_name} not found in module {module_name}")
    methods = get_methods_and_docs(obj)
    return MethodResponse(methods=methods)