import json
from openai import OpenAI
from pydantic import ValidationError

from app.core.config.config import get_settings
from app.modules.universities.universities_schemas import UniversityAnalysisResponse
from app.modules.tests.tests_schemas import (
    PersonalityAnalysisResponse,
    ShortAnalysisResponse,
)


class LLMService:
    def __init__(self):
        self.settings = get_settings()
        self.client = OpenAI(api_key=self.settings.llm.openai_api_key.get_secret_value())

    def get_university_analysis(self, prompt: dict) -> dict:
        response = self.client.chat.completions.create(
            model=self.settings.llm.model,
            messages=[
                {"role": "system", "content": prompt["system"]},
                {"role": "user", "content": prompt["user"]},
            ],
            response_format={"type": "json_object"},
            max_tokens=self.settings.llm.max_tokens,
        )
        try:
            analysis_data = json.loads(response.choices[0].message.content)
            # Validate the response against the Pydantic schema
            UniversityAnalysisResponse.model_validate(analysis_data)
            return analysis_data
        except (json.JSONDecodeError, ValidationError) as e:
            # Handle JSON parsing or validation errors
            # You might want to log the error and the invalid response for debugging
            print(f"Error parsing LLM response: {e}")
            print(f"Invalid response: {response.choices[0].message.content}")
            return {}

    def get_personality_analysis(self, prompt: dict) -> dict:
        response = self.client.chat.completions.create(
            model=self.settings.llm.model,
            messages=[
                {"role": "system", "content": prompt["system"]},
                {"role": "user", "content": prompt["user"]},
            ],
            response_format={"type": "json_object"},
            max_tokens=self.settings.llm.max_tokens,
        )
        try:
            analysis_data = json.loads(response.choices[0].message.content)
            # Validate the response against the Pydantic schema
            PersonalityAnalysisResponse.model_validate(analysis_data)
            return analysis_data
        except (json.JSONDecodeError, ValidationError) as e:
            # Handle JSON parsing or validation errors
            # You might want to log the error and the invalid response for debugging
            print(f"Error parsing LLM response: {e}")
            print(f"Invalid response: {response.choices[0].message.content}")
            return {}

    def get_short_analysis(self, prompt: dict) -> dict:
        response = self.client.chat.completions.create(
            model=self.settings.llm.model,
            messages=[
                {"role": "system", "content": prompt["system"]},
                {"role": "user", "content": prompt["user"]},
            ],
            response_format={"type": "json_object"},
            max_tokens=self.settings.llm.max_tokens,
        )
        try:
            analysis_data = json.loads(response.choices[0].message.content)
            # Validate the response against the Pydantic schema
            ShortAnalysisResponse.model_validate(analysis_data)
            return analysis_data
        except (json.JSONDecodeError, ValidationError) as e:
            # Handle JSON parsing or validation errors
            # You might want to log the error and the invalid response for debugging
            print(f"Error parsing LLM response: {e}")
            print(f"Invalid response: {response.choices[0].message.content}")
            return {}
