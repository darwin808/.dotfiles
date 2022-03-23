from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from typing import Any, Optional


@dataclass
class ObjectReference:
    filePath: str
    name: str
    identifierRange: Optional[tuple[int, int]] = None


@dataclass
class ConstructParameter:
    reference: ObjectReference
    key: Optional[str] = None
    typeParameters: Optional[list[ConstructParameter]] = None


@dataclass
class Construct:
    constructKind: str
    constructParameters: list[ConstructParameter]
    methodName: Optional[str] = None


any_construct_parameter = ConstructParameter(reference=ObjectReference(filePath="native", name="any"))

NATIVE_TYPES = [
    "float",
    "int",
    "complex",
    "bool",
    "str",
    "bytes",
    "bytearray",
    "memoryview",
    "range",
    "set",
    "Set",
    "frozenset",
    "FrozenSet",
    "list",
    "List",
    "dict",
    "Dict",
    "tuple",
    "Tuple",
    "Any",
    "Union",
    "Optional",
    "ClassVar",
    "AnyStr",
    "Final",
    "Annotated",
    "Generic",
    "DefaultDict",
    "OrderedDict",
    "ChainMap",
    "Counter",
    "Deque",
    "Callable",
    "NoneType",
    "Type",
    "Literal",
]


def dataclass_to_json(d: list[Any]):
    return json.dumps(
        {
            "response": [
                asdict(
                    e,
                    dict_factory=lambda data: dict(x for x in data if x[1] is not None),
                )
                for e in d
            ]
        }
    )
