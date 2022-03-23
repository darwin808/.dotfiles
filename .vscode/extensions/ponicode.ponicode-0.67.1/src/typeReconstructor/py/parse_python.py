import ast
import json
import sys

from utils import (
    NATIVE_TYPES,
    Construct,
    ConstructParameter,
    ObjectReference,
    any_construct_parameter,
    dataclass_to_json,
)

assert sys.version_info.major >= 3
assert sys.version_info.minor >= 7

def function_parser(code_to_parse: str):
    tree = ast.parse(code_to_parse)

    body = tree.body[0]

    parameters: list[ConstructParameter] = []

    if isinstance(body, ast.FunctionDef):
        parameters.extend(parse_function_def(body))

    elif isinstance(body, ast.ClassDef):
        parse_class_def(body)

    return parameters


def type_parser(code_to_parse: str):
    tree = ast.parse(code_to_parse)

    body = tree.body[0]

    constructs: list[Construct] = []

    if isinstance(body, ast.ClassDef):
        constructs.extend(parse_class_def(body))

    elif isinstance(body, ast.Expr):
        value = body.value
        constructParameter = parse_annotation(value)
        constructs.append(Construct(constructKind="TypeReference", constructParameters=[constructParameter]))

    return constructs


def parse_function_def(functionDef: ast.FunctionDef, is_method=False):
    parameters: list[ConstructParameter] = []
    parameters_list = functionDef.args.args[1:] if is_method else functionDef.args.args
    for arg in parameters_list:
        annotation = arg.annotation
        if annotation:
            parameters.append(parse_annotation(annotation))
        else:
            parameters.append(any_construct_parameter)
    return parameters


def parse_class_def(classDef: ast.ClassDef):
    constructors: list[Construct] = []

    decorators = [dec for dec in classDef.decorator_list if isinstance(dec, ast.Name) or isinstance(dec, ast.Attribute)]
    decorators_names = [dec.id if isinstance(dec, ast.Name) else dec.attr for dec in decorators]

    methods_list = [stmt for stmt in classDef.body if isinstance(stmt, ast.FunctionDef)]

    init_method_list = [method for method in methods_list if method.name == "__init__"]

    class_methods_list = [
        method
        for method in methods_list
        if "classmethod" in [decorator.id for decorator in method.decorator_list if isinstance(decorator, ast.Name)]
    ]

    if "dataclass" in decorators_names:
        parameters = [stmt for stmt in classDef.body if isinstance(stmt, ast.AnnAssign)]
        parsed_parameters = [parse_annotation(param.annotation) for param in parameters]

        constructors.append(
            Construct(
                constructKind="constructor",
                constructParameters=parsed_parameters,
            )
        )

    for method in class_methods_list:
        parsed_method = parse_function_def(method, True)
        constructors.append(
            Construct(
                constructKind="StaticConstructor",
                constructParameters=parsed_method,
                methodName=method.name,
            )
        )

    if init_method_list:
        init_method = init_method_list[0]
        parsed_init = parse_function_def(init_method, True)

        constructors.append(
            Construct(
                constructKind="constructor",
                constructParameters=parsed_init,
            )
        )

    if len(constructors) == 0 and len(classDef.bases) > 0:
        for parent in classDef.bases:
            parsed_parent = parse_annotation(parent)
            constructors.append(Construct(constructKind="InheritsFrom", constructParameters=[parsed_parent]))

    if len(constructors) == 0:
        constructors.append(
            Construct(
                constructKind="constructor",
                constructParameters=[],
            )
        )

    return constructors


def parse_annotation(annotation: ast.expr) -> ConstructParameter:
    if isinstance(annotation, ast.Attribute) or isinstance(annotation, ast.Name):
        type_name = annotation.attr if isinstance(annotation, ast.Attribute) else annotation.id
        if type_name in NATIVE_TYPES:
            ref = ObjectReference(filePath="native", name=type_name)
            return ConstructParameter(reference=ref)

        else:  # annotation is an identifier
            pos = (annotation.lineno, annotation.col_offset)

            return ConstructParameter(ObjectReference("", "", pos))

    elif isinstance(annotation, ast.Constant):
        return ConstructParameter(ObjectReference("native", f"'{annotation.value}'"))

    elif isinstance(annotation, ast.List):
        ref = ObjectReference(filePath="native", name="typesList")
        construct_parameter = ConstructParameter(reference=ref)
        construct_parameter.typeParameters = []
        for param in annotation.elts:

            construct_parameter.typeParameters.append(parse_annotation(param))
        return construct_parameter

    elif isinstance(annotation, ast.Subscript):
        value = annotation.value
        construct_parameter = parse_annotation(value)
        construct_parameter.typeParameters = []

        slice = annotation.slice
        
        if sys.version_info.minor in [7, 8] and isinstance(slice, ast.Index):
            slice = slice.value
        
        if isinstance(slice, ast.Name):
            construct_parameter.typeParameters.append(parse_annotation(slice))
        elif isinstance(slice, ast.Tuple):
            for param in slice.elts:
                construct_parameter.typeParameters.append(parse_annotation(param))
        elif isinstance(slice, ast.Constant):
            construct_parameter.typeParameters.append(ConstructParameter(ObjectReference("native", slice.value)))

        return construct_parameter

    elif isinstance(annotation, ast.Call):
        function = annotation.func
        function_name = ""
        if isinstance(function, ast.Attribute) or isinstance(function, ast.Name):
            function_name = function.attr if isinstance(function, ast.Attribute) else function.id
        if function_name == "TypeVar":
            if annotation.args:
                args = annotation.args[1:]
                if args:
                    parsed_args = [parse_annotation(arg) for arg in args]
                    return ConstructParameter(
                        reference=ObjectReference("native", "TypeVar"),
                        typeParameters=parsed_args,
                    )

    return any_construct_parameter


if __name__ == "__main__":
    payload_str = sys.stdin.read().strip().replace("\n", "\\n")
    payload = json.loads(payload_str)

    code = payload["code"]
    query = payload["query"]

    if query == "functionDefinition":
        out = function_parser(code)
        print(dataclass_to_json(out))

    elif query == "typeDefinition":
        out = type_parser(code)
        print(dataclass_to_json(out))
