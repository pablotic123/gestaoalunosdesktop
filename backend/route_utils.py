from fastapi import APIRouter
from typing import Callable, Any

def dual_route(router: APIRouter, path: str, **kwargs):
    """
    Decorator que registra a rota com E sem trailing slash
    """
    def decorator(func: Callable) -> Callable:
        path_without_slash = path.rstrip('/')
        path_with_slash = path_without_slash + '/'
        
        router.add_api_route(path_without_slash, func, **kwargs)
        router.add_api_route(path_with_slash, func, **kwargs)
        
        return func
    return decorator
