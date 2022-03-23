import inspect
import sys
import os
from contextlib import contextmanager
from types import FunctionType


def parse_tests(test):
    """
    Parse a report object of pytest and return it to be
    serializable as a JSON object
    """
    return {
        "outcome": test.outcome,
        "nodeid": test.nodeid,
        "duration": test.duration,
        "keywords": test.keywords,
        "sections": test.sections,
        "longreprtext": test.longreprtext,
        "stderr": test.capstderr,
        "stdout": test.capstdout,
    }


def get_module_from_file_path(path):
    """
    Return the module of the filepath given
    "demo_project/python/a_basics.py" ==> "demo_project.python.a_basics"
    """
    path = os.path.normpath(os.path.relpath(path)).replace('\\', '/')
    s = path.replace("./", "").replace("/", ".")
    return "".join(s.rsplit(".py", 1))


def get_methods_from_class(clas):
    """
    Gets all the methods in a given class
    """
    functions_name = [x for x, y in clas.__dict__.items() if type(y) == FunctionType]
    # Ponicode only generates classes that starts with `test_...`
    # if it is a class to test, and not a class to init the instances
    functions = [getattr(clas, x) for x in functions_name if x.startswith("test")]
    return functions


def get_from_module(module, function):
    """
    Returns a certain class or function from a given module
    """
    return getattr(module, function)


def is_class(to_test):
    """
    Check if a variable is a class or not
    """
    return inspect.isclass(to_test)


@contextmanager
def suppress_stdout():
    with open(os.devnull, "w") as devnull:
        old_stdout = sys.stdout
        sys.stdout = devnull
        try:
            yield
        finally:
            sys.stdout = old_stdout
