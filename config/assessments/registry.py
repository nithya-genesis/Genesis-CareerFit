import os, json

class AssessmentRegistry:
    def __init__(self):
        self.registry_dir = os.path.dirname(__file__)
        self.assessments = {}
        self._load_assessments()

    def _load_assessments(self):
        for file_name in os.listdir(self.registry_dir):
            if file_name.endswith('.json'):
                file_path = os.path.join(self.registry_dir, file_name)
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.assessments[data['assessment_id']] = data

    def get_assessment(self, assessment_id: str):
        return self.assessments.get(assessment_id)
