"""
KnowledgeDB Python SDK

Usage:
    from knowledgedb import KnowledgeDB
    db = KnowledgeDB('http://localhost:5000/db/usr_abc/myapp', 'kdb_...')
    db.insert('users', {'name': 'Alice', 'age': 25})
"""

import json
import urllib.request
import urllib.parse
import urllib.error


class KnowledgeDB:
    def __init__(self, endpoint: str, api_key: str):
        self.endpoint = endpoint.rstrip('/')
        self.api_key = api_key
        self.graph = GraphAPI(self)
        self.memory = MemoryAPI(self)

    def _request(self, method: str, path: str, body: dict = None):
        url = f"{self.endpoint}{path}"
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': self.api_key
        }

        data = json.dumps(body).encode('utf-8') if body else None
        req = urllib.request.Request(url, data=data, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            error_body = json.loads(e.read().decode('utf-8'))
            raise Exception(error_body.get('error', f'HTTP {e.code}'))

    # ---- CRUD ----

    def insert(self, collection: str, documents):
        if isinstance(documents, list):
            body = {'documents': documents}
        else:
            body = {'document': documents}
        return self._request('POST', f'/{collection}/insert', body)

    def find(self, collection: str, query: dict = None, options: dict = None):
        return self._request('POST', f'/{collection}/find', {
            'query': query or {},
            'options': options or {}
        })

    def update(self, collection: str, query: dict, update: dict, multi: bool = False):
        return self._request('PUT', f'/{collection}/update', {
            'query': query, 'update': update, 'multi': multi
        })

    def delete(self, collection: str, query: dict, multi: bool = False):
        return self._request('DELETE', f'/{collection}/delete', {
            'query': query, 'multi': multi
        })

    def count(self, collection: str, query: dict = None):
        return self._request('POST', f'/{collection}/count', {'query': query or {}})

    def collections(self):
        return self._request('GET', '/collections')

    def history(self, collection: str, doc_id: str):
        return self._request('GET', f'/{collection}/{doc_id}/history')

    def rollback(self, collection: str, doc_id: str, version: int):
        return self._request('POST', f'/{collection}/{doc_id}/rollback', {'version': version})

    # ---- Search ----

    def search(self, query: str, mode: str = 'hybrid', collections: list = None,
               graph_depth: int = 2, limit: int = 10):
        return self._request('POST', '/search', {
            'query': query, 'mode': mode,
            'collections': collections,
            'graphDepth': graph_depth, 'limit': limit
        })

    # ---- GraphRAG ----

    def ask(self, question: str, depth: int = 3, collections: list = None, limit: int = 10):
        return self._request('POST', '/ask', {
            'question': question, 'contextDepth': depth,
            'collections': collections, 'limit': limit
        })

    # ---- Analytics ----

    def analytics(self, collection: str, config: dict):
        return self._request('POST', f'/{collection}/analytics', config)

    def export_collection(self, collection: str, fmt: str = 'json'):
        return self._request('GET', f'/{collection}/export?format={fmt}')


class GraphAPI:
    def __init__(self, db: KnowledgeDB):
        self.db = db

    def nodes(self):
        return self.db._request('GET', '/graph/nodes')

    def edges(self):
        return self.db._request('GET', '/graph/edges')

    def stats(self):
        return self.db._request('GET', '/graph/stats')

    def node(self, entity_id: str):
        return self.db._request('GET', f'/graph/node/{entity_id}')

    def search(self, query: str):
        return self.db._request('GET', f'/graph/search?q={urllib.parse.quote(query)}')

    def traverse(self, start_node: str, depth: int = 2):
        return self.db._request('POST', '/graph/traverse', {'startNode': start_node, 'depth': depth})

    def path(self, from_label: str, to_label: str):
        return self.db._request('POST', '/graph/path', {'from': from_label, 'to': to_label})

    def link(self, from_label: str, to_label: str, relation: str):
        return self.db._request('POST', '/graph/link', {
            'fromLabel': from_label, 'toLabel': to_label, 'relation': relation
        })

    def delete_link(self, edge_id: str):
        return self.db._request('DELETE', f'/graph/link/{edge_id}')


class MemoryAPI:
    def __init__(self, db: KnowledgeDB):
        self.db = db

    def remember(self, agent_id: str, mem_type: str, content: str, tags: list = None):
        return self.db._request('POST', '/memory/remember', {
            'agentId': agent_id, 'type': mem_type,
            'content': content, 'tags': tags or []
        })

    def recall(self, agent_id: str, query: str, limit: int = 5, mem_type: str = None):
        body = {'agentId': agent_id, 'query': query, 'limit': limit}
        if mem_type:
            body['type'] = mem_type
        return self.db._request('POST', '/memory/recall', body)

    def forget(self, agent_id: str, older_than: str = None, mem_type: str = None):
        body = {'agentId': agent_id}
        if older_than:
            body['olderThan'] = older_than
        if mem_type:
            body['type'] = mem_type
        return self.db._request('DELETE', '/memory/forget', body)

    def list(self, agent_id: str, mem_type: str = None, limit: int = 20, skip: int = 0):
        params = f'agentId={agent_id}&limit={limit}&skip={skip}'
        if mem_type:
            params += f'&type={mem_type}'
        return self.db._request('GET', f'/memory/list?{params}')
