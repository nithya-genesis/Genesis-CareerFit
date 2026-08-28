import os
import json
from typing import Dict, Any, List

class RoleRegistry:
    def __init__(self):
        self.registry_dir = os.path.dirname(__file__)
        self.roles: Dict[str, Dict[str, Any]] = {}
        self._load_roles()

    def _load_roles(self):
        lib_path = os.path.join(self.registry_dir, "career_library.json")
        if os.path.exists(lib_path):
            with open(lib_path, "r", encoding="utf-8") as f:
                lib_data = json.load(f)
                for role in lib_data:
                    self.roles[role["role_id"]] = role
        else:
            for file_name in os.listdir(self.registry_dir):
                if file_name.endswith('.json') and file_name != "career_library.json":
                    file_path = os.path.join(self.registry_dir, file_name)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        self.roles[data['role_id']] = data

    def get_roles_for_department(self, department: str) -> List[Dict[str, Any]]:
        dept_clean = department.upper().replace(" ", "_").replace("&", "_").replace("-", "_")
        matched = []
        for role in self.roles.values():
            suitable = [d.upper() for d in role.get("suitable_departments", ["ALL"])]
            if "ALL" in suitable or any(d in dept_clean for d in suitable):
                matched.append(role)
        return matched if matched else list(self.roles.values())
