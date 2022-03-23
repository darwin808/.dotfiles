from typing import Any, Callable, Dict, Literal, Optional, Sequence, Tuple, overload

from sympy.core import Expr, Symbol

def separatevars(
    expr: Expr, symbols: Sequence[Symbol] = ..., dict: bool = ..., force: bool = ...
) -> Any: ...
def _is_sum_surds(p: Expr) -> bool: ...
def posify(eq: Expr) -> Tuple[Expr, Dict[Symbol, Symbol]]: ...
def hypersimp(f: Expr, k: Expr) -> Optional[Expr]: ...
def hypersimilar(f: Expr, g: Expr, k: Expr) -> bool: ...
def signsimp(expr: Expr, evaluate: Optional[bool] = ...) -> Expr: ...
def simplify(
    expr: Expr,
    ratio: float = ...,
    measure: Callable[[Expr], int] = ...,
    rational: bool = ...,
    inverse: bool = ...,
    doit: bool = ...,
    **kwargs: Any
) -> Expr: ...
def sum_simplify(s: Expr, **kwargs: Any) -> Expr: ...
def sum_combine(s_t: Sequence[Expr]) -> Expr: ...
def factor_sum(
    self: Expr,
    limits: Optional[Sequence[Any]] = ...,
    radical: bool = ...,
    clear: bool = ...,
    fraction: bool = ...,
    sign: bool = ...,
) -> Expr: ...
def product_simplify(s: Expr) -> Expr: ...
def logcombine(expr: Expr, force: bool = ...) -> Expr: ...
def inversecombine(expr: Expr) -> Expr: ...
def walk(e: Expr, *target: Expr) -> Expr: ...
def bottom_up(
    rv: Expr, F: Callable[[Expr], Expr], atoms: bool = ..., nonbasic: bool = ...
) -> Expr: ...
def kroneckersimp(expr: Expr) -> Expr: ...
def besselsimp(expr: Expr) -> Expr: ...
def nthroot(expr: Expr, n: int, max_len: int = ..., prec: int = ...) -> Expr: ...
def nsimplify(
    expr: Expr,
    constants: Sequence[Expr] = ...,
    tolerance: Optional[float] = ...,
    full: bool = ...,
    rational: Optional[bool] = ...,
    rational_conversion: str = ...,
) -> Expr: ...
def clear_coefficients(expr: Expr, rhs: Expr = ...) -> Tuple[Expr, Expr]: ...
def nc_simplify(expr: Expr, deep: bool = ...) -> Expr: ...
@overload
def dotprodsimp(expr: Expr, withsimp: Literal[True] = ...) -> Tuple[Expr, bool]: ...
@overload
def dotprodsimp(expr: Expr, withsimp: Literal[False] = ...) -> Expr: ...
