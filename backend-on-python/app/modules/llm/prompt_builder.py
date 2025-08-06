import json
from app.modules.llm.prompt_registry import (
    UNIVERSITY_ANALYSIS_PROMPT,
    PERSONALITY_ANALYSIS_PROMPT,
    SHORT_ANALYSIS_PROMPT,
)
from app.modules.universities.universities_schemas import UniversityAnalysisResponse
from app.modules.tests.tests_schemas import (
    PersonalityAnalysisResponse,
    ShortAnalysisResponse,
)


def build_university_analysis_prompt(
    user_profile: dict, universities_data: list
) -> dict:
    json_format = json.dumps(UniversityAnalysisResponse.model_json_schema(), indent=2)
    user_prompt = UNIVERSITY_ANALYSIS_PROMPT["user"].format(
        user_profile=json.dumps(user_profile, indent=2),
        universities_data=json.dumps(universities_data, indent=2),
        json_format=json_format,
    )
    return {
        "system": UNIVERSITY_ANALYSIS_PROMPT["system"],
        "user": user_prompt,
    }


def build_personality_analysis_prompt(test_results: list) -> dict:
    json_format = json.dumps(PersonalityAnalysisResponse.model_json_schema(), indent=2)
    user_prompt = PERSONALITY_ANALYSIS_PROMPT["user"].format(
        test_results=json.dumps(test_results, indent=2),
        json_format=json_format,
    )
    return {
        "system": PERSONALITY_ANALYSIS_PROMPT["system"],
        "user": user_prompt,
    }


def build_short_analysis_prompt(test_results: dict) -> dict:
    json_format = json.dumps(ShortAnalysisResponse.model_json_schema(), indent=2)
    user_prompt = SHORT_ANALYSIS_PROMPT["user"].format(
        test_results=json.dumps(test_results, indent=2),
        json_format=json_format,
    )
    return {
        "system": SHORT_ANALYSIS_PROMPT["system"],
        "user": user_prompt,
    }
